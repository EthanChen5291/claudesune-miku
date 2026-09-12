// audition/songs.html — 10 FULL SONGS from vibe prompts (D63).
//
// Ethan: "generate full harmonies and melodies given various environmental +
// emotional prompts. different instruments, and with progressions (so full
// length songs), variations throughout the song (in both instrument setup and
// chords/chord tones) and tones. 10 songs. add drums if needed."
//
// The pipeline is the audition-undertale mix pipeline pointed at GENERATED
// material: compileVibe() turns the prompt into parameters; the harmony is a
// D50 exemplar variation (click-kept exemplar of the vibe's family, varied);
// the accompaniment is a RATIFIED foundation pattern chosen by the vibe's
// figuration classes; melody is the D59 letter form (letters = different
// melodies); the instruments come from planArrangement with the environment's
// timbre bias, capped by the D62 ensemble dial; the D47 form varies the
// instrument setup section-by-section; the D59 treat varies the harmony at
// the last reprise; and TONES travel (D62): each new letter's accompaniment
// moves along a cheap FND_TRAVEL edge, so the texture develops with the form.
//
// DRUMS (D63 addendum): the confidence gate SPOke — 24 harvested patterns are
// vouched by Ethan's vibe notes, and four ride here where his note matches the
// song's vibe (his words quoted on the card). The 11th song is his buildup
// ask: dp_b_52_s's first 4 bars as a never-looped intro (drums → drone →
// accompaniment → riser), then the song proper opens with a drop.
// Articulation rides the vibe: staccato/legato/damper per emotion (or the
// environment's default), composed over each pattern's own authored legato.

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileVibe } from '../src/lib/vibes.js';
import { parsePrompt } from '../src/lib/prompt-parse.js';
import { exemplarPool, variationsOf, varyProgression } from '../src/lib/harmony-vary.js';
import { VERDICTS, DERIVED_VERDICTS, CARD_NOTES } from '../src/lib/verdicts.js';
import { renderProgression } from '../src/binder/harmony.js';
import { parseDegrees, ALL_PROGRESSIONS } from '../src/lib/progressions.js';
// r26/D115: the @ChordCamera pack is deliberately NOT merged into
// ALL_PROGRESSIONS (merging restages the counted harmony model — D95). It is
// reachable ONLY through an explicit per-song `basePin`, which names one song's
// exemplar outright and can move nothing else.
import { PROGRESSIONS_CHORDCAMERA } from '../src/lib/progressions-chordcamera.js';
import { PROGRESSIONS_VANRIVER } from '../src/lib/progressions-vanriver.js';
import { PROGRESSIONS_SERUM } from '../src/lib/progressions-serum.js';
import { SONG_LABELS, servesLine } from '../src/lib/song-labels.js';
import { LAYER_PATTERNS, VIBE_CLASSES, REEL_PROGRESSIONS, layersFor, comboScore } from '../src/lib/layer-patterns.js';
import { PROGRESSIONS_CITYPOP, citypopFor } from '../src/lib/progressions-citypop.js';
import { dpStack } from './drum-render.js';
import { bindFigure, bindMelody, bindMelodySpec, normalizeRhythm } from '../src/binder/bind.js';
import { composeVocalLine } from '../src/lib/vocal-line.js';
import { describePrompt, explain as explainPrompt } from '../src/lib/describe.js';
import { FIGURATIONS_FOUNDATION } from '../src/lib/figurations-foundation.js';
import { FND_TRAVEL } from '../src/lib/figuration-graph.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { INSTRUMENTS } from '../src/lib/instruments.js';
import { chordCoreTones, parseKey, keyUsesFlats, pcToNoteName } from '../src/binder/theory.js';
import { colorUpgradeDegrees } from '../src/lib/video-color.js';
import { MELODY_RHYTHMS_UNDERTALE } from '../src/lib/rhythms-undertale.js';
import {
  planArrangement, renderArrangement, planForm, renderForm,
  planMelodyForm, renderLetterLead, maskBarsFor, maskString,
} from '../src/binder/arrange.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';
import { SAMPLE_PACK } from '../src/lib/sample-pack-def.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };

// ---- melody-cell retrieval — the audition-undertale machinery (D40/D44) ----
const MEL_CELLS = Object.entries(MELODY_RHYTHMS_UNDERTALE).map(([name, e]) => ({ name, ...e }));
// r24 probe hooks. Every measurement in D112 came from one of these, and each
// exists because the built page does not carry what it reports: which melody
// CELL a song retrieved, which variation FORM its accompaniment took, and what
// the finished composite reads. Env-gated and hoisted out of the hot loops, so
// they cost one boolean when off.
const DBG_MEL = !!process.env.MELDEBUG, DBG_ACC = !!process.env.ACCDEBUG, DBG_ACCF = !!process.env.ACCFINAL, DBG_LEAD = !!process.env.LEADDEBUG;
function activityBudget(bpm) { return Math.max(8, Math.min(15, Math.round(16 - (bpm || 110) / 40))); }
function melodyDensityTarget(bpm, accDensity) {
  return Math.max(2, Math.min(12, Math.round(activityBudget(bpm) - accDensity)));
}
const R48 = 48;
const posOf = (o) => { const [n, d] = String(o).split('/').map(Number); return n / d; };
const barSteps = (onsets) => onsets.map((o) => Math.round((posOf(o) % 1) * R48) % R48);
function interlockScore(accSet, cell, beats) {
  let lockStrong = 0, lockWeak = 0, fill = 0;
  for (const p of barSteps(cell.onsets)) {
    if (accSet.has(p)) { if (p % (R48 / beats) === 0) lockStrong++; else lockWeak++; }
    else fill++;
  }
  return (fill * 1.0 + lockStrong * 0.8 - lockWeak * 0.6) / Math.sqrt(cell.onsets.length);
}
const DENSITY_BAND = 3;
function melodyRhythm(meter, bpm, seedName, { target: forced = null, accDensity = 0, accOnsets = null, beats = 4, exclude = [], maxDensity = null, heldFirst = false, noLateTail = false } = {}) {
  const target = forced ?? melodyDensityTarget(bpm, accDensity);
  let pool = MEL_CELLS.filter((c) => c.meter_class === meter);
  if (!pool.length) pool = MEL_CELLS.filter((c) => c.meter_class === '4/4');
  if (exclude.length) {
    const rest = pool.filter((c) => !exclude.includes(c.name));
    if (rest.length) pool = rest;
  }
  // D89 (festival, "way too hyper once again"): a hard density ceiling — the
  // ±band ranks by interlock and can hand a halved target a dense cell right
  // back (measured: the 2/4 halving only cut onsets 32%). Opt-in per call.
  if (maxDensity != null) {
    const capped = pool.filter((c) => c.density <= maxDensity);
    if (capped.length) pool = capped;
  }
  // ---- r29 · THE NO-JITTER LAW REACHES THE CAST'S OWN MELODY LAYERS -------
  // r28 fixed the erratic final-16th note in `bindMelody` via `minNoteLast`,
  // measured at 84.6% of every sub-16th note on the page he had judged. It does
  // not reach the PLANNER's melody layers, which are rendered from a retrieved
  // cell rather than walked — and his r28 note on ls_vi_v_three_tense is exactly
  // that gap: "the synth has really rapid notes and jumps though and sometimes
  // sounds like a 16th note off beat - align those."
  //
  // MEASURED on that song: its `alternate_melody` cell is `~@3 [chord]@12 note`,
  // so 64 of its 64 onsets (100%) land on an ODD 16th, and every bar closes with
  // a lone 16th in the final slot — the same gesture, arriving through a door
  // `minNoteLast` cannot see. 13 of the 37 melody cells (35%) end that way, so
  // excluding them still leaves 24 to retrieve from.
  if (noLateTail) {
    const noTail = pool.filter((c) => {
      const G = c.grid ?? 16;
      return Math.max(...barSteps(c.onsets)) < G - 1;
    });
    if (noTail.length) pool = noTail;
  }
  let band = pool.filter((c) => Math.abs(c.density - target) <= DENSITY_BAND);
  if (!band.length) {
    const sorted = pool.map((c) => ({ c, d: Math.abs(c.density - target) })).sort((a, b) => a.d - b.d);
    band = sorted.filter((x) => x.d <= sorted[0].d + 1).map((x) => x.c);
  }
  const accSet = new Set(accOnsets ? barSteps(accOnsets) : []);
  // r17 (his reel note: "the melody is held not very jittery"). interlockScore
  // ranks by ONSET POSITION only — nothing in retrieval ever looked at note
  // LENGTH, so at an identical density the pool's longer-noted cells were
  // invisible. Measured: adding a min-IOI term swaps the cell on 32 of 42 songs
  // and takes the mean fraction of sub-eighth notes 0.354 -> 0.200 with ZERO
  // change in onset count — the largest melody win available, at no cost in
  // notes. It re-rolls the cell, so it is gated to unpinned songs.
  const minIOI = (c) => {
    const st = barSteps(c.onsets).slice().sort((x, y) => x - y);
    const G = c.grid ?? 16;
    let m = Infinity;
    for (let i = 0; i < st.length; i++) m = Math.min(m, (st[i + 1] ?? G) - st[i]);
    return Number.isFinite(m) ? m / G : 0;
  };
  const ranked = band
    .map((c) => ({ c, s: interlockScore(accSet, c, beats), h: heldFirst ? minIOI(c) : 0 }))
    .sort((a, b) => b.s - a.s || b.h - a.h || b.c.seen - a.c.seen || (a.c.name < b.c.name ? -1 : 1));
  const pick = ranked[0].c;
  if (DBG_MEL) console.error(`MELDEBUG\t${seedName}\t${pick.name}\ttarget=${target}\tband=${band.length}\tpool=${pool.length}\tacc=${accOnsets?accOnsets.length:0}`);
  return { name: pick.name, onsets: pick.onsets, accents: pick.accents, artic: pick.artic, density: pick.density, target, interlock: Math.round(ranked[0].s * 100) / 100 };
}

function barPlan(n) {
  const B = (n % 4 === 0 || n === 2) ? n : Math.ceil(n / 4) * 4;
  if (B === n) return null;
  const base = Math.floor(B / n), rem = B % n;
  return Array.from({ length: n }, (_, i) => (i < rem ? base + 1 : base));
}

// r27 — UNEVEN CHORD LENGTH. `barPlan` above spreads a progression as evenly as
// the 4-bar grid allows, which is exactly what the @vanrivermusic reels do NOT
// do: measured over 155 chords, only 36.8% last their reel's modal unit, 23.2%
// last half of it or less, and 14.8% last two to four times it. The short slots
// carry the unstable chords (dim / altered dominant / slash) in 5 of 8 reels, two
// half-length re-voicings of ONE chord in another, and — in vid_vr_funky — the
// reverse, the diatonic chords passing quickly under a held borrowed one. The
// honest general statement is that THE CHORD THE LOOP IS ABOUT GETS THE TIME.
// See src/lib/progressions-vanriver.js and techniques.js `uneven_chord_length`.
//
// Weights come straight from the pack's measured `chordUnits`. Allocation is
// largest-remainder with a floor of one bar, so every chord still sounds and the
// loop still lands on a multiple of 4.
//
// RESOLUTION MATTERS AND IS THE REASON THESE SONGS ARE 16 BARS. At a target of 8
// bars a 7-chord progression cannot express anything but 1-1-1-1-1-1-2 — the
// ratios flatten to nothing. At 16 the same progression comes out 3-3-2-2-3-1-2,
// which carries the shape. A 4:1 measured ratio renders as 3:1; that rounding is
// stated here rather than hidden, and it is why the entries keep their exact
// fractional `chordUnits` in the pack instead of pre-rounded bar counts.
function weightedBarPlan(units, target) {
  const n = units.length;
  if (!n) return null;
  const B = Math.max(target, Math.ceil(n / 4) * 4);
  if (B < n) return null;
  const sum = units.reduce((a, b) => a + b, 0);
  if (!(sum > 0)) return null;
  // Plain largest-remainder on the FULL share, then repair any zero up to one
  // bar by taking from the largest allocation.
  //
  // The first version allocated one bar to every chord first and shared only the
  // remainder proportionally. That is the obvious way to guarantee the floor and
  // it is wrong: it compresses every ratio towards 1:1, and on the 4-chord
  // `vid_vr_ineedyourears` (units 0.75 1 0.75 1) it produced 4-4-4-4 — a
  // perfectly even bar plan from an uneven progression, i.e. it silently deleted
  // the entire finding this function exists to express. Sharing the full B first
  // gives 3-5-3-5, which is the measured shape.
  const raw = units.map((u) => (B * u) / sum);
  const plan = raw.map((x) => Math.floor(x));
  const rem = raw
    .map((x, i) => [x - Math.floor(x), i])
    .sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  let left = B - plan.reduce((a, b) => a + b, 0);
  for (let k = 0; left > 0; k += 1, left -= 1) plan[rem[k % n][1]] += 1;
  for (let i = 0; i < n; i += 1) {
    if (plan[i] >= 1) continue;                  // every chord must still sound
    let big = 0;
    for (let j = 1; j < n; j += 1) if (plan[j] > plan[big]) big = j;
    if (plan[big] <= 1) return null;             // too many chords for the length
    plan[big] -= 1; plan[i] += 1;
  }
  return plan;
}

// ---- drums: mini-notation from a rhythms.js percussion entry ---------------
const BAND_SOUND = { low: 'bd', mid: 'sd', high: 'hh' };
const PRESENCE_GAIN = { light: 0.5, driving: 0.7, foreground: 0.85 };
// r24 — HIS "our drum vst isnt that good ... doesnt sound like deep reel drums".
// MEASURED: 15 of 33 percussion patterns declare no `sounds` and fall through to
// Strudel's stock one-shots here, and they are every kick and hat the battle
// songs use. `deep` swaps the band fallback to his own Miraleste pack so a kit
// stops mixing stock synthetic sounds with real sampled ones.
//
// OPT-IN, because it changes the emitted mix string: switching it on by default
// rewrites the drums of every judged song and invalidates their HQ renders.
const DEEP_BAND_SOUND = { low: 'md_kick', mid: 'md_snare', high: 'md_hat' };
function drumExpr(name, presence, deep = false, stackSlots = false) {
  const entry = RHYTHMS[name];
  const r = normalizeRhythm({ ...entry, accents: entry.accents ?? entry.onsets?.map(() => 0.8) ?? [1] });
  // grid = lcm of onset denominators, capped
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  let G = 1;
  for (const [, d] of r.onsets) G = (G * d) / gcd(G, d);
  while (G < 4) G *= 2;
  if (G > 48) throw new Error(`drum grid ${G} too fine for ${name}`);
  // genre-expansion: an entry may name a sound per onset (`sounds`, vc_* local
  // samples — a dum and a tak are different drums, not just accent levels)
  const sound = entry.sound ?? (deep ? DEEP_BAND_SOUND[entry.band] : null) ?? BAND_SOUND[entry.band] ?? 'sd';
  const gmax = PRESENCE_GAIN[presence] ?? 0.6;
  const slots = Array(G * r.bars).fill('~');
  const gains = Array(G * r.bars).fill('0');
  const oSlots = stackSlots ? Array(G * r.bars).fill('~') : null;
  const oGains = stackSlots ? Array(G * r.bars).fill('0') : null;
  r.onsets.forEach(([n, d], i) => {
    const ix = Math.round((n / d) * G);
    if (ix >= slots.length) return;
    const snd = entry.sounds?.[i] ?? sound;
    const g = String(Math.round(r.accents[i] * gmax * 100) / 100);
    // r33 — same-slot collision. backbeat_hard/backbeat_kit declare snare+clap
    // TOGETHER on beats 2 and 4 and the last writer silently won: the clap
    // erased the snare and its accent-1.0 — measured, md_snare never sounds at
    // 1/4 or 3/4 in ANY mix carrying either row, on every page. Two drums on
    // one slot are a simultaneity, not a rewrite. Gated at the call site so
    // judged pages keep the thinned kit they were judged with.
    if (stackSlots && slots[ix] !== '~') {
      // r33 verify: the first form merged the pair into one slot at
      // Math.max(gains) — which re-accented the clap +18-33% wherever it
      // shared a slot with the accent-1.0 snare and CANCELLED the kit trim
      // (kit-vs-lead ratios flat-to-worse with the cap firing). Colliding
      // onsets go to an OVERLAY pattern instead, each sound keeping its own
      // declared accent.
      oSlots[ix] = snd; oGains[ix] = g;
    } else { slots[ix] = snd; gains[ix] = g; }
  });
  let expr = `s("${slots.join(' ')}").gain("${gains.join(' ')}")`;
  if (r.bars > 1) expr += `.slow(${r.bars})`;
  if (stackSlots && oSlots.some((x) => x !== '~')) {
    let o = `s("${oSlots.join(' ')}").gain("${oGains.join(' ')}")`;
    if (r.bars > 1) o += `.slow(${r.bars})`;
    expr = `stack(${expr}, ${o})`;
  }
  return expr;
}

// ---- the 10 prompts --------------------------------------------------------
// His three named vibes, the genocide contradiction cell, the mysterious
// calibration case, a solo-anchor aftermath, and four more spanning the map.
const PROMPTS = [
  { emotion: 'happy', environment: 'shop' },
  { emotion: null, environment: 'construction' },
  { emotion: 'tense', environment: 'fight' },
  { emotion: 'sad', environment: 'shop' },
  { emotion: 'triumphant', environment: 'boss' },
  { emotion: 'calm', environment: 'water' },
  { emotion: 'mysterious', environment: 'cave' },
  { emotion: 'nostalgic', environment: 'snow' },
  { emotion: 'somber', environment: 'aftermath' },
  { emotion: 'goofy', environment: 'kitchen' },
  // D86 (his round-9 ask): fully-synth songs — "1-2 fully synth calm songs
  // with appropriate environmental prompts" (lab + menu are the synth-native
  // environments) "and then generate another fully synth progression songs"
  // (stealth + casino carry the energetic side). All four run the full
  // machinery: letters, travel, treats, curves — full songs, all synth.
  { emotion: 'calm', environment: 'lab' },
  { emotion: 'calm', environment: 'menu' },
  { emotion: 'tense', environment: 'stealth' },
  { emotion: 'excited', environment: 'casino' },
  // D88 (his ask: "generate 8 different songs ... using what you learned"):
  // eight fresh vibe cells carrying the anti-generic pattern — colored
  // exemplar retrieval, a B-letter bridge progression, breakdown sections,
  // bar-4 sub turnarounds, and every D85-D87 layer policy.
  { emotion: 'mysterious', environment: 'desert' },
  { emotion: 'excited', environment: 'training' },
  { emotion: 'calm', environment: 'rest' },
  { emotion: 'tense', environment: 'lab' },
  { emotion: 'goofy', environment: 'casino' },
  { emotion: 'somber', environment: 'snow' },
  { emotion: 'happy', environment: 'festival' },
  { emotion: 'nostalgic', environment: 'shop' },
  // genre-expansion round (prompt.md 2026-08-27): 3 desert + 3 space + the
  // three horror lanes (manor=ambience, catacombs=action, citadel=epic) +
  // the choir pair (shrine soft-magical / triumphant-citadel active-battle,
  // his mid-round ask) + 3 reel demos (busy-battle, jungle groove, abstract
  // nature). vs_mysterious_desert is FIXED via SONG_OPTS, not re-added.
  { emotion: 'somber', environment: 'desert' },
  { emotion: 'happy', environment: 'desert' },
  { emotion: 'tense', environment: 'desert' },
  { emotion: 'calm', environment: 'space' },
  { emotion: 'mysterious', environment: 'space' },
  { emotion: 'excited', environment: 'space' },
  { emotion: 'scary', environment: 'manor' },
  { emotion: 'somber', environment: 'manor' },
  { emotion: 'mysterious', environment: 'manor' },
  { emotion: 'scary', environment: 'catacombs' },
  { emotion: 'tense', environment: 'catacombs' },
  { emotion: null, environment: 'catacombs' },
  { emotion: 'scary', environment: 'citadel' },
  { emotion: 'somber', environment: 'citadel' },
  { emotion: 'tense', environment: 'citadel' },
  { emotion: 'triumphant', environment: 'citadel' },
  { emotion: 'calm', environment: 'shrine' },
  { emotion: 'excited', environment: 'fight' },
  { emotion: 'happy', environment: 'jungle' },
  { emotion: 'mysterious', environment: 'jungle' },
  // r19/D100 — FOUR SONGS BUILT ON THE REEL MATERIAL, one per progression he
  // sent, each also carrying the LAYER technique the same batch taught (see
  // research/reel-atlas-r19.md and their SONG_OPTS at the bottom of this file).
  { emotion: 'scary', environment: 'cave' },
  { emotion: 'somber', environment: 'space' },
  { emotion: 'nostalgic', environment: 'casino' },
  { emotion: 'calm', environment: 'desert' },
];

const clicked = (name) => {
  const v = VERDICTS[name];
  return v && !String(v.page ?? '').endsWith('-implied');
};
const EX = exemplarPool();
const RATIFIED_FND = Object.entries(FIGURATIONS_FOUNDATION).filter(([, e]) => e.ratified);

const ENERGY = { ostinato: 1, bed: 2, statement: 3, dialogue: 3.5, answer: 4, handoff: 4, full: 5, fullHandoff: 5, breakdown: 2, tag: 1 };

// D63 addendum: the drum gate SPOKE — these harvested patterns are vouched by
// Ethan's vibe notes and assigned where the note matches the song's vibe.
// Every other song keeps engine percussion (or none).
const DP_DRUMS = {
  // round 3: "not groovy enough and should be a bit lighter" — boom_tap's
  // waiting-room chill traded for the groove he vouched, seated lighter
  vs_happy_shop: { pattern: 'dp_slowton', note: 'groovy chill beat', gainMul: 0.85 },
  vs_x_construction: { pattern: 'dp_working', note: 'relaxed chill beat. first two measures are a bit more energetic than last two' },
  vs_tense_fight: { pattern: 'dp_residual_stress_study', note: 'rising tension (video game)' },
  vs_triumphant_boss: { pattern: 'dp_8obit_electrowerk66', note: 'hot' },
  // rounds 1-2 chased groove (nuevayol → tikoflow); round 3: "drums may
  // actually be too heavy for this one since it's so fast - need lighter
  // one" — the sparsest beat he vouched, at a fast 2/4 it reads light
  vs_goofy_kitchen: { pattern: 'dp_boom_tap', note: 'very very chill beat, like waiting room or something', gainMul: 0.8 },
};
// round 1, his boss note: "drums are drowning everything" — dp mixes sit well
// under the old presence gains; rounds 2-3 ("STILL drowning") stepped down
// twice more, on top of drum-render's per-bar busy-voice trim
const DP_GAIN = { light: 0.45, driving: 0.5, foreground: 0.45 };

const songs = [];
const CHECKS = [];
function buildSong(prompt, name, opts = {}) {
  // ==========================================================================
  // r32 · opts.reelFaithful — THE REEL IS THE ARRANGEMENT
  // ==========================================================================
  // HIS NOTE, the whole of it: "i feel like the combination wasn't that good.
  // it should be hardcoded more faithfully to the reel in terms of combinations
  // and such (or maybe other added instruments are just affecting it idk)".
  //
  // The second clause is right and the number is worse than "affecting it".
  // MEASURED on the page he judged: 37 of 203 sounding layers came from the
  // reel library — 18.2%. A card called FAITHFUL was four fifths this engine's
  // own arrangement with a reel garnish on top, and almost every complaint on
  // the page names one of the engine's parts, not the reel's:
  //   "the vibraphone is a bit overused in general"  -> _sparkle / _companion,
  //        gm_music_box, on 15 of 16 songs. No reel row picks that voice.
  //   "boogie again for tense construction ... why?" -> _funk_bass, engine.
  //   "there doesn't have to be a beat drop in every song ffs" -> the engine's
  //        breakdown, on 12 of 16.
  //   "the melody also isn't good" / "doesn't sound on key" -> _lead, generated
  //        by the melody walker; the reel's own tune is a separate layer.
  //
  // ONE FLAG, not twelve. D101's lesson (pinFrom beats feature-pinning, "six
  // flags, seven next round") applies exactly: a faithful card declares that
  // the reel supplies the arrangement, and every discretionary engine layer
  // stands down at once. What is NOT switched off is anything structural —
  // sections, key, register laws, the D77 cap, the metronome test: the reel's
  // mix decisions do not outrank his ear's standing rules.
  if (opts.reelFaithful) {
    opts = {
      sparkle: false, descant: false, counterline: false, marcato: false,
      companion: false, funkBass: false, breakdown: false, echoLayer: false,
      texture: false, textureOff: true, octaveDouble: false, voiceCap: 0,
      // A TRANSCRIBED PATTERN MUST PLAY AS TRANSCRIBED. Two of his cards:
      //   "the random variations of the speed of the synth sounds really weird.
      //    each iteration shouldn't be a different speed"
      //   "sometimes it plays at different rhythms which sounds a bit strange
      //    like it's lagging in its beginning melody"
      // Both are the engine's own variation machinery applied to a part that
      // was read off a piano roll. D97's four-bar composite deliberately MOVES
      // THE RHYTHM in block 2 (that is the law he asked for), and the D62 tone
      // travel swaps the accompaniment for a different FOUNDATION on every new
      // letter — neither is wrong in general, and both are wrong on a layer
      // whose whole claim is that it is what someone actually played.
      accVary: false, accTravel: false, subBass: false, accUnderLead: true,
      ...opts,
    };
  }
  // ---- r27 · THE LAYER STACK, his kept videolab card ----------------------
  // HIS ASK this round: "in terms of synths, i liked layer stack and funk bounce
  // a lot ... all from videolabs.html". `vl_layerstack` is KEPT (D87).
  //
  // The card's own technique list is the definition: an ostinato pedal that
  // NEVER MOVES while only the bar-downbeat accent reads the harmony; a saw bass
  // with a bar-4 octave-drop turnaround; a supersaw no-3rd pad; an e-piano
  // counter entering on beat 2; music-box sparkle pickups on beat 4 climbing
  // into the next downbeat; NO DRUMS — the pulse layers carry time; and an
  // all-synth palette.
  //
  // Four of those six the engine already owns as separate rules, so this is a
  // PRESET, not new machinery — which is the honest way to ship it, because a
  // second implementation of the frozen pedal would drift from the first:
  //   frozenSlot   the ostinato whose body is frozen and whose single moving
  //                slot carries the harmony — the card's "accent-line chord
  //                changes" verbatim
  //   fullSynth    the all-synth palette
  //   percPresence the "no drums — the pulse layers carry time" clause
  //   sparkle/counterline cast themselves where the vibe admits them
  // Expanded here rather than in the prompt table so the card is ONE flag and
  // the mapping is stated once. Explicit per-song values always win.
  if (opts.layerStack === true) {
    opts = {
      fullSynth: true, frozenSlot: true, percPresence: 'none',
      ...opts,
    };
  }
  let v = compileVibe({ ...prompt, name, ...(opts.bpm ? { bpm: opts.bpm } : {}) }); // prompt may carry a meter override (the drop song pins 4/4)
  // D92 (his ruling after festival's repeated 2/4-hyper complaints and the
  // D89/D90 half-measures: "avoid 2/4 and just stick with 4/4 btw (and
  // adjust accordingly)"): a vibe that compiles to 2/4 re-compiles with a
  // 4/4 override — the 4/4 machinery (cells, foundations, density targets)
  // then fits it natively. KEPT songs are exempt (goofy_kitchen was judged
  // and clicked IN 2/4; re-metering discards judged material — his word
  // would have to name it).
  // genre-expansion addendum: an emotion's family override (somber→minor,
  // happy→major) pulled DESERT retrieval out of the modal pool where every
  // bII-bearing exemplar lives — re-creating the D91 "dark, not desert"
  // failure from the prompt grid. Desert pins family modal (unkept only):
  // the Phrygian-dominant trope outranks the emotion's tonal default.
  const vibeOverrides = {};
  if (v.meter === '2/4' && !prompt.meter && DERIVED_VERDICTS?.[name]?.verdict !== 'keep') vibeOverrides.meter = '4/4';
  if (prompt.environment === 'desert' && v.family !== 'modal' && DERIVED_VERDICTS?.[name]?.verdict !== 'keep') vibeOverrides.family = 'modal';
  if (opts.keyHint) vibeOverrides.keyHint = opts.keyHint; // verify catch: two desert songs hashed the same tonic
  // r14 (mysterious_manor: "it feels like a sleep lullaby. not really
  // mysterious" — its modal retrieval served a BRIGHT I-bVII trope in F
  // major): a song may pin its harmonic family outright.
  if (opts.family) vibeOverrides.family = opts.family;
  if (Object.keys(vibeOverrides).length) {
    v = compileVibe({ ...prompt, name, ...vibeOverrides, ...(opts.bpm ? { bpm: opts.bpm } : {}) });
  }
  const beats = Number(v.meter.split('/')[0]) || 4;

  // ---- harmony: a varied click-kept exemplar of the vibe's family ----------
  const judged = DERIVED_VERDICTS?.[name];
  // r35 · `keepFresh` — THE KEEP-TRANSITION LAW ON A noteBlind PAGE. A keep
  // clicked on a page whose songs were built history-less (vx_nostalgic_snow,
  // r34-vocal) was judged WITH every fresh rule of every round up to the one it
  // was built in; the click flipping `priorKeep` would strip all of them
  // (D91/D118, now the fifth bite). keepFresh says: this click is the song's
  // FIRST judgement, not a history — the harmony/base pin the verdict carries
  // stays (that is read from the verdict, not from priorKeep), the rule gates
  // stay where they were when he heard it, and `pinFrom` walls off the round
  // that follows. Verified by byte compare against the judged page.
  const priorKeep = judged?.verdict === 'keep' && opts.keepFresh !== true;
  // r25: hoisted to sit beside priorKeep. It was declared ~740 lines below and
  // the lead-voice gate needs it, which is a TDZ error rather than a silent
  // wrong answer — but the same shape (a freshness gate a caller cannot reach)
  // is what let r23Fresh and the battle_crash data edit past a pin this round.
  const pinnedRound = opts.pinFrom ? Number(String(opts.pinFrom).replace(/\D/g, '')) : null;
  const ruleFresh = (round) => !priorKeep && !opts.grammarPin
    && (pinnedRound == null || round < pinnedRound);
  const freshRules = ruleFresh(20);
  const env = prompt.environment;
  // r14 LANE LAW (his catacombs/citadel notes — "the synths don't really fit
  // ... they both make it sound playful", "boogie shuffle on catacombs?",
  // "sounds like a evening disco dance ball"): the horror lanes, and the
  // desert/jungle lanes behind them, refuse the engine's PLAYFUL defaults —
  // music-box sparkle, slap-bass funk bounce, chip leads, latin/boogie
  // foundations. Unkept songs only; a kept song keeps what he judged.
  const laneHorror = ['manor', 'catacombs', 'citadel'].includes(env);
  const laneSerious = !priorKeep && (laneHorror || env === 'desert' || env === 'jungle');

  // r27 — THE NICHE GATE, his ruling this round, verbatim: "note that engine
  // changes as a result of this should not affect the niche genres". The city-pop
  // / K-pop work is for the CASUAL lanes; desert, jungle and the three horror
  // lanes have their own researched vocabulary (D93/D94/D97) and their own judged
  // material, and nothing learned from a piano-chord reel has any authority there.
  //
  // Written as a POSITIVE test on a closed set rather than as a flag each new rule
  // remembers to check, because a list of forbidden names has failed five times in
  // this project (D99/D100/D102). `nicheLane` is computed once; every r27 rule
  // reads it, and test/niche-gate.test.js pins that they all do.
  //
  // NOTE this is deliberately NOT `laneSerious`: that one is gated on !priorKeep,
  // because it decides which figures a lane may bind and a kept song must keep
  // binding what it was judged with. The niche gate is about whether a NEW rule may
  // fire at all, so it must hold regardless of keep state.
  const NICHE_LANES = new Set(['desert', 'jungle', 'manor', 'catacombs', 'citadel']);
  const nicheLane = NICHE_LANES.has(env) || laneHorror;
  // every r27 rule funnels through this, so "not on the niche lanes" is one edit
  const r27 = (round = 27) => ruleFresh(round) && !nicheLane;
  // r28 rides the same gate. His r27 ruling ("engine changes as a result of this
  // should not affect the niche genres") applies with MORE force here, not less:
  // research/reel-layers-r22.md §5.2 says of its own evidence base "All 9 reels
  // are minor ... Nothing here transfers to desert, jungle or any modal lane on
  // its own authority." The research and his ruling agree, so the gate is not a
  // courtesy — it is what the source material permits.
  const r28 = (round = 28) => ruleFresh(round) && !nicheLane;
  const r29 = (round = 29) => ruleFresh(round) && !nicheLane;
  const r30 = (round = 30) => ruleFresh(round) && !nicheLane;
  const r31 = (round = 31) => ruleFresh(round) && !nicheLane;
  const r32 = (round = 32) => ruleFresh(round) && !nicheLane;
  const r33 = (round = 33) => ruleFresh(round) && !nicheLane;
  const r35 = (round = 35) => ruleFresh(round) && !nicheLane;
  // hoisted (r32): the drum selector, which runs earlier than the support
  // layers, needs to report its meter filter on the card too.
  const extraInfo = [];

  // ---- r28 · THE ERRATIC NOTES, LOCATED (opts.noJitter) --------------------
  // HIS MOST-REPEATED COMPLAINT ON THE PAGE HE JUST JUDGED — five cards:
  //   vr_romantic_romantic  "the random short bursts sound weird and erratic"
  //   vr_cloudy_nostalgic   "random very quick bursts in the left hand"
  //   cp_komuro_triumphant  "the piano melody is erratic (random really quick
  //                          notes) at times which I dislike once again"
  //   vr_moody_tense        "the piano has some random erratic chords"
  //   vr_hotel_romantic     "it just sounds a bit random"
  //
  // MEASURED across all 23 songs of that page: 1185 notes are a 16th or shorter,
  // and 1003 of them (84.6%) are the bar's LAST onset — all 1003 sitting in the
  // bar's final 16th slot. Not a tendency; every single one. `_acc` contributes
  // ZERO of them, so "the left hand" is not the accompaniment hand: the short
  // notes are the lead (0.58/bar), its octave partner (0.61/bar, which is the
  // lead an octave DOWN and therefore what a left hand sounds like) and its
  // companion (0.55/bar).
  //
  // The cause is one line in bind.js: `minNote` exempts `i === notes.length - 1`
  // unconditionally, so the one short note the melody floor can never remove is
  // a 16th hanging off the end of the bar. `minNoteLast` (r28) lifts that
  // exemption; this flag threads it through every melody-family bind at once —
  // lead, handoff, takeover, companion, echo and octave partner — because 81.9%
  // of the offending notes measured last round were ONE lead gesture plus its
  // derived copies, so fixing the lead alone would leave the copies playing it.
  // r33: noJitter becomes the DEFAULT for fresh songs. It was opt-in for two
  // rounds while only the test pages passed it — measured on songs.html this
  // round: the lead's short notes still land in the bar's final 16th slot at
  // 32.3% in the mix (companion 70.7%) against 2.6-7.5% in EVERY reference
  // population (uniform = 6.25%) — the D118 shape is engine-only and it was
  // still live on the main judged page. His r33 brief: "the melody generation
  // has been ass ... some seemingly really short notes and offbeats."
  const noJitter = (opts.noJitter === true && r28()) || (opts.noJitter !== false && r33());
  // r33 — the grid law rides the same opt-in: his "shifted off by like a
  // sixteenth note" cards are the same family of complaint noJitter exists
  // for, and 81.9% of the r28 offenders were one lead gesture plus its copies,
  // so this too must reach every melody-family bind at once (see
  // gridSnapMelodyEntry in bind.js for the law and its reference numbers).
  const gridSnapOn = noJitter && r33();

  // ---- r28 · `noteBlind` — THE KEEP-TRANSITION LAW, FOURTH BITE ------------
  // Six gates in this file read `historyLess()`
  // so that a NEW capability only ever lands on a song with no history. That is
  // the right rule and it stays. What it cannot also do is RETRACT a capability
  // the song was judged with (D99, verbatim: "a gate that stops NEW capabilities
  // must not RETRACT old ones") — but that is exactly what it does the first time
  // a note about the song exists.
  //
  // MEASURED this round, and it is the largest single move of the round: importing
  // his 23 vanriver notes moved 15 of the 23 songs on their own page, with NOTHING
  // else changed. Rebuilt against a pre-import copy of verdicts.js to be sure.
  // `colorFresh` is the worst of the six because it governs HARMONY: 14 songs lost
  // the `voicedAs` colour upgrade and their degrees/symbols/numerals all changed —
  // among them cp_royal_road_nostalgic ("this is a good theme, very groovy, I like
  // it. no complaints") and cp_planing_maj7_mysterious ("I like this song a lot ...
  // really good"). Both are prose keeps, and a prose keep is a keep.
  //
  // A page sets `noteBlind` to say: MY OWN notes are not a history, because they
  // are this page's first judgement. Judged VERDICTS still count — the
  // DERIVED_VERDICTS half of every gate is untouched — so a real keep still gates
  // everything it gated before. Only the "he has written about this card" half is
  // suspended, and only for the page that asks.
  const historyLess = () => (opts.keepFresh === true || !DERIVED_VERDICTS?.[name])
    && (opts.noteBlind === true || !CARD_NOTES?.[name]);

  // ==========================================================================
  // r26/D115 — THE DISSONANCE BUDGET, DECLARED PER LANE (HIS ASK)
  // ==========================================================================
  // Verbatim: "maybe just cap by genre? like reduce dissonance in the genres i
  // mentioned while capping it in like specific ones like desert and other ones,
  // and like those specific chord types that i liked".
  //
  // This is the right shape for a result r26 could not otherwise use. Twenty
  // ways of measuring dissonance were tested against his 16 flagged / 12
  // unflagged suite cards and every one came back |r| < 0.23 — because the
  // question is not HOW MUCH friction but WHERE. su_mysterious_desert is the
  // most dissonant song in the suite by a factor of 2.3 and he is a "big fan"
  // of it, because its friction is `opts.wobble` — a device he asked for. A
  // global threshold cannot express that. A per-lane budget can.
  //
  // WHAT IS BEING BUDGETED, precisely: CHROMATIC vertical friction — close
  // semitone and tritone collisions between two sounding layers. NOT colour.
  // m7/^7/9/sus/6 cost nothing here and are not touched, because the taste canon
  // is explicit that "diatonic colour everywhere" is the norm and CHROMATICISM
  // is what he rejects (D88), and because he named the chord types he likes.
  //
  // COSTS ARE MEASURED, not guessed: each is that layer's close-harsh events per
  // bar against the melody, taken from the r26 sweep of the suite AFTER this
  // round's echo fix (the echo's own cost fell 0.31 -> 0.21 because of it).
  //
  // PRIORITY IS CHEAPEST-AND-MOST-WANTED FIRST, which is what makes this a cap
  // rather than a strip: every layer that carries its own melody — companion,
  // counterline, descant, marcato — fits inside even the tightest budget. What
  // falls off the end is the frozen slot (1.00/bar on its own, half the engine's
  // total) and then the echo. "More layers with their own melody" survives; the
  // ostinati that manufacture rubs do not.
  //
  // A LANE'S SIGNATURE DEVICE IS EXEMPT BY CONSTRUCTION, not by a special case:
  // wobble, b2rub, choirPincer, horrorOstinato, chromDescent and the desert
  // flourish/punct are simply not in RUB_COST, so they are never charged. That
  // is his "capping it in like specific ones like desert" — the idiom's own
  // friction is the lane, and only the generic sources are metered.
  const RUB_COST = {
    companion: 0.01, sparkle: 0.00, octaveDouble: 0.02, counterline: 0.08,
    descant: 0.09, marcato: 0.11, coprimeCell: 0.05, echo: 0.21, frozenSlot: 1.00,
  };
  const RUB_PRIORITY = ['companion', 'sparkle', 'octaveDouble', 'counterline',
    'descant', 'marcato', 'coprimeCell', 'echo', 'frozenSlot'];
  // 0.35 admits everything through `marcato` (cumulative 0.31) and stops before
  // the coprime cell; 0.60 adds the echo; 1.60 admits everything.
  const LANE_RUB_BUDGET = {
    // the lanes his cards named — "reduce dissonance in the genres i mentioned"
    water: 0.35, rest: 0.35, menu: 0.35, snow: 0.35, shop: 0.35, shrine: 0.35,
    aftermath: 0.35, cave: 0.35, space: 0.35, festival: 0.35, kitchen: 0.35,
    casino: 0.35, training: 0.35, construction: 0.35, lab: 0.35, stealth: 0.35,
    // battle lanes: he called these "much better" in r25 and the echo is cheap
    // now, so they keep it; the frozen slot still does not fit
    fight: 0.60, boss: 0.60,
    // idiom lanes — the friction IS the sound (D93/D94: Phrygian dominant's bII
    // against the tonic, horror's one harmonic device over a consonant floor)
    desert: 1.60, manor: 1.60, catacombs: 1.60, citadel: 1.60, jungle: 1.60,
  };
  const rubBudgetOn = ruleFresh(26) && opts.rubBudget !== false;
  const rubBudget = opts.rubBudget ?? LANE_RUB_BUDGET[env] ?? 0.60;
  const rubAllowed = new Set();
  let rubSpend = 0;
  for (const d of RUB_PRIORITY) {
    const c = RUB_COST[d] ?? 0;
    if (rubSpend + c <= rubBudget + 1e-9) { rubSpend += c; rubAllowed.add(d); }
  }
  const rubOk = (d) => !rubBudgetOn || rubAllowed.has(d);
  const rubDropped = RUB_PRIORITY.filter((d) => !rubAllowed.has(d));
  // r14 verify catch: nearest-motion root placement starts from the TONIC at
  // the device's octave — a high tonic (F..B) seats the whole line ~a fifth
  // higher than a low one (measured: mysterious_jungle's B-rooted bass lost
  // its low end, excited_space's A-rooted marcato drifted to octave 5-6).
  // Devices seat by POCKET: high tonics drop one octave.
  const tonicPc = { c: 0, 'c#': 1, db: 1, d: 2, 'd#': 3, eb: 3, e: 4, f: 5, 'f#': 6, gb: 6, g: 7, 'g#': 8, ab: 8, a: 9, 'a#': 10, bb: 10, b: 11 }[String(v.keyHint).toLowerCase()] ?? 0;
  // r14 (happy_desert: melody "too 'harmonious' and 'happy'"): the desert
  // melody supply follows its trope's lane — harmonic minor for the Gerudo
  // motion lane, Phrygian dominant (Hijaz) for the vamp lanes. The key is
  // computed after trope selection below.
  let desertScale = null;
  let famPool = EX.entries.filter(([n, e]) => clicked(n) && e.family === v.family);
  // D65 (his second calm-water kill): a killed song's base is EXCLUDED from
  // its next retrieval — "chord progression isn't good" twice is a verdict on
  // the ingredient, and re-serving it is re-asking a settled question.
  // D67 (his THIRD water kill): the exclusion reads the NOTE, not just the
  // verdict — this kill faults the mix ("more reverb… pad too loud"), not
  // the harmony, so opts.keepBase holds the base and the mix takes the hit.
  if (judged?.verdict === 'kill' && judged.base && !opts.keepBase) {
    const rest = famPool.filter(([n]) => n !== judged.base);
    if (rest.length) famPool = rest;
  }
  // D89 (his desert note: "I don't think the chord progression sounds like a
  // desert. look into other game desert chord progressions"): researched — the
  // game-desert canon is PHRYGIAN. Gerudo Valley runs i-bVI-bVII-V in harmonic
  // minor (Phrygian dominant), and the trope-wide marker across desert levels
  // is the bII (the Andalusian cadence / Hijaz maqam). A desert environment
  // retrieves from the bII-bearing entries of its family pool when any exist.
  let phrygianLock = false;
  if (!priorKeep && prompt.environment === 'desert') {
    const phrygian = famPool.filter(([, x]) => x.degrees.split(' ').some((t) => t === '1b' || t.startsWith('1b:')));
    // the researched trope must also SURVIVE retrieval: the loop serves the
    // exemplar raw (measured: the variation pass brightened iv to IV and
    // dimmed v to v° — diluting exactly the darkness that reads as desert,
    // with a dim chord his water kill already refused). Treat/bridge
    // departures still vary it in their own sections.
    // D91 (his SECOND desert note: "I still don't think the chord
    // progression sounds like a desert"): the all-minor i-v-iv-bII read
    // dark, not desert. The trope's BITE is Phrygian DOMINANT — the bII
    // hard against the tonic, and the RAISED THIRD (Hijaz / the harmonic-
    // minor major chord). Rank the pool by that signature and serve the
    // top: im<->bII adjacency (2), a major-III chord (2), minor tonic
    // first (1). The faulted i-v-iv-bII base ranks below by construction.
    if (phrygian.length) {
      const score = ([, x]) => {
        const t = x.degrees.split(' ');
        let s = 0;
        for (let i = 0; i < t.length; i++) {
          const a = t[i], b = t[(i + 1) % t.length];
          const isbII = (q) => q === '1b' || q.startsWith('1b:');
          if ((a === '0:m' && isbII(b)) || (isbII(a) && b === '0:m')) { s += 2; break; }
        }
        if (t.includes('4')) s += 2;
        if (t[0] === '0:m') s += 1;
        return s;
      };
      const ranked = [...phrygian].sort((a, b) => score(b) - score(a) || a[0].localeCompare(b[0]));
      // r14 (his standing ask "look into other game desert chord
      // progressions" — researched, research/progressions-desert-jungle-
      // r14.md): the desert canon splits into a MOTION lane (Gerudo Valley
      // i-bVI-bVII-V7, melody in harmonic minor — the augmented 2nd lands
      // over the V) and a VAMP lane (Burning Town's double-harmonic Hijaz:
      // a MAJOR tonic heard against the bII — the raised third finally
      // lives IN a chord, the exact gap the report found in our all-minor
      // trope). Three tropes now, spread across the desert songs, each
      // served RAW; opts.desertTrope pins a lane by name.
      const DESERT_TROPES = {
        gerudo: { name: 'mod_desert_gerudo', entry: { degrees: '0:m 8b 10b 7:7', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r14 desert trope: Gerudo motion lane' }], changed: false } }, scale: 'harmonicMinor' },
        hijaz: { name: 'mod_desert_hijaz', entry: { degrees: '0 1b 5:m 1b', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r14 desert trope: double-harmonic Hijaz vamp' }], changed: false } }, scale: 'phrygianDominant' },
        legacy: { name: ranked[0][0], entry: ranked[0][1], scale: 'phrygianDominant' },
        // r16 (desert-shuttle: "both, pick per song"). NSMB's B section plants
        // the bII as a planed maj7 CHORD rather than a melodic b2 — measured,
        // bars 12-17 are C^7|Db^7 x3 then Eb^7, bass root+5th, guide-tone
        // dyads. The departure chord is NOT the reference's Eb^7: he heard the
        // demo and said "the second to last chord in b sounds a bit too
        // harmonious", and a bIII maj7 is a bright chromatic mediant. Db7 in
        // its place keeps the bII root and the planing, and its b7 is Cb = B
        // natural — so the chord pincers the tonic from a semitone BELOW as
        // well as above, the same device he approved on the ornament and
        // choir-pincer cards.
        shuttle: { name: 'mod_desert_shuttle', entry: { degrees: '0:^7 1b:^7 0:^7 1b:^7 0:^7 1b:^7 1b:7 0:^7', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r16 desert trope: NSMB planed-bII maj7 shuttle, Db7 departure' }], changed: false } }, scale: 'phrygianDominant' },
        // r16 (desert-drone, his answer: "it depend. on drone, it's less
        // harmonious and so if it's meant to be less harmonious yes drone. but
        // don't lock all desert to be this, songs are different"). NSMB spends
        // its whole A section on a THIRDLESS G drone — measured, the floor is
        // only {G, D, C, F} for eight bars with no third anywhere, and all the
        // desert colour lives in the ornaments above it. Opt-in per song, which
        // is what "don't lock all desert to be this" asks for.
        drone: { name: 'mod_desert_drone', entry: { degrees: '0:sus 0:sus 0:sus 0:sus 0:sus 0:sus 5:sus 5:sus', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r16 desert trope: NSMB thirdless drone, jumps a fourth' }], changed: false } }, scale: 'phrygianDominant' },
        // r18/D99 (mysterious_desert: "I still don't think the chord progression
        // sounds like a desert. look into other game desert chord progressions").
        // He is describing a real defect, and the trope table explains it: the
        // song was on `drone`, whose eight chords are ALL sus. A thirdless drone
        // has neither the raised third nor the bII — it carries neither half of
        // the Hijaz signature the whole lane law is built on, so of course it
        // does not read desert. Drone is ATMOSPHERE, which is what he asked it
        // for in the triage, handed to a song that needed the lane's harmony.
        //
        // CARAVAN is the lane law with MOTION — the thing drone lacks and the
        // two-chord shuttle also lacks: I - bII - bvii - bII in Phrygian
        // dominant. The tonic keeps its raised third (Hijaz, not Phrygian: his
        // standing "all-minor read dark, not desert" ruling), the bII lands hard
        // against it twice per loop, and the minor bVII in between is entirely
        // inside the scale — so the song gets a third harmonic destination at no
        // cost in chromaticism, which is what he rejects.
        caravan: { name: 'mod_desert_caravan', entry: { degrees: '0 1b 10b:m 1b', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r18 desert trope: Hijaz caravan, I-bII-bvii-bII with motion' }], changed: false } }, scale: 'phrygianDominant' },
      };
      // the hash may land the shuttle (his "both, pick per song"); the DRONE is
      // opt-in only, because "don't lock all desert to be this" is exactly a
      // rule against letting a hash hand it to a song at random.
      const laneKeys = ['gerudo', 'hijaz', 'legacy', 'shuttle'];
      const trope = DESERT_TROPES[opts.desertTrope] ?? DESERT_TROPES[laneKeys[fnv(`${name}|deserttrope`) % laneKeys.length]];
      famPool = [[trope.name, trope.entry]];
      phrygianLock = true;
      desertScale = trope.scale;
    }
  }
  // r14 JUNGLE LOCK (happy_jungle: "the chord progression intervals don't
  // really sound like jungle vibe, and it's just basic chords" — researched,
  // research/progressions-desert-jungle-r14.md §4: every strong jungle
  // source is a two-chord MODAL VAMP, never a functional pop loop): dorian
  // i-IV-v-IV (the Crash vamp) or the Stickerbush wash (natural minor,
  // minor v, no leading tone). Served raw like the desert tropes; melody
  // supply follows the lane (dorian / natural minor, pentatonic-leaning).
  if (!priorKeep && env === 'jungle') {
    const JUNGLE_TROPES = {
      dorian: { name: 'mod_jungle_dorian', entry: { degrees: '0:m7 5 7:m 5', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r14 jungle trope: dorian i-IV-v-IV vamp' }], changed: false } }, scale: 'dorian' },
      wash: { name: 'mod_jungle_wash', entry: { degrees: '0:m 3b:^7 0:m 3b:^7 8b:^7 10b 7:m 0:m', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r14 jungle trope: Stickerbush wash' }], changed: false } }, scale: 'minor' },
      // r16 (jungle-mode: "both, energy picks"). The lane declared family
      // 'major' while the trope lock permitted minor only — a contradiction
      // this resolves. Contra's jungle hook, measured 92% mixolydian: F Gm F F7
      // = I ii I I7, no leading tone anywhere, which is the law both sides
      // share. His caveat on the demo ("a is more harmonious ... b is closer
      // but this specific pattern isn't there yet") was about the Alberti bed
      // under it, not the mode — that is fixed separately by the jungle vamp.
      mixo: { name: 'mod_jungle_mixo', entry: { degrees: '0 2:m7 0 0:7', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r16 jungle trope: Contra mixolydian I-ii-I-I7' }], changed: false } }, scale: 'mixolydian' },
      // r18/D99 — he killed `mixo` outright: "the chord progression intervals
      // don't really sound like jungle vibe, you just changed one note and it's
      // still just basic chords. too harmonious, not unique. look and do
      // research into jungle". He is right on the measurement too: three of its
      // four chords are the tonic, and every one is plain diatonic.
      //
      // PLANE is the DKC move — parallel maj9 chords sliding by whole tone and
      // minor third with no functional motion at all (I - bVII - bVI - bVII).
      // The bVII removes the leading tone, so no chord ever wants to resolve to
      // another; the maj9s keep it bright without making it cadential, which is
      // the exact gap between "harmonious" and "unique" he keeps pointing at.
      plane: { name: 'mod_jungle_plane', entry: { degrees: '0:^9 10:^9 8:^9 10:^9', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r18 jungle trope: DKC planed maj9, no functional motion' }], changed: false } }, scale: 'mixolydian' },
      // CANOPY is the other half of the same idea: an open THIRDLESS tonic
      // (sus2) that never commits to major or minor, answered by a 6/9 and an
      // add9 so the colour moves while the harmony does not. His own law from
      // the jungle triage — "sometimes songs are too harmonious to be
      // atmospheric" — and the same thirdless device he approved for the desert
      // drone, in a brighter mode.
      canopy: { name: 'mod_jungle_canopy', entry: { degrees: '0:2 5:69 10:add9 0:2', numerals: null, family: 'modal', lineage: { ops: [{ op: 'r18 jungle trope: thirdless canopy, colour over a static tonic' }], changed: false } }, scale: 'mixolydian' },
    };
    // energy picks, per his answer: the driving/foreground end of the lane
    // takes the major side, the atmospheric end keeps the modal-minor tropes.
    const jKeys = Object.keys(JUNGLE_TROPES);
    const jEnergetic = (opts.percPresence ?? v.percussion?.presence) === 'foreground' || v.bpm >= 122;
    const jPool = jEnergetic ? ['plane', 'canopy', 'dorian'] : ['dorian', 'wash', 'canopy'];
    const jt = JUNGLE_TROPES[opts.jungleTrope] ?? JUNGLE_TROPES[jPool[fnv(`${name}|jungletrope`) % jPool.length]];
    famPool = [[jt.name, jt.entry]];
    phrygianLock = true;
    desertScale = jt.scale;
  }
  // D64 (his calm-water kill: "chord progression isn't good" on a dim chain):
  // a low-chromaticism vibe prefers PLAIN-TRIAD exemplars (the D51 taste
  // signal). Applied only where no keep is at stake — a song he kept must not
  // re-roll its harmony under a rule change.
  // D64 refined by D88 (his "less generic" verdict, measured: the praised
  // lab songs run ~100% colored chords, the suite ran 43%): "low color"
  // means low CHROMATICISM (the water kill was a dim chain), NOT plain
  // triads — diatonic color (m7/^7/9/sus/6) is his home (D74). Every
  // unkept song now prefers the colored half of its pool; a low-colorBias
  // vibe additionally pushes chromatic entries (alt/dim/aug) to the back.
  if (!priorKeep && famPool.length > 3) {
    const colorness = (deg) => {
      const t = deg.split(' ');
      return t.filter((x) => x.includes(':') && !/:m$/.test(x)).length / t.length;
    };
    const chromness = (deg) => {
      const t = deg.split(' ');
      return t.filter((x) => /[#b]|o|\+|alt/.test(x.split(':')[1] ?? '')).length / t.length;
    };
    const lowChrom = (v.colorBias ?? 0) <= 0.2;
    const ranked = [...famPool].sort((a, b) =>
      (lowChrom ? chromness(a[1].degrees) - chromness(b[1].degrees) : 0)
      || colorness(b[1].degrees) - colorness(a[1].degrees)
      || a[0].localeCompare(b[0]));
    famPool = ranked.slice(0, Math.ceil(ranked.length / 2));
  }
  if (opts.loop4) {
    const four = famPool.filter(([, e]) => parseDegrees(e.degrees).length === 4);
    if (four.length) famPool = four;
  }
  const pool = famPool.length ? famPool : EX.entries.filter(([n]) => clicked(n));
  // D65: a KEPT song pins its BASE too, not just its degrees — retrieval-rule
  // changes must never re-roll what the judged card says it was built from
  // (D67: keepBase pins a mix-faulted kill's base the same way)
  // r17 (verify finding): `grammarPin` gates MELODY grammar but does NOT set
  // priorKeep, so a PROSE keep's exemplar re-rolled with the pool like any
  // unpinned song's. Measured in a sandbox: adding 18 progressions and
  // ratifying one moved vs_tense_lab, vs_goofy_casino and vs_calm_space —
  // the exact three songs `grammarPin` exists to hold still — while all 14
  // clicked keeps stayed byte-identical. A prose keep has no `judged.base` to
  // pin to (there is no verdict yet), so `basePin` names the exemplar outright.
  // r19/D100: basePin also reaches UNRATIFIED entries. The pool holds ratified +
  // famous only (harmony-vary.js), which is right for RETRIEVAL — D95's law that
  // unclicked additions must not re-roll anybody. But an explicit per-song pin
  // is not retrieval: it names one song's exemplar outright and can move nothing
  // else. Without this the four reel progressions were silently ignored and the
  // songs built on them came out on unrelated exemplars — the build looked green
  // and the music was wrong, which is exactly the "returned OK" trap.
  // The colour upgrade and the raw-serve both change the HARMONY, which is the
  // one thing D64 pins hardest — a kept song's degrees are the degrees he
  // judged. History-less songs and explicit opt-in only.
  const colorFresh = opts.voicedColor === true
    || (opts.voicedColor !== false && !priorKeep && !opts.grammarPin && !opts.pinFrom
        && historyLess());
  const PROG_ANY = (n) => ALL_PROGRESSIONS[n] ?? PROGRESSIONS_CHORDCAMERA[n] ?? PROGRESSIONS_VANRIVER[n] ?? PROGRESSIONS_CITYPOP[n] ?? PROGRESSIONS_SERUM[n] ?? REEL_PROGRESSIONS[n];
  const basePinned = opts.basePin
    && (EX.entries.some(([n]) => n === opts.basePin) || PROG_ANY(opts.basePin))
    ? opts.basePin : null;
  const [exName] = basePinned ? [basePinned]
    // r35 verify catch: keepFresh suspends priorKeep, so the clicked keep's BASE
    // pin (D64/65) must be read here too — without it snow's exemplar matched
    // only because the hash retrieval had not moved
    : (priorKeep || opts.keepBase || opts.keepFresh === true) && judged?.base && EX.entries.some(([n]) => n === judged.base)
    ? [judged.base]
    : pool[fnv(`${name}|exemplar`) % pool.length];
  // r19/D100 — opts.rawBase generalises D93's desert law ("Serve trope
  // progressions RAW — the variation pass dilutes them") to any hand-pinned
  // reel progression. Measured on the first build of the four reel songs: the
  // variation pass turned the thirdless `F5 Gb5 F5 Gb5` into `F5 Gb5 F5 Em` —
  // an E MINOR TRIAD in the one progression whose entire point is that it has
  // no thirds — and swapped two of the jazz circle's eight chords for sus
  // chords, including the V9 the circle turns on.
  // ---- r24 · A TRANSCRIBED, JUDGED PROGRESSION IS SERVED RAW -------------
  // HIS ASK: "good color is like the songs in videolab.html of the songs i liked
  // (kpop, citypop, etc. should we save these as foundational chord patterns to
  // hardcode so we know what's going on)?"
  //
  // Same argument D100 already accepted for the reel progressions and D93 for
  // the desert tropes: the variation pass DILUTES a hand-transcribed loop. It
  // turned a deliberately thirdless progression into an E minor triad once, and
  // measured here it rewrites the city-pop loop `7:m7 0:7 9:7 2:m9 7:7 0:^7`
  // into `7:sus 0:7 9:7 2:m9 7:m 0:^7` — the V7 that the turnaround lives on
  // becomes a minor chord.
  //
  // It also DESTROYS THE COLOUR RECOVERY BELOW: `voicedAs` is aligned
  // chord-for-chord with the ORIGINAL degrees, so once the variation swaps a
  // chord the transcribed voicing describes something that is no longer there,
  // and applying it would invent colour rather than restore it.
  //
  // So a videos-pack exemplar carrying a transcription is served RAW on
  // history-less songs, and then re-coloured from its own voicing.
  const videoSrc = ALL_PROGRESSIONS[exName];
  const serveVideoRaw = colorFresh && videoSrc?.pack === 'igvideo'
    && Array.isArray(videoSrc.voicedAs) && videoSrc.voicedAs.length > 0;
  const vars = (phrygianLock || opts.rawBase || serveVideoRaw) ? [] : variationsOf(exName, {
    count: 1, intensity: 0.3 + v.colorBias * 0.4, budget: 2, seed: `${name}|harmony`,
  });
  let e = vars[0] ?? (EX.entries.find(([n]) => n === exName) ?? pool.find(([n]) => n === exName)
    ?? [exName, PROG_ANY(exName)])[1];
  // D64: a KEPT song's harmony is PINNED to the degrees Ethan judged. The
  // generator's output can drift as the libraries evolve under it (measured:
  // one seed flipped operators between builds) — and a verdict is a judgment
  // on the music that played, so the judged snapshot outranks regeneration.
  if (judged?.verdict === 'keep' && judged.degrees && judged.degrees !== e.degrees) {
    e = {
      ...e, degrees: judged.degrees, numerals: null,
      lineage: { ...(e.lineage ?? {}), ops: [...(e.lineage?.ops ?? []), { op: 'pinned-to-judged (D64)' }], changed: true },
    };
  }
  // ---- r24 · GOOD COLOUR: read the transcribed voicing we already had -----
  // HIS RULING: "there's good color and bad color. the ones i mentioned are bad
  // color. good color is like the songs in videolab.html of the songs i liked
  // (kpop, citypop, etc. should we save these as foundational chord patterns to
  // hardcode so we know what's going on)?"
  //
  // They are already saved. All 48 entries in progressions-videos.js carry a
  // `voicedAs` array — the literal spellings off the video, "G7(9,13)",
  // "Gm7(9)", "F7(b9)" — a test checks it chord-for-chord, and he clicked KEEP
  // on 12 of the 13 that reached a page. MEASURED: nothing in the generator ever
  // read the field. The degrees were retrieved and re-voiced generically, so
  // city-pop's "2:m9 7:7 0:^7 6:7 5:^7 10:7 9:m9" lost every 9th and 13th that
  // made it sound like city-pop.
  //
  // Upgrading the QUALITY is the whole fix — same roots, same count, richer
  // chord — so it cannot re-roll a retrieval pool (D95). It is also exactly his
  // good/bad distinction: colour lives in the CHORD (vertical, the harmony's own
  // flavour) rather than in an ornament rubbing against it (horizontal, his
  // "dissonance pass").
  //
  // Measured over the pack: 31 of 271 chords upgrade, across 15 of 48 entries.
  // Conservative by design — the parser refuses `voicedAs` cells that are
  // transcription prose rather than a chord symbol, because a stray "9" inside a
  // note name would invent colour that was never played.
  if (colorFresh && e.voicedAs) {
    const upgraded = colorUpgradeDegrees(e.degrees, e.voicedAs);
    if (upgraded !== e.degrees) {
      e = {
        ...e, degrees: upgraded, numerals: null,
        lineage: { ...(e.lineage ?? {}), ops: [...(e.lineage?.ops ?? []), { op: 'voicedAs colour upgrade (r24)' }], changed: true },
      };
    }
  }
  // D73 (water: "C D F^7 -> good … however C7 following F^7 doesnt fit too
  // well. I don't like the C7"): a song may excise ONE faulted chord by
  // token substitution — everything he praised in the loop stays exactly as
  // it played. Water: 0:7 -> 9:m (vi — smooth from the IV^7 he loves, and
  // no dominant, the aquatic no-V lesson).
  if (opts.fixChord) {
    // r19/D100: accepts ONE [from, to] pair (the D73 form — calm_water is a
    // keep and rides this path byte-identically) or a LIST of them, because a
    // progression can carry more than one faulted chord. scary_citadel had two.
    const pairs = Array.isArray(opts.fixChord[0]) ? opts.fixChord : [opts.fixChord];
    for (const [from, to] of pairs) {
      e = {
        ...e, degrees: e.degrees.split(' ').map((t) => (t === from ? to : t)).join(' '), numerals: null,
        lineage: { ...(e.lineage ?? {}), ops: [...(e.lineage?.ops ?? []), { op: `fixChord ${from}->${to} (D73)` }], changed: true },
      };
    }
  }
  // r32 — opts.keyScale. HIS CARD on the reel-8 song: "the melody in the
  // glockenspiel doesn't sound on key and isn't a good melody either."
  //
  // Reel 8 is D DORIAN — B and F both natural over the C-major collection — and
  // `family: 'modal'` fell through this ternary to 'major', so the song was
  // built in D MAJOR: F# and C# against Dm9, Em7 and C^7. Every scale token and
  // the whole melody supply were reading a scale the harmony contradicts. The
  // key's MODE was simply not expressible: only desert could name one.
  const key = `${v.keyHint}:${opts.keyScale ?? desertScale ?? (v.family === 'minor' ? 'minor' : 'major')}`;
  const symbols = renderProgression(e, key);
  // r27: `opts.chordUnits` (the pack's measured relative durations) replaces the
  // even plan. Gated on ruleFresh so it can never reach a judged song, and it
  // falls back to barPlan the moment the weights do not match the rendered
  // symbol count — a progression that a `treat` op lengthened must not silently
  // take a stale weight vector.
  const unevenOn = r27() && Array.isArray(opts.chordUnits)
    && opts.chordUnits.length === symbols.length;
  const plan4 = unevenOn
    ? weightedBarPlan(opts.chordUnits, opts.chordUnitBars ?? 16)
    : barPlan(symbols.length);
  // recorded on the song so the page can show the measured units against the
  // bars they actually became — the rounding is the thing worth seeing
  const chordBarPlan = unevenOn ? plan4 : null;
  // r32 — SUB-BAR HARMONIC RHYTHM (opts.chordBeats), his "hardcoded more
  // faithfully to the reel". `chordUnits` above allocates whole BARS; six of
  // his eight reels change chord inside the bar, two of them on every beat, and
  // reel 3's changes cross the barline. `chordBeats` gives each symbol a
  // duration in beats and bindFigure resolves the chord PER ONSET (bind.js
  // r32). `barSyms` is still built — as the DOWNBEAT symbol of each bar — so
  // every downstream consumer that reasons about bars keeps working.
  const beatsPerBar = Math.max(1, Number(String(v.meter).split('/')[0]) || 4);
  const subBarOn = r32() && Array.isArray(opts.chordBeats)
    && opts.chordBeats.length === symbols.length
    && opts.chordBeats.every((x) => Number(x) > 0)
    && Math.abs((opts.chordBeats.reduce((a, b) => a + Number(b), 0) / beatsPerBar) % 1) < 1e-9;
  let barSyms; let loopBars; let ctxBar;
  if (subBarOn) {
    const cb = opts.chordBeats.map(Number);
    loopBars = Math.round(cb.reduce((a, b) => a + b, 0) / beatsPerBar);
    const edges = []; let acc = 0;
    for (const b of cb) { edges.push(acc); acc += b; }
    barSyms = Array.from({ length: loopBars }, (_, b) => {
      const pos = b * beatsPerBar;
      let k = 0;
      for (let j = 0; j < edges.length; j++) if (edges[j] <= pos + 1e-9) k = j;
      return symbols[k];
    });
    ctxBar = { harmony: symbols, chordBeats: cb, key };
  } else {
    barSyms = plan4 ? symbols.flatMap((sym, i) => Array(plan4[i]).fill(sym)) : symbols;
    loopBars = barSyms.length;
    ctxBar = { harmony: barSyms, barsPerChord: 1, key };
  }

  // ---- accompaniment: a ratified foundation in the vibe's classes ----------
  let accPool = RATIFIED_FND.filter(([, f]) => v.figClasses.includes(f.class) && f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === '4/4');
  // r27 — THE METRONOME TEST APPLIES TO THE PRIMARY PICK TOO.
  //
  // D102 states the rule: a figure is "a pulse, not a texture" at
  // `onsets/bar >= 6 && distinct shapes <= 1`, and "a gear change, not a texture"
  // at `onsets/bar >= 12`. It was only ever wired into `edgesFrom` — the TRAVEL
  // destination filter. The song's own accompaniment, the figure that plays for
  // most of its bars, was never checked.
  //
  // Caught by the r27 adversarial verify pass: `vr_ineedyourears_excited` bound
  // `fnd_octave_bounce_16ths` as its PRIMARY figure — 16 declared onsets/bar,
  // 2 shapes, 14.25 emitted onsets/bar, content literally `41, 53, 41, 53…`, a
  // root/octave bounce on every 16th, with bars 0 and 4 identical. The engine's
  // own rule would have refused that figure as a travel destination and let it
  // be the whole texture.
  //
  // Same measurement, same thresholds, applied at the pick. Falls back to the
  // unfiltered pool if it would empty it — a song with no accompaniment is worse
  // than a busy one.
  //
  // OPT-IN (`opts.metronomeAcc`), and the reason is measured, not cautious:
  // filtering the pool changes `fnv % pool.length`, so it is a RETRIEVAL RE-ROLL
  // (D95's blast radius). Switched on by default it moved SIX judged songs —
  // vs_excited_training, vs_calm_rest, vs_somber_snow, vs_excited_space,
  // vs_calm_shrine, vs_excited_fight — each to a different accompaniment figure.
  // vs_excited_fight going from `fnd_octave_bounce_16ths` to
  // `fnd_pedal_root_ostinato` is the rule working correctly on a song he has
  // already heard with the bounce. That is a re-audition, i.e. a whole round with
  // his ear on the result, not a side effect of building a test page.
  const metronomic = (f) => {
    const perBar = (f.onsets?.length ?? 0) / (f.bars ?? 1);
    const shapes = new Set((f.figure ?? []).map(String)).size;
    return (perBar >= 6 && shapes <= 1) || perBar >= 12;
  };
  if (r27() && opts.metronomeAcc === true) {
    const calm = accPool.filter(([, f]) => !metronomic(f));
    if (calm.length) accPool = calm;
  }
  // r14 lane law, the foundation side (measured against his notes: x_catacombs
  // bound fnd_boogie_shuffle — "boogie shuffle on catacombs?"; somber_manor's
  // fnd_alberti_8ths — "sounds happy"; happy/tense/mysterious desert bound
  // bossa/tumbao/walking basses — latin, not desert; both jungles bound
  // fnd_block_quarters — "just basic chords"): figure styles that read playful,
  // latin-dance or salon never bind in a serious lane. Unkept songs only.
  const FND_LANE_BLACKLIST = laneHorror
    // r18/D99 — the same gap as the r16 jungle Alberti, one figure over. His
    // ear found it on FOUR separate cards without being told which layer it
    // was: "the section the piano started doing the four note arpeggio walk
    // things ... that sounds too happy" (scary_manor), "the 4 note arpeggio in
    // the marimba or whatever it was -> too major" (tense_catacombs), "the four
    // note arpeggio also is too major and harmonious" (tense_citadel), "four
    // chord arpeggio is overused and not varied at all and also too major and
    // bland" (triumphant_citadel). Measured: fnd_arp_16ths_drive was the travel
    // destination in 8 of the 10 horror songs, and arp-family figures were 36 of
    // 65 travel destinations (55%) suite-wide. 'alberti' was already blacklisted
    // here; arp_16ths and broken_tenths are the same gesture under other names.
    ? /boogie|stride|charleston|ragtime|bossa|tumbao|walking|alberti|funk|bounce|arp_16ths|broken_tenths/
    : env === 'desert'
      // verify catch: 'alberti' was missing here — three desert songs'
      // travel edges walked drone/pedal figures INTO fnd_alberti_16ths,
      // audibly interleaved with the NSMB floor on the same marimba
      ? /boogie|stride|charleston|ragtime|bossa|tumbao|walking|swing|funk|bounce|tresillo|clave|alberti/
      : env === 'jungle'
        // r16 verify catch, and his ear found it first: 'alberti' was missing
        // from THIS arm while the horror and desert arms both carried it, so
        // both jungle songs bound fnd_alberti_8ths (R-5-3-5) and every one of
        // the nine jungle demos he judged shared it as their "constant". He
        // called it out twice without being asked which layer it was —
        // "just another default Alberti", "Alberti not match atmospheric".
        // broken_tenths joins it: it is the same figure with the third an
        // octave up, and it is where the B-letter travel edge walked.
        ? /boogie|stride|charleston|ragtime|walking|block_quarters|alberti|broken_tenths/
        : null;
  // r18/D99 — a NAME blacklist is unbounded and has now failed twice: r16's
  // jungle Alberti, and this round's arpeggio, which surfaced the moment travel
  // stopped taking the list in declaration order and reached figures the old
  // ordering had simply never got to (wide_oompah into four horror songs,
  // tresillo/montuno into three more — oom-pah under a catacomb is the very
  // "playful" he has now written on six cards). The set of playful figure NAMES
  // is open-ended; the set of figure CLASSES is closed at 13. So a serious lane
  // now states what it PERMITS. dance_bass / oompah / guajeo / riff / comp /
  // walk / fingerpick are the salon-and-dance classes and none of them belongs
  // under horror, desert or jungle.
  const SERIOUS_FND_CLASSES = new Set(['pulse', 'sustain', 'block', 'broken_octave', 'arp']);
  const laneFndOk = (n, f) => !(FND_LANE_BLACKLIST && FND_LANE_BLACKLIST.test(n))
    && !(laneSerious && f && !SERIOUS_FND_CLASSES.has(f.class));
  if (!priorKeep && FND_LANE_BLACKLIST) {
    const seriousPool = accPool.filter(([n, f]) => laneFndOk(n, f));
    if (seriousPool.length) accPool = seriousPool;
  }
  // D65 (aftermath: "too uniform where it's just one chord repeated again and
  // again slowly") — a song may ask for a MOVING class outright
  if (opts.accClassPrefer) {
    const pref = accPool.filter(([, f]) => f.class === opts.accClassPrefer);
    if (pref.length) accPool = pref;
    else if (!priorKeep) {
      // r14 (happy_jungle asked for arps but its vibe's classes carried
      // none): an unkept song's explicit class ask may reach past the
      // vibe's own class list — still ratified, still lane-filtered
      const wide = RATIFIED_FND.filter(([n, f]) => f.class === opts.accClassPrefer && f.meter_class === v.meter && !(FND_LANE_BLACKLIST && FND_LANE_BLACKLIST.test(n)));
      if (wide.length) accPool = wide;
    }
  }
  const [accName, accFig0] = accPool[fnv(`${name}|acc`) % accPool.length];
  // D73 (kitchen, the THIRD "way too hyper", now aimed at the piano: "still
  // way too hyper in the piano key. like way too hyper and fast"): a very
  // fast staccato 2/4 song halves the piano's pulse — the same figure spans
  // two bars, so the oom-pah breathes at half rate while the tempo (and the
  // drums he already approved) stays. The lead thins below, same trigger.
  const accHalfTime = v.meter === '2/4' && v.bpm >= 150 && (v.articulation?.style === 'staccato');
  // r16 JUNGLE VAMP. Blacklisting the Alberti is necessary but not sufficient:
  // measured, the whole ratified arp pool is 5 entries and 3 of them ARE
  // Alberti, and banning it outright drops both songs onto fnd_ballad_8ths_arch
  // at octave 2 — which doubles happy_jungle's acc/bass unison from 22% to 44%
  // and pushes the marimba to MIDI 97, seven semitones past the HQ marimba's
  // top key. So the lane gets a written vamp instead of a pool pick.
  //
  // The shape is Ryuu's, bars 26-31 — the one figure in his references that
  // makes a single moving interval read as variation: pedal-ish frame, dyad
  // body, and the colour tone is the only thing that moves. Thirdless on the
  // strong slots, because he said "sometimes songs are too harmonious to be
  // atmospheric"; 3+3+2 rather than straight 8ths, because that is what stops
  // it outlining a triad in order the way the Alberti did. s2/s6 resolve
  // against the chord-scale (r15/D95), so over dorian they land the 9th and
  // the natural 6th — dorian's own characteristic tone, not a generic third.
  //
  // r18/D99, his ask verbatim: "do we have any other jungle harmony besides
  // jungle vamp?" — no, and that was the whole problem: BOTH jungle songs bound
  // the identical figure, so the lane fix from r16 had itself become the lane's
  // new monoculture, which is the exact complaint it was written to answer. The
  // second figure is the CANOPY: two bars instead of one, so it cannot be heard
  // as a one-bar loop; a low root that lands only on bar 1 and is answered by
  // its fifth in bar 2, which is how the DKC beds breathe; and its colour tones
  // are the 9th and the 4th (s2/s4 — chord-scale resolved, so in key by
  // construction) instead of the vamp's 9th and 6th. Same laws, different music.
  const JUNGLE_ACC = [
    {
      name: 'jungle-vamp', bars: 1, grid: 16, class: 'riff', meter_class: '4/4', legato: false, octave: 3,
      onsets: ['0', '3/16', '3/8', '1/2', '11/16', '7/8'],
      figure: ['R', '5', 's2.5', 'R+', '5', 's6.5'],
      accents: [1, 0.6, 0.8, 0.9, 0.6, 0.75],
    },
    {
      name: 'jungle-canopy', bars: 2, grid: 16, class: 'riff', meter_class: '4/4', legato: false, octave: 3,
      onsets: ['0', '5/16', '1/2', '3/4', '1', '21/16', '13/8', '15/8'],
      figure: ['R', 's4.R+', '5', 's2.5', '5', 's2.5', 'R+', 's4.5'],
      accents: [1, 0.7, 0.85, 0.6, 0.9, 0.65, 0.8, 0.55],
    },
  ];
  const jungleVamp = !priorKeep && env === 'jungle'
    ? (JUNGLE_ACC.find((f) => f.name === opts.jungleAcc)
      ?? JUNGLE_ACC[fnv(`${name}|jungleacc`) % JUNGLE_ACC.length])
    : null;
  // r16 HORROR OSTINATO, from Boiler Mushi — the reference he sent mid-round
  // with "after it actually gets to the theme (after the silence) it sounds
  // spooky". Measured, and the measurement refuted the obvious answer: the bars
  // he called spooky contain ZERO sustained minor 2nds, minor 9ths, major 7ths
  // or tritones, and a non-horror song (calm_water) beats the whole theme on
  // semitone content. Vertical dissonance explains nothing here.
  //
  // What separates it is MELODIC semitone motion inside the accompaniment hand:
  // 50.7% of the left hand's steps in the ostinato are half-steps, against
  // 0.0-2.4% for every engine horror acc measured. The controlled comparison is
  // inside the file itself — its intro repeats a byte-identical cell for 13
  // bars too, but that cell is octave leaps (0% semitone) and is not spooky.
  // Repetition is not the spook; the semitone inside the repeated cell is.
  //
  // So: C3 G3 Ab3 G3, twice a bar — root, fifth, b6, fifth, with NO THIRD, the
  // b6 rocking against the fifth. It is DIATONIC (all three are in natural
  // minor), so it clears D88 — this is colour, not the dim-chain chromaticism
  // his ear rejects. It plays at accompaniment volume (measured 0.86x the
  // melody, -1.4 dB), NOT at the 0.08-0.30 the other horror devices use, which
  // is why those read as ornaments and this reads as the song.
  const horrorOstinato = opts.horrorOstinato ? {
    name: 'horror-b6-ostinato', bars: 1, grid: 8, class: 'pulse', meter_class: '4/4', legato: false, octave: 3,
    onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
    figure: ['R', '5', '~8', '5', 'R', '5', '~8', '5'],
    accents: [1, 0.6, 0.85, 0.6, 0.95, 0.6, 0.85, 0.6],
  } : null;
  // r32 — THE REEL'S CHORD ROW *IS* THE ACCOMPANIMENT (opts.reelAcc).
  //
  // On the page he judged, a faithful card cast the reel's `chords` row as an
  // EXTRA layer while the engine's own `_acc` went on playing a different
  // figure over the same harmony — two harmony hands at once. That is a
  // doubling, not a stack, and it is the shape D102 warns about from the other
  // direction ("two layers that always strike together on one instrument are
  // one layer"). Here the acc slot simply takes the reel's row, so there is one
  // harmony hand and it is the transcribed one. Same slot as horrorOstinato and
  // the jungle vamp, which is the precedent for a lane supplying its own acc.
  const reelAccRow = opts.reelAcc ? LAYER_PATTERNS[opts.reelAcc] : null;
  const reelAccFig = reelAccRow ? {
    name: `reel-${opts.reelAcc}`, bars: reelAccRow.rhythm.bars ?? 1,
    grid: reelAccRow.rhythm.grid ?? 16, class: 'block', meter_class: '4/4',
    legato: reelAccRow.rhythm.legato ?? false,
    onsets: reelAccRow.rhythm.onsets, figure: reelAccRow.intervals,
    accents: reelAccRow.rhythm.accents,
  } : null;
  const accFig = reelAccFig ?? horrorOstinato ?? jungleVamp ?? { ...accFig0, name: accName, ...(accHalfTime ? { bars: (accFig0.bars ?? 1) * 2 } : {}) };
  // accDensity feeds the PLANNER and the lead target — computed from the
  // figure as authored, not the half-time stretch, so slowing the piano's
  // pulse cannot re-roll the cast (measured: the halved value handed
  // kitchen an extra pizzicato layer — more voices on the song he wants
  // calmer)
  const accDensity = accFig0.onsets.length / (accFig0.bars ?? 1);
  // D73 addendum 2 (fight: "i can't hear it. maybe replace the piano low
  // note part with the bass"): a doubled bare sine at octave 1 vanished
  // under the mix — 32Hz with no harmonics doesn't survive real speakers.
  // So on beat-forward fast songs whose accompaniment is a root-driven
  // pulse, the BASS TAKES THE PART: the low line binds on gm_synth_bass_1
  // (the bronik voice he could hear once its gain came up) instead of
  // piano, and no doubling layer stacks under it.
  const rootDriven = accFig.figure.every((t) => /^R\+?$/.test(t))
    && accFig.onsets.length / (accFig.bars ?? 1) <= 8;
  const accToBass = rootDriven && v.bpm >= 140 && ['driving', 'foreground'].includes(v.percussion.presence);
  // D86 (his round-9 rule, engine-wide): ENERGETIC songs spread OFF the
  // piano — the accompaniment hand binds a synth voice — unless the vibe is
  // explicitly piano territory ("piano heavy like goofy or playful or
  // solo/duet/trio"). fullSynth songs force it regardless of vibe.
  const PIANO_MOODS = ['goofy', 'comic', 'playful', 'quirky', 'silly', 'whimsical'];
  const pianoVibe = (v.moods ?? []).some((m) => PIANO_MOODS.includes(m))
    || ['solo', 'duet', 'trio'].includes(v.ensemble.anchor);
  const energetic = ['driving', 'foreground'].includes(v.percussion.presence) || v.bpm >= 140;
  const synthAcc = Boolean(opts.fullSynth) || (energetic && !pianoVibe);
  // fully-synth voice map: every acoustic cast/handoff instrument retints to
  // the D85 palette; names already synth pass through
  const SYNTH_OF = (inst) => {
    if (/synth|supersaw|sawtooth|square|epiano|music_box|kalimba|pad_|^gm_pad/.test(inst)) return inst;
    if (/string|cello|violin|viola|tremolo|fiddle/.test(inst)) return 'gm_synth_strings_1';
    if (/bass/.test(inst)) return 'gm_synth_bass_1';
    if (/vibraphone|celesta|glocken|xylophone|marimba|bell|chime/.test(inst)) return 'gm_music_box';
    if (/piano|harpsichord|clavinet/.test(inst)) return 'gm_epiano1';
    if (/flute|recorder|whistle|ocarina|calliope|clarinet|oboe|pan_/.test(inst)) return 'gm_lead_1_square';
    if (/trumpet|trombone|horn|brass|sax|tuba/.test(inst)) return 'gm_lead_2_sawtooth';
    if (/pizzicato|guitar|koto|harp|banjo/.test(inst)) return 'gm_kalimba';
    return 'gm_pad_warm';
  };
  // D87 (his construction keep-note, "synths sound better than piano for
  // this vibe I think - learn this"): synth-acc songs carry SYNTH LEADS
  // too — saw above 120bpm, square below (fullSynth calm songs keep the
  // Rhodes lead under 120).
  // D89 (rest: "maybe some strings could actually take the melody. like solo
  // violin or cello") — a song may hand its melody to a named voice outright,
  // and may seat it in that voice's own singing register.
  // D90 (his correction: "there should be handoffs ... im just saying some
  // songs should have string melodies / solo string melodies"): string
  // melodies are a PALETTE capability, decoupled from handoffs. A
  // string-friendly vibe (slow, legato/pedal, chamber anchor or somber-side
  // moods, not fullSynth) opens the melody to strings two ways: the letter
  // handoff pool goes strings-first (below), and a HISTORY-LESS song (no
  // verdict, no note — nothing of his mid-conversation) may roll a solo
  // string lead outright. Songs he has spoken about keep their lead voice
  // unless his note names it.
  const STRINGY_MOODS = ['somber', 'sad', 'grave', 'tender', 'intimate', 'nostalgic', 'plaintive', 'sacred'];
  const stringFriendly = !opts.fullSynth && v.bpm <= 90
    && ((v.articulation?.pedal) || v.articulation?.style === 'legato')
    && (['solo', 'duet', 'trio'].includes(v.ensemble.anchor) || (v.moods ?? []).some((m) => STRINGY_MOODS.includes(m)));
  const stringLeadRoll = !opts.leadSound && stringFriendly && !priorKeep
    && historyLess()
    && fnv(`${name}|stringlead`) % 3 === 0
    ? (fnv(`${name}|stringvoice`) % 2 === 0 ? 'gm_cello' : 'gm_violin')
    : null;
  // r14 (every catacombs/citadel note: "the synths don't really fit ...
  // playful", "lead synths sound really playful"): a horror lane's default
  // lead is never a chip synth — catacombs takes the sharp solo violin (his
  // own suggestion), citadel the church organ. opts.leadSound always wins;
  // manor keeps the dark piano (the PianoX trope).
  // r18/D99 — catacombs moves off the solo violin. The violin was HIS OWN r14
  // suggestion ("more sharp solo cello or solo violin playing off chord notes"),
  // but that was a request for a background dissonance colour, and it ended up
  // carrying the tune. All three catacombs songs came back saying so: "I think
  // the violin taking the melody made it not as much scarier" (scary), "the
  // violin sounds giddy almost and the melody is too major" (tense), "mostly the
  // same advice when the violin and piano comes in though. it just sounds much
  // more playful" (x). The cello says the same lane in a register that cannot
  // read giddy; the violin stays in the lane for the layers underneath.
  const horrorLeadDefault = !priorKeep && env === 'catacombs' ? 'gm_cello'
    : !priorKeep && env === 'citadel' ? 'gm_church_organ' : null;
  const LEAD_SOUND_RAW = opts.leadSound ?? stringLeadRoll ?? horrorLeadDefault ?? (opts.fullSynth ? (v.bpm >= 120 ? 'gm_lead_2_sawtooth' : 'gm_epiano1')
    : synthAcc ? (v.bpm >= 120 ? 'gm_lead_2_sawtooth' : 'gm_lead_1_square') : 'piano');
  // r25 — THE BOWED LEAD COMES OFF THE QUIET SONGS. His r24 ruling was an
  // articulation one ("some calm/slow songs could have strings as the melody but
  // SOFT and fluid in dynamics") and r24 answered it with `leadDynamics`. His r25
  // cards say the dynamics fix was not enough and name the SAMPLE:
  //   "this cello/string vst just isn't good for these sort of chill songs"
  //   "cello sucks once again. just remove it in general because the vst sucks"
  //   "the cello too loud and forceful again. i just dislike this cello for this genre"
  //   "still way too loud and forceful ... maybe learn in engine to replace with
  //    another instrument"
  //   "cello still way too loud and constant instead of flowing"
  // MEASURED: all five songs lead on gm_violin, all are salience 'background', all
  // 50-60bpm. The predicate is declared data, not a name list — a BOWED voice is
  // family 'string' with a SLOW attack, which is the same pair `leadDynamics`
  // already keys on. The replacement pool is the range he named himself, "piano,
  // woodwind, or other instruments too", and it is what he praised on the one snow
  // song he liked: "the flutes/clarinets are actually really good".
  //
  // The pool is hash-rotated rather than fixed so this does not become a second
  // monoculture, and it is applied to the HANDOFF pool too — D100's lesson is that
  // a voice removed from one path arrives through another.
  const isBowed = (snd) => INSTRUMENTS[snd]?.family === 'string' && INSTRUMENTS[snd]?.attack === 'slow';
  const UNBOWED_LEADS = ['gm_clarinet', 'gm_flute', 'piano', 'gm_vibraphone'];
  const swapBowed = ruleFresh(25) && v.salience === 'background' && !opts.leadSound;
  const LEAD_SOUND = (swapBowed && isBowed(LEAD_SOUND_RAW))
    ? UNBOWED_LEADS[fnv(`${name}|unbowed`) % UNBOWED_LEADS.length]
    : LEAD_SOUND_RAW;
  // r14 (render-log catch: violin/trumpet leads at octave 5 folded up to
  // 206 notes/song down an octave in HQ — VSCO violin tops at G#5, trumpet
  // at F#5): range-limited lead voices walk at octave 4 in BOTH tiers so
  // the browser and HQ mixes stay the same music.
  // r18/D99: `cello` added, and the lesson is the one this round keeps
  // teaching. Moving catacombs onto a cello lead put 160 notes past the top of
  // the VSCO cello because this list — a list of NAMES — did not have it, so
  // the lead kept the violin's octave. Measured: sfz notes outside their patch
  // range 375 -> 545 across the suite, invisible in the pages render log,
  // caught only by measuring the ranges directly. The cap belongs to the
  // instrument's range, not to how the instrument got chosen (a cello from the
  // string-lead roll was already capped a few lines down, which is exactly the
  // kind of duplicate rule that lets one path escape).
  const leadRangeCapped = !opts.leadOctave && /violin|trumpet|oboe|shanai|cello/.test(LEAD_SOUND);
  const leadOctave = opts.leadOctave
    ?? (stringLeadRoll === 'gm_cello' || leadRangeCapped
      ? Math.min(v.register.leadOctave, 4) : v.register.leadOctave);
  const accOnsets = accFig.onsets;
  const accOct = Math.max(1, Math.min(3, opts.accOctave ?? v.register.accOctave));
  // D63 articulation: style-level duration + damper on top of each pattern's
  // own authored legato (bindFigure honours entry.legato; .clip scales it)
  const ART = v.articulation ?? { style: 'detached', pedal: false };
  // genre-expansion (his desert-vs-space complaint; research/env-space.md §5:
  // "long echo/reverb tails and held whole-note beds — wet = void. Desert is
  // DRY"): a desert song never takes the damper-pedal wet room, whatever its
  // emotion says. Unkept only — a kept desert would keep its judged wetness.
  if (prompt.environment === 'desert' && !priorKeep) ART.pedal = false;
  const LEAD = { ...(ART.lead ?? { hold: false, merge: true, densityMul: 1, gainMul: 1 }) };
  // D64 (his fight note): a fast song wants a LONG HELD lead over the busy
  // floor — "even though it's meant to be energetic, there should be a long
  // held melody". Fires on fight/boss/drop.
  if (v.bpm >= 140) {
    LEAD.hold = true;
    LEAD.densityMul = Math.min(LEAD.densityMul, 0.55);
  }
  // D73: on the half-time-acc songs the lead thins hard too — the piano as
  // a whole is what he heard as hyper, not one hand of it (0.35 measured
  // only -13% because the retrieval band re-absorbed it; 0.2 pins the
  // target to the sparse end of the cell pool)
  if (accHalfTime) LEAD.densityMul = Math.min(LEAD.densityMul, 0.2);
  // D87 (stealth note: the melody "does too much \"talking\" - too active
  // for stealth"): a song may thin its lead directly
  if (opts.leadDensityMul) LEAD.densityMul = Math.min(LEAD.densityMul, opts.leadDensityMul);
  // r19/D100 — CATACOMBS JOINS THE MANOR AS AMBIENCE. His ruling: "it should
  // just be the beginning and ambiant horror with like some small random brief
  // melodies or sounds", and separately "the melody itself does not work for
  // this genre because it's too harmonic and sounds playful. same for the other
  // catacombs". I measured the obvious hypotheses first and they all REFUTED:
  // against the six leads he has praised, the catacombs leads are SPARSER (2.96
  // vs 3.48 notes/bar), no more chord-toned (89% vs 93%), no leapier (90% vs
  // 87%) and LESS bouncy (1.71 vs 2.11 direction changes/bar). Nothing in the
  // note statistics separates them — the engine writes ONE kind of tune, a
  // singing phrase-shaped one, and that reads fine over a shop and playful over
  // a crypt. So the fix is not a better melody, it is LESS melody: the same
  // fragment density D93 prescribes for ambience and scary_manor has carried
  // since r14 at 0.3.
  if (!priorKeep && !opts.grammarPin && env === 'catacombs') LEAD.densityMul = Math.min(LEAD.densityMul, 0.35);
  // D89/D90: a bowed/blown lead sustains — the arranger's own SUSTAINY rule
  // (winds and strings fill to the next note), reaching the main lead whether
  // named by opts or rolled by the string-lead capability
  if (/cello|violin|viola|string|flute|recorder|horn|trumpet|oboe|clarinet|choir|shanai|pan_flute/.test(LEAD_SOUND)) LEAD.hold = true;
  // D64/D65 (his boss note, twice): when foreground drums play, the melody
  // rides louder — the boost stepped 0.12 → 0.18 ("could still be a bit louder")
  // D86: opts.leadGainMul — a song-scoped trim dial (fight: "piano (very loud)")
  // D89 (snow + rest, the same words twice: "melody too soft"): a song whose
  // opts RAISE the lead may pass the 1.0 ceiling (to 1.15) — the ceiling
  // stays for every formula-driven gain so no judged mix moves.
  const leadGain = Math.min(opts.leadGainMul > 1 ? 1.15 : 1, Math.round((0.85 * LEAD.gainMul + (v.percussion.presence === 'foreground' ? 0.18 : 0)) * (opts.leadGainMul ?? 1) * 100) / 100);
  const accFx = ART.pedal ? '.clip(1.25).room(0.5)'
    : ART.style === 'staccato' ? '.clip(0.55).room(0.15)'
    : ART.style === 'legato' ? '.clip(1.1).room(0.3)'
    : '.room(0.25)';
  // D65/D67 (cave/snow round 2, then cave + water round 3 — "more reverb"
  // three times): the pedal vibes' whole piano sits in a wetter room
  // ---- r24 · A SUSTAINED LEAD NEEDS DYNAMICS, NOT A DIFFERENT VOICE -------
  // His ruling, verbatim: "it depends, i dont want to hardcode anything. like
  // some calm/slow songs could have strings as the melody but SOFT and fluid in
  // dynamics. moreover it could also be piano, woodwind, or other instruments
  // too - there's not really a limitation other than maybe brass and other
  // stuff i disliked in the past."
  //
  // So this is NOT a voice swap and NOT a lane rule. The palette stays open.
  //
  // What his five near-identical cards were actually describing: "way too loud
  // and forceful and a constant screeching", "too loud and constant instead of
  // flowing", "if the cello were softer and less forceful and more flowing".
  // MEASURED — the lead's gain is ONE CONSTANT for the entire song, always has
  // been (`.gain(0.47)` on all five), while pads have breathed per bar since
  // D67. A struck voice hides that because its own decay envelope supplies the
  // shape; a bowed voice at a fixed gain is a flat wall of tone.
  //
  // That split is exactly what his verdicts drew: all five "cello too loud and
  // forceful" songs lead on gm_violin (attack slow, sustain long), and
  // su_triumphant_snow — "definitely a solid song" — leads on piano.
  //
  // Keyed on DECLARED DATA (`attack` / `sustain` in INSTRUMENTS), never a name
  // list — line 845 above still name-matches for LEAD.hold and is the kind of
  // rule that has failed five times here.
  const LEAD_INST = INSTRUMENTS[LEAD_SOUND] ?? null;
  const leadSustained = LEAD_INST?.sustain === 'long';
  const leadBowed = leadSustained && LEAD_INST?.attack === 'slow';
  // History-less songs only (D99) plus an explicit opt — the judged page's
  // leads must not move until his ear rules on this.
  // r33: `!opts.pinFrom` → ruleFresh(25) — same pin-semantics repair as
  // deepDrums below; r20/r24 pins keep their judged (off) state, an r33 pin
  // keeps the capability it was judged with.
  const leadDynOn = (opts.leadDynamics === true
      || (opts.leadDynamics !== false && leadSustained && ruleFresh(25)
          && historyLess()));
  // Two DIFFERENTLY-SHAPED four-bar arcs, so an eight-bar span never repeats a
  // contour — "fluid", not a square wave. Peak on bar 3 of the first phrase and
  // bar 2 of the second.
  const LEAD_ARC = [0.70, 0.86, 1.00, 0.80, 0.74, 1.00, 0.88, 0.78];
  // A slow-attack (bowed) voice reads forceful at the struck-voice gain, and
  // "screeching" is what an un-shaped bow sounds like. Trim the centre unless
  // the song is loud enough to need it.
  const leadDynMul = leadBowed && v.percussion.presence !== 'foreground' ? 0.82 : 1;
  const leadGainExpr = leadDynOn
    ? `"<${LEAD_ARC.map((x) => Math.round(leadGain * leadDynMul * x * 100) / 100).join(' ')}>"`
    : String(leadGain);
  // r33 — THE GAIN CLOBBER. bindMelody authors a per-note accent envelope as
  // .gain("<...>") on its own expr; every melody-family fx here then appended a
  // SECOND, flat .gain(x) — and a later .gain() REPLACES the earlier one, it
  // does not compose (measured: note(...).gain("1 .5 .75 .25").gain(0.8)
  // realizes 0.8/0.8/0.8/0.8; .mul(gain(0.8)) realizes 0.8/0.4/0.6/0.2). So
  // the ENTIRE melody tier — lead, handoff letters, takeover/alternate/backup,
  // octave partner — has realized UNIFORM velocity on every page (min==max on
  // 14/16 reels leads; all 47 songs.html leads carry the double-gain chain).
  // "Uniform velocity is a bug" is this project's own §3.4. His r33 cards sit
  // on top of it: a handoff whose authored 0.666–0.98 envelope collapses to a
  // flat 0.85 IS "the flute is too loud" with no shading. `.mul(gain(x))`
  // composes; kept/pinned songs were JUDGED with the flat form and keep it.
  const gainFx = (g) => (r33() ? `.mul(gain(${g}))` : `.gain(${g})`);
  const leadFx = ART.pedal ? `${gainFx(leadGainExpr)}.room(0.7)` : `${gainFx(leadGainExpr)}.room(0.25)`;
  // r16 FOUNDATION-VARIATION LAW — supersedes D94's 2-bar composite.
  //
  // He rejected D94 in three independent places in one round. The jungle-floor
  // note: "important that you don't reuse b every time though. because that
  // makes it uniform (and no changing like 1 interval randomly doesn't change
  // it like you did for the foundations)". The desert-bass A/B, whose two demos
  // differ by exactly ONE note per bar: "they sound the same". And his
  // mid-round message with the Spirited Away scores attached: "see how it's not
  // just a default foundations but select intervals and such? and how sections
  // change over time".
  //
  // MEASURED, he was right and it was worse than "~1 note": of the 66 letter
  // composites in the suite, 65 changed EXACTLY ONE event and one changed
  // nothing; 52% of them fired the identical device (a '+' on the last onset);
  // and 76% never moved an onset at all, so the rhythm never varied. Against
  // his two references the gap is categorical — the engine played 3.79 distinct
  // interval classes per song to Ryuu's 11 and Inochi's 12, and 99.3% of every
  // accompaniment note it has ever written was a root, third or fifth. Not one
  // 4th, 6th, 7th or 9th above its own bass, ever, because the foundation canon
  // is 98.8% R/3/5 tokens and all 30 of its entries are one bar long.
  //
  // So the composite is FOUR bars, and each block owes a quota of changed
  // events by CLASS: block 2 always moves the RHYTHM, block 3 always rewrites
  // the INTERVALS (scale-aware, per r15/D95), block 4 is a turnaround. A form
  // that cannot make its quota ESCALATES to the next form rather than degrading
  // to a one-note edit — which is what produced the octave-lift monoculture.
  // Ryuu is the model: its 2-bar unit keeps the first half byte-identical and
  // replaces 4 of 4 notes in the second (84% churn), and the same progression
  // returns three times at 5.5 / 1.8 / 8.0 onsets per bar.
  const accVaryOn = !priorKeep && !opts.grammarPin && opts.accVary !== false;
  // r20/D101 — `pinFrom`, and why grammarPin was the wrong tool for a fresh
  // prose keep. THE KEEP-TRANSITION LAW (D91), third time it has bitten.
  //
  // vs_somber_space, vs_calm_desert and vs_scary_cave arrived as PROSE KEEPS
  // this round, judged on the UNKEPT path — so acc variation, the D99 travel
  // rotation, the D98 melody grammar and the D100 descant placement were ALL
  // live in what he heard and praised. Setting `grammarPin: true` to protect
  // them from the new r20 walk switched every one of those off too: the byte
  // compare showed somber_space's lead going from two held notes a bar to nine,
  // and its descant walk moving a bar — i.e. the pin destroying exactly the
  // "pad warping thing" and the layering he said he loved.
  // Pinning feature-by-feature is how that gets missed (six flags, and the next
  // rule makes it seven). `pinFrom` states the real intent instead — rules
  // introduced in this round and later do not reach this song — and it
  // generalises: an r21 rule keys on the same stamp.
  //
  // r24 — GENERALISED, AND IT WAS A LATENT BUG. The comment above says "an r21
  // rule keys on the same stamp", but the code compared against the literal
  // string 'r20', so ANY other stamp (`pinFrom: 'r24'`) was silently ignored and
  // the song it was meant to protect stayed fully exposed. Parsed as a round
  // NUMBER now, so a rule introduced in round N does not reach a song pinned
  // from round <= N.
  // Onsets are held as INTEGER slots out of ACC_DEN per bar so every comparison
  // and midpoint is exact; only the emitted strings are fractions again.
  const ACC_DEN = 192;
  const slotOf = (o) => {
    const [a, b] = String(o).split('/').map(Number);
    return Math.round((a / (b ?? 1)) * ACC_DEN);
  };
  const octSplit = (t) => { const m = /^(.*?)(\++)?$/.exec(String(t)); return [m[1], m[2] ?? '']; };
  const RECOLOURABLE = /^(R|[34567]|9|s[2467])$/;
  // A figure token may be a dot-joined STACK (`R.3.5` block chords, `R.5` power
  // fifths, `3+.5+.R+` oompah). Those are half the foundation canon and the
  // r15 forms skipped every one of them, which is why the block-chord songs —
  // somber_manor, scary_citadel, tense_catacombs — never varied at all. For a
  // stack, recolouring means moving its TOP voice; the root stays put.
  const topOf = (t) => { const p = String(t).split('.'); return octSplit(p[p.length - 1]); };
  const setTop = (t, tone) => {
    const p = String(t).split('.');
    p[p.length - 1] = tone + topOf(t)[1];
    return p.join('.');
  };
  // r20/D101 — THE SCALE LADDER, and why the variation forms needed one.
  //
  // MEASURED on the judged build, across all 47 songs: the accompaniment plays
  // 5,599 non-chord tones (22.8% of 24,559 notes) and 93.9% of them NEVER
  // RESOLVE — they are leapt away from. Only 27 notes in the entire suite (0.1%)
  // are true passing tones. That one number is behind two complaints that read
  // as opposites:
  //   "the piano doesnt do any walking. there's not any extra notes between
  //    chords or countermelody etc in the piano - it's just chord bouncing"
  //    (nostalgic_casino) — walking IS passing tones, and there are 27.
  //   "too much dissonance and variation ... just tiny offbeats and bits of
  //    dissonance that you can't follow" (mysterious_jungle) — an unresolved
  //    non-chord tone is exactly a dissonance you cannot follow.
  // Both are the same defect: the r16 forms vary by SUBSTITUTION (swap a chord
  // tone for a colour tone in place), and a substitution changes the note but
  // not the LINE. A passing tone is defined by what comes AFTER it.
  //
  // The fix has to work in any key over any chord, which is his actual test
  // ("even in different chord progressions and such"). So define an inserted
  // note RELATIVE TO THE TOKEN IT RESOLVES INTO, on the chord-scale ladder:
  // consecutive ladder positions are a step apart by the definition of a scale,
  // and every token here resolves against chordScale (D95), so none of this can
  // spell a foreign pitch — the same guarantee `s2/s4/s6/s7` already carried.
  const LADDER = ['R', 's2', '3', 's4', '5', 's6', 's7'];
  // the plain-degree spellings the canon actually uses map onto the ladder too,
  // so a figure written with `3`/`5` is walkable without rewriting it first
  const LADDER_IX = { R: 0, s2: 1, 2: 1, 9: 1, 3: 2, s4: 3, 4: 3, 5: 4, s6: 5, 6: 5, s7: 6, 7: 6 };
  const ladderIx = (tok) => LADDER_IX[octSplit(topOf(tok)[0])[0]] ?? null;
  // the ladder step between two positions, as a token — the passing tone. Only
  // defined when they are exactly two apart (a third); anything else is not a
  // gap a single step can fill.
  const ladderBetween = (a, b) => {
    if (a == null || b == null) return null;
    const lo = Math.min(a, b), hi = Math.max(a, b);
    if (hi - lo !== 2) return null;
    return LADDER[lo + 1];
  };
  // a NEIGHBOUR of a position: the adjacent ladder tone, preferring the one
  // below (a leading tone into the target reads as intent; the upper neighbour
  // is the fallback when the target is the root itself)
  const ladderNeighbour = (ix, below = true) => {
    if (ix == null) return null;
    if (below) return ix > 0 ? LADDER[ix - 1] : LADDER[LADDER.length - 1];
    return ix < LADDER.length - 1 ? LADDER[ix + 1] : LADDER[0];
  };
  // r24 — THE VERTICAL COROLLARY OF THE RESOLUTION LAW (his "too much dissonance
  // in some of the chords in the piano" / "the added notes in the piano onto the
  // Alberti make it sound bad").
  //
  // D101's law is HORIZONTAL: retarget a non-chord tone so the LINE steps into
  // whatever follows it. It does that by moving the TOP VOICE of the token it
  // lands on (`setTop`), and it never looked at the voices underneath. The
  // ladder's own defining property is what turns that into a defect: consecutive
  // ladder positions ARE a step apart, so retargeting a top voice to a NEIGHBOUR
  // of the next token puts it a step from the voice below it whenever that voice
  // happens to sit one position away.
  //
  // MEASURED, r24 suite, accompaniment hand only: 35.0% of its 2,066 polyphonic
  // attacks sound an interval of a second and 14.5% a literal SEMITONE, against
  // 9.0% / 3.9% across the 59 MIDI files he hand-picked (per-file median there
  // 1.4%, p75 11.4%). EIGHT songs measured 100.0% — their acc hand is monophonic
  // except where a variation form bolts a partner on, so every chord they own is
  // the clash. su_excited_boss sounds F against F# 64 times; su_triumphant_boss
  // sounds a whole tone 64 times.
  //
  // The law: a horizontal fix may not create a vertical step. It is checkable on
  // the TOKENS alone — ladder position is scale position, and bindFigure resolves
  // each member of a stack at or above the one before it, so the sounding gap
  // between consecutive members needs no chord to compute.
  //
  // His own good/bad-colour ruling says how to REPAIR rather than merely refuse:
  // a 9th above the chord is the colour he keeps (the city-pop and kpop loops he
  // clicked), a 2nd beside the root is the clash. Same tone, different octave. So
  // the guard lifts an octave first and only gives up if that is out of range.
  const verticalGuard = ruleFresh(24);
  // VERIFY CATCH, and the reason this is stated in code rather than assumed: the
  // first version of this raised each member to sit at or above the one before
  // it, on the strength of a comment saying stacks resolve that way. bindFigure
  // does NOT — `midi = rootRef + memberSemis(member) + 12 * plus.length`, each
  // member independent of its neighbours. The monotone model passed `R.3.5.s4`
  // as clean while the song sounded D-F#-G#-A, a semitone at the top. So the
  // members are placed where the binder places them, and EVERY PAIR is checked,
  // not just consecutive ones.
  //
  // LADDER_IX is the right coordinate for it: checked against memberSemis, the
  // seven positions map to strictly increasing semitones (R 0, s2/9 2, 3 4,
  // s4/4 5-6, 5 7, s6/6 9, s7/7 10-11) with no implicit octaves anywhere, so one
  // ladder position apart IS one scale step apart, in any key over any chord.
  const stackPositions = (tok) => {
    const out = [];
    for (const p of String(tok).split('.')) {
      const [core, oct] = octSplit(p);
      const ix = LADDER_IX[core];
      if (ix == null) return null;           // `~n` and anything unmapped: not analysable
      out.push(ix + 7 * oct.length);
    }
    return out;
  };
  // A stack is BAD when two consecutive members sound a step apart (1 ladder
  // position) or land on the same pitch class in the same or the next octave
  // (0 or 7). The second clause is the guard's own footprint: retargeting the
  // top of `R.s4.s6` to `s4` writes `R.s4.s4`, which is not a clash but is a
  // wasted voice, and D100 already bans octave doubling for the companion.
  const stackBad = (tok) => {
    const pos = stackPositions(tok);
    if (!pos) return false;
    for (let i = 0; i < pos.length; i++)
      for (let j = i + 1; j < pos.length; j++) {
        const d = Math.abs(pos[i] - pos[j]);
        if (d === 1 || d === 0 || d === 7) return true;
      }
    return false;
  };
  // setTop, with the vertical guard. A single note has no stack to clash with and
  // is passed straight through, which is 77% of accompaniment attacks.
  //
  // The LIFT is only offered to a plain top voice — `R.s2` -> `R.s2+` is the 9th
  // instead of the 2nd, which is exactly the good-colour/bad-colour distinction
  // he drew, and it costs one octave from a stack that has none. A top that is
  // ALREADY octave-marked gives up instead: measured, lifting there wrote
  // `3+.5+.s6++` on the casino oompah, two octaves above the hand and over the
  // lead, and on su_excited_boss it parked a spread b9 on all 64 offbeats of an
  // 8-bar block. D102's own rule kills that second one on sight — a barely-moving
  // line parked on an out-of-key pitch is the shape the corpus never writes.
  // Giving up keeps the dyad's perfect fourth, which is diatonic by construction.
  const setTopVoiced = (t, tone) => {
    if (!verticalGuard || !String(t).includes('.')) return setTop(t, tone);
    const plain = setTop(t, tone);
    if (!stackBad(plain)) return plain;
    if (!topOf(t)[1].length) {
      const lifted = String(t).split('.').slice(0, -1).concat(`${tone}+`).join('.');
      if (!stackBad(lifted)) return lifted;
    }
    return t;                                 // D101: a tone that stays put beats one that clashes
  };
  // A colour tone is picked so that it RESOLVES into the token that follows it.
  // This is his calm_shrine note in his own capitals — "maybe vary the intervals
  // individually of the chords (NOT IN A RANDOM WAY, IN A CALULCATED WAY BUT A
  // WAY THAT'S UNIQUE)". The old rotation `PAL[(k++ + cyc) % PAL.length]` is the
  // random way: it consults neither neighbour. If NO palette member lands a step
  // from the target the token is LEFT ALONE — a chord tone that stays put is
  // always better than a colour tone that goes nowhere, and a form that can no
  // longer make its quota escalates to the next form (the r16 rule) instead of
  // shipping a near-copy.
  const pickResolving = (pal, nextTok, cyc) => {
    const target = ladderIx(nextTok);
    if (target == null) return null;
    const good = pal.filter((p) => {
      const ix = ladderIx(p);
      if (ix == null || ix === target) return false;
      const d = Math.abs(ix - target);
      return d === 1 || d === LADDER.length - 1; // adjacent on the ladder, incl. the octave wrap
    });
    return good.length ? good[cyc % good.length] : null;
  };
  // Block 2 — the RHYTHM must move. Ryuu's sections run 8.0 / 1.0 / 5.5 / 1.8 /
  // 8.0 / 6.2 / 3.6 / 2.5 onsets per bar; the engine had a median of TWO
  // distinct accompaniment rhythms for a whole 24-56 bar track.
  const RHYTHM_FORMS = [
    // HOLD — the back half stops moving: keep its first onset, drop the rest so
    // the note rings through. This is the density swing the engine never made.
    ['hold', (b, half) => {
      const first = b.on.findIndex((s) => s >= half);
      if (first < 0 || first >= b.on.length - 1) return null;
      return { on: b.on.slice(0, first + 1), fig: b.fig.slice(0, first + 1), acc: b.acc.slice(0, first + 1) };
    }],
    // FILL — the back half doubles, and the inserted notes carry a scale step
    // so the fill reads as a line rather than a repeat.
    ['fill', (b, half, step) => {
      const on = [], fig = [], acc = [];
      for (let i = 0; i < b.on.length; i++) {
        on.push(b.on[i]); fig.push(b.fig[i]); acc.push(b.acc[i]);
        const next = b.on[i + 1] ?? half * 2;
        const gap = next - b.on[i];
        // r16 verify catch: gating the fill on the BACK HALF meant a sparse
        // figure (fnd_drone_fifth is ONE onset at 0) could never be filled, so
        // varyFig returned it unchanged and four songs LOST the D94
        // embellishment without gaining anything — adjacent-bar identical went
        // 0% -> 42-64% on somber_citadel / mysterious_space / mysterious_desert.
        // A big hole anywhere is now fair game; a busy figure still only fills
        // behind the half-bar so the front of the bar stays recognisable.
        if ((b.on[i] >= half || gap >= step * 4) && gap >= step * 1.5) {
          // r18/D99: the midpoint of an odd gap is off the grid — a gap of
          // 1.5 steps inserted at +0.75 of a step, the same split-second
          // stumble the push form was making. Snap to the figure's own grid
          // and skip the fill outright if no grid point sits inside the gap.
          const mid = Math.round((b.on[i] + Math.round((next - b.on[i]) / 2)) / step) * step;
          if (mid > b.on[i] && mid < next) {
            on.push(mid);
            // r20/D101: this used to push `s4`/`s2` by parity — a colour tone
            // chosen with no reference to either neighbour, which is how a fill
            // became one of the 3,319 unresolved dissonances. The inserted note
            // is now defined by the token it resolves INTO: the ladder step
            // between the two surrounding tokens if they span a third (a true
            // passing tone), otherwise the neighbour a step below the FOLLOWING
            // token (an approach into it). Both leave the insert one scale step
            // from a chord tone by construction, in any key over any chord.
            const here = ladderIx(b.fig[i]);
            const after = ladderIx(b.fig[i + 1] ?? b.fig[0]);
            const tone = freshRules
              ? (ladderBetween(here, after) ?? ladderNeighbour(after, true) ?? (i % 2 ? 's4' : 's2'))
              : (i % 2 ? 's4' : 's2');
            fig.push(tone);
            acc.push(Math.max(0.3, Math.round((b.acc[i] - 0.18) * 100) / 100));
          }
        }
      }
      return on.length > b.on.length ? { on, fig, acc } : null;
    }],
    // WALK — "the piano doesnt do any walking. there's not any extra notes
    // between chords or countermelody etc in the piano - it's just chord
    // bouncing" (nostalgic_casino, r20). Measured on that song's own acc hand:
    //   [B3,D4,F#4] ~@2 [B3,D4,F#4] ~@4
    // the same triad struck twice with four empty slots after it. It passed the
    // variation law because a 2-onset figure gets quota 1 (`n <= 2 ? 1 : ...`),
    // so ONE added grace note was a legal "variation" and the bar stayed a chord
    // bounce. `fill` could not help: it inserts at most one note per gap.
    // This fills the biggest hole with a two-note ladder RUN that ARRIVES a step
    // from whatever follows it — so the extra notes are a line INTO the next
    // chord rather than decoration, which is the whole difference between
    // walking and sprinkling.
    ['walk', (b, half, step) => {
      const end = half * 2;
      let bi = -1, bGap = 0;
      for (let i = 0; i < b.on.length; i++) {
        const gap = (b.on[i + 1] ?? end) - b.on[i];
        if (gap > bGap) { bGap = gap; bi = i; }
      }
      if (bi < 0 || bGap < step * 3) return null;
      const boundary = b.on[bi + 1] ?? end;
      let run;
      if (b.on[bi + 1] == null) {
        // The hole runs to the BAR END, so the walk crosses into the next chord
        // — the acc always binds against a per-bar symbol array (barsPerChord:1
        // at every call site), so a bar boundary is a chord change. Target the
        // NEXT chord with the D101 look-ahead: its third, then its second, then
        // the downbeat lands on its root. Two descending scale steps INTO the
        // new harmony, which is what walking means and what current-chord tokens
        // cannot express.
        // r21: three notes when the hole allows it. "the walking bassline is
        // good but too minimal - it barely does anything and contributes
        // anything to the chord, it's still like 95% chord repetition". Two
        // notes in a four-slot hole is a pickup, not a walk; the fifth-third-
        // second descent is a full scale approach and doubles what the hand
        // contributes between chords.
        run = bGap >= step * 4 ? ['>5', '>3', '>s2'] : ['>3', '>s2'];
      } else {
        const tIx = ladderIx(b.fig[bi + 1]);
        if (tIx == null) return null;
        // approach from above where there is ladder room above the target,
        // otherwise from below; never wrap, which would jump an octave
        const desc = tIx <= LADDER.length - 3;
        run = desc ? [LADDER[tIx + 2], LADDER[tIx + 1]] : [LADDER[tIx - 2], LADDER[tIx - 1]];
      }
      // slots follow the run length (2 or 3), latest-first, and never encroach
      // on the onset that opens the hole
      const slots = run.map((_, j) => boundary - (run.length - j) * step).filter((s) => s > b.on[bi]);
      if (!slots.length) return null;
      const on = [], fig = [], acc = [];
      for (let i = 0; i < b.on.length; i++) {
        on.push(b.on[i]); fig.push(b.fig[i]); acc.push(b.acc[i]);
        if (i !== bi) continue;
        // a walk is quieter than the chord it connects — support under lead (D77)
        const g = Math.max(0.28, Math.round((b.acc[i] - 0.22) * 100) / 100);
        for (let j = 0; j < slots.length; j++) {
          on.push(slots[j]);
          fig.push(run[run.length - slots.length + j]);
          acc.push(g);
        }
      }
      return { on, fig, acc };
    }],
    // ANTICIPATE — the back half arrives early by a WHOLE grid step.
    //
    // r18/D99, his ear three times in one round: "the random split-second
    // delays in rhythm in the piano sounds off though. that just sounds off"
    // (shrine), "the random split second in some of the chords are kinda
    // weird" (happy_jungle), "the random rhythm variation of the piano chord
    // sounds kinda off setting" (somber_manor). This form used to shift by
    // step/2 — HALF a grid step, which is off the 16th grid by construction.
    // Measured on the judged build: 402 of 13,285 accompaniment attacks
    // (3.0%) landed off-grid, all of them here, and every song carrying any
    // carried exactly 12.5% of its attacks that way. At 54bpm step/2 is ~70ms
    // — too small to hear as syncopation and exactly the size the ear reads
    // as a player with bad timing. A WHOLE step is 278ms at that tempo: an
    // anticipation the ear hears as a choice. Syncopation must stay ON the
    // grid; only its placement is the variable.
    ['push', (b, half, step) => {
      const on = b.on.map((s) => (s >= half ? s - step : s));
      for (let i = 1; i < on.length; i++) if (on[i] <= on[i - 1]) return null;
      if (on[0] < 0) return null;
      return { on, fig: b.fig.slice(), acc: b.acc.slice() };
    }],
  ];
  // Block 3 — the INTERVALS must move. The downbeat token is always left alone
  // so the bar keeps its harmonic anchor; everything off the downbeat is fair
  // game. `4/6/9` resolve against what the chord actually carries (bind.js
  // memberSemis) and `s2/s4/s6/s7` against its chord-scale, so none of these
  // can spell a foreign pitch.
  const INTERVAL_FORMS = [
    // COLOUR — the plain non-triadic degrees the engine had literally never
    // played above its own bass.
    ['colour', (b, cyc) => {
      // r16 verify catch: bare `4` and `7` do NOT resolve against the key —
      // memberSemis falls back to FIXED intervals (4->5, 7->10) that consult
      // neither the key nor the chord-scale, so `4` over Eb in G minor wrote
      // Ab and `7` over C in C mixolydian wrote B. Measured: +137 out-of-key
      // notes. `s4`/`s7` resolve against chordScale and cannot.
      const PAL = ['6', '9', 's4'];
      let k = 0;
      const fig = b.fig.map((t, i) => {
        if (i === 0 || i % 2 === 0) return t;
        const [core, oct] = octSplit(t);
        // r20/D101: resolve into the NEXT token (wrapping to the bar's first,
        // since the figure loops) instead of rotating the palette blind. A
        // grammarPinned song keeps the old blind rotation it was judged on.
        if (!freshRules) {
          if (String(t).includes('.')) return setTopVoiced(t, PAL[(k++ + cyc) % PAL.length]);
          if (!RECOLOURABLE.test(core)) return t;
          return PAL[(k++ + cyc) % PAL.length] + oct;
        }
        const pick = pickResolving(PAL, b.fig[i + 1] ?? b.fig[0], cyc + (k++));
        if (!pick) return t;
        if (String(t).includes('.')) return setTopVoiced(t, pick);
        if (!RECOLOURABLE.test(core)) return t;
        return pick + oct;
      });
      return { on: b.on.slice(), fig, acc: b.acc.slice() };
    }],
    // SCALE — the same move one level up (his r15 directive, "also think in
    // scales"): the figure lands in the scale the chord implies, so a bVI gets
    // its harmonic-minor leading tone and a V7 its b9.
    ['scale', (b, cyc) => {
      const PAL = ['s2', 's6', 's4', 's7'];
      let k = 0;
      const fig = b.fig.map((t, i) => {
        if (i === 0 || i % 2 === 0) return t;
        const [core, oct] = octSplit(t);
        if (!freshRules) {
          if (String(t).includes('.')) return setTopVoiced(t, PAL[(k++ + cyc) % PAL.length]);
          if (!RECOLOURABLE.test(core)) return t;
          return PAL[(k++ + cyc) % PAL.length] + oct;
        }
        const pick = pickResolving(PAL, b.fig[i + 1] ?? b.fig[0], cyc + (k++));
        if (!pick) return t;
        if (String(t).includes('.')) return setTopVoiced(t, pick);
        if (!RECOLOURABLE.test(core)) return t;
        return pick + oct;
      });
      return { on: b.on.slice(), fig, acc: b.acc.slice() };
    }],
    // QUARTAL — thirdless, straight off Ryuu bars 22-25: `D3 A3 C4 D4 | G3 A3
    // C4 D4`, interval set {0,5,7,10,12,14}, no third anywhere over a minor
    // tonic. One form that alone doubles the engine's interval vocabulary.
    ['quartal', (b) => {
      // thirdless, but scale-derived: see the PAL note above. Over a minor
      // tonic s4/s7 land on the same pitches Ryuu's D3 A3 C4 does; over
      // anything else they stay in the scale the chord implies.
      const CYC = ['R', 's4', 's7'];
      const fig = b.fig.map((t, i) => {
        if (String(t).includes('.')) {
          // a stack becomes a thirdless stack, voice for voice
          return String(t).split('.').map((p, j) => CYC[j % CYC.length] + octSplit(p)[1]).join('.');
        }
        const [core, oct] = octSplit(t);
        if (!RECOLOURABLE.test(core)) return t;
        return CYC[i % CYC.length] + oct;
      });
      return { on: b.on.slice(), fig, acc: b.acc.slice() };
    }],
    // DYAD — his parallel-fourths ruling ("depends, but I approve of both.
    // again I don't want to hardcode anything") and the "select intervals" ask
    // in one: the off-downbeat tokens thicken into two-note shapes.
    // r17 (his reel note: "see how the chord is four notes not your typical
    // chord"). Measured, the engine struck four notes on 0.11% of its
    // accompaniment attacks — 18 of 15,867 — and a SINGLE note on 74.3%, out of
    // a total vertical vocabulary of 23 shapes. The canon cannot do better: all
    // 201 of its onsets are single, double or triple, never quadruple.
    // Only the STRONG onsets take the stack, so the bar keeps its rhythm and
    // the weak onsets stay light. The shapes keep the third HIGH (a third in
    // the bass at octave 2 is mud) except the deliberate first inversion, which
    // is exactly the reference's Dmaj7/F# — in bindFigure an inversion is token
    // ORDER, since every member resolves at or above the root.
    //
    // r18/D99 — it now builds UNDER the figure's own top voice instead of
    // replacing the whole token. Two cards said the same thing about the r17
    // version: "the beginning chords are a bit weird - it feels like u just
    // randomly moved some notes out of order rather than being intention"
    // (excited_casino) and, in capitals, "maybe vary the intervals individually
    // of the chords (NOT IN A RANDOM WAY, IN A CALULCATED WAY BUT A WAY THAT'S
    // UNIQUE)" (calm_shrine). Substituting a whole canned shape DOES move the
    // notes out of order — an oompah's `3+.5+.R+` became `R.5.s7.3+`, so the top
    // voice jumped from the root to the third and the ear hears the voicing
    // shuffle rather than a chord growing. Keeping the top and stacking three
    // tones beneath it is the calculated version of the same idea: the melody of
    // the accompaniment survives, and the chord thickens under it. It is also
    // what he asked for in so many words on somber_manor — "adding extra stuff".
    // bindFigure resolves each member at or above the one before it, so writing
    // the kept tone LAST is what puts it on top.
    ['quartet', (b, cyc, half, lowOct) => {
      const UNDER = lowOct
        ? ['R.5.s7', 'R.5.9', 'R.s7.9']
        : ['R.5.s7', 'R.5.9', 'R.s7.9', '3.5.s7'];
      const und = UNDER[cyc % UNDER.length].split('.');
      let placed = 0;
      const fig = b.fig.map((t, i) => {
        const strong = i === 0 || (b.on[i] >= half && (i === 0 || b.on[i - 1] < half));
        if (!strong) return t;
        const [tc, to] = topOf(t);
        const parts = und.filter((x) => x !== tc).slice(0, 3);
        if (parts.length < 3) return t;
        placed++;
        // r24 vertical corollary: the kept top is appended ABOVE the three
        // stacked tones, so an under-tone one ladder position below it sounds a
        // second inside the chord. Drop that one voice rather than the form —
        // a triad under the melody note beats a cluster under it.
        let out = `${parts.join('.')}.${tc}${to}`;
        if (verticalGuard && stackBad(out)) {
          for (let d = parts.length - 1; d >= 0 && stackBad(out); d--)
            out = `${parts.filter((_, j) => j !== d).join('.')}.${tc}${to}`;
          if (stackBad(out)) { placed--; return t; }
        }
        return out;
      });
      return placed ? { on: b.on.slice(), fig, acc: b.acc.slice() } : null;
    }],
    ['dyad', (b) => {
      const PARTNER = { R: 's4', 3: 's6', 4: 's7', 5: 's2', 6: 's2', 7: 's4', 9: '5' };
      const fig = b.fig.map((t, i) => {
        if (i % 2 === 0) return t;
        const [core, oct] = octSplit(t);
        // the PARTNER map itself is clean — every pair in it is 3 or 4 ladder
        // positions apart (verified r24) — but it is applied on top of tokens
        // the other forms may already have moved, so it takes the guard too.
        const guard = (out) => (verticalGuard && stackBad(out) ? t : out);
        if (String(t).includes('.')) {
          const [tc, to] = topOf(t);
          return guard(`${t}.${PARTNER[tc] ?? 's2'}${to}`);
        }
        const p = PARTNER[core];
        return p ? guard(`${core}${oct}.${p}${oct}`) : t;
      });
      return { on: b.on.slice(), fig, acc: b.acc.slice() };
    }],
  ];
  // Block 4 — the TURNAROUND. The back half changes register (D88's bar-4 sub
  // "drops an octave", generalised to the acc hand: already-lifted tokens drop,
  // plain ones lift) and the last onset becomes a scale approach into the next
  // statement of the loop.
  const DESC = ['5', '3', 'R'];
  const turnaroundBar = (b, half) => {
    const on = b.on.slice(), fig = b.fig.slice(), acc = b.acc.slice();
    let k = 0;
    for (let i = 0; i < on.length; i++) {
      if (on[i] < half) continue;
      // D88's turnaround DROPS ("bar-4 turnarounds — sub drops an octave"), and
      // the r16 verify pass measured what lifting instead cost: the piano acc on
      // vs_calm_rest climbed to Db6 with 36 notes ABOVE its own lead (breaking
      // D77), and vs_excited_training's SYNTH BASS ended a bar on G4. So the
      // back half never rises. It strips an octave where it has one, and
      // otherwise walks down through chord tones into the next statement.
      fig[i] = String(fig[i]).split('.').map((p) => {
        const [c, o] = octSplit(p);
        return o.length ? c + o.slice(1) : p;
      }).join('.');
      fig[i] = setTopVoiced(fig[i], DESC[k++ % DESC.length]);
    }
    const last = fig.length - 1;
    // r16 verify catch: this used to REPLACE the last token outright, so a
    // block-chord bar (`R.3.5`) ended on one bare note two octaves above the
    // rest of the hand. The approach tone belongs on TOP of the stack, not
    // instead of it.
    fig[last] = setTopVoiced(fig[last], 's7');
    acc[last] = Math.min(0.95, Math.round((acc[last] + 0.15) * 100) / 100);
    return { on, fig, acc };
  };
  const varyFig = (fig, salt = 0) => {
    const n = fig.onsets.length;
    if (!n || fig.name?.endsWith('+vary')) return fig;
    const bars0 = fig.bars ?? 1;
    // 4 is the maximum safe composite: every section start, breakdown-mask
    // boundary and section length in the suite is divisible by 4, so a 4-bar
    // block never desyncs; an 8-bar one would break the 4-bar intros.
    const blocks = bars0 === 1 ? 4 : bars0 === 2 ? 2 : 1;
    if (blocks === 1) return fig;
    const base = {
      on: fig.onsets.map(slotOf),
      fig: fig.figure.slice(),
      acc: (fig.accents ?? fig.onsets.map(() => 0.7)).slice(),
    };
    const half = Math.round((bars0 * ACC_DEN) / 2);
    const step = Math.round(ACC_DEN / (fig.grid ?? 8));
    // an event = an onset added, an onset removed, or a token rewritten at a
    // surviving onset. The quota is what stops a form degrading to one note.
    // a 1- or 2-onset figure physically cannot change 2 events without being
    // rewritten wholesale; for those, one is the whole bar.
    const quota = n <= 2 ? 1 : Math.max(2, Math.ceil(n / 3));
    const events = (b) => {
      const was = new Map(base.on.map((s, i) => [s, base.fig[i]]));
      let gone = 0, added = 0, retok = 0;
      for (const [s, t] of was) {
        const j = b.on.indexOf(s);
        if (j < 0) gone++; else if (b.fig[j] !== t) retok++;
      }
      for (const s of b.on) if (!was.has(s)) added++;
      // r16 verify catch: counting a MOVED onset as two events (one gone, one
      // added) let a block clear a quota of 2 by nudging a single note an
      // eighth earlier. Pair them up: a move is one event.
      const moved = Math.min(gone, added);
      return moved + (gone - moved) + (added - moved) + retok;
    };
    // salt 0 (a letter's first statement) keeps the unsalted seed, so adding
    // per-statement variation moved nothing that was already judged on it
    const seed = fnv(`${name}|accvary|${fig.name ?? 'acc'}${salt ? `|s${salt}` : ''}`);
    // r21: `src` is explicit so a block can take a SECOND treatment composed on
    // top of the first (a 2-bar figure gets rhythm AND intervals in one block —
    // see below). events() still counts against the untouched `base`, so a
    // composed block clears its quota by more, never less.
    const tryFormsOn = (src, forms, start, ...args) => {
      for (let k = 0; k < forms.length; k++) {
        const out = forms[(start + k) % forms.length][1](src, ...args);
        if (out && events(out) >= quota) {
          if (DBG_ACC) console.error(`ACCDEBUG\t${name}\t${fig.name ?? 'acc'}\tsalt${salt}\t${forms[(start + k) % forms.length][0]}\t${out.fig.join(' ')}`);
          return out;
        }
      }
      return null;
    };
    const tryForms = (forms, start, ...args) => tryFormsOn(base, forms, start, ...args);
    const made = [];
    // A SPARSE figure is the one that most needs walking and the one the quota
    // protects least: at 1-2 onsets its quota is 1, so any single edit passed.
    // Those start the rotation at `walk` instead of at the hash, so the hole
    // gets a line through it rather than a grace note. Busier figures keep the
    // hash rotation — they have no hole to walk.
    const perBar = n / bars0;
    // a pinned song never sees the r20 walk — it was judged without it
    const RF = freshRules ? RHYTHM_FORMS : RHYTHM_FORMS.filter(([nm]) => nm !== 'walk');
    const IX_WALK = RF.findIndex(([nm]) => nm === 'walk');
    // r21: `!salt` — the walk anchors a sparse figure's FIRST statement, but a
    // returning letter rotates. Forcing walk on every statement made the
    // composite salt-INVARIANT, and effStmt then collapses a salt-invariant
    // figure back to statement 0 (its documented job), so every statement
    // replayed the same bar. Measured: vs_nostalgic_casino's accompaniment gave
    // the same chord the identical treatment on all 7 of its passes.
    made.push(tryForms(RF, (freshRules && perBar <= 3 && IX_WALK >= 0 && !salt) ? IX_WALK : seed % RF.length, half, step));
    if (blocks === 4) {
      // >>> not >>: fnv returns an UNSIGNED 32-bit hash, and a signed shift on
      // anything above 2^31 goes negative — which indexes the form list off the
      // end rather than wrapping.
      // the four-voice form is weighted to roughly half the composites rather
      // than taking 1 of 5 by hash: at 1-in-5 it lifted four-note accompaniment
      // attacks from 0.00% to only 0.25%, which does not answer "see how the
      // chord is four notes". The other half keeps the colour/scale/quartal/
      // dyad rotation, because his same message says "this is just one pattern
      // of many".
      const IX_QUARTET = INTERVAL_FORMS.findIndex(([nm]) => nm === 'quartet');
      const iStart = (seed >>> 3) % 2 === 0 ? IX_QUARTET : (seed >>> 5) % INTERVAL_FORMS.length;
      made.push(tryForms(INTERVAL_FORMS, iStart, (seed >>> 6) % 3, half, (fig.octave ?? accOct) <= 2));
      const t = turnaroundBar(base, half);
      made.push(events(t) >= quota ? t : null);
    } else if (blocks === 2 && freshRules) {
      // r21 — THE TWO-BAR BLIND SPOT. Only 1-bar figures (blocks === 4) ever got
      // an interval rewrite or a turnaround; a 2-bar figure got a rhythm change
      // and nothing else. His ear found it: "the marimba repeating the chords
      // repeatedly in the middle section is still there instead of being varied
      // and having extra stuff" (mysterious_jungle, whose acc `jungle-canopy` is
      // a 2-bar figure). Measured: that song's 8-bar accompaniment block
      // repeated VERBATIM 9 times across 72 bars, 6 distinct shapes in total.
      //
      // The composite cannot simply grow a third block — 4 bars is the maximum
      // safe length (every section start and length in the suite divides by 4),
      // and 6 would desync. So the INTERVAL rewrite is composed ONTO the rhythm
      // block instead: same 4 bars, but the notes move as well as the timing.
      const iStart = (seed >>> 5) % INTERVAL_FORMS.length;
      if (made[0]) {
        const iv = tryFormsOn(made[0], INTERVAL_FORMS, iStart, (seed >>> 6) % 3, half, (fig.octave ?? accOct) <= 2);
        if (iv) made[0] = iv;
      }
    }
    // r20/D101 — THE RESOLUTION LAW, applied to the whole composite at once.
    //
    // Patching the individual forms did almost nothing (measured: 93.9% -> 93.3%
    // unresolved) because the non-chord tones come from ALL of them — quartal
    // places `R/s4/s7` by index, dyad bolts on a partner, quartet stacks under,
    // turnaroundBar tops the last onset with `s7` — and each was choosing its
    // pitch without reference to what follows it. Five special cases is also
    // exactly the "hardcoded" shape he is pushing back on. One law instead:
    //
    //   a token that is not a chord tone must be a SCALE STEP from the token
    //   that follows it.
    //
    // That is the definition of a passing/neighbour tone, it is stated over the
    // ladder so it holds in any key over any chord, and it is checkable. Where a
    // token breaks it, retarget its TOP VOICE to the ladder neighbour of what
    // follows (the r18 rule: keep the voicing, move one voice — do not reshuffle).
    //
    // Applied ONLY to the generated blocks. Block 1 is the canon figure itself,
    // judged on its own page; the engine disciplines its own variations, it does
    // not rewrite the library's writing.
    const NONCHORD_IX = new Set([1, 3, 5, 6]); // s2/9, s4, s6, s7 — R(0)/3(2)/5(4) are chord tones
    const resolveBlocks = (blocks) => {
      const flat = [];
      for (const b of blocks) if (b) for (let i = 0; i < b.on.length; i++) flat.push({ b, i });
      if (!flat.length) return;
      for (let k = 0; k < flat.length; k++) {
        const { b, i } = flat[k];
        const cur = ladderIx(b.fig[i]);
        if (cur == null || !NONCHORD_IX.has(cur)) continue;
        // the next attack in the composite; the last one wraps to the figure's
        // own first token, because the composite loops
        const nx = flat[k + 1] ? flat[k + 1].b.fig[flat[k + 1].i] : base.fig[0];
        const nxIx = ladderIx(nx);
        if (nxIx == null) continue;
        const d = Math.abs(cur - nxIx);
        if (d === 1 || d === LADDER.length - 1) continue; // already resolves
        // step INTO the next token — below it where possible (a leading tone
        // reads as intent), above it when the target is the ladder floor
        const tone = ladderNeighbour(nxIx, nxIx > 0);
        if (tone) b.fig[i] = setTopVoiced(b.fig[i], tone);
      }
    };
    if (freshRules) resolveBlocks(made);
    const onsets = fig.onsets.slice(), figure = fig.figure.slice(), accents = base.acc.slice();
    let emitted = 1;
    for (const b of made) {
      // a block that could not make its quota is dropped rather than shipped as
      // a near-copy; the composite simply gets shorter.
      if (!b) continue;
      const shift = emitted * bars0 * ACC_DEN;
      for (let i = 0; i < b.on.length; i++) {
        onsets.push(`${b.on[i] + shift}/${ACC_DEN}`);
        figure.push(b.fig[i]);
        accents.push(b.acc[i]);
      }
      emitted++;
    }
    if (emitted === 1) return fig;
    if (DBG_ACCF) console.error(`ACCFINAL\t${name}\t${fig.name ?? 'acc'}\tsalt${salt}\tn=${n}\tbars0=${bars0}\t${figure.join(' ')}`);
    return { ...fig, name: `${fig.name ?? 'acc'}+vary`, bars: bars0 * emitted, onsets, figure, accents };
  };
  // D81: loopRoots everywhere (the D76 spiral guard); the accToBass branch
  // binds gainRange so its accents sound (D78) instead of one flat velocity
  const varySig = (f, salt) => JSON.stringify(varyFig(f, salt));
  const effStmt = (f, stmt) => (stmt && varySig(f, stmt) === varySig(f, 0) ? 0 : stmt);
  // hoisted out of bindAcc verbatim so other layers can ASK what voice the
  // accompaniment hand is on (r19: the companion has to avoid it — see below)
  const accVoiceFor = (fig0) => opts.accSound ?? (accToBass ? 'gm_synth_bass_1'
    : (!priorKeep && env === 'desert') ? (/drone|sustain|pad|held/.test(`${fig0.class ?? ''} ${fig0.name ?? ''}`) ? 'gm_pad_bowed' : 'gm_marimba')
      : (!priorKeep && env === 'jungle') ? 'gm_marimba' // the DKC acc voice
        : synthAcc ? 'gm_epiano1' : 'piano');
  // ==========================================================================
  // r26/D115 — THE LEFT HAND MAY ONLY SOUND 3rds, 6ths, 4ths AND 5ths
  // ==========================================================================
  // HIS EAR, on three separate cards of the r26 A/B page, all saying one thing:
  //   "when there's two notes at first, that interval combination sucks"     (calm water)
  //   "in the piano left hand, whenever it has two notes at once, it's dissonant" (nostalgic snow)
  //   "whenever there's two notes in the piano, it doesn't sound good ... you're
  //    not good at combining notes in the left hand during the variation"     (excited space)
  //
  // AND I HAD REPORTED THE OPPOSITE. r26's first pass measured the acc hand's
  // MEDIAN attack at one note, found m2-per-bar ~= 0, and concluded "dissonance
  // in the piano is NOT vertical". That was the median hiding the tail. Measured
  // properly, over every simultaneous PAIR in the accompaniment hand:
  //
  //   pair interval        suite    HIS 15 KEPT SONGS
  //   unison / octave       1.9%          0.0%
  //   m2 / M7               4.7%          0.0%
  //   M2 / m7               5.2%          0.0%
  //   tritone               4.6%          0.0%
  //   3rds/6ths/4ths/5ths  83.5%        100.0%
  //
  // 900 pairs in the kept set and not one exception. That is not a preference,
  // it is a law his ear has already written, and 16.4% of the suite breaks it.
  //
  // WHY THE r24 VERTICAL GUARD MISSED IT: it works in LADDER positions and
  // rejects distances of 0, 1 and 7 — unisons, steps and octave doublings. A
  // ladder distance of SIX is a seventh and it let those straight through, and a
  // ladder distance of three is a tritone whenever the chord-scale raises the
  // fourth, which ladder coordinates cannot see at all. Both gaps are exactly
  // the intervals above.
  //
  // So this guard works on the EMITTED NOTES instead of on tokens, which is the
  // only place the real interval exists. It reads the bound expression, finds
  // every simultaneous stack, and keeps notes greedily from the bottom: a note
  // joins only if it makes an allowed interval with every note already kept.
  // Nothing is transposed — a note that cannot join is DROPPED, which is D101's
  // rule ("a tone that stays put beats one that clashes") and leaves the hand
  // thinner rather than wrong.
  const PC_OF = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const noteMidi = (t) => {
    const m = String(t).match(/^([a-gA-G])([#b]*)(-?\d+)$/);
    if (!m) return null;
    let pc = PC_OF[m[1].toLowerCase()];
    for (const c of m[2]) pc += c === '#' ? 1 : -1;
    return pc + 12 * (Number(m[3]) + 1);
  };
  // allowed simultaneous interval classes: m3/M6, M3/m6, P4/P5. Everything else
  // — unison, octave, 2nd, 7th, tritone — is what his kept songs never contain.
  const OK_IC = new Set([3, 4, 5]);
  const handClean = ruleFresh(26) && opts.handClean !== false;
  let handDropped = 0;
  const cleanStacks = (expr) => {
    if (!handClean) return expr;
    return String(expr).replace(/\[([^\[\]]+)\]/g, (whole, body) => {
      if (!body.includes(',')) return whole;             // a sequence, not a stack
      const parts = body.split(',').map((x) => x.trim());
      const parsed = parts.map((p) => {
        const mm = p.match(/^([a-gA-G][#b]*-?\d+)(.*)$/);
        return mm ? { midi: noteMidi(mm[1]), text: p } : { midi: null, text: p };
      });
      if (parsed.some((x) => x.midi == null)) return whole;   // not analysable: leave alone
      parsed.sort((a, b) => a.midi - b.midi);
      const keep = [];
      for (const n of parsed) {
        const ok = keep.every((k) => {
          const d = Math.abs(n.midi - k.midi) % 12;
          return OK_IC.has(d > 6 ? 12 - d : d);
        });
        if (ok) keep.push(n); else handDropped++;
      }
      if (!keep.length) return whole;
      return keep.length === 1 ? keep[0].text : `[${keep.map((k) => k.text).join(',')}]`;
    });
  };

  // ==========================================================================
  // r26/D116 — A SUPPORT LAYER AGREES WITH THE CHORD
  // ==========================================================================
  // HIS INSTRUCTION, verbatim: "the woodwinds's part doesn't agree with the
  // melody at all - make them just have supporting roles for the chord
  // progression" (su_excited_space); "the woodwinds are out of key" (training).
  //
  // MEASURED FIRST, AND MY FIRST MEASUREMENT WAS WRONG. "14.9% of woodwind notes
  // are out of key" was taken against a scale GUESSED from the key string, so
  // E:phrygianDominant matched /phry/ and scored against natural minor, and
  // F:mixolydian scored against major — every desert and jungle song judged
  // against the wrong scale, on exactly the lanes whose mode is the point. Using
  // the engine's own SCALES table, support layers run 14.5% out-of-key against
  // the LEAD's 15.0%. No worse than the tune. Out-of-key is not the fault.
  //
  // Out-of-CHORD is. Chord = every pitch class the harmony hand and bass sound
  // anywhere in that bar:
  //                       lead    support
  //   his KEPT songs       6.0%     6.5%     <- support tracks the lead
  //   the suite           11.9%    14.8%
  //   judged unkept       10.9%    22.5%     <- support is DOUBLE the lead
  //
  // So the law his kept material states is SUPPORT IS NO MORE CHROMATIC THAN THE
  // LEAD — D102's corpus finding arriving from his own ear.
  //
  // THE MECHANISM, found by reading emitted notes rather than tokens: the descant
  // on su_happy_festival writes `[F#3,A3] A3 B3 A3` over D^7 (all diatonic) and
  // then `[F3,G#3] G#3 A#3 G#3` two bars later — the same cell PLANED DOWN A
  // SEMITONE instead of rebound to the chord. F natural and A# are foreign to the
  // chord AND to A major. 24.8% of descant notes over 20 songs are non-chord
  // tones, the worst widely-cast layer in the engine.
  //
  // A note is allowed if it is in the KEY'S SCALE and is not a semitone from a
  // chord tone (the avoid-note rule). That deliberately KEEPS 9ths, 6ths and sus
  // colour — "those specific chord types that i liked" — and removes only foreign
  // pitches and semitone rubs. Anything else snaps to the nearest allowed pitch
  // class; nothing is transposed wholesale.
  const supportSnapOn = ruleFresh(26) && opts.supportSnap !== false;
  let supportSnapped = 0;
  const KEY_PCS = (() => {
    try { const pk = parseKey(key); return new Set(pk.intervals.map((x) => (pk.rootPc + x) % 12)); }
    catch { return null; }
  })();
  const useFlats = (() => { try { return keyUsesFlats(key); } catch { return false; } })();
  const NOTE_RE = /\b([a-gA-G])([#b]*)(-?\d+)\b/g;
  const PCV = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const topSplit = (body) => {
    const out = []; let d = 0, cur = '';
    for (const c of body) {
      if ('([{<'.includes(c)) d++;
      if (')]}>'.includes(c)) d--;
      if (/\s/.test(c) && d === 0) { if (cur.trim()) out.push(cur.trim()); cur = ''; continue; }
      cur += c;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };
  const snapSupport = (expr, syms) => {
    if (!supportSnapOn || !KEY_PCS || !Array.isArray(syms) || !syms.length) return expr;
    return String(expr).replace(/note\("<([^"]*)>"\)/g, (whole, body) => {
      const bars = topSplit(body);
      if (bars.length < 2) return whole;
      const out = bars.map((barTxt, i) => {
        const sym = syms[i % syms.length];
        let core = null;
        try { const t = chordCoreTones(sym); core = t ? [...t].map((x) => ((x % 12) + 12) % 12) : null; } catch { core = null; }
        if (!core || !core.length) return barTxt;
        // r26 SECOND PASS, and this is the whole point of the rule. The first
        // version seeded `allowed` with the chord's own core tones, which is why
        // it barely moved anything: over C#7 in A major the "foreign" F and B in
        // the descant are E# and B, the 3rd and 7th of a legitimate secondary
        // dominant. Nothing was wrong with them theoretically and he still hears
        // them as "the woodwinds are out of key".
        //
        // So the licence is split by ROLE, which is what his sentence already
        // says: the LEAD may spell a chromatic chord (chromCore exists for that,
        // and D102 measured chromatic licence scaling with realised motion), and
        // a SUPPORT layer may not. Support gets the KEY'S SCALE and nothing else,
        // minus any scale tone sitting a semitone off a chord tone. A secondary
        // dominant still sounds — the acc and the bass state it — but the
        // woodwinds stay in the key over the top of it.
        const coreSet = new Set(core.filter((c) => KEY_PCS.has(c)));
        const allowed = new Set(coreSet);
        for (const pc of KEY_PCS) {
          if (core.some((c) => { const d = Math.abs(pc - c) % 12; return d === 1 || d === 11; })) continue;
          allowed.add(pc);
        }
        if (!allowed.size) return barTxt;
        return barTxt.replace(NOTE_RE, (tok, L, acc, oct) => {
          let pc = PCV[L.toLowerCase()];
          for (const c of acc) pc += c === '#' ? 1 : -1;
          const midi = pc + 12 * (Number(oct) + 1);
          const p = ((pc % 12) + 12) % 12;
          if (allowed.has(p)) return tok;
          let best = null;
          for (const a of allowed) for (const k of [-1, 0, 1]) {
            const cand = a + 12 * (Math.floor((midi - a) / 12) + k);
            const dist = Math.abs(cand - midi);
            if (best === null || dist < best.d
              || (dist === best.d && coreSet.has(a) && !coreSet.has(best.pc))) best = { m: cand, d: dist, pc: a };
          }
          if (!best) return tok;
          supportSnapped++;
          return pcToNoteName(((best.m % 12) + 12) % 12, useFlats) + String(Math.floor(best.m / 12) - 1);
        });
      });
      return `note("<${out.join(' ')}>")`;
    });
  };

  let bindAcc = (fig0, ctx, salt = 0) => bindFigure(accVaryOn ? varyFig(fig0, salt) : fig0, ctx, v.meter, {
    scaleTokensInKey: opts.scaleTokensInKey === true,
    // D86: synthAcc songs put the accompaniment hand on the Soft Suitcase
    // e-piano (unless accToBass already gave it to the synth bass) — "like
    // in construction left hand piano part, replace it with synths"
    // genre-expansion: opts.accSound names the acc voice outright (citadel
    // organ, the music-box manor's celesta) — voice-only, same figures.
    // r14 (three desert notes in one round heard the piano acc as "vanilla"/
    // "bare"/"just piano"): the desert accompaniment hand leaves the piano —
    // sustained figures bow (the duduk-drone trope), moving figures go to
    // the NSMB marimba.
    sound: accVoiceFor(fig0),
    loopRoots: true,
    // r14 (scary_manor: "piano too heavy"): opts.accGainMul trims the acc
    // hand's whole band, whatever voice carries it
    // r32 — A REEL'S CHORD HAND KEEPS ITS OWN RELATIONSHIP TO THE TUNE.
    //
    // The acc's default top is 1.0 for a piano, an ABSOLUTE number that never
    // consults the lead. Measured on the page he judged, `_acc` averaged 1.15x
    // the lead's gain across all 16 songs and hit 2.13x where the lead sits at
    // 0.47 — the accompaniment is louder than the tune it accompanies, which is
    // the D77 breach CLAUDE.md already warns about in the abstract ("the law
    // that actually holds is RELATIVE"). Scoped to the reel acc rather than the
    // whole engine, because widening it is a round of its own: the general acc
    // gain reaches all 47 judged songs.
    ...(reelAccRow
      ? { gainRange: (reelAccRow.gainVsLead ?? [0.3, 0.55])
        .map((x) => Math.round(Math.max(0.35, Math.min(0.9, x)) * leadGain * 100) / 100) }
      // …and where the reel has NO chord row, the engine's own foundation still
      // has to stay under the tune. Measured on the four cards that fall through
      // here: 1.18x, 2.13x, 2.13x, 1.18x the lead. Scoped to opts.accUnderLead
      // (set by reelFaithful) rather than made general, because the general acc
      // band reaches all 47 judged songs and that is a round of its own — the
      // measurement is in DECISIONS.md so the next round can pick it up.
      : opts.accUnderLead
      // r33: the r32 top of 0.9x left the reel-page acc at a REALIZED 0.80-0.85x
      // the lead and drew "piano too loud" on three more cards (r1, r5, cross
      // dark). 0.72x matches the kit's own relative cap; the acc is support,
      // and support tops OUT at the counterline ceiling, not just under the tune.
      // The extra x0.85 is the r33 VERIFY correction: restoring the lead's
      // accent envelope dropped its realized mean ~15% below nominal (measured
      // 0.86-0.88 of nominal), and an acc capped against NOMINAL ran 0.99x the
      // realized lead on r5. The acc binds before the lead does, so the
      // envelope mean is approximated by its measured band rather than parsed.
      ? { gainRange: [Math.round(0.35 * leadGain * 100) / 100, Math.round((r33() ? 0.72 * 0.85 : 0.9) * leadGain * 100) / 100] }
      : opts.accGainMul
      ? { gainRange: (accToBass ? [0.6, 0.95] : synthAcc ? [0.5, 0.85] : [0.35, 1.0]).map((x) => Math.round(x * opts.accGainMul * 100) / 100) }
      : accToBass ? { gainRange: [0.6, 0.95] } : synthAcc ? { gainRange: [0.5, 0.85] } : {}),
    fx: accToBass ? '.room(0.15).clip(0.95)' : accFx,
    // the vibe's accFloor lifts a pattern's home octave (water: "too low"),
    // never lowers it — a wide oom-pah keeps its cellar
    // opts.accOctave is a FLOOR like the vibe's accFloor (verify catch: the
    // figuration's own octave beat the opt — the music-box song's celesta
    // acc realized an octave-2 bass under a no-bass trope)
    // r16: the jungle bass IS the low end (round tumbao on synth bass, octave
    // 1-2), so the acc hand stays above it whatever figure a letter binds.
    // Measured need: swapping the Alberti out changed the acc CLASS, which
    // changed the travel edges, and B landed fnd_pedal_root_ostinato at octave
    // 2 — a root drone doubling the bass on 24 exact unisons. "One low voice
    // at a time" is a standing law; this is where jungle enforces it.
    // r24 — THE QUIET PIANO SITS TOO LOW. FINDING KEPT, FIX REVERTED (D112
    // addendum, after the adversarial pass).
    //
    // The MEASUREMENT holds and the verify pass reproduced it independently, read
    // from the MIX: his 7 KEPT calm songs' accompaniment hand runs low 48 / centre
    // 59.5 / top 66, the suite's 10 ran 41 / 53 / 67.5, and su_mysterious_cave's
    // "random low note piano slam ... (I think it did in in Dm7)?" is a drone fifth
    // at D2-C#3. A piano hand that low at gain 1.0 does read percussive.
    //
    // The FIX breached D77 on a JUDGED song. vs_somber_snow went from 20.5% to
    // 60.5% of its accompaniment attacks sounding ABOVE a simultaneous lead note,
    // acc median five semitones OVER the lead; su_mysterious_cave's own lead-to-acc
    // separation fell from 15 semitones to 3 against the ~12 CLAUDE.md cites. The
    // ceiling could not catch it — the trial bound ONE figure at ONE chord context
    // at salt 0 while travel letters bind figures the lift also raises, so 4 of 12
    // lifted songs finished above it, one at B5.
    //
    // `closeVoicing` was worse. It ran AFTER the vertical guard and stripped the
    // octave lifts the guard had just added (18 reversions on 4 songs, leaving
    // su_excited_space shipping 27 literal-semitone piano attacks); it flattened
    // `fnd_pedal_root_ostinato` to eight identical notes, which is D102's "pulse,
    // not a texture" precisely; it turned spread 9ths into major-second clusters;
    // it pulled the oom-pah bass up into its own chord; and it is a no-op on every
    // alberti figure, so it never reached su_romantic_rest, the card behind it.
    //
    // Also refuted, and worth more than the fix was: "register is the whole
    // difference" came from the unmasked `_acc` SOLOS. In the MIX the suite's calm
    // accompaniment is 39-41% SPARSER than his kept set (4.88 attacks/bar against
    // 8.00). DENSITY is the larger difference and I had declared it absent. That is
    // the next thing to try, not another octave.
    octave: Math.max(1, Math.min(4, Math.max(fig0.octave ?? accOct, v.register.accFloor ?? 0, opts.accOctave ?? 0,
      !priorKeep && env === 'jungle' ? 3 : 0))),
  }).expr;
  const bindAccRaw = bindAcc;
  bindAcc = (fig0, ctx, salt = 0) => cleanStacks(bindAccRaw(fig0, ctx, salt));
  const base = bindAcc(accFig, ctxBar);

  // ---- melody + arrangement (the undertale mix pipeline) -------------------
  // D89 (festival, the piano RH "way too hyper once again — I think 2/4
  // screws up piano melody"): he diagnosed it exactly. The density target is
  // per BAR, and a 2/4 bar is half as long — the same number reads at twice
  // the rate. In 2/4 the lead target halves (unkept songs only; kitchen's
  // kept 2/4 already carries its own D73 half-time treatment).
  const meterMul = beats === 2 && !priorKeep ? 0.5 : 1;
  const leadTargetRaw = Math.max(2, Math.round(melodyDensityTarget(v.bpm, accDensity) * LEAD.densityMul));
  const leadTarget = Math.max(2, Math.round(leadTargetRaw * meterMul));
  // D89 (training bar 4, "sounded kinda weird" — measured: the antecedent
  // phrase-final tone held the b7) + D90 (festival's Bb7/Bbm melody "really
  // funky"): the melody-grammar corrections, gated so every judged melody
  // stays byte-identical. opts.grammarPin pins a prose-praised song that has
  // no formal keep click yet.
  // opts.melodyGrammar pins the flag for a song JUDGED with the grammar on —
  // a new keep must not revert the melody he approved (menu's Bb^7 spelling)
  const melodyGrammar = opts.melodyGrammar ?? (!priorKeep && !opts.grammarPin);
  const cadenceNo7 = melodyGrammar;
  const chromCore = melodyGrammar;
  // r14: the two new grammar dials (cadence-tail variety + octave leap-fold)
  // key on FRESHNESS directly, not on the melodyGrammar flag — a pinned
  // melodyGrammar (stealth/menu, judged with the grammar on) must not drag
  // the new dials in and re-roll a judged melody.
  const grammarFresh = !priorKeep && !opts.grammarPin;
  // ---- r23 GENRE GATE ----------------------------------------------------
  // His r23 instruction, verbatim: "lots of the techniques and intervals behind
  // his layering should own be applied to applicable genres. not specific ones
  // like jungle or desert or etc."
  //
  // `v.role` is the vibe table's declared dramatic GENRE — battle, boss, chase,
  // town, overworld, shop, cutscene, menu... — and it is the right axis for
  // this. A lane (`env`) says WHERE the song is; a role says WHAT KIND of cue
  // it is, which is what every measurement this round actually separated on.
  // Using declared data rather than a name list is also the standing law here
  // (a forbidden-name list has failed five times).
  //
  // EXCLUDES THE LANES THAT ALREADY OWN THEIR LAW. Five of the seven battle/
  // boss songs on the judged page are CITADEL, and D93 is explicit that
  // citadel's "epic" is a tonal organ/choir/lament over gothic timbre, while
  // D100 measured what happens when a dread lane gets a groove: four-on-the-
  // floor `block_quarters` was heard as "an evening disco dance ball". A
  // straight-8th synth-bass pedal and a tom kit on scary_citadel would be that
  // exact defect, arriving through a new door. Desert and jungle likewise pin
  // their own floors (iqa' hand drums; the tumbao bass). A role gate does not
  // outrank a lane law — it composes with it.
  const battleRoleRaw = ['battle', 'boss'].includes(v.role) && !laneHorror
    && !['desert', 'jungle'].includes(env);
  // r24 ADVERSARIAL CATCH: this read priorKeep and grammarPin but NOT pinFrom, so
  // all four r24 prose keeps got the r23 devices anyway — su_mysterious_desert,
  // the strongest prose keep in the export ("big fan of this song"), had 66.7% of
  // its frozen-slot vibraphone pitches rewritten. Exactly the D111 failure again,
  // through a second gate, inside the round that fixed the first one. Every
  // freshness gate now goes through ruleFresh so a pin cannot be half-honoured.
  const r23Fresh = ruleFresh(23);
  // r18/D99, third application: a NEW capability roll defaults only onto a
  // HISTORY-LESS song — no verdict and no CARD_NOTES entry. Measured here:
  // without this clause the battle devices landed on vs_excited_fight, a song
  // he has written about (its companion is the "completely off key" card in
  // D100). `opts.r23` switches the whole family on for a page that exists to
  // be stress-tested, which is what this round's page does.
  const battleRole = battleRoleRaw && (opts.r23 === true
    || (historyLess()));
  // r17 (his reel note: "notice how melody is chord too not just one note").
  // Excluded: choir leads — D93's choir writing rules put one line on one side
  // of the G4 gender seam, and a dyad turns a chant into a two-part texture.
  const chordTopOn = (opts.chordTop ?? grammarFresh) && !/choir/.test(LEAD_SOUND);
  // D90 ("better but still too jittery like adhd"): the 2/4 thinning goes
  // further — the density ceiling tightens to the target itself, and the
  // thinned melody HOLDS (notes fill their gaps; the D64 held-lead device)
  // with a floor under the articulation ratios (the D67 anti-robotic floor).
  if (meterMul < 1) LEAD.hold = true;
  const artFloor = opts.articFloor ?? (meterMul < 1 ? 0.85 : null);
  const meterCap = meterMul < 1 ? { maxDensity: leadTarget } : {};
  const leadCell = melodyRhythm(v.meter, v.bpm, name, { target: leadTarget, accDensity, accOnsets, beats, heldFirst: grammarFresh, ...meterCap });
  // r35: `opts.leadSeedSalt` re-rolls the TUNE of one song (the lead cell's
  // seed, and with it every letter's melody seed below) without touching its
  // harmony, cast or form — his vg_triumphant_training card: "the melody for
  // the vocal doesn't sound good". The salt is chosen by MEASUREMENT (the
  // most singable of the candidates: fewest zigzag leaps, most steps) and
  // pinned on the row; the key is still hashed from the song's name (D120).
  const melodyName = opts.leadSeedSalt != null ? `${name}|salt${opts.leadSeedSalt}` : name;
  const leadSeed = fnv(melodyName);
  let leadBound = bindMelody(leadCell, ctxBar, v.meter, {
    style: 'toby-fox', seed: leadSeed, octave: leadOctave, sound: LEAD_SOUND, fx: leadFx,
    hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(), ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
  });
  // ---- r35 · THE VOCAL WRITER (opts.vocalWriter; research/vocaloid-r35.md) ---
  // His ask: "our voices are good and the melody is good but it's relatively
  // uniform … learn from vocaloid patterns and agreements with harmony and
  // ranges and speeds that can be done (and the choruses to support)".
  // MEASURED against 36 Vocaloid transcriptions, the sung line the engine
  // exports is a quarter-note instrumental lead (1.4 syllables/s vs 3.9; step
  // 18% vs 48%; every phrase on the downbeat vs 9%; 0% cell repeats vs 31%).
  // The writer authors a spec from the corpus's RULES per letter — A = verse,
  // B = chorus (+4 semitones, the corpus's +3..+5 lift), others = bridge — and
  // bindMelodySpec (the D38 guard) binds it over the letter's harmony. Every
  // line that RIDES the lead (companion, double, octave partner, chorus
  // double) takes the same spec so it stays rhythm-locked. Opt-in, page-only,
  // r35-gated: no judged song carries it.
  const vocalWriterOn = !!opts.vocalWriter && ruleFresh(35);
  const vocalWriterCfg = typeof opts.vocalWriter === 'object' ? opts.vocalWriter : {};
  const writerRole = (L) => (vocalWriterCfg.roles?.[L]) ?? (L === 'A' ? 'verse' : L === 'B' ? 'chorus' : 'bridge');
  const writerBind = (L, ctxL, stmt = 0, { octave = leadOctave, sound = LEAD_SOUND, fx = leadFx, shift = 0, role = null, gainRange = null } = {}) => {
    const kp = parseKey(ctxL.key ?? key);
    const rootMidi = 12 * (octave + 1) + kp.rootPc;
    const roleOf = role ?? writerRole(L);
    const { spec, meta } = composeVocalLine({
      seed: `${melodyName}|${L}`, keyIntervals: kp.intervals, rootMidi, bpm: v.bpm, harmony: ctxL.harmony,
      chordTonesOf: (sym) => new Set([...chordCoreTones(sym)].map((pc) => ((pc % 12) + 12) % 12)),
      role: roleOf, stmt, rate: vocalWriterCfg.rate, lift: vocalWriterCfg.lift?.[roleOf], targetMidi: vocalWriterCfg.targetMidi,
      span: vocalWriterCfg.span, startBias: vocalWriterCfg.startBias, breathBias: vocalWriterCfg.breathBias,
    });
    const shifted = shift ? { ...spec, bars: spec.bars.map((b) => ({ ...b, degrees: b.degrees.map((d) => (d == null ? null : d + shift)) })) } : spec;
    const bound = bindMelodySpec(shifted, ctxL, v.meter, { octave, sound, fx, ...(gainRange ? { gainRange } : {}) });
    return { ...bound, writerMeta: meta };
  };
  if (vocalWriterOn) {
    leadBound = writerBind('A', ctxBar, 0);
    extraInfo.push(`vocal writer (r35): the sung line is rule-composed — ${leadBound.writerMeta.notesPerBar} notes/bar at ${v.bpm} (syllable law), step ${leadBound.writerMeta.steps}% / repeat ${leadBound.writerMeta.repeats}%, phrases start at 8th-slots ${leadBound.writerMeta.phraseStarts.join('/')}, chorus lift +${vocalWriterCfg.lift?.chorus ?? 4}`);
  }
  // D73: half-time thinning changes only the SOUNDING piano — the planner
  // still sees the pre-thinning lead (the 0.55 fast-song cap), or the cast
  // re-rolls under the new numbers (measured twice on kitchen: first a
  // pizzicato appeared, then a xylophone — extra voices on the song he
  // wants calmer). D89: the 2/4 halving hides from the planner the same way.
  let planCell = leadCell, planPeriod = leadBound.boundMeta.period;
  if (accHalfTime || meterMul < 1) {
    const t0 = accHalfTime
      ? Math.max(2, Math.round(melodyDensityTarget(v.bpm, accDensity) * 0.55))
      : leadTargetRaw;
    planCell = melodyRhythm(v.meter, v.bpm, name, { target: t0, accDensity, accOnsets, beats, heldFirst: grammarFresh });
    planPeriod = bindMelody(planCell, ctxBar, v.meter, {
      style: 'toby-fox', seed: leadSeed, octave: leadOctave, sound: LEAD_SOUND, fx: leadFx,
      hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    }).boundMeta.period;
  }
  const plan = planArrangement({
    name, song: name, family: v.family, role: v.role, moods: v.moods, instBias: v.instBias,
    environment: prompt.environment, // envOnly instrument gate (genre-expansion round)
    bpm: v.bpm, meter: v.meter, loopBars,
    leadPeriod: planPeriod,
    accDensity, accOctave: accOct, leadDensity: planCell.density, palette: INSTRUMENTS,
  });
  // D62 ensemble dial: the vibe's voice count CAPS the cast before the form
  const fullCast = plan.layers.length;
  // r21 A/B build, corpus insight I1 (opts.voiceCap): the vgmusic sweep puts
  // median CONCURRENCY at 4.16 voices (median max 5) over 31,652 files; ours
  // measures 5-7. The gap is real and it is the one corpus number that
  // survived the adversarial pass unweakened. It is applied ONLY where a song
  // asks for it — no judged song sets voiceCap, so the D62 cast everywhere
  // else is byte-identical.
  plan.layers = plan.layers.slice(0, Math.min(v.ensemble.count, opts.voiceCap ?? Infinity));
  // r19/D100 — THE LEAD SINGER. His answer when I asked which device should
  // carry scary_catacombs' scare, verbatim: "the melody is super loud (not
  // dissonant) and completely harmonic in the violin like a lead singer which
  // destroys the atmosphericness". The violin is `melody_backup`, and that
  // part's OWN declaration in arrange.js is the whole problem — "doubles the
  // lead line so it reads louder and wider without adding any new rhythm".
  // Measured in the MIX (not the solos): 42 of its 48 notes sound with the
  // cello lead and 36 are its EXACT pitch, over 16 of 56 bars. Louder-and-wider
  // is an anti-goal in a lane whose job is atmosphere, and it is a fake layer
  // besides — engine-wide, 19 of 38 songs' "own melody" cast part is a
  // note-for-note unison double of the lead.
  //
  // All three catacombs cards name this violin ("the violin taking the melody
  // made it not as much scarier", "the sharp violins hurt my ears and don't
  // belong", "the same advice when the violin and piano comes in"). Only the
  // pure doubler goes; `melody_takeover` is a HANDOFF and D90 protects those.
  // Dropping it frees the slot for the COMPANION, which does have its own line.
  if (!priorKeep && !opts.grammarPin && laneHorror) {
    plan.layers = plan.layers.filter((l) => l.part !== 'melody_backup');
  }
  // D86: fully-synth songs retint every planned voice to the D85 palette
  if (opts.fullSynth) for (const l of plan.layers) l.instrument = SYNTH_OF(l.instrument);
  // r14 lane law, the cast side (catacombs/citadel: "the synths don't
  // really fit ... playful"): a horror cast never carries a chip voice —
  // the planner's square/saw backups retint to the lane's own voice.
  if (!priorKeep && laneHorror) {
    // r18/D99 — the manor's voice was the OBOE and he rejected it twice in one
    // pass: "also the high oboe doesn't fit at all, and is too loud"
    // (somber_manor, where it was the melody_takeover at gain 0.87 against a
    // 0.47 lead, reaching F6), and "the flute started being the melody - that
    // sounds too happy" (scary_manor, which carries no flute at all — the oboe
    // is what a bright double reed sounds like from across a room). A manor is
    // the AMBIENCE lane; the cello is its gothic voice and it is already in the
    // manor's own handoff pool, so this makes the cast agree with the handoffs.
    const HORROR_VOICE = { manor: 'gm_cello', catacombs: 'gm_violin', citadel: 'gm_trumpet' };
    for (const l of plan.layers) {
      // r18/D99: the ban was chip voices only, so the PLANNER could still hand
      // a manor its oboe and a catacomb its recorder straight from the palette
      // — which is exactly what happened on both manor songs. Bright reeds,
      // flutes and mallets are the "too happy" timbres he keeps naming in these
      // lanes; they retint to the lane voice like the chip voices always did.
      if (/gm_lead_\d|supersaw|square|sawtooth|oboe|flute|recorder|piccolo|clarinet|whistle|ocarina|music_box|glocken|celesta/.test(l.instrument)) {
        l.instrument = HORROR_VOICE[env];
      }
    }
  }
  // r19/D100 (happy_jungle, verbatim: "a bit too dissonant with the piano and
  // the flute/obe. they dont really fit"). Measured: its cast was gm_clarinet
  // on harmony_support and gm_flute on melody_backup — the planner's generic
  // palette, the same way it handed both manors an oboe before r18. The
  // ORCHESTRAL CONCERT WINDS are what he named, and this list is deliberately
  // narrower than horror's: mysterious_jungle's gm_lead_3_calliope is that
  // song's alternate_melody and he has now judged it good ("this is better, it
  // feels more mysterious"), so the chip-voice half of the horror ban stays out
  // of this lane until his ear asks for it.
  if (!priorKeep && env === 'jungle') {
    // distinct voices, and never the lead's or the acc's: retinting both of
    // happy_jungle's winds to the lane's marimba just moved the collision it
    // was meant to cure (that IS its acc voice — two more layers vanishing
    // into it).
    const taken = new Set([LEAD_SOUND, accVoiceFor(accFig)]);
    const PALETTE = ['gm_kalimba', 'gm_vibraphone', 'gm_orchestral_harp', 'gm_marimba', 'gm_pad_warm'];
    for (const l of plan.layers) {
      if (!/oboe|flute|recorder|piccolo|clarinet|bassoon|english_horn/.test(l.instrument)) continue;
      const pick = PALETTE.find((s) => !taken.has(s)) ?? 'gm_marimba';
      taken.add(pick);
      l.instrument = pick;
    }
  }
  // r14 verify catch (HQ-range law): cast melodic voices on range-limited
  // instruments compose INSIDE the instrument's real range — the planner
  // wrote a violin counter-line at midi 88-107 (VSCO violin tops at G#5=80),
  // which folded 100% in HQ with contour-inverting 1-3 octave folds and a
  // -53 LUFS stem. Both tiers now hear the same registers. Unkept only.
  if (!priorKeep) {
    for (const l of plan.layers) {
      // r18/D99: the same name-list failure one instrument over. The list held
      // violin/trumpet/oboe/shanai, so when the manor's voice became the CELLO
      // its melody_takeover was clamped by nothing and composed A#4-F7 — an
      // octave HIGHER than the oboe it replaced, and a seventh above the lead's
      // own top. A cello does not have an F7. Bowed low strings and organs join
      // the range clamp, and every melodic cast layer additionally caps at the
      // LEAD's octave: a part that doubles or answers the tune has no business
      // above it (D77), whatever instrument the planner picked.
      if (/violin|trumpet|oboe|shanai|cello|viola|bassoon|organ/.test(l.instrument)) l.octave = Math.min(l.octave, 4);
      if (/^(lead|lead-rhythm|independent)$/.test(l.derives ?? '')) l.octave = Math.min(l.octave, leadOctave);
    }
  }
  // D65 (cave, both rounds: "the secondary melody instrument is way too
  // high"): the song may demand its melodic layers sit BELOW the lead. Two
  // octaves down, because the melody WALK climbs well above its root octave
  // (the verify pass measured a leadOctave-1 cap still peaking above the
  // lead). Song-scoped, not vibe-scoped: snow's high flute is the same
  // machinery and he PRAISED it — "I like the section with the arpeggio and
  // the flute".
  if (opts.capMelody) {
    for (const l of plan.layers) {
      if (['lead', 'lead-rhythm', 'independent'].includes(l.derives)) {
        l.octave = Math.min(l.octave, Math.max(3, leadOctave - 2));
      }
    }
  }
  // D65 (cave/snow: "strings in the background as support/harmony would fit
  // in good - can't hear them"; aftermath: "more layers I think as soft
  // support"): a song may DEMAND its strings pad — retint a cast pad to the
  // string ensemble, or add one when the dial (or the palette's whim) left
  // none. His explicit ask outranks the ensemble cap.
  if (opts.stringsPad) {
    const pads = plan.layers.filter((l) => l.derives === 'chords');
    const stringy = pads.some((l) => /string|cello|violin|viola/.test(l.instrument));
    if (pads.length && !stringy && opts.stringsPad !== 'add') {
      for (const l of pads) l.instrument = 'gm_string_ensemble_1';
    } else if (!pads.length || opts.stringsPad === 'add') {
      plan.layers.push({
        id: `${name}::strings_pad`, part: 'harmony_support', derives: 'chords',
        contributes: 'sustained chord voicings underneath (his strings rule)',
        instrument: opts.fullSynth ? 'gm_synth_strings_1' : 'gm_string_ensemble_1', octave: 4, gain: 0.42, mass: 0.7,
        entry: 'bed', canLead: false, addsDensity: 0, seed: fnv(`${name}::strings_pad`),
      });
    }
  }
  // genre-expansion (his choir ask: "1 active song that uses choir (like
  // battle)"): a song may DEMAND a choir pad the way stringsPad demands
  // strings — sustained wordless-choir chords past the ensemble cap.
  if (opts.choirPad) {
    plan.layers.push({
      id: `${name}::choir_pad`, part: 'harmony_support', derives: 'chords',
      contributes: 'wordless choir sustains underneath (his choir ask)',
      instrument: typeof opts.choirPad === 'string' ? opts.choirPad : 'gm_choir_aahs',
      octave: 3, gain: 0.45, mass: 0.7,
      entry: 'bed', canLead: false, addsDensity: 0, seed: fnv(`${name}::choir_pad`),
    });
  }
  // opts.padSound: retint every pad voice (voice-only — verify catch: a cast
  // choir_female pad voiced chord bottoms at Bb2-F#3, far under the female
  // register; the SSO MIXED sfz is register-honest by construction, male
  // samples below G4, female above)
  if (opts.padSound) {
    // r14: the demanded strings pad keeps its own voice (shrine asked for
    // strings BESIDE the choir pads — retinting both defeats the layer ask)
    for (const l of plan.layers) if (l.derives === 'chords' && !l.id.endsWith('::strings_pad')) l.instrument = opts.padSound;
  }
  // D72 ("allow the strings … more expression … a full coherent melody" +
  // "im telling u this not just to specifically change it for the song but
  // change the generation of songs of this type (or other types as well)"):
  // GENERATION POLICY, not a song patch. Every pad moves: the HIGHEST pad
  // carries the planned phrase (contour arc + scale passing tones + tiled
  // rhythm motif) and any lower pads keep the D70 subtle per-bar mover —
  // two full melodies at once would crowd the piano; one voice sings, the
  // rest support. D73 revised the fast side: "for the more energetic songs,
  // like tense fight, the melody should be a bit more free, with variations
  // and such" — above the 140bpm line the top pad sings the FREE variant of
  // the phrase (per-bar shape variety instead of the tiled motif, wider
  // arc) rather than being throttled to subtle.
  {
    const pads = plan.layers.filter((l) => l.derives === 'chords');
    if (pads.length) {
      const top = pads.reduce((a, b) => (b.octave > a.octave ? b : a));
      for (const l of pads) l.padMelody = l === top ? (v.bpm <= 140 ? 'full' : 'free') : 'subtle';
    }
    // D73 (water: "the later high melody pad is a bit too loud"): a song
    // may trim ALL its pads' gain centres — the breathing wave keeps its
    // shape around the lower centre.
    if (opts.padGainMul) {
      for (const l of pads) l.gain = Math.round(l.gain * opts.padGainMul * 100) / 100;
    }
  }
  // D65 bumped pad gains ×1.3 ("can't hear them"); D67 heard the overshoot —
  // "way too loud and drown out the piano" (cave), "a bit too loud" (fight,
  // construction, water) — the bump is gone and the pads now BREATHE instead
  // (per-bar gain waves in the mix pass below).
  const renderCtx = (ctx) => renderArrangement(plan, {
    harmonyContext: ctx, meter: v.meter, style: 'toby-fox',
    leadRhythm: leadCell, leadSeed,
    counterRhythmFor: (target, seedName) => melodyRhythm(v.meter, v.bpm, seedName, { target, accOnsets, beats, noLateTail: false }),
    figureFor: () => accFig,
    // D65: the lead's manner reaches EVERY melodic layer the arranger binds
    // (round 2: "trumpet still should much more hold"), and support pads are
    // real chord voicings over a low frame (his strings rule)
    leadOpts: { hold: LEAD.hold, mergeRepeats: LEAD.merge, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(), composeGain: r33() },
    padVoicing: true,
    // D70/D72: pad melody modes are assigned per LAYER above (top pad
    // 'full' under 140bpm, the rest 'subtle') — no ctx-wide flag needed.
  });
  const rendered = renderCtx(ctxBar);
  const form = planForm(plan);
  // D65 (the verify pass caught aftermath's added pad masked <0@72>): a
  // demanded strings pad the mass ceiling refused a section is not "more
  // layers as soft support", it is a voice on paper. His explicit ask
  // outranks the ceiling — an unheard demanded pad joins every tune section.
  if (opts.stringsPad) {
    for (const l of plan.layers) {
      if (l.derives !== 'chords') continue;
      if (form.sections.some((sec) => sec.active.includes(l.id))) continue;
      for (const sec of form.sections) if (sec.lead !== 'none') sec.active.push(l.id);
    }
  }
  // D64: on slow songs the pre-melody sections ran twice as long as they felt
  // ("reduce the beginning time before the melody comes in by half" — three
  // songs, all <=65bpm). Halve leading no-tune sections while whole loops fit.
  // D67: happy shop asked by name at 101bpm ("the beginning section (of just
  // the piano) should be reduced to half its length") — opts.halveIntro.
  if (v.bpm <= 80 || opts.halveIntro) {
    let halved = false;
    for (const sec of form.sections) {
      if (sec.lead !== 'none') break;
      const half = sec.bars / 2;
      if (half >= loopBars && half % loopBars === 0) { sec.bars = half; halved = true; }
    }
    if (halved) {
      let sb = 0;
      for (const sec of form.sections) { sec.startBar = sb; sb += sec.bars; }
      form.totalBars = sb;
    }
  }
  // D89 (somber snow: "beginning session too long (before melody comes in)";
  // calm rest: "beginning arpeggios are too long" — both at a crawl): at
  // <=60bpm even ONE loop of intro runs ~18-32 seconds, and the halving above
  // can't shrink it without breaking loop alignment (half a loop would start
  // the tune mid-progression). So the no-tune intro is DROPPED in whole loops
  // — phase-safe — and the melody opens the song. Unkept songs only.
  if (!priorKeep && v.bpm <= 60) {
    let dropped = false;
    while (form.sections.length > 1 && form.sections[0].lead === 'none' && form.sections[0].bars % loopBars === 0) {
      form.sections.shift();
      dropped = true;
    }
    if (dropped) {
      let sb = 0;
      for (const sec of form.sections) { sec.startBar = sb; sb += sec.bars; }
      form.totalBars = sb;
    }
  }
  // D91 (casino: "the beginning chords are too long - it's just chords for
  // like 20 seconds"; nostalgic_shop: "the beginning part is literally just
  // chord progression on piano - it should be shorter"): at ANY tempo a
  // no-tune intro caps at ~16 seconds — shrunk by whole loops (phase-safe)
  // down to a one-loop floor. Unkept songs only.
  if (!priorKeep) {
    const secPerBar = (beats * 60) / v.bpm;
    const first = form.sections[0];
    if (first && first.lead === 'none' && form.sections.length > 1) {
      // r18/D99 (happy_jungle: "the beginning where it's just marimba should be
      // cut in half. the beginning if it's so bare shouldn't be so long"). The
      // 16-second cap was never about seconds alone — it is about how long a
      // listener will sit with WHATEVER is playing, and one instrument buys far
      // less patience than an arrangement. Measured on happy_jungle: 8 bars =
      // 15.5s of solo marimba, which cleared the cap by half a second. A
      // section carrying at most one planned layer is BARE and gets 9 seconds,
      // which halved that intro to 4 bars exactly as he asked.
      // grammarPin, for the same reason the travel rotation needed it: a PROSE
      // keep is a keep. Without this the new cap shortened vs_goofy_casino from
      // 32 to 28 bars — a pinned song moved by a rule its own note never asked
      // for. Any NEW structural rule has to carry both guards, not just
      // !priorKeep.
      const bareIntro = !opts.grammarPin && (first.active?.length ?? 0) <= 1;
      const introCapS = bareIntro ? 9 : 16;
      let shrunk = false;
      while (first.bars > loopBars && first.bars * secPerBar > introCapS && (first.bars - loopBars) % loopBars === 0) {
        first.bars -= loopBars;
        shrunk = true;
      }
      if (shrunk) {
        let sb = 0;
        for (const sec of form.sections) { sec.startBar = sb; sb += sec.bars; }
        form.totalBars = sb;
      }
    }
  }
  // r27 — `opts.totalBarsCap`. His ask for the vanriver test page: "the songs
  // should just be 16-32 bars long, just to test it". Trailing sections are
  // dropped whole so nothing starts mid-progression, and a section that alone
  // exceeds the cap is shrunk by WHOLE LOOPS (the D89/D91 phase-safety rule —
  // half a loop would start the tune mid-harmony). A lead-bearing section is
  // kept even if that overruns the cap: a test song with no tune tests nothing.
  if (r27() && opts.totalBarsCap > 0 && form.totalBars > opts.totalBarsCap) {
    const cap = opts.totalBarsCap;
    const total = () => form.sections.reduce((a, sec) => a + sec.bars, 0);
    // (1) trailing sections, while more than one section still carries a tune.
    while (total() > cap
      && form.sections.filter((sec) => sec.lead !== 'none').length > 1) form.sections.pop();
    // (2) the no-tune intro. At this length an intro is the whole song, and it
    //     is also exactly what he has complained about six times — "piano for a
    //     long time again in the beginning". A 16-bar test song opens on its
    //     tune. Kept only while it fits.
    while (total() > cap && form.sections.length > 1
      && form.sections[0].lead === 'none') form.sections.shift();
    // (3) still over: shrink by WHOLE LOOPS from the back, never below one loop,
    //     so no section starts mid-progression (the D89/D91 phase-safety rule).
    for (let i = form.sections.length - 1; i >= 0 && total() > cap; i -= 1) {
      const sec = form.sections[i];
      while (total() > cap && sec.bars - loopBars >= loopBars) sec.bars -= loopBars;
    }
    let sb = 0;
    for (const sec of form.sections) { sec.startBar = sb; sb += sec.bars; }
    form.totalBars = sb;
  }
  // D82 (teaching the planner, his go-ahead): the SECTION DYNAMIC CURVE is a
  // generator default — every section's energy sets a level (0.85..1.05), a
  // low-energy final section fades further, and the lead rides a gentler
  // half-depth version of the same arc. Period = totalBars, so nothing
  // phase-drifts (D63).
  const secMul = form.sections.map((sec) => Math.round((0.8 + 0.05 * (ENERGY[sec.archetype] ?? 3)) * 100) / 100);
  if (form.sections.length > 1 && (ENERGY[form.sections[form.sections.length - 1].archetype] ?? 3) <= 2) {
    secMul[secMul.length - 1] = Math.min(secMul[secMul.length - 1], 0.72);
  }
  const curveOf = (muls) => `"<${form.sections.flatMap((sec, i) => Array(sec.bars).fill(muls[i])).join(' ')}>"`;
  const SEC_CURVE = curveOf(secMul);
  // r33: the melody tier's curve tops at 1.0 on fresh songs — a late letter
  // that rides a 1.025-1.05 segment plays LOUDER than the tune he calibrated
  // in the A section, and with a voice change at the same seam that reads as
  // "in the second section it randomly got louder" (his r1 card; measured, the
  // handoff entered at 1.02-1.04x the lead on 10/10 pairs). Support keeps the
  // full curve; the tune itself never exceeds its own ceiling.
  const LEAD_CURVE = curveOf(secMul.map((m) => Math.min(r33() ? 1 : Infinity, Math.round(((1 + m) / 2) * 100) / 100)));
  const withCurve = (expr, lead = false) => `${expr}.mul(gain(${lead ? LEAD_CURVE : SEC_CURVE}))`;

  const shaped = renderForm(rendered.layers, leadBound.expr, form);

  // ---- letters (D59) -------------------------------------------------------
  // D67 (aftermath "still a bit too uniform": its hash-picked AA scheme had
  // ONE letter, so the accompaniment never travelled) — a song may force a
  // letter scheme with real contrast in it
  const mf = planMelodyForm(form, { name, scheme: opts.scheme ?? null });
  const letterCellMemo = new Map([['A', leadCell]]);
  const letterCell = (L) => {
    if (!letterCellMemo.has(L)) {
      const used = [...letterCellMemo.values()].map((c) => c.name);
      letterCellMemo.set(L, melodyRhythm(v.meter, v.bpm, `${name}|${L}`, { target: leadTarget, accDensity, accOnsets, beats, exclude: used, heldFirst: grammarFresh, ...meterCap }));
    }
    return letterCellMemo.get(L);
  };
  // r24 — A RETURNING STATEMENT OF A LETTER IS NOT THE SAME PHRASE.
  //
  // His su_tense_boss card: "for the section you repeated the same melody with
  // nothing different for like a full section which was like 16 times or
  // something."
  //
  // MEASURED — the longest stretch of bars over which the LEAD repeats with some
  // period P in {1,2,4,8}, on the MASKED lead as the mix plays it (see LEADDEBUG).
  // His 59 reference files: median 5 / p75 9 / p90 13-15 / max 44. Ours before:
  // median 11 / p75 14.5 / p90 16 / max 32 — a real gap at the median, about 2x.
  //
  // AN EARLIER VERSION OF THIS COMMENT CLAIMED median 24 and "72 bars of 72". That
  // was the UNMASKED `_lead` solo, which loops for the whole song by design; the
  // numbers are struck rather than quietly edited, because they were used to
  // justify this rule. Bar-level repetition was never the problem either: max 2
  // against the reference's max 6. The verify pass also re-picked the reference's
  // melody part more carefully (monophonic, non-FX, non-pad), giving median 6 /
  // p75 10 / p90 16 — against which our BEFORE build sat inside the p75-p90 band
  // rather than outside the distribution. So this is a tightening, not a rescue.
  //
  // The acc has had the answer since D97/D102: key the variation on the STATEMENT
  // NUMBER, so A at bar 24 is not A at bar 0. The lead never got it — one
  // expression per letter, masked across every section that owns it, by
  // construction identical on every pass.
  //
  // Phrases 0 and 1 keep the seed. A theme has to be RESTATED before it can
  // develop, and re-seeding every return would write a new tune each time rather
  // than a variation of one. From the THIRD phrase the walk re-seeds: restate,
  // then depart.
  //
  // r24 ADVERSARIAL CATCH: this shipped at `stmt >= 1` while the comment claimed
  // 0-and-1, and after the split the argument is a PHRASE index renumbered across
  // the whole letter — so the second phrase of the FIRST statement already
  // departed and the theme was never restated once. Measured on su_triumphant_boss:
  // bars 8-15 became a different tune an octave lower with two bars silent.
  const leadStmtVary = ruleFresh(24);
  // r24 ADVERSARIAL CATCH: this read `boundMeta.period`, which is the bind's FULL
  // period (planBars x restatements), not its phrase length — so the min(8,...)
  // saturated and EVERY song split at 8 regardless of its plan. On a 12-bar-plan
  // song an 8-bar cut lands two thirds of the way through a harmonic plan.
  // bindMelody's own phrase rule is `harmonyBars <= 3 ? max(2, harmonyBars) : 4`,
  // mirrored here so the split lands where the binder's own cadences already do.
  const leadPhraseBars = loopBars <= 3 ? Math.max(2, loopBars) : 4;
  const letterSeed = (L, stmt = 0) => {
    const base = L === 'A' ? leadSeed : fnv(`${melodyName}|melody|${L}`);
    return (leadStmtVary && stmt >= 2) ? fnv(`${melodyName}|melody|${L}|s${stmt}`) : base;
  };
  // D82 (teaching the planner): MELODY HANDOFFS are a generator default. A
  // letter is a complete melodic statement — exactly the D80 boundary rule
  // ("if it plays for half and then another instrument plays the other
  // half, it sounds like it cut off"), so the handoff unit is the LETTER:
  // the A theme keeps the piano; each other letter hands its whole
  // statement to one instrument from the pool (deterministic per song).
  // Songs whose cast already carries a melody voice (takeover/alternate/
  // backup — the planner's own handoffs) are left alone.
  const castHasMelodyVoice = rendered.layers.some((l) => /alternate_melody|melody_takeover|melody_backup/.test(l.id));
  // D90 ("some songs should have string melodies"): a string-friendly vibe's
  // handoff pool goes strings-first — a letter handed to a violin or cello IS
  // the string melody, with handoffs intact (his correction: handoffs stay).
  // Kept songs keep the original pool (their handoff voices are judged).
  // r14 lane pools: a desert letter hands to the desert voices (tense_desert:
  // "the main melody should not just be piano"), a horror letter to the
  // gothic ones — never the vibraphone/epiano salon pool.
  // r33 — a page/song may state its own handoff voices (the reels pages hand
  // the tune only to the reel's OWN instruments; the default salon pool below
  // — flute/vibraphone/epiano — is 10 of his 16 r33 complaint cards: every
  // "flute too loud", both "glockenspiel way too loud" (= gm_vibraphone; no
  // glockenspiel exists on the page) and the "melody synth" are D90 handoff
  // segments of the lead line on exactly these three voices).
  const HANDOFF_POOL = (Array.isArray(opts.handoffPool) && opts.handoffPool.filter((s) => s !== LEAD_SOUND).length)
    ? opts.handoffPool.filter((s) => s !== LEAD_SOUND)
    : !priorKeep && env === 'desert'
    ? ['gm_shanai', 'gm_oboe', 'gm_sitar'].filter((s) => s !== LEAD_SOUND)
    : !priorKeep && laneHorror
      // r19/D100 — "the violin taking the melody" is LITERALLY this line. D99
      // moved the catacombs LEAD off the violin for exactly his complaint and
      // left the violin in the HANDOFF pool, so it went on taking the tune on
      // every non-A letter — the same half-fix shape as the texture leak and
      // the octave cap. Four cards now name it ("the sharp violins hurt my ears
      // and don't belong"). The viola keeps the handoff bowed, and D90 keeps
      // the handoff itself; only the piercing voice goes.
      ? ['gm_viola', 'gm_cello', 'gm_church_organ'].filter((s) => s !== LEAD_SOUND)
      : !priorKeep && stringFriendly
        // r25: on a quiet song the bowed voices come out of the handoff pool too,
        // or the lead swap above just hands the tune back to them one letter later
        ? (swapBowed ? ['gm_flute', 'gm_clarinet', 'gm_vibraphone'] : ['gm_violin', 'gm_cello', 'gm_flute'])
        : ['gm_flute', 'gm_vibraphone', 'gm_epiano1'];
  const letterSound = (L) => {
    // D91 (his construction/fight praise, "instead of just the one synth
    // being the melody, to vary it a bit"): a synth-lead song may vary the
    // lead voice per letter even when the cast carries a melody voice —
    // non-A letters bind the partner synth (saw<->square). Voice-only on
    // the two kept songs: same cells, same seeds, the notes are identical.
    // Default only on history-less synth songs (nothing judged re-rolls).
    const varyLead = opts.varyLeadVoice ?? ((synthAcc || opts.fullSynth) && !priorKeep && !opts.grammarPin
      && historyLess());
    if (varyLead && L !== 'A' && /gm_lead_[12]/.test(LEAD_SOUND)) {
      return LEAD_SOUND === 'gm_lead_2_sawtooth' ? 'gm_lead_1_square' : 'gm_lead_2_sawtooth';
    }
    if (L === 'A' || castHasMelodyVoice || opts.noHandoff) return LEAD_SOUND;
    const others = [...new Set((mf.sections ?? []).map((x) => (x.letter ?? '').replace('*', '')).filter((x) => x && x !== 'A'))].sort();
    const ix = others.indexOf(L);
    if (ix < 0) return LEAD_SOUND;
    const snd = HANDOFF_POOL[(fnv(`${name}|handoff`) + ix) % HANDOFF_POOL.length];
    return opts.fullSynth ? SYNTH_OF(snd) : snd;
  };
  // r24 — THE SPLIT AND THE SEAMS. The verify pass flagged that a phrase split
  // manufactures boundaries leapFold (D94) cannot see across, because leapFold is
  // a WITHIN-BIND rule. MEASURED at the actual seams (a bar where one masked piece
  // stops and another starts), split OFF vs ON: the seam count doubles, 220 -> 477,
  // but each seam is no worse — leaps over a major 6th 29.6% -> 27.5%, an octave or
  // more 20.1% -> 20.6%, against 10% and 7% at an ordinary bar line. A ~20% octave
  // leap at a phrase seam is what the engine already did at every letter change;
  // the split adds seams, it does not degrade them. (The max did rise, 28 -> 38.)
  //
  // I built a seed search to fold each seam toward the previous phrase's last note
  // and REMOVED IT: A/B'd with the search disabled, every figure was identical to
  // three significant digits, because the first candidate seed already lands within
  // a fourth almost every time and the residual leaps come from the phrase ARCH —
  // phrases end high and start low, which is a breath, not a zigzag.
  // r33 — STATEMENT VARIATION VARIES THE TUNE, NOT THE REGISTER. The r24
  // re-seed (stmt >= 2) hands the walker a fresh seed, and on rl_device_rise_up
  // the re-seeded statement realized at midi ~88 — a full octave above the
  // statement-0 tune (midi 78) — at FULL lead gain, entering at bar 16. That is
  // his "the high synth is too loud when it comes in in like the second
  // section" measured: ratio 1.00 to the lead, joint-loudest layer in the mix.
  // A departure is a variation of the tune; a +12 register jump is a new
  // instrument. Re-seeded statements whose realized median exceeds statement
  // 0's by a fifth or more fold down by whole octaves toward it (leapFold's
  // own convention, D94).
  const stmtRegAnchor = new Map();
  const midiMedianOfBound = (b) => {
    const ms = (b.boundMeta?.notes ?? []).map((n) => n.midi).filter((x) => typeof x === 'number').sort((a, b2) => a - b2);
    return ms.length ? ms[Math.floor(ms.length / 2)] : null;
  };
  // the A theme's statement 0 is leadBound itself (it does not pass through
  // bindLetter), so its register anchor is seeded here
  { const m0 = midiMedianOfBound(leadBound); if (m0 != null) stmtRegAnchor.set('A', m0); }
  const bindLetter = (L, ctxL, stmt = 0) => {
    const snd = letterSound(L);
    if (vocalWriterOn) return writerBind(L, ctxL, stmt, { sound: snd });
    const bound = bindMelody(letterCell(L), ctxL, v.meter, {
      style: 'toby-fox', seed: letterSeed(L, stmt), octave: leadOctave, sound: snd, fx: leadFx,
      hold: /flute|cello|violin|oboe|shanai|organ|choir/.test(snd) ? true : LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(), ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    });
    if (r33() && leadStmtVary) {
      const med = midiMedianOfBound(bound);
      if (stmt === 0) {
        if (med != null && !stmtRegAnchor.has(L)) stmtRegAnchor.set(L, med);
      } else {
        // r33 verify: the first cut clamped only stmt >= 2 (the re-seed
        // boundary); any later statement that realizes a fifth or more above
        // its own statement 0 now folds, whatever put it there.
        const base = stmtRegAnchor.get(L);
        if (med != null && base != null && med - base >= 7) {
          const drop = 12 * Math.max(1, Math.round((med - base) / 12));
          return { ...bound, expr: `${bound.expr}.add(note(-${drop}))` };
        }
      }
    }
    return bound;
  };

  // ---- the harmonic departure ----------------------------------------------
  // D59 treat: harmony varies at the LAST REPRISE (kept songs keep this).
  // D88 ("less generic", measured: the praised lab songs carry ~3 distinct
  // progression sections; the suite ran one loop + a one-op treat): unkept
  // and future songs give the B LETTER its own progression — a deeper
  // variation (budget 2) owns every B section, so the bridge is a real
  // harmonic departure, not a decoration. The star machinery is reused
  // wholesale: melody, accompaniment, cast voices and extras all rebind to
  // the bridge harmony in those sections.
  let vary = null;
  const bridgeMode = (opts.bridgeHarmony ?? !priorKeep)
    && mf.sections.some((s) => (s.letter ?? '').replace('*', '') === 'B');
  if (bridgeMode) {
    const t = varyProgression(e, {
      budget: 2, intensity: 0.55, seed: `${name}|bridge`,
      allow: ['recolour', 'suspend', 'mixture', 'alter_dominant'],
    });
    if (t.lineage.changed) vary = t;
  }
  if (!vary && mf.varySection != null && opts.rawHarmony !== true) {
    const t = varyProgression(e, {
      budget: 1, intensity: 0.4, seed: `${name}|treat`,
      allow: ['recolour', 'suspend', 'mixture', 'alter_dominant'],
    });
    if (t.lineage.changed) vary = t;
  }
  const bridgeOn = Boolean(vary) && bridgeMode;
  let mfx = mf;
  let ctxBarV = null;
  let renderedV = null;
  let varyInfo = null;
  const varySecIdx = new Set();
  if (vary && bridgeOn) {
    for (const s of mf.sections) if ((s.letter ?? '').replace('*', '') === 'B') varySecIdx.add(s.index);
  } else if (vary) {
    varySecIdx.add(mf.varySection);
  }
  const varyBars = form.sections.flatMap((sec) => Array(sec.bars).fill(varySecIdx.has(sec.index) ? 1 : 0));
  if (vary) {
    const symbolsV = renderProgression(vary, key);
    const barSymsV = plan4 ? symbolsV.flatMap((sym, i) => Array(plan4[i]).fill(sym)) : symbolsV;
    ctxBarV = { harmony: barSymsV, barsPerChord: 1, key };
    varyInfo = {
      op: vary.lineage.ops.map((o) => o.op ?? o).join(' + '),
      symbols: symbolsV,
      kind: bridgeOn ? 'bridge (B owns it)' : 'treat @ last reprise',
    };
    renderedV = renderCtx(ctxBarV);
    const starred = [...new Set([...varySecIdx].map((i) => mf.sections.find((s) => s.index === i)?.letter).filter(Boolean))];
    mfx = {
      ...mf,
      sections: mf.sections.map((s) => (varySecIdx.has(s.index) ? { ...s, letter: `${s.letter}*` } : s)),
      letters: [...mf.letters, ...starred.map((L) => `${L}*`)],
    };
  }

  // ---- tone travel (D62): each new letter's accompaniment walks an edge ----
  const extraLetters = [...new Set(mf.sections.map((s) => s.letter).filter((L) => L && L !== 'A'))];
  const edgesFrom = (opts.accTravel === false ? [] : FND_TRAVEL)
    .filter((t) => t.a === accName || t.b === accName)
    .map((t) => ({ other: t.a === accName ? t.b : t.a, cost: t.cost, devices: t.devices }))
    .filter((t) => FIGURATIONS_FOUNDATION[t.other]?.ratified && FIGURATIONS_FOUNDATION[t.other].meter_class === v.meter)
    // r14 lane law: tone travel obeys the same blacklist — scary_manor's B
    // letter walked drone_fifth into an Alberti ("sounds happy ... doesn't
    // feel scary") through exactly this edge list
    .filter((t) => priorKeep || laneFndOk(t.other, FIGURATIONS_FOUNDATION[t.other]))
    // r21 — THE METRONOME TEST. A destination that is BOTH dense and
    // single-shaped is a pulse, not a texture. `fnd_power_fifth_8ths` is eight
    // identical `R.5` tokens on straight 8ths, and vs_mysterious_jungle's middle
    // 16 bars bound it ON THE MARIMBA: 124 attacks per 8 bars — the densest
    // stretch in the song — carrying 5 distinct bar-patterns, its 8-bar block
    // repeating verbatim. That is exactly "the marimba repeating the chords
    // repeatedly in the middle section ... instead of being varied and having
    // extra stuff".
    // No rhythm form can rescue it, which is why patching the forms was the
    // wrong layer: on straight 8ths `fill` finds no gap of 1.5 steps, `walk` no
    // hole of 3, and `push` collides its own onsets, so `hold` is the only
    // survivor and the composite comes out salt-INVARIANT — and effStmt then
    // collapses a salt-invariant figure back to statement 0, so every statement
    // of a 16-bar section is identical. I tried four variants of `hold` before
    // accepting that a monotonous FIGURE CHOICE cannot be fixed by varying it.
    // Stated as a MEASUREMENT of the figure (onset density x distinct shapes),
    // never as a forbidden name — a name list has now failed five times (D100).
    .filter((t) => {
      // freshRules, not (priorKeep || grammarPin): the byte compare caught this
      // reaching vs_somber_space and vs_calm_desert, which carry pinFrom: 'r20'
      // and no grammarPin. Every new structural rule needs the era stamp too.
      if (!freshRules) return true;
      const f = FIGURATIONS_FOUNDATION[t.other];
      const perBar = (f.onsets?.length ?? 0) / (f.bars ?? 1);
      const shapes = new Set((f.figure ?? []).map(String)).size;
      // …and a 16th-note DRIVE is not a texture change either, whatever its
      // shape count. Excluding only single-shaped pulses moved jungle's middle
      // from `fnd_power_fifth_8ths` to `fnd_arp_16ths_drive` — denser still, and
      // the exact thing his ear has rejected twice on jungle cards ("just
      // another default Alberti"). `SERIOUS_FND_CLASSES` permits `arp`, so the
      // class whitelist cannot catch it: this is D100's lesson restated, that a
      // whitelist encodes "not playful" and says nothing about GEAR. Density is
      // the property that matters, so density is what is measured.
      return !(perBar >= 6 && shapes <= 1) && perBar < 12;
    });
  // r18/D99 — "four chord arpeggio is OVERUSED and NOT VARIED AT ALL". Two
  // separate defects hid behind that one phrase. The lane blacklist above fixes
  // which figures may be reached; this fixes the fact that every song reached
  // the SAME one. `edgesFrom[i]` took the travel list in declaration order, so
  // any two songs sharing an accompaniment figure walked to an identical
  // destination — and B, C and D of a single song walked to three figures from
  // the same family, because the list groups them. Rotating by the song's own
  // hash (the D46 move: chosen from context, never sampled) and floating one
  // member of each family to the front gives the letters genuinely different
  // territory. priorKeep and opts.travelPin hold the judged order.
  const travelFamily = (n) => (/alberti|arp|broken/.test(n) ? 'arp'
    : /oompah|stride|boogie|charleston|habanera/.test(n) ? 'oompah'
      : /block|drone|pedal|sustain|power_fifth/.test(n) ? 'block' : 'other');
  // grammarPin belongs in this gate for the same reason accVaryOn carries it:
  // a PROSE keep ("love this. the layering, the progressions, the variation and
  // changes. amazing") is a keep, and re-ordering its travel moved both of them.
  const edgeOrder = (priorKeep || opts.grammarPin || opts.travelPin || edgesFrom.length < 2) ? edgesFrom : (() => {
    const r = fnv(`${name}|travelpick`) % edgesFrom.length;
    const rot = [...edgesFrom.slice(r), ...edgesFrom.slice(0, r)];
    const seen = new Set(); const first = []; const rest = [];
    for (const e of rot) {
      const f = travelFamily(e.other);
      if (seen.has(f)) rest.push(e); else { first.push(e); seen.add(f); }
    }
    return [...first, ...rest];
  })();
  const letterFig = new Map([['A', accFig]]);
  const travelInfo = [];
  extraLetters.forEach((L, i) => {
    const edge = edgeOrder[i] ?? null;
    if (edge) {
      letterFig.set(L, { ...FIGURATIONS_FOUNDATION[edge.other], name: edge.other });
      travelInfo.push(`${L}: ${accFig.name ?? accName} → ${edge.other} (${edge.devices[0]}, cost ${edge.cost})`);
    } else {
      letterFig.set(L, accFig);
    }
  });
  // per-bar accompaniment: which figuration, over which harmony
  const barLetter = form.sections.flatMap((sec) => {
    const L = mfx.sections.find((x) => x.index === sec.index)?.letter ?? null;
    return Array(sec.bars).fill(L);
  });
  // r16, the other half of his mid-round ask — "how sections change over time".
  // A returning letter used to be byte-identical to its first statement: the
  // combo key was (figure, variant) only, so A at bar 24 re-entered the same
  // bound expression it played at bar 0. Ryuu is the counter-example — the SAME
  // progression Bb-C-Am-Am returns three times at 5.5 / 1.8 / 8.0 onsets per
  // bar (broken arp, then block chords, then root-fifth 8ths). So the STATEMENT
  // NUMBER now keys the combo and salts the variation seed: statement 0 keeps
  // exactly what it had, later statements pick different forms.
  const stmtOfSection = new Map();
  {
    const seen = new Map();
    for (const sec of form.sections) {
      const L = mfx.sections.find((x) => x.index === sec.index)?.letter ?? null;
      const k = (L && L.endsWith('*') ? L.slice(0, -1) : L) ?? '-';
      const c = seen.get(k) ?? 0;
      stmtOfSection.set(sec.index, c);
      seen.set(k, c + 1);
    }
  }
  // r21 — key the salt on the SECTION, not on the letter's statement count.
  //
  // D97 salted by "how many times has this letter been heard", so a song whose
  // letters are A B C B* has statements 0,0,0,1 — three of its four sections
  // share salt 0 and therefore share one composite. Measured on
  // vs_mysterious_jungle: its 8-bar accompaniment block repeated VERBATIM 9
  // times across 72 bars, and on vs_nostalgic_casino every one of the 7 passes
  // gave the same chord the identical treatment. His ear, twice: "the marimba
  // repeating the chords repeatedly in the middle section", "it's still like
  // 95% chord repetition".
  // Section 0 still takes the unsalted seed, so nothing that was judged on
  // statement 0 moves for that reason; and the whole thing rides accVaryOn, so
  // keeps and pins are untouched either way.
  // …and a LONG section is split in half, because a 4-bar composite cannot
  // develop across 16 bars however it is salted. Measured on the middle of
  // vs_mysterious_jungle (bars 24-39): 124 marimba attacks per 8 bars — the
  // densest stretch in the song — carrying only 5 distinct bar-patterns, its
  // 8-bar block repeating twice. That is what "repeating the chords repeatedly
  // in the middle section" sounds like.
  // The split point is a multiple of 4 (4 * floor(bars/8)), so every piece still
  // lands on the 4-bar grid every section start and breakdown mask assumes.
  const barStmt = form.sections.flatMap((sec, si) => Array.from({ length: sec.bars }, (_, b) => {
    if (!freshRules) return stmtOfSection.get(sec.index) ?? 0;
    const half = 4 * Math.floor(sec.bars / 8);
    return (sec.bars >= 8 && half > 0 && b >= half) ? si * 2 + 1 : si * 2;
  }));
  const comboMask = new Map(); // `${fig.name}|${variant}|${statement}` -> bars 0/1
  barLetter.forEach((L, bar) => {
    const base0 = L && L.endsWith('*') ? L.slice(0, -1) : L;
    const fig = letterFig.get(base0) ?? accFig;
    const variant = ctxBarV != null && varyBars[bar] === 1;
    // gated on accVaryOn, not just used as a salt: splitting the combo changes
    // the MIX STRING (two masked pieces instead of one) even when the bound
    // expression is identical, so an ungated split leaks into pinned songs —
    // it moved vs_mysterious_cave, a keep, before this gate.
    // r16 verify catch: 6 of the 30 canon foundations are SALT-INVARIANT, so
    // the split emitted a second masked piece carrying byte-identical music on
    // 5 songs — pure mix-string overhead, zero musical change. Collapse the
    // statement back to 0 whenever the varied figure comes out the same.
    const stmt = accVaryOn ? effStmt(fig, barStmt[bar] ?? 0) : 0;
    const k = `${fig.name}|${variant ? 'v' : 'o'}|${stmt}`;
    if (!comboMask.has(k)) comboMask.set(k, { fig, variant, stmt, bars: Array(barLetter.length).fill(0) });
    comboMask.get(k).bars[bar] = 1;
  });
  const basePieces = [...comboMask.values()].map(({ fig, variant, stmt, bars }) => {
    const expr = bindAcc(fig, variant ? ctxBarV : ctxBar, stmt);
    const m = maskString(bars);
    return /^1(@\d+)?$/.test(m) ? expr : `${expr}.mask("<${m}>")`;
  });
  const baseMix = basePieces.length === 1 ? basePieces[0] : `stack(${basePieces.join(', ')})`;

  // ---- the letter-formed lead + layers (undertale mix logic) ---------------
  const letterLead = renderLetterLead(form, mfx, (L, stmt) => {
    const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
    return bindLetter(base0, L.endsWith('*') ? ctxBarV : ctxBar, stmt).expr;
  }, { perStatement: leadStmtVary, phraseBars: leadPhraseBars });
  // the lead AS THE MIX PLAYS IT — masked. The `_lead` solo is deliberately
  // unmasked (a solo should sound like the layer, not like its placement), and a
  // repetition probe run against it reports the 8-bar cell looping for the whole
  // song. That is how a first pass "measured" 72 bars of verbatim repetition.
  if (DBG_LEAD && letterLead.lead) console.error(`LEADDEBUG\t${name}\t${v.bpm}\t${beats}\t${form.totalBars}\t${letterLead.lead}`);
  const lettersOf = (l) => [...new Set(form.sections
    .filter((s) => s.active.includes(l.id) && s.lead !== 'none')
    .map((s) => mf.sections.find((x) => x.index === s.index)?.letter)
    .filter(Boolean))];
  // ---- r29 · THE CAST'S OWN GAINS ARE ABSOLUTE TOO ------------------------
  // `gainFor` in arrange.js sets `melody_takeover: 0.85` and then caps the
  // result with `Math.min(0.9, ...)`, whose comment reads "Capped so nothing can
  // shout over the piano". It does not do that: 0.9 is an absolute ceiling, not
  // a comparison with the lead. MEASURED on the r28 page, takeover-family layers
  // against their own song's lead: 1.91x, 1.60x, 1.53x, 1.53x, 1.25x, 1.09x —
  // six of eleven ABOVE the tune they are supporting, and the 1.91x song is his
  // "the synth sometimes is a bit too loud" card.
  //
  // Fixed here rather than in arrange.js because the arranger cannot see
  // `leadGain` — it is computed in this file from the vibe — and because
  // changing `gainFor` would move every page at once. A `melody_takeover` may
  // reach the lead's own level (it genuinely takes the tune over, D100) but not
  // exceed it.
  const castCapOn = r29() && opts.supportUnderLead === true;
  const castCap = (l) => {
    if (!castCapOn || !(l.gain > leadGain)) return null;
    return Math.round((leadGain / l.gain) * 100) / 100;
  };
  const castCapped = [];
  const layerMixRaw = shaped.layers.map((l) => {
    let orig = l.expr;
    let variant = renderedV?.layers.find((x) => x.id === l.id)?.expr ?? null;
    if (l.derives === 'lead' || l.derives === 'lead-rhythm') {
      const Ls = lettersOf(l);
      if (Ls.length === 1 && Ls[0] !== 'A') {
        const sustainy = /trumpet|trombone|horn|oboe|clarinet|flute|recorder|ocarina|voice|choir|string|cello|violin|viola|bassoon|pan_flute/.test(l.instrument);
        const opts = {
          style: 'toby-fox', octave: l.octave, sound: l.instrument, fx: gainFx(l.gain),
          seed: l.derives === 'lead' ? letterSeed(Ls[0]) : l.seed,
          // D66: the merge is the MELODY's — only tune-carrying layers get it
          // D89 addendum: the verify pass caught this rebind as the ONE bind
          // path the cadence correction missed (desert's bridge calliope held
          // a maj7 at an antecedent phrase-final)
          hold: sustainy || LEAD.hold, mergeRepeats: l.derives === 'lead', cadenceNo7, chromCore,
        };
        orig = bindMelody(letterCell(Ls[0]), ctxBar, v.meter, opts).expr;
        if (ctxBarV) variant = bindMelody(letterCell(Ls[0]), ctxBarV, v.meter, opts).expr;
      }
    }
    let act = maskBarsFor(l.id, form);
    // D65→D67, the pad dynamics story: round 2 asked for a swell in the
    // development ("louder in the part with the flute and arpeggio"); round
    // 3 sharpened it — "the dynamics should fluctuate not sound constant",
    // "vary fluidly … to represent the flow of water", strings "way too
    // loud" in their section, and for environment songs the pad "should
    // begin as it starts playing" (the setting IS the environment). So a
    // support pad now BREATHES: a per-bar gain wave around a soft base,
    // rising to a higher band where another melodic voice plays (that
    // section is the development), and on padFromStart songs it sounds from
    // bar 1, very soft.
    let devBars = null;
    if (l.derives === 'chords') {
      const melodicBars = shaped.layers
        .filter((x) => x.id !== l.id && ['lead', 'lead-rhythm', 'independent'].includes(x.derives))
        .map((x) => maskBarsFor(x.id, form));
      let dev = act.map((_, i) => (melodicBars.some((mb) => mb[i]) ? 1 : 0));
      if (!dev.some(Boolean)) {
        const peakIdx = form.sections.reduce((a, b) => (b.energy > a.energy ? b : a)).index;
        dev = form.sections.flatMap((sec) => Array(sec.bars).fill(sec.index === peakIdx ? 1 : 0));
      }
      if (opts.padFromStart) act = act.map(() => 1);
      else act = act.map((x, i) => (x || dev[i] ? 1 : 0));
      devBars = dev;
    }
    // D91 (snow: "some parts where the strings suddenly jump to be really
    // loud ... very loud and jumps"): opts.padWaveCalm halves the wave's
    // contrast and narrows the development/base band gap — the pad still
    // breathes (menu's flow was PRAISED with the full wave), just gently.
    const calmWave = Boolean(opts.padWaveCalm);
    // r18: somber_snow's "strings suddenly jump to be really loud" note is ABOVE
    // his scary_manor line and arrived unchanged, so it is a leftover from the
    // round padWaveCalm already answered — the tightening I had made here is
    // reverted. The measurement is kept for whenever it goes live: in the MIX
    // (not the solo, where the D82 section curve is absent) that pad runs
    // 0.30-0.44, a 1.47x span peaking every fourth bar.
    const wave = (center) => `"<${(calmWave ? [0.93, 1, 1.05, 0.98] : [0.85, 1, 1.12, 0.97]).map((m) => Math.round(center * m * 100) / 100).join(' ')}>"`;
    const inVary = act.map((x, i) => (x && varyBars[i] ? 1 : 0));
    const variantOn = variant && inVary.some(Boolean);
    // partition the active bars by (which harmony) × (development or base)
    const groups = new Map();
    act.forEach((x, i) => {
      if (!x) return;
      const k = `${variantOn && varyBars[i] ? 'v' : 'o'}${devBars && devBars[i] ? 's' : 'p'}`;
      if (!groups.has(k)) groups.set(k, Array(act.length).fill(0));
      groups.get(k)[i] = 1;
    });
    if (!groups.size) return `${orig}.mask("<${maskString(act)}>")`;
    const exprOf = (k) => {
      const base = k[0] === 'v' ? variant : orig;
      if (!devBars) return base;
      // D91 addendum: the D82 section-curve step stacks on the band boundary
      // (measured 1.53x with 1.02/0.82) — calm bands narrowed to 0.95/0.85.
      return `${base}.gain(${wave(k[1] === 's' ? l.gain * (calmWave ? 0.95 : 1.15) : l.gain * (calmWave ? 0.85 : 0.72))})`;
    };
    const parts = [...groups.entries()].map(([k, bars]) => {
      const m = maskString(bars);
      return /^1(@\d+)?$/.test(m) ? exprOf(k) : `${exprOf(k)}.mask("<${m}>")`;
    });
    return parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`;
  });
  // apply the relative cap on the FINISHED layer, so it survives every branch
  // above (masked, waved, per-letter rebound) rather than only the common one.
  const layerMixExprs = layerMixRaw.map((x, i) => {
    const l = shaped.layers[i];
    const k = l ? castCap(l) : null;
    if (!k || k >= 1) return x;
    castCapped.push(`${l.part} ${l.gain}->${Math.round(l.gain * k * 100) / 100}`);
    return `(${x}).mul(gain(${k}))`;
  });

  // ---- drums: vouched dp_* where a vibe note matches, else engine perc -----
  let drums = null;
  let drumBarsShared = null;
  const drumInfo = [];
  const dpPick = !opts.dropIntro && v.percussion.presence !== 'none' ? (DP_DRUMS[name] ?? null) : null;
  if (dpPick) {
    const T = form.totalBars;
    const probe = dpStack(dpPick.pattern, {});
    const mul = beats === 2 ? 2 : 1; // a 4/4 grid over 2/4 bars spans two of them
    const d = [16, 12, 8, 6, 4, 2, 1].find((x) => x <= probe.bars && T % (x * mul) === 0) ?? 1;
    let { expr } = dpStack(dpPick.pattern, { from: 0, to: d, gainMul: (DP_GAIN[v.percussion.presence] ?? 0.5) * (dpPick.gainMul ?? 1) });
    if (mul === 2) expr = `(${expr}).slow(2)`;
    const drumBars = form.sections.flatMap((sec) =>
      Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    if (drumBars.some(Boolean)) {
      const dm = maskString(drumBars);
      drumBarsShared = drumBars;
      drums = /^1(@\d+)?$/.test(dm) ? expr : `${expr}.mask("<${dm}>")`;
      drumInfo.push(`${dpPick.pattern} (harvested — his note: \u201c${dpPick.note}\u201d)${d < probe.bars ? `, first ${d}/${probe.bars} bars` : ''}`);
    }
  } else if (!opts.dropIntro && (opts.percPresence ?? v.percussion.presence) !== 'none' && (opts.percPatterns ?? v.percussion.patterns).length) {
    // genre-expansion: opts.percPatterns pins a song's iqa'/groove outright
    // (somber desert wants masmoudi, the caravan wants ayyub) and
    // opts.percPresence resurrects percussion an emotion zeroed out —
    // "even somber: masmoudi dums every 2 bars minimum" (env-desert-jungle
    // §2: deleting all percussion is what tips desert into space).
    // r19/D100 — the catacombs floor follows the lane to AMBIENCE. His ruling
    // was "it should just be the beginning and ambiant horror", and measured,
    // all three catacombs songs were running `war_gallop` (the action-trailer
    // dotted-8th gallop) UNDER `sixteenth_drive` (the busiest hi-hat the
    // library has) at driving/foreground. That is the "happy everything" bed
    // the drop landed into, and it is the same complaint he had just made about
    // scary_citadel's drum in his own words ("really groovy"). heartbeat_toms
    // is the library's own horror floor — lub-dub, then silence for the rest of
    // the bar — and the high band drops out entirely: ambience has no hats.
    const catacombAmbience = !priorKeep && !opts.grammarPin && env === 'catacombs' && !opts.percPatterns;
    const patsRaw = catacombAmbience ? ['heartbeat_toms'] : (opts.percPatterns ?? v.percussion.patterns);
    // r32 — HIS CARD, TWICE: "the shake or tambourine or whatever again sounds
    // like it's on a different tempo" (rl_holiday_bright_r7) and "this tambourine
    // or whatever is literally just off beat" (rl_cross_holiday_bright).
    //
    // He is describing a real GRID defect, not a mix opinion. `seven_hats_223`
    // is a 7/8 pattern — seven onsets at 0, 1/7, 2/7 ... 6/7 of the bar — and it
    // was selected for a 4/4 song, so its hats land on SEVENTHS of a 4/4 bar and
    // line up with nothing. Its own row says `meter_class: '7/8'`; the data was
    // right all along and the SELECTOR never looked. The foundation pool has
    // filtered on `meter_class` since the beginning; the drum pool never did.
    //
    // Five library rows are affected — seven_hats_223 (high), seven_pulse_223
    // (low), seven_syncopated (mid), seven_offbeat_lift (mid) and waltz_lift
    // (3/4, low). Measured reach: 3 songs across the whole project, all of them
    // festival/holiday prompts, which is why it took until now to surface.
    // D92 makes the engine 4/4-only, so an odd-meter drum row can never be right.
    const patsMeter = patsRaw.filter((p) => {
      const mc = RHYTHMS[p]?.meter_class;
      return !mc || mc === v.meter;
    });
    const patsDropped = patsRaw.filter((p) => !patsMeter.includes(p));
    const pats = patsMeter.length ? patsMeter : patsRaw;
    const presence = catacombAmbience ? 'light' : (opts.percPresence ?? v.percussion.presence);
    const byBand = (band) => pats.find((p) => RHYTHMS[p]?.band === band);
    // r16: the selector took ONE low-band pattern and one high, then capped at
    // two — so his desert-perc answer ("add it as a 3rd pattern") was
    // unreachable: even an explicit percPatterns list naming a second low-band
    // floor was silently dropped. A song that NAMES its patterns may now seat
    // two low-band floors; the env-default path is untouched, so no song that
    // did not ask for it gains a drum.
    const lows = pats.filter((p) => RHYTHMS[p]?.band === 'low');
    // ---- r22: THE MISSING SNARE. His note, verbatim: "for the drums there
    // isn't even a dum being hit it's just hihat - there should be actual drums
    // like an actual drum beat." Measured on that song: 256 hi-hats, 80 kicks,
    // ZERO snares over 16 bars. The cause is this line — it took ONE 'low'
    // pattern and ONE 'high' and capped at two, and every snare in RHYTHMS is
    // band 'mid', so the backbeat was unreachable on the default path no matter
    // what the vibe asked for. That is the THIRD failure of this selector's
    // shape (r16: a second low-band floor silently dropped; D100: the low-band
    // cap again) and the fix is the same each time — stop assuming the kit has
    // exactly two parts.
    //
    // Lanes that own their percussion keep it: desert's iqa' floor is judged
    // law (D93/D94) and horror's ambience deliberately has no kit. Jungle is
    // left alone here too — his "this isn't heavy tribal percussion" note wants
    // MORE HAND DRUMS, not a trap snare, and guessing at that is how the lane
    // law got broken twice before.
    const NO_BACKBEAT_LANES = new Set(['desert', 'manor', 'catacombs', 'citadel', 'cave', 'jungle', 'shrine']);
    // r24: real samples instead of Strudel's stock bd/sd/hh for the 15 patterns
    // that declare none. Opt-in — it rewrites the mix string, so switching it on
    // by default would move every judged song's drums and invalidate their HQ
    // renders. His Miraleste pack is local-only and gitignored (r16 licensing).
    // r33: `!opts.pinFrom` treated ANY pin as full-off, violating pinFrom's
    // documented semantics ("rules from THIS round on do not reach this song")
    // — a pinFrom:'r33' prose keep lost the deep drums it was JUDGED WITH the
    // moment it was pinned (the D101 catch-22, third instance). ruleFresh(25)
    // keeps the r20/r24-pinned songs exactly as they were (25 >= their pins →
    // still off) and lets an r33 pin keep the judged capability.
    const deepDrums = opts.deepDrums === true && ruleFresh(25);
    //
    // OPT-IN, NOT ENGINE-WIDE, AND THAT IS DELIBERATE. Switching it on by
    // default moved 13 of the 47 judged songs (measured) and would invalidate
    // the 66 HQ renders queued for his r21 listen. There is also a fork only
    // his ear can settle, and the two live notes point opposite ways: r21
    // "the drums are a bit too loud" (nostalgic_casino) against r22 "there
    // isn't even a dum being hit". So mid arrives as a THIRD voice (fuller,
    // denser) only where a song asks; the alternative — mid REPLACING the high
    // hat, same density, kick+snare instead of kick+hat — is one flag away if
    // that is what he wants instead.
    const wantsBackbeat = opts.percBackbeat === true && !priorKeep && !opts.grammarPin
      && !opts.percPatterns && !NO_BACKBEAT_LANES.has(env) && !catacombAmbience;
    // The BACKBEAT outranks whatever mid pattern the vibe happens to list.
    // Measured first pass: miniboss_drive and splash_action picked up
    // `gallop_arp` — a snare at 12/bar with nothing on 2 and 4. That is a
    // snare, but it is not what he asked for ("an actual drum beat"), and
    // preferring the vibe's existing mid quietly satisfied the band check
    // while missing the ask.
    const midPick = !wantsBackbeat ? null
      : (presence === 'foreground' || v.bpm >= 130 ? 'backbeat_hard' : 'backbeat_kit');
    let picks = opts.percPatterns
      ? [...new Set([...lows.slice(0, 2), byBand('high')].filter(Boolean))].slice(0, 3)
      : [...new Set([byBand('low') ?? pats[0], midPick, byBand('high')].filter(Boolean))].slice(0, 3);
    // his industrial ask: "if it's industrial it should have more percussion
    // like metal rod hits or stick hits or such" — a fourth voice, over the kit
    // r32 — ROTATE. `industrial_metal` was named literally here and it was the
    // library's only stick row, so every construction song got the same part:
    // his "the same 3 stick is just used every construction or what?". Two
    // groove-forward siblings added (rhythms.js) and the pick is hash-rotated,
    // which is the D119 fix — when a selection looks varied, COUNT THE POOL.
    // Report the meter filter ONLY where it changes what actually sounds. An
    // odd-meter row that sat in the list but was never picked is a latent bug,
    // not an event, and announcing it on a judged card moves the card text for
    // no audible reason — the byte compare caught exactly that on three songs,
    // one of them a keep.
    if (patsDropped.length && patsMeter.length) {
      const byBandRaw = (band) => patsRaw.find((p2) => RHYTHMS[p2]?.band === band);
      const lowsRaw = patsRaw.filter((p2) => RHYTHMS[p2]?.band === 'low');
      const picksRaw = opts.percPatterns
        ? [...new Set([...lowsRaw.slice(0, 2), byBandRaw('high')].filter(Boolean))].slice(0, 3)
        : [...new Set([byBandRaw('low') ?? patsRaw[0], midPick, byBandRaw('high')].filter(Boolean))].slice(0, 3);
      if (JSON.stringify(picksRaw) !== JSON.stringify(picks)) {
        extraInfo.push(`drum meter filter (r32): dropped ${patsDropped.join(', ')} — `
          + `meter_class ${patsDropped.map((p2) => RHYTHMS[p2]?.meter_class).join('/')} in a ${v.meter} song. `
          + 'His "the tambourine sounds like it\u2019s on a different tempo" / "literally just off beat": '
          + 'a 7/8 row\u2019s onsets are SEVENTHS of the bar and line up with nothing in 4/4');
      }
    }
    // r32 — HIS CARD: "the percussion also a bit too relaxed too sign excited"
    // (an excited/training song). Measured across the vibe table: SIX
    // environments declare drums with no HIGH band at all, and two of them —
    // `training` and `lab` — declare `presence: 'driving'` while carrying no
    // timekeeper whatsoever. training is a 120-150bpm chase lane whose whole kit
    // is a four-on-the-floor and a ghost backbeat: no hat, no shaker, nothing
    // subdividing the beat. That reads relaxed because it IS relaxed.
    //
    // The other four are correct as they stand and are left alone: stealth,
    // kitchen and space all declare `light` (sparse by design, and D93's horror
    // ambience deliberately has no kit), and citadel is a niche lane the r32
    // gate excludes anyway.
    //
    // Done in the SELECTOR, not in vibes.js: adding a pattern to a vibe's
    // declared list would re-roll `byBand()` for every song on that lane
    // including keeps, and the freeze law forbids that. Here it rides r32().
    if (r32() && !byBand('high') && ['driving', 'foreground'].includes(presence)
      && !NO_BACKBEAT_LANES.has(env)) {
      const tick = v.bpm >= 120 ? 'shaker_urgency' : 'swung_lofi_hats';
      picks = [...new Set([...picks, tick])].slice(0, 4);
      extraInfo.push(`timekeeper (r32): ${tick} added — this lane declares a "${presence}" kit and its `
        + 'pattern list carries no HIGH band at all, so nothing was subdividing the beat. His "the '
        + 'percussion also a bit too relaxed too sign excited". Six environments are in that state; only '
        + 'the two that declare a driving kit are corrected, because sparse IS the point on the others');
    }
    // r33 — HIS FIFTH STICK COMPLAINT, and the r32 rotation was measured a
    // hash NO-OP on the exact card he judged: fnv('rl_industrial_mission_r4|
    // industrial') % 3 = 0 = industrial_metal, the identical old row, still
    // literally "hitting 3 times and rest" (md_stick 3/bar at 1/8·5/8·7/8, one
    // pattern across all 24 drum bars, interlocking with ZERO kick/clap/snare
    // onsets while the metal doubled the backbeat 72/72 — redundant, not a
    // groove). The two r32 siblings were DESIGNED for his sentence ("the stick
    // should be a notable part of the percussion and be part of a groovy
    // beat") and the rotation simply never landed on them where he listened.
    // industrial_metal leaves the default rotation on r33-fresh songs; it stays
    // in the library for his ear to ratify back via the catalog if wanted.
    const INDUSTRIAL = r33()
      ? ['industrial_stick_backbeat', 'industrial_rivet_tresillo']
      : ['industrial_metal', 'industrial_stick_backbeat', 'industrial_rivet_tresillo'];
    if (wantsBackbeat && env === 'construction') {
      const pick = r32() ? INDUSTRIAL[fnv(`${name}|industrial`) % INDUSTRIAL.length] : 'industrial_metal';
      picks = [...new Set([...picks, pick])];
    }
    // ---- r23: THE BATTLE KIT (his "for the boss fights learn what makes them
    // actually feel energetic with stakes on the line and epic ... and rhythm").
    //
    // Gated on the vibe's dramatic ROLE, which is exactly what he asked for
    // this round: "lots of the techniques and intervals behind his layering
    // should own be applied to applicable genres. not specific ones like jungle
    // or desert". `v.role` is a GENRE (battle/boss/chase/town/...), declared by
    // the vibe table; `env` is a lane. Every r23 device below keys on the role.
    //
    // Measured (research/boss-r23.md, 13 battle vs 43 other files, all from his
    // own hand-picked set): toms 1.887 hits/bar vs 0.313, crash on 19.8% of
    // bars vs 13.8%. Both arrive as EXTRA voices on band 'accent', which no
    // selector reads — growing 'low' or 'mid' would re-roll `byBand()` across
    // the whole suite, and this selector has already broken three times on
    // exactly that (r16, D100, r22).
    if (opts.battleKit !== false && !priorKeep && !opts.grammarPin && !opts.percPatterns
        && battleRole && presence !== 'none' && !NO_BACKBEAT_LANES.has(env)) {
      // r25: `noCymbal` drops the crash for a song whose note asks for it —
      // "just remove the suspended cymbal from these type of songs"
      // (su_triumphant_boss), "remove the cymbal" (su_tense_fight).
      picks = [...new Set([...picks, 'battle_toms', ...(opts.noCymbal ? [] : ['battle_crash'])])];
    }
    // ---- r24 · THE BAND KIT: "some songs may not have drum set" ------------
    // His words: "bear in mind though that some songs may not have drum set,
    // they'll have like band drums like snare or bass and timphany etc."
    //
    // Selected from the CAST'S DECLARED FAMILIES, never from a lane or a name:
    // a song whose pitched cast is mostly acoustic orchestral voices (string /
    // wind / brass, per INSTRUMENTS[x].family) gets a BAND floor instead of a
    // drum set — field snare, concert bass drum, timpani, and a roll into every
    // eighth bar. This is a REPLACEMENT, not an addition; a kit and a band line
    // playing at once is the "four sonic worlds" problem in a different form.
    //
    // Synth songs are excluded by construction: a fullSynth or synth-acc song
    // is not an orchestral cue whatever its cast says.
    const castFamilies = rendered.layers
      .map((l) => INSTRUMENTS[l.instrument]?.family)
      .filter(Boolean);
    const orchShare = castFamilies.length
      ? castFamilies.filter((f) => ['string', 'wind', 'brass'].includes(f)).length / castFamilies.length
      : 0;
    // History-less songs only (D99), plus `opts.r23`/explicit: without this the
    // selector moved THREE judged songs (excited_training, happy_festival,
    // nostalgic_shop) — swapping a kit for a band line is a large change to a
    // mix he has already heard, and it invalidates their HQ renders.
    const bandKitFresh = opts.r23 === true
      || (historyLess());
    // WHAT DISQUALIFIES A BAND KIT IS THE CONTEXT, NOT THE INSTRUMENT FAMILY.
    // First cut needed only `orchShare >= 0.5` and put a march snare, timpani
    // and a GONG under su_nostalgic_casino and su_excited_casino — swing songs
    // whose brass is a muted trumpet and a french horn. My second cut demanded a
    // WIND or STRING on the theory that brass alone reads as a big band; that
    // was wrong in the other direction and disqualified every song including
    // su_excited_boss, a horns-and-trumpet boss cue that is exactly what band
    // percussion is for. Measured: 7 songs -> 0.
    //
    // The honest discriminator is the ENSEMBLE CONTEXT. A swing feel and the
    // diegetic/joke roles are combo music, where a field snare and timpani are
    // absurd whatever the cast declares; everything else with an acoustic
    // orchestral cast is a concert cue.
    const combo = Boolean(opts.swing) || ['diegetic', 'joke', 'shop'].includes(v.role);
    const wantsBandKit = opts.bandKit === true || (opts.bandKit !== false && bandKitFresh
      // r24: ruleFresh(24) so a PROSE KEEP pinned this round refuses it. Without
      // this the band kit re-cast su_scary_fight, which he had just called "the
      // one I like the most of the fight songs" — a pin that new rules ignore is
      // not a pin, and this is the D99 failure in its own fix.
      && ruleFresh(24)
      && !opts.percPatterns && !opts.fullSynth && !synthAcc
      && castFamilies.length >= 2 && orchShare >= 0.5 && !combo
      && presence !== 'none' && !['desert', 'jungle'].includes(env));
    if (wantsBandKit) {
      picks = ['band_bass_drum', 'band_march_snare'];
      // timpani only where the song is big enough to carry it; the roll is a
      // transition and needs 8+ bars to land on
      const peakEnergy = Math.max(...form.sections.map((sec) => ENERGY[sec.archetype] ?? 3));
      if (peakEnergy >= 4 || ['battle', 'boss', 'cutscene'].includes(v.role)) picks.push('band_timpani');
      if (form.totalBars >= 16) picks.push('band_roll_swell');
      if (['battle', 'boss'].includes(v.role) && form.totalBars >= 32) picks.push('band_gong');
    }
    // r16 JUNGLE FLOOR + KICK, both from his answers.
    //   jungle-floor: "depends on the song's energy! use a for relaxing jungle
    //   themes but otherwise make a beat similar to b. important that you
    //   don't reuse b every time though. because that makes it uniform"
    //   jungle-kick: "b" — four-on-the-floor, for energetic songs.
    // The relaxing side is untouched (tumbao_conga + martillo_bongo, 11
    // hits/bar = the demo he said to keep). The energetic side takes a carpet
    // CHOSEN BY HASH from two, plus the dance kick — his Battle Cats example
    // is the only reference that puts one under the hand percussion, so it is
    // gated to the energetic end rather than given to the lane.
    if (!priorKeep && env === 'jungle' && !opts.percPatterns) {
      // 'foreground' is the energy signal, not bpm: the emotion transform
      // demotes an atmospheric song's percussion presence, which is exactly
      // the "relaxing jungle theme" his answer says keeps floor a. Gating on
      // bpm as well put a dance kick under mysterious_jungle.
      const energetic = presence === 'foreground';
      if (energetic) {
        const CARPETS = ['jungle_carpet_16ths', 'jungle_carpet_guiro', 'martillo_bongo'];
        const carpet = CARPETS[fnv(`${name}|jfloor`) % CARPETS.length];
        picks = [...new Set([byBand('low') ?? pats[0], carpet, 'four_floor'])];
      }
    }
    // opts.percAllBars: the floor never leaves (verify catch: somber
    // desert's whole 16-bar B section had zero hand drums — exactly the
    // "no percussion tips it into space" failure the pin exists to stop)
    const drumBars = form.sections.flatMap((sec) =>
      Array(sec.bars).fill(opts.percAllBars ? 1 : (ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    // ---- r35 · THE CRASH LEADS INTO THE SEAM, AND ITS PEAK LANDS THERE ------
    // His cards: "random cymbal is in the middle of the section, not before a
    // drop or anything" (vx_tense_fight), "random cymbal doesn't fit either"
    // (vx_triumphant_boss), "cymbal not before the drop of a section"
    // (vg_excited_fight). Two measured causes. (1) `battle_crash` is an 8-bar
    // CELL (onset 31/4 = bar 7 beat 4) that counts from the drum mask's first
    // bar, not from the form — on a 16-bar A section its crash lands at bar 8,
    // mid-section, and on the 64-bar boss half its six crashes were mid-section.
    // (2) The sound is a CRESCENDO sample and the wav backend round-robins its
    // three lengths: the swell peaks 1.44 s (short), 3.57 s (median) or 7.06 s
    // (long) after the onset — a "lead-in" placed a beat before the seam PEAKED
    // one to four bars INTO the next section. So on r35-fresh songs the crash
    // row leaves the kit and a single stamp is placed per seam: the SHORT
    // variant (`vc_cym_cresc:0`, both tiers pick the same file) starting its
    // measured peak-time before the downbeat of every section that changes
    // letter or lifts energy and carries drums — the "drop", his word.
    const seamCrash = opts.crashSeams ?? (r35() && historyLess() && picks.includes('battle_crash'));
    if (seamCrash) picks = picks.filter((p) => p !== 'battle_crash');
    if (drumBars.some(Boolean)) {
      const parts = picks.map((p) => drumExpr(p, presence, deepDrums, r33()));
      const dm = maskString(drumBars);
      drumBarsShared = drumBars;
      const stackd = parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`;
      drums = /^1(@\d+)?$/.test(dm) ? stackd : `${stackd}.mask("<${dm}>")`;
      drumInfo.push(...picks.map((p) => `${p} (${RHYTHMS[p].band}) at ${presence}`));
      if (seamCrash) {
        const CRASH_PEAK_S = 1.44; // measured: susCymb1-cresc-Short_v1.wav peak RMS at 1.44 s
        const secPerBar = (60 / v.bpm) * beats;
        const leadBars = CRASH_PEAK_S / secPerBar;
        const letterAt = (sec) => String(mf.sections.find((x) => x.index === sec.index)?.letter ?? 'A').replace('*', '');
        const stampBars = Array(form.totalBars).fill(0);
        const seams = [];
        let start = 0;
        form.sections.forEach((sec, i) => {
          if (i > 0) {
            const prev = form.sections[i - 1];
            const drop = drumBars[start] === 1
              && (letterAt(sec) !== letterAt(prev) || (ENERGY[sec.archetype] ?? 3) > (ENERGY[prev.archetype] ?? 3) || (prev.lead === 'none' && sec.lead !== 'none'));
            const t = start - leadBars;
            if (drop && t >= 0) { stampBars[Math.floor(t)] = 1; seams.push(start); }
          }
          start += sec.bars;
        });
        if (seams.length) {
          const frac = Math.round((1 - (leadBars - Math.floor(leadBars))) * 10000) / 10000; // bar-local onset inside the stamp bar
          const g = Math.round(0.85 * (PRESENCE_GAIN[presence] ?? 0.7) * 100) / 100;
          const stamp = `s("vc_cym_cresc:0").gain(${g}).mask("<${maskString(stampBars)}>").late(${frac})`;
          drums = `stack(${drums}, ${stamp})`;
          drumInfo.push(`seam crash (r35): vc_cym_cresc:0 peaking on the downbeat of bar${seams.length > 1 ? 's' : ''} ${seams.join(', ')} (starts ${CRASH_PEAK_S}s = ${leadBars.toFixed(2)} bars early)`);
        }
      }
    }
  }

  // ---- r32 · THE DRUMS ARE CAPPED RELATIVE TO THE LEAD, not by a number ----
  //
  // His cards this round: "also the drums a bit too loud" and "stick hit also
  // too loud". Measured on the page he judged, `_drums` peaked at 0.85 with a
  // MEAN of 0.90x the lead's gain and ran LOUDER than the lead on two songs.
  // `PRESENCE_GAIN` is absolute (light 0.5 / driving 0.7 / foreground 0.85) and
  // never consults the tune — the same defect r29/D119 found twice already, in
  // the texture band and in gainFor: "check the RATIO, never the number".
  // CLAUDE.md's own drum law is relative too ("melody outranks drums").
  //
  // 0.72 rather than 1.0 because a kit reads louder than its peak sample gain
  // (many onsets, broadband), and because "a bit too loud" asks for a trim, not
  // a duck. Applied where the kit is ASSEMBLED so the solo carries it as well —
  // a mix-only trim would have made every probe of `_drums` lie (the
  // measure-in-the-mix rule cuts both ways).
  if (drums && r32()) {
    // r33 — the r32 trim FIRED on his "percussion too loud" cards and was still
    // defeated twice, both measured: (a) the section-energy curve multiplies
    // the whole group AFTER this cap (x1.05 in late sections), so the capped
    // kit's realized peak exceeded the cap on every accent-1.0 hit
    // (industrial_mission: metal at 0.756 = 1.05 x cap, the loudest drum in the
    // kit at 0.93x the lead); and (b) the cap compared the kit's PEAK to the
    // lead's NOMINAL gain, but the lead realizes its accent envelope's MEAN —
    // measured 0.73-0.86 of nominal — so a "capped" kit still ran 0.86-0.93x
    // the tune he actually hears (cross_casual_task: kick 0.862x, clap 0.815x
    // of the solo-matched lead mean 0.357). The r33 form caps against the
    // lead's REALIZED mean and divides out the curve's own maximum.
    // r33 verify: boundMeta.gains overstated the realized envelope by ~12%
    // (0.96-0.99 claimed vs 0.86-0.88 measured per-instant) — the mean now
    // comes from the EMITTED envelope, duration-weighted.
    let envMean = 1;
    {
      const envStr = (/\.gain\("<([^>]+)>"\)/.exec(leadBound.expr) ?? [])[1];
      if (envStr) {
        let sum = 0; let w = 0;
        for (const m of envStr.matchAll(/([\d.]+)(?:@([\d.]+))?/g)) {
          const g = Number(m[1]); const dur = Number(m[2] ?? 1);
          if (Number.isFinite(g) && Number.isFinite(dur)) { sum += g * dur; w += dur; }
        }
        if (w > 0) envMean = sum / w;
      } else {
        const envGains = (leadBound.boundMeta?.gains ?? []).filter((x) => Number.isFinite(x));
        if (envGains.length) envMean = envGains.reduce((a, b) => a + b, 0) / envGains.length;
      }
    }
    const secMax = Math.max(...secMul, 1);
    // r33 verify, second pass: the lead's DYNAMIC ARC (leadDynOn) multiplies
    // the melody again after the accent envelope — a cap that ignores it runs
    // the kit at the arc's peak against the lead's arc-mean (measured 1.01x on
    // vs_excited_fight). Folded in the same way as the envelope.
    const arcMean = leadDynOn
      ? LEAD_ARC.reduce((a, b) => a + b, 0) / LEAD_ARC.length * leadDynMul : 1;
    const leadRealized = r33() ? leadGain * Math.min(1, envMean) * Math.min(1, arcMean) : leadGain;
    const cap = Math.round((0.72 * leadRealized) / (r33() ? secMax : 1) * 1000) / 1000;
    const peak = Math.max(...[...String(drums).matchAll(/gain\("([^"]+)"\)/g)]
      .flatMap((m) => m[1].split(/\s+/).map(Number)).filter((x) => Number.isFinite(x)), 0);
    if (peak > cap && peak > 0) {
      const mul = Math.round((cap / peak) * 1000) / 1000;
      drums = `(${drums}).mul(gain(${mul}))`;
      extraInfo.push(`drum trim (${r33() ? 'r33: vs the lead’s REALIZED mean, curve max divided out' : 'r32'}): x${mul} — the kit peaked at ${peak} against a lead of `
        + `${r33() ? leadRealized.toFixed(3) + ' realized (' + leadGain + ' nominal)' : leadGain}, i.e. ${(peak / leadGain).toFixed(2)}x the tune. His "the drums a bit too loud" `
        + '/ "stick hit also too loud" / "percussion too loud" (x2, r33). PRESENCE_GAIN is an absolute number that never looked at the '
        + 'lead (the same shape as the two absolute caps r29/D119 had to make relative)');
    }
  }

  // ---- D65 add-ons (his fight note) ----------------------------------------
  // "try layering even more chord tone types (middle octave ish) such as the
  // offbeat foundation one" → a second ratified figuration, mid-register, in
  // the form's busy sections; "more harmony melodies (hold notes that act as
  // a melody itself that supports the main melody)" → a guide-tone line: the
  // sounding chord's own third, one held note per bar, voice-led by the
  // binder's nearest-root walk, wherever the tune plays.
  const extraParts = [];
  const extraSolos = {};
  // D82 (teaching the planner): TRANSITIONS — a support layer's entrances
  // ramp and exits taper (first bar of a run x0.75, last x0.85, runs >= 3
  // bars), the generator's version of the lab's crossfade grammar.
  const rampMul = (bars) => {
    const m = bars.map(() => 1);
    let i = 0;
    while (i < bars.length) {
      if (!bars[i]) { i++; continue; }
      let j = i;
      while (j < bars.length && bars[j]) j++;
      if (j - i >= 3) { m[i] = 0.75; m[j - 1] = 0.85; }
      i = j;
    }
    return m.some((x) => x !== 1) ? `.mul(gain("<${m.join(' ')}>"))` : '';
  };
  // D85 addendum: every (bindFn, bars) fed to varySplit is also recorded —
  // the dropIntro block rebuilds the mix from scratch on the 4+T timeline
  // and was silently DROPPING the extras (verify pass: festival's cast
  // declared sparkle+counterline its mix never played).
  const extraRecs = [];
  const varySplit = (bindFn, bars) => {
    extraRecs.push([bindFn, bars]);
    const pieces = [];
    const out = bars.map((x, i) => (x && !(ctxBarV && varyBars[i]) ? 1 : 0));
    if (out.some(Boolean)) pieces.push(`${bindFn(ctxBar)}.mask("<${maskString(out)}>")${rampMul(out)}`);
    if (ctxBarV) {
      const inn = bars.map((x, i) => (x && varyBars[i] ? 1 : 0));
      if (inn.some(Boolean)) pieces.push(`${bindFn(ctxBarV)}.mask("<${maskString(inn)}>")`);
    }
    return pieces;
  };
  // D86 (his round-9 fight/boss notes: "the texture isn't fully sounding ...
  // add more textures since it's meant to be textured and energetic"):
  // energetic non-piano-vibe songs carry a DEFAULT texture beside any opted
  // one (fight ends with two, distinct classes), the band is AUDIBLE now
  // (0.3-0.52 — the old 0.22-0.42 kalimba vanished under the mix), coverage
  // widens to energy>=3 bars (was >=4), and the voices are synths: kalimba
  // pluck first, low-passed supersaw stabs second.
  {
    const texSpecs = [];
    // r29: one gate for the whole texture rotation — class AND voice.
    const texVary = r29() && opts.textureVary === true && !laneSerious;
    if (opts.texture) texSpecs.push(opts.texture);
    // r32: a reel-faithful card takes its texture from the reel or not at all
    // (opts.textureOff, set by opts.reelFaithful). D86's default exists to
    // thicken an ENGINE arrangement; a transcribed stack is not one.
    if (!opts.textureOff && ((energetic && !pianoVibe) || opts.fullSynth)) {
      // second/default texture stays a COMPACT class (offbeat chords) — the
      // first cut used 'arp' and fnd_ballad_8ths_arch arched to Eb6, ten
      // semis over fight's lead peak (the verify blocker)
      //
      // r19/D100: except in a serious lane, whose vocabulary has no 'offbeat'
      // in it. r18 put the class whitelist on the acc pool and the travel
      // edges and MISSED this path, so all three catacombs songs bound
      // fnd_offbeat_chords as a texture anyway — and his ear caught it twice
      // ("the piano on the offbeat (the & of every beat) makes it sound less
      // serious", "the off beat piano is too major to be not playful"). Block
      // chords are the compact stab the whitelist does permit.
      // ---- r29 · THE TEXTURE WAS THE SAME FIGURE ON THE SAME VOICE EVERY TIME
      // HIS WORDS, on ls_iii_vi_v_nostalgic: "the offbeat strum synth thing (the
      // one that does like one every other beat) has been used in every song so
      // far". MEASURED, and he is understating it: `fnd_offbeat_chords` on
      // `gm_kalimba` is 14 of 14 on the r28 page, 3 of 3 on the r27 page and 13
      // of 22 on the judged suite — 30 of 39 songs carrying a texture play the
      // identical figure on the identical instrument.
      //
      // The cause is two lines, and the older of them says so out loud: the class
      // is FIXED to 'offbeat', and the comment above notes "offbeat has ONE
      // ratified 4/4 entry". A pool of one makes `fnv(...) % tPool.length` a
      // no-op, so the hash rotation that exists everywhere else in this file
      // cannot do anything here. `texSounds[ti % texSounds.length]` is the same
      // shape: the first texture is always index 0.
      //
      // The fix is a rotation over a PERMITTED SET of compact chordal-stab
      // classes — enumerating what is allowed rather than blacklisting what is
      // not, which is the rule this project has had to relearn five times
      // (D99/D100/D102). `riff` stays out of the rotation and remains only in the
      // fall-through: `fnd_boogie_shuffle` is its one entry and he has rejected
      // it by name ("boogie shuffle on catacombs?").
      const TEX_CLASSES = ['offbeat', 'comp', 'block', 'broken_octave'];
      texSpecs.push({
        class: laneSerious ? 'block'
          : texVary ? TEX_CLASSES[fnv(`${name}|texclass`) % TEX_CLASSES.length] : 'offbeat',
        octave: 3,
      });
    }
    // r14 lane law: horror textures stab on orchestral voices (pizzicato,
    // harpsichord), not the kalimba/supersaw chip pair; jungle keeps the
    // kalimba (it IS the lane voice), desert takes the marimba side.
    const texSounds = !priorKeep && laneHorror ? ['gm_pizzicato_strings', 'gm_harpsichord']
      : !priorKeep && env === 'desert' ? ['gm_marimba', 'gm_kalimba']
        : texVary ? ['gm_kalimba', 'supersaw', 'gm_pad_metallic']
        : ['gm_kalimba', 'supersaw'];
    const usedT = new Set();
    texSpecs.forEach((spec, ti) => {
      // compact-class chain: if the wanted class is exhausted (offbeat has
      // ONE ratified 4/4 entry and fight's opt already took it), fall
      // through to the next chordal-stab class rather than dropping the
      // texture — his "add more textures" note
      let tPool = [];
      // the fall-through chain is lane-aware too: 'comp' and 'riff' are not in
      // a serious lane's vocabulary either, so an exhausted class must not
      // escape into them (the same leak, one step further down)
      const chain = laneSerious ? [spec.class, 'block', 'sustain', 'pulse'] : [spec.class, 'comp', 'block', 'riff'];
      for (const cls of chain) {
        tPool = RATIFIED_FND.filter(([n, f]) => f.class === cls && f.meter_class === v.meter && n !== accName && !usedT.has(n)
          && (priorKeep || laneFndOk(n, f)));
        // r29: THE METRONOME TEST REACHES THE TEXTURE TOO (D102). Opening the
        // class rotation immediately made `broken_octave` reachable, and its
        // `fnd_octave_bounce_16ths` is 16 onsets a bar — over the 12/bar
        // gear-change clause, which is the exact rule that exists because
        // `fnd_power_fifth_8ths` bound the jungle marimba for sixteen bars.
        // Applied the moment the option set widened, per D100's own lesson:
        // "after fixing any list-based rule, immediately measure what the newly
        // reachable options are."
        if (texVary) {
          const calm = tPool.filter(([, f]) => {
            const perBar = (f.onsets?.length ?? 0) / (f.bars ?? 1);
            const shapes = new Set((f.figure ?? []).map(String)).size;
            return !((perBar >= 6 && shapes <= 1) || perBar >= 12);
          });
          if (calm.length) tPool = calm;
        }
        if (tPool.length) { spec = { ...spec, class: cls }; break; }
      }
      if (!tPool.length) return;
      const [tName, tFig0] = tPool[fnv(`${name}|texture${ti ? ti + 1 : ''}`) % tPool.length];
      usedT.add(tName);
      const tFig = { ...tFig0, name: tName };
      // r14: a horror texture never falls back to the piano stab — the lane
      // voices carry it at any tempo (somber_citadel's pizzicato arps)
      // the VOICE rotates for the same reason the class does — `ti % length` gave
      // index 0 to every first texture, i.e. gm_kalimba on all 30 of them.
      const texPick = texVary
        ? (ti + fnv(`${name}|texsound`)) % texSounds.length
        : ti % texSounds.length;
      const tSound = (!priorKeep && laneHorror) || synthAcc || v.bpm >= 120 ? texSounds[texPick] : 'piano';
      const tFx = tSound === 'supersaw' ? '.lpf(2600).room(0.25).clip(0.5)' : accFx;
      // octave capped at 3: at 4 the chord tokens' tops poked ABOVE the
      // leads (verify pass: kalimba Ab5-D6 vs lead peaks F5-C6 on three
      // songs) — support tops sit UNDER the melody (D77)
      // ---- r29 · D77 IS A RELATIVE LAW AND THIS BAND IS ABSOLUTE -------------
      // [0.3, 0.52] was set by D86 for ENERGETIC songs ("the old 0.22-0.42
      // kalimba vanished under the mix"), but the condition that reaches it is
      // `(energetic && !pianoVibe) || opts.fullSynth` — so every all-synth song
      // gets the energetic band whatever its energy.
      //
      // MEASURED on the page he just judged: the texture is 0.481 mean on ALL 14
      // songs and is LOUDER THAN THE LEAD on 11 of them. All four of his "too
      // loud" cards are in that 11 — "the melody synth is a bit too loud", "the
      // synth sometimes is a bit too loud", "the main synth is sometimes too
      // loud", "the high synth is way too loud". The three songs where it sits
      // under the lead (0.57x, 0.67x) drew no loudness note at all.
      //
      // CLAUDE.md already carries the correction this needs: the absolute number
      // in the taste canon was wrong and "the law that actually holds is
      // RELATIVE: support stays under the lead (D77)". So the band's ceiling is
      // capped at three quarters of the lead's gain. On a lead at 0.85 that is
      // 0.64 and nothing changes; on a lead at 0.47 it is 0.35, which is where
      // every complaint came from. The cap bites exactly where he complained.
      const texCap = (r29() && opts.supportUnderLead === true)
        ? Math.min(0.52, Math.round(0.75 * leadGain * 100) / 100) : 0.52;
      const texBand = [Math.min(0.3, Math.round(texCap * 0.58 * 100) / 100), texCap];
      const bindT = (ctx, salt = 0) => bindFigure(salt ? varyFig(tFig, salt) : tFig, ctx, v.meter, { sound: tSound, loopRoots: true, gainRange: texBand, fx: tFx, octave: Math.min(spec.octave, 3) }).expr;
      const tBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
      if (tBars.some(Boolean)) {
        // r19/D100 — THE TEXTURE NOW VARIES ACROSS THE FORM. His words: "the
        // repeating chord in the marimba or whatever in these songs sound too
        // static and robotic because it's literally just a chord repeating
        // basically with no unique pattern or anything or varying as it
        // progresses throughout". Measured on scary_catacombs: fnd_block_quarters
        // at 672 attacks over 56 bars — a three-note chord on every quarter of
        // every bar, one bound expression for the whole song.
        //
        // THIS IS MY OWN FIX FROM EARLIER THIS ROUND. He complained that the
        // serious lanes bound an OFFBEAT texture ("the piano on the offbeat ...
        // makes it sound less serious"), so I moved them to `block` — and a
        // block figure with no variation is a metronome. The accompaniment has
        // had the D97 per-statement composite since r16; the texture never got
        // it. Same salt machinery, one layer over.
        if (laneSerious && accVaryOn) {
          let at = 0;
          form.sections.forEach((sec, si) => {
            const m = tBars.map((x, b) => (x && b >= at && b < at + sec.bars ? 1 : 0));
            at += sec.bars;
            if (m.some(Boolean)) extraParts.push(...varySplit((ctx) => bindT(ctx, effStmt(tFig, si)), m));
          });
        } else extraParts.push(...varySplit(bindT, tBars));
        extraSolos[ti ? `_texture${ti + 1}` : '_texture'] = bindT(ctxBar);
        // the gain clause appears ONLY when the cap bites, so a song whose
        // texture did not change prints the same cast line it always did. The
        // first cut printed the band unconditionally and diffed the `cast` field
        // on 22 of the 47 judged songs for no musical reason — a text-only diff
        // is still a diff, and it hides the real ones.
        extraInfo.push(`texture ${tName} (${spec.class}, oct ${Math.min(spec.octave, 3)}, ${tSound})`
          + `${texCap < 0.52 ? ` \u2014 gain ${texBand[0]}-${texBand[1]}, capped under the lead's ${leadGain} (r29/D77: measured 0.481 on all 14 r28 songs and LOUDER than the lead on 11, which is where all four of his "too loud" cards sit)` : ''}`);
      }
    });
  }
  // D73 ("also for appropriate songs i want to try a deep bass like in
  // beats. does strudel have a sound for that?" — yes: the pure sine at
  // octave 1 IS the beats sub, the same physics as an 808's body): on fast
  // beat-forward songs a sub-bass holds the chord root at octave 1, masked
  // to the same bars the beat plays, so bass and beat arrive as one floor.
  // Policy, not a song patch: any driving/foreground drum song >= 140bpm.
  // r23: the battle pedal REPLACES the sub-bass rather than stacking with it —
  // "one low voice at a time" is the project's own law, and two synth basses at
  // octave 2 is how the register collision the verify pass keeps finding gets
  // made. `accToBass` songs already give the low end to the acc hand, so the
  // pedal stands down there too.
  const wantsDriveBass = (opts.driveBass === true || (opts.driveBass !== false && battleRole))
    && r23Fresh && !accToBass && drumBarsShared;

  // ---- r27 · FUNK BOUNCE — ALREADY IN THE ENGINE, do not add a second -------
  // HIS ASK this round: "in terms of synths, i liked layer stack and funk bounce
  // a lot ... all from videolabs.html". I wrote a fresh implementation of the
  // bounce here and then measured the page: cp_komuro_triumphant was playing 64
  // slap-bass notes on a row that had asked for NO devices. The reason is that
  // the device ALREADY EXISTS, further down this file as `opts.funkBass`, with
  // byte-identical parameters — onsets ['0','3/8','1/2','7/8'], figure
  // ['R','R+','5','R+'], accents [0.95,0.7,0.8,0.75], octave 2, gm_slap_bass_2,
  // gain [0.55,0.9], .clip(0.6) — and it is default-ON for any non-serious lane
  // in 4/4 between 96 and 140bpm with driving-or-foreground drums.
  //
  // So the thing he says he likes is already shipping, and the duplicate is
  // deleted rather than kept: two implementations of one device drift, and the
  // second one would have been the one nobody maintained. `opts.bassLine` widens
  // the tempo window to 165 and relaxes the percussion-presence gate; that is
  // the knob to reach for, not a new device.
  //
  // The pre-existing gate also already satisfies his "should not affect the niche
  // genres" ruling: `!laneSerious` excludes desert, jungle and the horror lanes.

  if (synthAcc && !accToBass) extraInfo.push('acc hand on gm_epiano1 (synth spread \u2014 his round-9 rule)');
  if (accToBass) {
    extraInfo.push('bass pulse: acc roots on gm_synth_bass_1 (the piano low part IS the bass — his fight note)');
  } else if (opts.subBass !== false && !wantsDriveBass && drumBarsShared && v.bpm >= 140 && ['driving', 'foreground'].includes(v.percussion.presence)) {
    // D73 (+addendum 2): where the acc is NOT a root pulse the bass can
    // take over (boss's 16th octave-bounce stays piano), the sub instead
    // HOLDS the bar root under the beat — on gm_synth_bass_1, not bare
    // sine, and at octave 2: "i can't hear it" killed the pure sine.
    // D88 (the praised songs' bar-4 grammar): unkept/future songs' sub
    // holds three bars then drops an octave on bar 4's back half — the
    // turnaround event every lab bass has. Kept songs keep the flat hold.
    const subHold = priorKeep
      ? { name: 'sub-bass', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.8], legato: true }
      : { name: 'sub-bass', bars: 4, onsets: ['0/1', '1/1', '2/1', '3/1'], figure: ['R', 'R', 'R', 'R'], accents: [0.8, 0.75, 0.75, 0.7], legato: true };
    const subDrop = { name: 'sub-drop', bars: 4, onsets: ['7/2'], figure: ['R'], accents: [0.82], legato: true };
    const bindSub = (ctx) => {
      const hold = bindFigure(subHold, ctx, v.meter, { octave: 2, sound: 'gm_synth_bass_1', loopRoots: true, gainRange: [0.6, 0.9], fx: '.clip(1.02)' }).expr;
      if (priorKeep) return hold;
      // the bar-4 turnaround: the root restated an octave DOWN on the back
      // half of every 4th bar (the lab basses' grammar)
      const drop = bindFigure(subDrop, ctx, v.meter, { octave: 1, sound: 'gm_synth_bass_1', loopRoots: true, gainRange: [0.62, 0.85], fx: '.clip(1.02)' }).expr;
      return `stack(${hold}, ${drop})`;
    };
    extraParts.push(...varySplit(bindSub, drumBarsShared));
    extraSolos._sub_bass = bindSub(ctxBar);
    extraInfo.push('sub-bass: gm_synth_bass_1 held roots (oct 2) under the beat');
  }
  // ---- r23 · THE BATTLE BASS IS A PEDAL, NOT A WALK -----------------------
  // His ask: "for the boss fights learn what makes them actually feel energetic
  // with stakes on the line and epic through their layering patterns and what
  // they do in each instrument and rhythm and intervals."
  //
  // The cleanest single answer the measurement gave. Over 13 battle files vs 43
  // others from his own hand-picked set (research/boss-r23.md):
  //   repeated-note rate   62.2%  vs  36.8%     <- the mechanism
  //   stepwise rate        19.8%  vs  31.5%
  //   onsets/bar            5.38  vs   6.71     <- FEWER notes, not more
  //   grid                 x.x.x.x.x.x.x.x.  in 6 of 10 battle basses
  //   longest identical-pitch run   13 to 144 notes
  // So the battle bass is not busier and it is not more mobile — it is the SAME
  // note hammered in straight 8ths. It drives by repetition. Every low voice
  // this engine writes either walks (`accToBass` roots) or holds (`sub-bass`),
  // and neither of those is this shape; measured on the r23 page before the
  // fix, the battle songs' low voice repeated 31.6% of the time.
  //
  // Written as a pedal on the CHORD root (`loopRoots`), so a bar of one chord
  // is eight strikes of one pitch — which is exactly what produces the measured
  // rate — and the root still tracks the progression, which the reference files
  // do too (bass ranges of 14-19 semitones on most of them; only soabattlev12
  // pedals a single pitch for its whole core window).
  //
  // D88's turnaround law is honoured: the pedal DROPS an octave on the last 8th
  // of every 4th bar. Lifting there put a synth bass on G4 once already.
  if (wantsDriveBass) {
    const pedalFig = {
      name: 'battle-pedal', bars: 1, grid: 16, legato: false,
      onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
      figure: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
      accents: [0.95, 0.6, 0.72, 0.6, 0.9, 0.6, 0.72, 0.62],
    };
    const turnFig = { name: 'battle-pedal-turn', bars: 4, onsets: ['31/8'], figure: ['R'], accents: [0.8], legato: false };
    const bindDrive = (ctx) => {
      const ped = bindFigure(pedalFig, ctx, v.meter, {
        octave: 2, sound: 'gm_synth_bass_1', loopRoots: true,
        gainRange: [0.55, 0.85], fx: '.clip(0.62)', rhythmName: 'battle-pedal',
      }).expr;
      const turn = bindFigure(turnFig, ctx, v.meter, {
        octave: 1, sound: 'gm_synth_bass_1', loopRoots: true,
        gainRange: [0.6, 0.82], fx: '.clip(0.9)', rhythmName: 'battle-pedal-turn',
      }).expr;
      return `stack(${ped}, ${turn})`;
    };
    // it runs where the beat runs — bass and kit arrive as one floor
    const dbBars = drumBarsShared ?? form.sections.flatMap((sec) =>
      Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    if (dbBars.some(Boolean)) {
      extraParts.push(...varySplit(bindDrive, dbBars));
      extraSolos._battle_bass = bindDrive(ctxBar);
      extraInfo.push('battle bass: repeated-root pedal in straight 8ths on gm_synth_bass_1 (oct 2), octave drop on the bar-4 turn (r23 \u2014 battle basses repeat 62.2% of their notes vs 36.8%)');
    }
  }
  // D85 (his round-8 ask: "more creative layering ... more supporting
  // melodies in the harmony (like the videos)"): the counterline is now a
  // GENERATOR DEFAULT, and it moves the way the batch-3 builds move — odd
  // bars hold the chord's third (the D65 guide-tone), even bars enter on
  // beat 2 and climb 3→5→root-up in quarters (the videos' counter always
  // enters in the gap after the downbeat and arches up). Whisper band
  // stands (strings were "too loud" four rounds running). Voice: the Juno
  // synth strings on songs that already carry synth low voices, the real
  // ensemble elsewhere. opts.counterline: false opts out.
  // D91 (casino: "there's also not any supportive counter melody for the
  // first melody part") — opts.counterline: true FORCES it past the dial
  // r19/D100 — NO HEROIC STRINGS IN THE CRYPT. His words: "whenever you added
  // the strings, it just makes it much less scary - it sounds like heroic
  // strings. it should be ambiance. same for tense catacombs - heroic strings.
  // and scary catacombs." And the second half of the same note names the
  // mechanism better than I could: "the random synth playing doesnt sound scary
  // and it's a bit too loud - in scary catacombs it literally sounds like a 5th
  // 3rd root - that's literally major". The counterline's own cast line reads
  // "held 3rd / beat-2 climb R-3-5 alternating" — it IS a root-third-fifth
  // arpeggio, on gm_synth_strings_1, and with the descant beside it on the same
  // voice at the same quarters that is a steady consonant string chord: the
  // sound of heroism, in the ambience lane.
  const laneStringsOff = !priorKeep && !opts.grammarPin && env === 'catacombs';
  if (!laneStringsOff && (opts.counterline === true || (opts.counterline !== false && v.ensemble.count >= 3))) {
    const clHold = { name: 'counterline', bars: 1, onsets: ['0'], figure: ['3'], accents: [0.72], legato: true };
    // verify pass (D85 addendum): the first cut climbed 3-5-R+ and its R+
    // peak (midi 84-86) poked ABOVE the lead on the four songs whose lead
    // dips into octave 4 — support tops sit UNDER the melody (D77). R-3-5
    // still arches up but tops at the fifth, inside the held-3rd band.
    const clClimb = {
      name: 'counterclimb', bars: 1, onsets: ['1/4', '2/4', '3/4'],
      figure: ['R', '3', '5'], accents: [0.6, 0.66, 0.72], legato: true,
    };
    const clSound = (opts.fullSynth || synthAcc || (drumBarsShared && v.bpm >= 140)) ? 'gm_synth_strings_1' : 'gm_string_ensemble_1';
    // r14: when a RANGE-CAPPED lead walks at octave 4, the counterline
    // steps to 3 — support tops stay UNDER the lead (D77). Keyed on the
    // cap itself, never on the octave value (two kept songs' vibes sit at
    // leadOctave 4 natively and must not move).
    const clOpts = { octave: leadRangeCapped ? 3 : 4, sound: clSound, loopRoots: true, gainRange: [0.12, 0.24], fx: '.room(0.45)', rhythmName: 'counterline' };
    const bindCl = (ctx) => snapSupport(bindFigure(clHold, ctx, v.meter, clOpts).expr, barSyms);
    const bindClimb = (ctx) => snapSupport(bindFigure(clClimb, ctx, v.meter, clOpts).expr, barSyms);
    const clBars = form.sections.flatMap((sec) => Array(sec.bars).fill(sec.lead !== 'none' ? 1 : 0));
    if (clBars.some(Boolean)) {
      const odd = clBars.map((x, i) => (x && i % 2 === 0 ? 1 : 0));
      const even = clBars.map((x, i) => (x && i % 2 === 1 ? 1 : 0));
      if (odd.some(Boolean)) extraParts.push(...varySplit(bindCl, odd));
      if (even.some(Boolean)) extraParts.push(...varySplit(bindClimb, even));
      extraSolos._counterline = `stack(${bindCl(ctxBar)}.mask("<1 0>"), ${bindClimb(ctxBar)}.mask("<0 1>"))`;
      extraInfo.push(`counterline: held 3rd / beat-2 climb R-3-5 alternating (${clSound}, oct 4)`);
    }
  }

  // ---- r33 · AMBIENT SWELL (his ask, verbatim on rl_cross_casual_task_active:
  // "there should be some ambiance added over time (in safe notes) though like
  // ambient strings or something. this should be abstracted to other songs
  // too.") — a held root+fifth string wash, whisper band, absent for the
  // opening bars and FADING in over four (his standing "strings should always
  // FADE in ... not just cut in and spawn in"). "Safe notes" is why the figure
  // is R.5 only: no 3rd, no color, nothing the harmony can contradict. The
  // band tops at 0.15 — under the counterline's 0.162, which CLAUDE.md sets as
  // the ceiling for any NEW support texture. Opt-in per page/song
  // (opts.ambientSwell); the reels pages default it on.
  if (opts.ambientSwell === true && r33()) {
    const swFig = { name: 'ambient_swell', bars: 1, onsets: ['0'], figure: ['R.5'], accents: [0.5], legato: true };
    const swSound = (opts.fullSynth || synthAcc) ? 'gm_synth_strings_1' : 'gm_string_ensemble_1';
    const bindSw = (ctx) => snapSupport(bindFigure(swFig, ctx, v.meter, {
      octave: 3, sound: swSound, loopRoots: true, gainRange: [0.08, 0.15], fx: '.room(0.6)', rhythmName: 'ambient_swell',
    }).expr, barSyms);
    // r33 verify: the first cut used entry bar 8 + a 4-bar fade on every card
    // — "identical envelope, gain, and entry on all 15" is the r32 breakdown
    // lesson (a device on every card at one setting is what he hears as "in
    // every song"). Entry and fade length now rotate per song.
    const swSalt = fnv(`${name}|swell`);
    const swStart = form.totalBars >= 16 ? [6, 8, 10][swSalt % 3] : 4;
    const swFade = 3 + (swSalt >> 2) % 3; // 3-5 bars
    if (form.totalBars > swStart + swFade + 1) {
      const swMask = Array.from({ length: form.totalBars }, (_, i) => (i < swStart ? 0 : 1)).join(' ');
      const swEnv = Array.from({ length: form.totalBars }, (_, i) => (i < swStart ? 0
        : i >= swStart + swFade ? 1
        : Math.round((0.25 + 0.75 * ((i - swStart) / swFade)) * 100) / 100)).join(' ');
      extraParts.push(`(${bindSw(ctxBar)}).mask("<${swMask}>").mul(gain("<${swEnv}>"))`);
      extraSolos.ambient_swell = bindSw(ctxBar);
      extraInfo.push(`ambient swell (r33, HIS ASK): ${swSound} holds R+5 from bar ${swStart}, fading in over ${swFade} bars `
        + 'and staying under the counterline ceiling — "some ambiance added over time (in safe notes) ... '
        + 'like ambient strings", abstracted to any song via opts.ambientSwell');
    }
  }
  // D91 (training: "it doesn't sound 'excited' enough ... some staccato
  // strings/synths with their own sub harmony should be added here to make
  // it more exciting ... with their own melody (and accents)"): the MARCATO
  // layer — staccato strings with their own melodic line and accents,
  // riding the busy sections BESIDE the sustained ambience (his "of course
  // not all" — counterline/descant stay legato). opts.marcato forces;
  // default only on history-less energetic songs (nothing he has judged or
  // noted re-rolls under a new device).
  const marcatoOn = (opts.marcato ?? (energetic && !priorKeep && historyLess()))
    && rubOk('marcato');
  if (marcatoOn) {
    // r14 REWRITE (his law, verbatim: "the stacco string shouldnt just be
    // violin and shouldnt just be complimenting the melody. its mainly
    // harmony, doing its own subharmony or just a rhymic repeat (where it
    // repeats a note for a duration in a specific rhythm actively) and
    // should be multiple notes per hit not just one note typically"; the
    // excited_fight note heard the old walked line as "just accenting the
    // melody on specific notes"): the marcato is no longer a melody walk —
    // it is a CHORDAL OSTINATO in its own consistent rhythm. Two shapes by
    // seed: the subharmony walk (dyad hits whose top voice moves 3→5→6) and
    // the rhythmic repeat (one dyad hammered on the 3+3+2 trailer grid).
    // ---- r22: HIS SUPPORT FIGURES (opts.supportFigure) --------------------
    // Verbatim: "for actual patterns, other than alternate melody, there can
    // also just be support in some instruments too. like in battle themes the
    // violins can go root third fifth or root fifth 8th repeatedly 8th note
    // style or root third fifth third root third fifth or etc. all sorts of
    // different combinations to support it, whether with piano or synth or
    // strings to make it sound more 'action' and 'high stakes'."
    //
    // This is D94's device — the staccato string ostinato — with the figures
    // stated explicitly rather than a new layer, which is the correction the
    // other session made and it is right. Three shapes, straight from his three
    // examples, driven in 8ths because that is the "8th note style" he names.
    //
    // GATED, and it has to be: these are extra entries in a hash-picked pool,
    // so letting them into the default `% 2` would re-roll the marcato shape on
    // every unkept song that already has one (D95's law — pool growth moves
    // `fnv % pool.length` everywhere).
    //
    // NOTE the tension with D94, which says the marcato is "multiple notes per
    // hit not just one note typically". These figures are single tones by his
    // own description. Both are his words, five rounds apart; the chordal
    // shapes below are untouched and this is an alternative, not a replacement.
    const SUPPORT_FIGS = [
      {
        name: 'support-R35', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
        figure: ['R', '3', '5', 'R', '3', '5', 'R', '3'],
        accents: [0.9, 0.55, 0.62, 0.85, 0.55, 0.62, 0.8, 0.55],
      },
      {
        name: 'support-R5oct', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
        figure: ['R', '5', 'R+', '5', 'R', '5', 'R+', '5'],
        accents: [0.92, 0.55, 0.7, 0.55, 0.88, 0.55, 0.7, 0.55],
      },
      {
        name: 'support-R353', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
        figure: ['R', '3', '5', '3', 'R', '3', '5', '3'],
        accents: [0.9, 0.55, 0.72, 0.55, 0.85, 0.55, 0.7, 0.55],
      },
      // ---- r23, MEASURED, AND IT DIVERGES FROM HIS SENTENCE ---------------
      // The three shapes above are his words transcribed. The measurement over
      // his own battle files says something he did not say: the single most
      // common thing a battle support layer does is HAMMER ONE PITCH.
      // Pure-repeat bar shapes are 34.2% of battle support bars against 7.0%
      // of non-battle — a 4.9x gap and the largest separation in the whole
      // r23 analysis. The modal shape is `0-0-0`: THREE onsets, all the same
      // pitch. Not eight, not a quarter pulse — three.
      //
      // Placed 3+3+2 (onsets 0, 3/8, 3/4) so the repetition drives instead of
      // marking time, and on the FIFTH rather than the root, because the r23
      // battle bass below is already a repeated-root pedal and doubling it
      // would thicken the floor instead of adding a layer.
      //
      // ALL THREE TOKENS ARE THE SAME. The first write was `R 5 5` — "the
      // downbeat takes the root so the chord change stays audible" — and the
      // probe caught it: a bar of R-5-5 holds TWO pitches, so its pure-repeat
      // rate is 0% BY CONSTRUCTION and the figure could never reproduce the
      // thing it was built from. Measured 0.0% on all 10 songs carrying it.
      // The reference shape is literally one pitch per bar (`0-0-0` as
      // intervals from the bar's lowest note); `loopRoots` still moves it when
      // the chord moves, which is where the change comes from — the same
      // mechanism as the frozen slot, one layer down.
      {
        name: 'support-hammer', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '3/8', '3/4'],
        figure: ['5', '5', '5'],
        accents: [0.92, 0.78, 0.7],
      },
      // OPEN SONORITY. Battle harmony measured LESS third-y and MORE open:
      // octave/unison dyads 36.1% of all sounding pairs vs 28.3%, fifths 15.3%
      // vs 13.0%, thirds DOWN 15.5% vs 20.2%, and the bare power-fifth chord
      // quality 11.7% vs 4.9% (2.4x). Note what is NOT there: tritones 1.7% vs
      // 2.3%, semitones 1.0% vs 1.8%, dim 0.8% vs 1.5%. Battle music is LESS
      // dissonant than his other picks, not more — an engine reaching for
      // "stakes" by adding tension intervals would be reaching the wrong way.
      {
        name: 'support-open5', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
        figure: ['R.5', 'R.5', '5.R+', 'R.5', 'R.5', '5.R+', 'R.5', '5.R+'],
        accents: [0.92, 0.55, 0.72, 0.55, 0.88, 0.58, 0.7, 0.6],
      },
    ];
    const mcShape = fnv(`${name}|marcshape`) % 2;
    // r23: a battle/boss song takes one of the two MEASURED shapes (indices 3
    // and 4); every other song keeps the hash over his three stated ones, so
    // growing this pool 3 -> 5 cannot re-roll a song that is not a battle cue.
    // Pool growth is a retrieval re-roll vector (D95) and this is the gate.
    // Which of the two measured shapes a battle cue takes is decided by what
    // the LOW END is already doing, not by a coin flip. If the r23 pedal has
    // the bass hammering one root in 8ths, a hammered support on top of it is
    // two hammers and one idea; that song takes the OPEN shape instead. Where
    // the bass is doing something else, the support hammers.
    // (The first cut used `fnv % 2` and landed the hammer on 1 of 5 battle
    // songs — a thin roll for a page that exists to let his ear compare them.)
    const supIdx = (typeof opts.supportFigure === 'number') ? opts.supportFigure
      : (battleRole && r23Fresh) ? (wantsDriveBass ? 4 : 3)
      : fnv(`${name}|supfig`) % 3;
    // r23: on a battle/boss cue the support ostinato is the DEFAULT, not an
    // opt-in. It is the layer his note asked for by name ("in battle themes the
    // violins can go root third fifth ... to make it sound more 'action' and
    // 'high stakes'") and the layer the measurement found doing the most work.
    const useSupportFig = Boolean(opts.supportFigure) || (battleRole && r23Fresh && opts.supportFigure !== false);
    const mcFig = useSupportFig
      ? SUPPORT_FIGS[supIdx % SUPPORT_FIGS.length]
      : mcShape === 0
      ? {
        name: 'marcato-subharmony', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '1/4', '3/8', '1/2', '3/4', '7/8'],
        figure: ['R.3', '3.5', 'R.3', 'R.5', '3.6', 'R.5'],
        accents: [0.9, 0.6, 0.7, 0.85, 0.6, 0.72],
      }
      : {
        name: 'marcato-repeat', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '3/16', '3/8', '1/2', '11/16', '7/8'],
        figure: ['R.5', 'R.5', 'R.5', '3.5', '3.5', 'R.5'],
        accents: [0.9, 0.55, 0.72, 0.85, 0.55, 0.7],
      };
    const mcSound = (opts.fullSynth || synthAcc) ? 'gm_synth_strings_1' : 'gm_string_ensemble_1';
    // pocket seating (verify catch: an A-tonic marcato at octave 4 drifted
    // 60% of its haps above midi 76, topping F6)
    const bindMc = (ctx) => snapSupport(bindFigure(mcFig, ctx, v.meter, {
      octave: tonicPc >= 5 ? 3 : 4, sound: mcSound, loopRoots: true,
      gainRange: [0.22, 0.42], fx: '.clip(0.4).room(0.25)', rhythmName: 'marcato',
    }).expr, barSyms);
    const mcBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 4 ? 1 : 0));
    if (mcBars.some(Boolean)) {
      extraParts.push(...varySplit(bindMc, mcBars));
      extraSolos._marcato = bindMc(ctxBar);
      extraInfo.push(`marcato: staccato ${mcSound} ${useSupportFig ? `support ostinato ${mcFig.name} [${mcFig.figure.slice(0, 4).join('-')}] (r22/r23, his "root third fifth ... 8th note style")` : mcShape === 0 ? 'dyad subharmony (R.3-3.5-R.5-3.6 walk)' : 'dyad rhythmic repeat (3+3+2 grid)'} (oct 4, busy sections)`);
    }
  }
  // D87 ("i want you to see what you did and teach the engine" — the kept
  // vl_layerstack card): the ACCENT-LINE device — a STATIC tonic pedal in
  // 8ths whose bar-downbeat accent alone tracks the harmony (the chord
  // change carried by one note per bar). Default where a fullSynth song's
  // own accompaniment is sustained/pulsing, so the pedal complements
  // rather than doubles. opts.accentLine: false opts out.
  if (opts.accentLine !== false && opts.fullSynth && v.bpm >= 90 && ['sustain', 'pulse'].includes(accFig.class)) {
    const tonicCtx = { harmony: [barSyms[0]], barsPerChord: 1, key };
    const pedFig = { name: 'accent-pedal', bars: 1, onsets: ['1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8'], figure: ['R', '~2', 'R', '~2', 'R', '~2', 'R'], accents: [0.5, 0.45, 0.5, 0.45, 0.5, 0.45, 0.5], legato: false };
    const alFig = { name: 'accent-line', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.9], legato: false };
    const pedalExpr = bindFigure(pedFig, tonicCtx, v.meter, { sound: 'gm_kalimba', octave: 4, gainRange: [0.24, 0.4], fx: '.room(0.3).clip(0.7)' }).expr;
    const bindAL = (ctx) => `stack(${pedalExpr}, ${bindFigure(alFig, ctx, v.meter, { sound: 'gm_kalimba', octave: 4, loopRoots: true, gainRange: [0.32, 0.5], fx: '.room(0.3).clip(0.7)' }).expr})`;
    const alBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    if (alBars.some(Boolean)) {
      extraParts.push(...varySplit(bindAL, alBars));
      extraSolos._accent_line = bindAL(ctxBar);
      extraInfo.push('accent line: static tonic pedal 8ths + chord-tracking downbeat accents (gm_kalimba, oct 4)');
    }
  }
  // ======================================================================
  // r23 — THE REEL DEVICES, APPLIED BY MUSICAL APPLICABILITY
  // ======================================================================
  // His instruction this round: "lots of the techniques and intervals behind
  // his layering should own be applied to applicable genres. not specific ones
  // like jungle or desert or etc."
  //
  // So neither of these keys on `env`. They key on what the MUSIC is doing —
  // a pulse fast enough to carry an ostinato, and a section with a tune — which
  // is what makes them genre-general. Both are read off the face-cam production
  // reels (research/reel-layers-r22.md); both were `recorded` in
  // src/lib/techniques.js and are now wired.

  // ---- R2 · FREEZE THE BODY, MOVE ONE SLOT ------------------------------
  // 4 reels / 1 source. `DZS8`'s 4-note per-beat cell holds slots 3-4 fixed for
  // the entire loop, so the SAME frozen dyad reads 9+b3 over Em, then #11+5
  // over C, then 5+b6 over B. The chord moves underneath and re-colours a
  // pitch that never changed.
  //
  // This is the D101 distinction arriving from the reels: the engine varies by
  // SUBSTITUTION (pick a different note), and this varies by RE-HARMONISATION
  // (keep the note, change what it means). It produces the 9ths and 11ths above
  // the bass that D98 wants without ever choosing them.
  //
  // Implementation reuses the accent-line's proven shape: the frozen body binds
  // against a CONSTANT tonic context so its pitches cannot move, and one slot
  // binds against the real progression. Scale tokens only (`s2`/`s6`), never a
  // bare 4 or 7 — those consult neither key nor chord-scale (D97's measured
  // out-of-key bug).
  //
  // OPT-IN, and that is a measured decision rather than caution. Rolled by hash
  // on every unkept song it moved TEN of the judged page's 47 — including
  // scary_catacombs, tense_citadel and happy_jungle, i.e. three lanes whose own
  // law (D93/D94/D100) refuses exactly this kind of new ostinato. That is the
  // D100 failure shape arriving through a new door: a device that is right for
  // "applicable genres" is still wrong for a lane that pins its own texture.
  // It ships enabled on the r23 stress-test page and reaches the judged suite
  // when his ear says so.
  // TEMPO GATE CORRECTED, AND THE SOURCE REFUTED MY FIRST GUESS. I shipped
  // `bpm >= 90` on the assumption this is a pulse device. The six reels it comes
  // from run at 63, 69, 75, 80, 91 and 102 bpm — FOUR of them under 90. The
  // device is a held texture re-coloured by the harmony underneath, which is a
  // slow-music behaviour if anything. Measured cost of the wrong gate: 4 of the
  // 14 stress-test pairs came out byte-identical.
  let r28FzOct = null; let r28CpOct = null;   // r28/R4: the r23 devices' bands, so the allocator can avoid them
  if (opts.frozenSlot === true && r23Fresh && v.bpm >= 55 && rubOk('frozenSlot')) {
    const frozenCtx = { harmony: [barSyms[0]], barsPerChord: 1, key };
    // ---- r24 · THE FROZEN BODY IS A COMMON-TONE PEDAL, NOT A HELD GUESS ----
    // HIS RULING, and it is the sharpest line in the r23 export: "I feel like
    // with all the songs it feels like you do a dissonance pass and randomly add
    // dissonance at certain places which doesn't sound good." Eleven of his 28
    // cards mention dissonance.
    //
    // MEASURED, non-chord-tone rate per layer across the suite: frozen_slot
    // 45.2% on 25 of 28 songs — the most dissonant widely-cast layer in the
    // engine, against the lead at 26.9% and the companion at 27.4%. That is not
    // a bug in the device, it IS the device: "the frozen tones re-colour as the
    // harmony moves" means manufacturing a rub on every chord that does not
    // contain them, and it was running on nearly every song.
    //
    // The reel it came from shows one producer doing this deliberately once.
    // His ear says no, and his ear is the only quality signal here.
    //
    // The fix keeps the device and changes what gets frozen: hold the pitch
    // classes the PROGRESSION ITSELF holds in common. A common-tone pedal is
    // consonant against most of the loop and rubs only where the harmony
    // genuinely departs — which is the difference between a pedal and a
    // dissonance pass. Falls back to the old tonic-scale tones only if the
    // progression shares nothing, which cannot happen for a real loop.
    const fzCommon = (() => {
      const counts = new Map();
      const loop = barSyms.slice(0, Math.max(1, Math.min(barSyms.length, 8)));
      for (const sym of loop) {
        let tones = null;
        try { tones = chordCoreTones(sym); } catch { tones = null; }
        if (!tones) continue;
        for (const pc of [...tones]) counts.set(((pc % 12) + 12) % 12, (counts.get(((pc % 12) + 12) % 12) ?? 0) + 1);
      }
      // rank by how many of the loop's chords contain the pitch class
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([pc]) => pc);
    })();
    // ---- r26 · A COMMON TONE IS ONLY COMMON IF IT IS ACTUALLY COMMON --------
    // r24 replaced the frozen body's fixed guess with "the pitch classes the
    // PROGRESSION holds in common", ranked by how many chords contain them. It
    // then took the top TWO whatever their coverage, and on a loop that shares
    // nothing the second pick can be in a minority of the chords. Measured over
    // the 25 suite songs carrying the device: the held tones are foreign to 27%
    // of the loop on average, and the second pick alone covers as little as 50%.
    // It sounds four times a bar on every bar of every energetic section, which
    // is how a pedal turns into the "dissonance pass" he describes.
    //
    // Measured contribution, r26: frozen_slot plus its own slot partner generate
    // 1007 of the suite's 2058 close semitone/tritone collisions with the melody
    // — 54%, the largest single source in the engine — and ablating it alone cut
    // rubs against the lead by 53%. He also named its default voice unprompted:
    // "I feel like vibraphone is overused and doesn't fit".
    //
    // So a pitch may be frozen only if the loop actually holds it: >= 75% of the
    // chords must contain it. One qualifying pitch is a real pedal and is kept
    // (spread across octaves instead of paired); none, and the device does not
    // cast at all rather than manufacturing a rub to have something to hold.
    const fzLoopLen = Math.max(1, Math.min(barSyms.length, 8));
    const fzCover = (pc) => {
      let n = 0;
      for (const sym of barSyms.slice(0, fzLoopLen)) {
        let tones = null;
        try { tones = chordCoreTones(sym); } catch { tones = null; }
        if (tones && [...tones].some((t) => (((t % 12) + 12) % 12) === pc)) n++;
      }
      return n / fzLoopLen;
    };
    const fzStrict = ruleFresh(26);
    const fzQualified = fzStrict ? fzCommon.filter((pc) => fzCover(pc) >= 0.75) : fzCommon;
    // express the winners as semitone offsets from the tonic, which is what the
    // `~n` figure token takes; `+` puts one of them an octave up so the body is
    // a spread dyad rather than a cluster (the reel's shape, kept).
    const fzPick = fzStrict
      ? (fzQualified.length >= 2 ? fzQualified.slice(0, 2)
        : fzQualified.length === 1 ? [fzQualified[0], fzQualified[0]] : [])
      : fzCommon.slice(0, 2);
    const fzOffsets = fzPick.map((pc) => (((pc - tonicPc) % 12) + 12) % 12);
    const fzSkip = fzStrict && fzOffsets.length < 2;
    const bodyFig = fzOffsets.length >= 2
      ? {
        name: 'frozen-body-commontone', bars: 1, grid: 16, legato: false,
        onsets: ['1/8', '3/8', '5/8', '7/8'],
        figure: [`~${fzOffsets[0]}`, `~${fzOffsets[1]}`, `~${fzOffsets[0]}`, `~${fzOffsets[1] + 12}`],
        accents: [0.42, 0.5, 0.42, 0.46],
      }
      : {
        name: 'frozen-body', bars: 1, grid: 16, legato: false,
        onsets: ['1/8', '3/8', '5/8', '7/8'],
        figure: ['5', 's6', '5', 's2+'],
        accents: [0.42, 0.5, 0.42, 0.46],
      };
    // the ONE MOVING SLOT: the downbeat, tracking the real chord
    const slotFig = { name: 'frozen-slot', bars: 1, onsets: ['0', '1/2'], figure: ['R', 'R'], accents: [0.6, 0.5], legato: false };
    const fzSound = (opts.fullSynth || synthAcc) ? 'gm_synth_strings_1' : 'gm_vibraphone';
    // REGISTER CAPPED BY THE LEAD (D77 — support tops stay UNDER the lead).
    // The first cut used `tonicPc >= 5 ? 4 : 5`, a fixed guess that consults
    // nothing, and the verify probe caught it on SIX songs: festival_hook put
    // the frozen slot at midi 88 over a lead at 64 — two octaves ABOVE the
    // tune — and chase_facility, cave_dungeon and training_speed were 100%
    // above as well. Same shape as the descant's own aftermath fix.
    const fzOct = Math.max(3, Math.min(tonicPc >= 5 ? 4 : 5, (leadOctave ?? 5) - 1));
    r28FzOct = fzOct;
    const bodyExpr = bindFigure(bodyFig, frozenCtx, v.meter, {
      octave: fzOct, sound: fzSound, gainRange: [0.16, 0.3], fx: '.room(0.35)', rhythmName: 'frozen-body',
    }).expr;
    const bindFz = (ctx) => `stack(${bodyExpr}, ${bindFigure(slotFig, ctx, v.meter, {
      octave: fzOct, sound: fzSound, loopRoots: true, gainRange: [0.2, 0.34], fx: '.room(0.35)', rhythmName: 'frozen-slot',
    }).expr})`;
    const fzBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    if (fzSkip) {
      extraInfo.push('frozen slot: NOT CAST — no pitch class is held by 75% of this loop, so there is no '
        + 'common tone to freeze and holding one anyway is what makes the device a dissonance pass (r26)');
    } else if (fzBars.some(Boolean)) {
      extraParts.push(...varySplit(bindFz, fzBars));
      extraSolos._frozen_slot = bindFz(ctxBar);
      extraInfo.push(`frozen slot: ${fzSound} holds 5-s6-5-s2+ FIXED while the downbeat tracks the chord \u2014 the frozen tones re-colour as the harmony moves (r23 reel R2, oct ${fzOct})`);
    }
  }

  // ---- R6 · A CELL LENGTH COPRIME WITH THE BAR --------------------------
  // 2 reels / 2 INDEPENDENT sources — the only structural device in the reel
  // set confirmed by two different producers, and the only one that produces
  // change without a section boundary. That is directly the r17 ask this
  // project has carried unbuilt for six rounds: "changes not just in strict
  // section bar". Measured then, and still true: 139 of 139 layer entries land
  // exactly on a section start.
  //
  // A 3-eighth cell in a 4/4 bar restarts on a different metric position every
  // bar and realigns only every 3 bars: 8 onsets over 3 bars, at 0, 3/8, 6/8,
  // 9/8, 12/8, 15/8, 18/8, 21/8. Zero note edits, no boundary, and the phase
  // relationship to the beat is different in each of the three bars.
  //
  // `Db04` also shows how to END it — break the cell at the phrase close with a
  // stepwise descent carrying a pitch the cell never contained. Here the last
  // onset of the 3-bar cell takes s2 (the cell is otherwise R/3/5), which is
  // that break.
  // Opt-in for the same measured reason as the frozen slot above.
  // Kept higher than the frozen slot's: re-phasing is only audible if the cell
  // recurs often enough for the ear to hold its shape across the shift. 80 is
  // the slowest of the two reels that show it (Db04's house tempo and Dcbb's
  // 127), rounded down rather than up because that pair is thin evidence.
  if (opts.coprimeCell === true && r23Fresh && v.bpm >= 80 && rubOk('coprimeCell')) {
    const cpFig = {
      name: 'coprime-3-8ths', bars: 3, grid: 8, legato: false,
      onsets: ['0', '3/8', '6/8', '9/8', '12/8', '15/8', '18/8', '21/8'],
      figure: ['R', '5', '3+', 'R', '5', '3+', 'R', 's2+'],
      accents: [0.6, 0.44, 0.5, 0.58, 0.44, 0.5, 0.56, 0.48],
    };
    const cpSound = (opts.fullSynth || synthAcc) ? 'gm_synth_bass_2' : 'gm_pizzicato_strings';
    // capped for the same reason, one octave lower than the frozen slot so the
    // two r23 devices do not land in each other's band either
    const cpOct = Math.max(2, Math.min(tonicPc >= 5 ? 3 : 4, (leadOctave ?? 5) - 2));
    r28CpOct = cpOct;
    const bindCp = (ctx) => snapSupport(bindFigure(cpFig, ctx, v.meter, {
      octave: cpOct, sound: cpSound, loopRoots: true,
      gainRange: [0.18, 0.32], fx: '.room(0.28).clip(0.55)', rhythmName: 'coprime-cell',
    }).expr, barSyms);
    const cpBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    if (cpBars.some(Boolean)) {
      extraParts.push(...varySplit(bindCp, cpBars));
      extraSolos._coprime_cell = bindCp(ctxBar);
      extraInfo.push(`coprime cell: ${cpSound} runs a 3-eighth cell against a 4/4 bar \u2014 re-phases every bar, realigns every 3, no section boundary involved (r23 reel R6, oct ${cpOct})`);
    }
  }
  // D87 (his round-10 MAIN directive): HARMONY MELODIES — "in the harmony
  // there should be more textures, importantly layers with their own
  // melody that compliment rather than purely just regular chords/
  // foundation tone stuff. there can be multiple at a time and each one
  // could also instead of just being a note, be multiple notes possibly".
  // The DESCANT: a 2-bar phrase where a held third+fifth DYAD breathes for
  // a bar, then its top voice walks 5-6-5 in quarters (the lift he keeps
  // choosing). It rides BESIDE the counterline and the pad phrases —
  // several harmony melodies at once — in a whisper-plus band, registered
  // under the lead (D77). opts.descant: false opts out; opts.descant
  // {octave, tension} reshapes it (tension = a 9-over-5 sus cluster held
  // high — stealth's "more tension by having a high texture").
  // D91 (rest/nostalgic_shop: "sub harmony melodies" / "more textures") —
  // an explicit opts.descant OBJECT forces it past the dial
  if (!laneStringsOff && ((opts.descant && typeof opts.descant === 'object') || (opts.descant !== false && v.ensemble.count >= 2))) {
    const dsc = (opts.descant && typeof opts.descant === 'object') ? opts.descant : {};
    // at least an octave under the lead's home octave (aftermath's low-
    // sitting lead was topped +11 by the oct-4 walk — verify blocker)
    const dOct = dsc.octave ?? Math.max(3, Math.min(energetic ? 3 : 4, (leadOctave ?? 5) - 1));
    // r19/D100 — THE DESCANT AND THE COUNTERLINE WERE ONE LAYER. Measured on
    // the judged page: 25 of the 28 songs that carry both put them on the SAME
    // string voice at IDENTICAL onsets — mysterious_jungle's first bars are
    // counterline D5 F#5 A5 and descant D4/F#4 A4 B4 at 0, 1.25, 1.50, 1.75,
    // the same four instants, an octave apart. That is one four-note string
    // chord moving in parallel, not two lines, and it is the mechanism behind
    // the ask he has now made on nine separate cards ("the harmony sounds too
    // basic - I want more layers with their own melody man that's what ive
    // been saying"). The collision is structural, not accidental: the
    // counterline's climb masks onto the ODD bar at 1/4·2/4·3/4, which is
    // exactly where a 2-bar descant's 5/4·6/4·7/4 walk lands.
    //
    // So the walk moves into the EVEN bar, where the counterline only holds.
    // Same shape (held dyad, then the 5-6-5 lift he keeps choosing), same
    // voice, same band — the two layers now interleave instead of striking
    // together, sharing only the downbeat. Unkept and unpinned songs only.
    const dWalk = (!priorKeep && !opts.grammarPin) ? ['1/4', '2/4', '3/4'] : ['5/4', '6/4', '7/4'];
    const dFig = dsc.tension
      ? { name: 'descant-tension', bars: 2, onsets: ['0', ...dWalk], figure: ['9.5', '5', '6', '5'], accents: [0.6, 0.55, 0.62, 0.55], legato: true }
      : { name: 'descant', bars: 2, onsets: ['0', ...dWalk], figure: ['3.5', '5', '6', '5'], accents: [0.6, 0.55, 0.62, 0.55], legato: true };
    const dSound = (opts.fullSynth || synthAcc) ? 'gm_synth_strings_1' : 'gm_string_ensemble_1';
    const bindD = (ctx) => snapSupport(bindFigure(dFig, ctx, v.meter, { octave: dOct, sound: dSound, loopRoots: true, gainRange: [0.15, 0.28], fx: '.room(0.5)', rhythmName: 'descant' }).expr, barSyms);
    const dBars = form.sections.flatMap((sec) => Array(sec.bars).fill(sec.lead !== 'none' ? 1 : 0));
    if (dBars.some(Boolean)) {
      extraParts.push(...varySplit(bindD, dBars));
      extraSolos._descant = bindD(ctxBar);
      extraInfo.push(`descant: held 3+5 dyad / 5-6-5 walk, 2-bar phrase (${dSound}, oct ${dOct}${dsc.tension ? ', tension 9-over-5' : ''})`);
    }
  }
  // D85 (his "high end patterns ... to compliment the tracks", the batch-3
  // doctrine): a music-box sparkle lane far above the lead — odd bars get
  // root+5th chimes on beats 1 and 3 (the sparse anchor), even bars get a
  // beat-4 pair of 8ths climbing 5→6 toward the next bar (the pickup).
  // Whisper gains, octave 6 (a lane of its own; the melody's walk tops out
  // well below). Conservative gate: only sections at energy >= 4 and only
  // songs with a pulse (>= 90bpm) — the lab cards carry the full-loop
  // version for his ear. This consciously extends the D76 high-silence
  // rule per his explicit round-8 ask; his verdicts rule on it.
  // r14 lane law: the music-box sparkle is a PLAYFUL device — it never joins
  // a horror, desert or jungle song (measured on every "playful"-noted card)
  // r24: remember the sparkle's voice so the echo and the octave partner cannot
  // pick it too. HIS EAR, two cards: "the high glockenspiel sounds a bit too
  // erratic like it's making the melody seem jittery" (su_tense_boss) and "the
  // glockenspiel too active once again" (su_triumphant_boss). MEASURED on both:
  // gm_music_box was cast TWICE — once as this sparkle at octave 6 and again as
  // the r22 octave partner or echo — so two high music-box lines were running
  // against each other. Exactly D100's shape: a voice excluded from one path
  // arrives through another, and only a per-song voice audit catches it.
  let sparkleSound = null;
  if (opts.sparkle !== false && !laneSerious && v.bpm >= 90 && v.meter === '4/4') {
    sparkleSound = 'gm_music_box';
    const spChime = {
      name: 'sparkle-chime', bars: 1, onsets: ['0', '1/2'],
      figure: ['R', '5'], accents: [0.5, 0.4], legato: false,
    };
    const spPickup = {
      name: 'sparkle-pickup', bars: 1, onsets: ['3/4', '7/8'],
      figure: ['5', '6'], accents: [0.42, 0.5], legato: false,
    };
    const spOpts = { octave: 6, sound: 'gm_music_box', loopRoots: true, gainRange: [0.15, 0.3], fx: '.room(0.5).clip(0.9)', rhythmName: 'sparkle' };
    const bindChime = (ctx) => snapSupport(bindFigure(spChime, ctx, v.meter, spOpts).expr, barSyms);
    const bindPick = (ctx) => snapSupport(bindFigure(spPickup, ctx, v.meter, spOpts).expr, barSyms);
    const spBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 4 ? 1 : 0));
    if (spBars.some(Boolean)) {
      const odd = spBars.map((x, i) => (x && i % 2 === 0 ? 1 : 0));
      const even = spBars.map((x, i) => (x && i % 2 === 1 ? 1 : 0));
      if (odd.some(Boolean)) extraParts.push(...varySplit(bindChime, odd));
      if (even.some(Boolean)) extraParts.push(...varySplit(bindPick, even));
      extraSolos._sparkle = `stack(${bindChime(ctxBar)}.mask("<1 0>"), ${bindPick(ctxBar)}.mask("<0 1>"))`;
      extraInfo.push('sparkle: music-box chimes/pickups (oct 6, busy sections)');
    }
  }
  // D85 ("the bouncy bass used in funky songs"): in the funk pocket —
  // beat-forward 4/4 between 96 and 140bpm, where neither the accToBass
  // swap nor the >=140 sub-bass fires — a slap-bass line bounces root /
  // octave / fifth / octave on a syncopated grid, masked to the beat's
  // bars. gm_slap_bass_2 -> Surge "Rubber Bass" in HQ.
  // r14 lane law: the slap bounce reads PLAYFUL — never in horror/desert/
  // jungle (tense_citadel: "the bass is also playful"; happy_jungle: "the
  // bass doesn't work"). The jungle lane gets its own round tumbao below.
  // r25 — `opts.bassLine` forces it past the percussion-presence gate. His
  // su_goofy_kitchen note, twice: "maybe some bass though?" (r24) and then "add
  // some bass though? it still wasn't added" (r25). MEASURED why it wasn't: the
  // song clears most conditions but falls through TWO gates at once: its
  // percussion presence is 'light' where this block wants driving-or-foreground,
  // and at 141bpm it is one beat over this window and under the >=140 sub-bass
  // path's own presence gate. A groove song with quiet drums is exactly where a
  // bass is doing the groove's work, so the opt relaxes both.
  if (opts.funkBass !== false && !laneSerious && !accToBass && drumBarsShared
    && v.meter === '4/4' && v.bpm >= 96 && v.bpm < (opts.bassLine === true ? 165 : 140)
    && (opts.bassLine === true || ['driving', 'foreground'].includes(v.percussion.presence))) {
    const fbFig = {
      name: 'funk-bounce', bars: 1, onsets: ['0', '3/8', '1/2', '7/8'],
      figure: ['R', 'R+', '5', 'R+'], accents: [0.95, 0.7, 0.8, 0.75], legato: false,
    };
    const bindFb = (ctx) => bindFigure(fbFig, ctx, v.meter, { octave: 2, sound: 'gm_slap_bass_2', loopRoots: true, gainRange: [0.55, 0.9], fx: '.clip(0.6)' }).expr;
    extraParts.push(...varySplit(bindFb, drumBarsShared));
    extraSolos._funk_bass = bindFb(ctxBar);
    extraInfo.push('funk bounce: gm_slap_bass_2 R/R+/5/R+ syncopated under the beat');
  }

  // D88 (the praised songs' C sections; the suite's base acc NEVER dropped
  // out — a still-open item since the old round 10): unkept/future songs
  // with a low-energy interior section get a real BREAKDOWN there — the
  // base accompaniment strips and a held-root floor carries it with the
  // extras (counterline/descant/pads keep playing by their own gates).
  let bdMaskStr = null;
  let bdGainStr = null;   // r32: the fade form of the same strip
  let bdReentryBar = null; // genre-expansion: the bar the full texture returns on
  // opts.breakdown === true forces it for a song JUDGED with a breakdown —
  // a new keep must not lose the section-strip he approved
  // r32 — TWO OF HIS CARDS ARE THIS DEVICE, SIX TIMES BETWEEN THEM.
  //   "when the piano disappears it sounds abrupt because it such a core part"
  //   "when the piano disappears it sounds really random and abrupt once again"
  //   "the e piano randomly disappearing is abrupt just like the previous songs"
  //   "the piano just abruptly cuts off"
  //   "the pain [piano] disappearing is abrupt"
  //   "there doesn't have to be a beat drop in every song ffs"
  // Measured on the page he judged: the breakdown fired on 12 of 16 songs,
  // because `opts.breakdown !== false && !priorKeep` is true of every unkept
  // song there is. The last card is the general form of the other five.
  //
  // Two separate defects, and they need separate fixes:
  //   (1) IT IS NOT A CHOICE. A device on 75% of songs is a default, and a beat
  //       drop is a gesture — it should be a minority. Hash-gated to roughly one
  //       song in three, on r32-fresh songs only.
  //   (2) IT IS A HARD CUT. `bdMaskStr` is a 0/1 `.mask()` over the WHOLE base
  //       mix, so the accompaniment goes to silence between one bar and the next
  //       and snaps back at full gain a section later. That is exactly the
  //       artefact r22 already fixed for the breathing layers ("strings should
  //       always FADE in ... not just cut in and spawn in") and it was never
  //       applied here. The strip is now a gain envelope: a bar of decay in, a
  //       two-bar swell back out.
  const bdRoll = !r32() || (fnv(`${name}|breakdown`) % 3 === 0);
  if ((opts.breakdown === true || (opts.breakdown !== false && !priorKeep && bdRoll))
    && !opts.dropIntro && form.sections.length >= 3) {
    const interiorAll = form.sections.filter((sec, i) => i > 0 && i < form.sections.length - 1);
    const interior = interiorAll.filter((sec) => (ENERGY[sec.archetype] ?? 3) <= 2);
    // prefer the form's own breathing point; else strip the section before
    // the finale (every praised lab song breaks down SOMEWHERE)
    const bd = interior.length ? interior[interior.length - 1] : interiorAll[interiorAll.length - 1];
    if (bd) {
      const bdBars = form.sections.flatMap((sec) => Array(sec.bars).fill(sec.index === bd.index ? 0 : 1));
      // r32: a GAIN envelope, not a mask — the bar before the strip decays, the
      // two bars after it swell back. Same run-length encoding, so the emitted
      // pattern is the same shape; only the values in the transition bars move.
      // Legacy (non-r32) songs keep the hard 0/1 mask byte-for-byte.
      const bdGain = bdBars.map((x, i) => {
        if (!x) return 0;
        if (bdBars[i + 1] === 0) return 0.45;           // last bar before the drop
        if (bdBars[i - 1] === 0) return 0.4;            // first bar back
        if (bdBars[i - 2] === 0 && bdBars[i - 1] === 1) return 0.75;
        return 1;
      });
      bdMaskStr = maskString(bdBars);
      bdGainStr = r32() ? maskString(bdGain) : null;
      const floorFig = { name: 'breakdown-floor', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.7], legato: true };
      const floorSound = (accToBass || synthAcc) ? 'gm_synth_bass_1' : 'piano';
      const bindFloor = (ctx) => bindFigure(floorFig, ctx, v.meter, { octave: 2, sound: floorSound, loopRoots: true, gainRange: [0.4, 0.6], fx: '.room(0.4).clip(1.05)' }).expr;
      const floorBars = bdBars.map((x) => (x ? 0 : 1));
      extraParts.push(...varySplit(bindFloor, floorBars));
      extraSolos._breakdown_floor = bindFloor(ctxBar);
      extraInfo.push(`breakdown: base acc strips in section ${bd.index} (${bd.archetype}); held-root floor on ${floorSound}`);
      bdReentryBar = bdBars.lastIndexOf(0) + 1;
    }
  }

  // ---- genre-expansion devices (2026-08-27 round) --------------------------
  // Every block below fires ONLY for a new environment, the noted desert
  // song, or an explicit opt — no pre-round song can drift. Sample voices
  // (hx_* horror pack, vc_* VCSL percussion) come from the local sample pack
  // (src/lib/sample-pack-def.js) and sound in BOTH tiers (audition data-URI
  // map + the render tier's wav backend).
  const barSec = (beats * 60) / v.bpm;
  const T_ALL = form.totalBars;
  const sectionStartBar = [];
  { let acc0 = 0; for (const sec of form.sections) { sectionStartBar.push(acc0); acc0 += sec.bars; } }
  const fxParts = [];

  // (a) the desert floor — the NSMB marimba ostinato (midi-desert-analysis
  // §1.2): constant-16th broken open fifth, a b7+4 two-16th splash on each
  // downbeat, 5+5+2 velocity cross-accents. The "desert floor" that gives a
  // desert song its >=6 attacks/bar without touching the melody.
  // r14 (somber_desert: "the piano is a bit too bare ... add more texture
  // that contributes to the desert vibe"): the floor no longer skips slow
  // songs — under 80bpm it plays the HALF variant (broken fifths in 8ths,
  // same splash, softer band) so even a crawl keeps the desert's motion.
  if (env === 'desert' && !priorKeep && (opts.percPresence ?? v.percussion.presence) !== 'none') {
    const dfSlow = v.bpm < 80;
    const floorFig = dfSlow
      ? {
        name: 'desert-floor-slow', bars: 1, grid: 16, class: 'pulse', meter_class: '4/4', legato: false,
        onsets: ['0/16', '2/16', '4/16', '6/16', '8/16', '10/16', '12/16', '14/16'],
        figure: ['~5', 'R', '5', 'R', 'R', '5', '5', 'R'],
        accents: [0.6, 1, 0.4, 0.62, 1, 0.4, 0.62, 0.4],
      }
      : {
        name: 'desert-floor', bars: 1, grid: 16, class: 'pulse', meter_class: '4/4', legato: false,
        onsets: [...Array(16)].map((_, i) => `${i}/16`),
        figure: ['~5', '~10', 'R', '5', '5', 'R', '5', 'R', 'R', '5', '5', 'R', 'R', '5', '5', 'R'],
        accents: [0.62, 0.4, 1, 0.4, 0.62, 0.68, 0.62, 1, 0.4, 0.62, 0.4, 0.62, 1, 0.4, 1, 0.4],
      };
    const bindDF = (ctx) => bindFigure(floorFig, ctx, v.meter, { sound: 'gm_marimba', loopRoots: true, gainRange: dfSlow ? [0.2, 0.38] : [0.28, 0.5], fx: '.clip(0.75).room(0.2)', octave: 3 }).expr;
    const dfBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= (dfSlow ? 2 : 3) ? 1 : 0));
    if (dfBars.some(Boolean)) {
      extraParts.push(...varySplit(bindDF, dfBars));
      extraSolos._desert_floor = bindDF(ctxBar);
      extraInfo.push(`desert floor: gm_marimba broken-fifth ${dfSlow ? '8ths (slow half variant)' : '16ths, b7+4 downbeat splash, 5+5+2 cross-accents'} (NSMB)`);
    }
  }

  // (b) desert stamps — the sitar slide-off flourish at A-section starts
  // (identical every time: a stamp, not a variation) + the beat-3.5
  // pan-flute punctuation (the NSMB shakuhachi slot).
  if (env === 'desert' && !priorKeep) {
    const flourishFig = {
      name: 'desert-flourish', bars: 1, grid: 32, class: 'riff', meter_class: '4/4', legato: true,
      onsets: ['0', '1/32', '2/32', '3/32', '4/32', '5/32'],
      figure: ['~13', '~12', '~11', '~9', '~8', '~7'],
      accents: [0.85, 0.7, 0.66, 0.62, 0.6, 0.9],
    };
    const flBars = Array(T_ALL).fill(0);
    form.sections.forEach((sec, i) => {
      const L = (mfx.sections.find((x) => x.index === sec.index)?.letter ?? '').replace('*', '');
      if (L === 'A' && sectionStartBar[i] < T_ALL) flBars[sectionStartBar[i]] = 1;
    });
    let stamped = 0;
    for (let i = 0; i < flBars.length; i++) { if (flBars[i]) { stamped++; if (stamped > 3) flBars[i] = 0; } }
    if (flBars.some(Boolean)) {
      const bindFl = (ctx) => bindFigure(flourishFig, ctx, v.meter, { sound: LEAD_SOUND, loopRoots: true, gainRange: [0.5, 0.68], fx: '.room(0.35)', octave: 4 }).expr;
      extraParts.push(...varySplit(bindFl, flBars));
      extraSolos._desert_flourish = bindFl(ctxBar);
      extraInfo.push(`desert flourish: 6-note chromatic slide-off to the 5th, stamped at ${flBars.filter(Boolean).length} A-start(s) on ${LEAD_SOUND}`);
    }
    const punctFig = { name: 'desert-punct', bars: 4, grid: 8, class: 'sustain', meter_class: '4/4', legato: false, onsets: ['7/8'], figure: ['5'], accents: [0.5] };
    const bindPu = (ctx) => bindFigure(punctFig, ctx, v.meter, { sound: 'gm_pan_flute', loopRoots: true, gainRange: [0.2, 0.3], fx: '.room(0.5)', octave: 4 }).expr;
    const puBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 2 ? 1 : 0));
    // r18 (somber_desert, "remove the really high flute note but otherwise Im a
    // fan"): this is that note — a lone gm_pan_flute fifth at octave 4, 12
    // sounding notes in the whole song, exposed at D5-D#5 over a 52bpm bed.
    // Song-scoped, because happy_desert carries the same stamp and he liked
    // that one as it stands.
    if (opts.desertPunct !== false && puBars.some(Boolean)) {
      extraParts.push(...varySplit(bindPu, puBars));
      extraSolos._desert_punct = bindPu(ctxBar);
      extraInfo.push('desert punctuation: gm_pan_flute at beat 3.5 every 4th bar');
    }
  }

  // (b2) r14 OFF-CHORD STINGERS (scary_catacombs: "more sharp solo cello or
  // solo violin playing off chord notes"): one sharp b9-over-root hit at up
  // to three interior section seams — the action lane's single harmonic-
  // dissonance device, event-tied and rare per the horror dosing law.
  // r16: the horror dosing law is ONE harmonic-dissonance device per song, but
  // catacombs was measured running TWO at once (stingers + chromatic descent)
  // on all three of its songs. A song carrying the choir pincer therefore
  // carries nothing else harmonic — his note was "just one pattern in a sea of
  // patterns", and a third simultaneous device would be the opposite of that.
  // r18/D99 — the stinger is no longer a DEFAULT. He rejected it on both songs
  // that carried it, in the same words each time: "the random sharp violin just
  // hurt my ears" (scary_catacombs), "the sharp violins hurt my ears and don't
  // belong" (tense_catacombs), and again on x_catacombs. Measured, it was a
  // 0.95-accent b9 on a SOLO violin at gain 0.5-0.62 with .clip(0.5) — a loud
  // short stab, which is the one thing a sharp interval must not be. He also
  // said what he wants instead, and it is the opposite of a stab: "I mean like
  // subtle dissonance by random instruments in the background in their own
  // parts that come in sometimes or all the time." That is the bgDissonance
  // layer below. opts.stingers still forces the old hits if a card ever asks.
  if (!opts.choirPincer && opts.stingers === true) {
    const stSound = fnv(`${name}|sting`) % 2 === 0 ? 'gm_violin' : 'gm_cello';
    // violin stingers sit at octave 4 (verify catch: octave-5 b9 hits landed
    // midi 87-92, above the VSCO violin's G#5 top — HQ folded all of them)
    const stOct = stSound === 'gm_violin' ? 4 : 3;
    const seams = sectionStartBar.slice(1).filter((b) => b < T_ALL).slice(0, 3);
    const stFigs = [
      { name: 'stinger-b9', bars: 1, grid: 8, class: 'sustain', meter_class: '4/4', legato: false, onsets: ['0'], figure: ['~13'], accents: [0.95] },
      { name: 'stinger-tritone', bars: 1, grid: 8, class: 'sustain', meter_class: '4/4', legato: false, onsets: ['0'], figure: ['~6'], accents: [0.95] },
    ];
    seams.forEach((b, i) => {
      const bars = Array(T_ALL).fill(0); bars[b] = 1;
      const bindSt = (ctx) => bindFigure(stFigs[i % 2], ctx, v.meter, { sound: stSound, octave: stOct, loopRoots: true, gainRange: [0.5, 0.62], fx: '.clip(0.5).room(0.35)' }).expr;
      extraParts.push(...varySplit(bindSt, bars));
      if (i === 0) extraSolos._stinger = bindSt(ctxBar);
    });
    if (seams.length) extraInfo.push(`off-chord stingers: ${stSound} b9/tritone hits at ${seams.length} section seam(s) (his sharp-solo-strings ask)`);
  }

  // (b2b) r18/D99 BACKGROUND DISSONANCE — the stinger's replacement, written
  // from his own description of what he wanted instead: "I mean like subtle
  // dissonance by random instruments in the background in their own parts that
  // come in sometimes or all the time." Every clause is a spec.
  //   subtle          -> whisper band [0.09, 0.16], under the 0.162 counterline
  //                      floor that the corrected D77 law makes the ceiling for
  //                      a new support texture
  //   dissonance      -> the b9 and the tritone the stinger carried; the
  //                      harmonic content is kept, only its ATTACK is thrown
  //                      away, and it stays the song's ONE device (still
  //                      mutually exclusive with the pincer, per the dosing law)
  //   in the background-> a bed voice (tremolo strings / metallic pad), never a
  //                      solo violin, and legato across two whole bars
  //   in their own parts, come in sometimes
  //                   -> section-gated by the song's own hash, not stamped on
  //                      section seams: some songs run it through their whole
  //                      interior, others on alternating sections only
  // (b1c) r19/D100 THE FIFTH PINCER — built from the one reel he answered with a
  // verdict rather than a question: "scary^" on dantes.studio. Read note by note,
  // its sonority is TWO PERFECT FIFTHS A SEMITONE APART sounding together
  // (F#-C# against G-D), and the second chord swaps the semitone for a tritone
  // (G-D against C#-G#). Both are thirdless. That is the difference from every
  // horror device the engine already had: wobble is a P4 dyad, choirPincer
  // alternates a single note above and below, horrorOstinato is one thirdless
  // line — none of them stacks a whole SECOND FIFTH against the chord's own.
  //
  // Voices enter one at a time about a beat apart in the source, so the onsets
  // stagger rather than strike; `~1`/`~8` is the semitone-above fifth and
  // `~6`/`~13` the tritone-above one, both written as raw semitone offsets
  // because neither is a chord member by construction. Counts as THE song's one
  // harmonic device (D93), so it suppresses the others.
  const fifthPincer = opts.fifthPincer === true;
  if (fifthPincer) {
    const fpFig = {
      name: 'fifth-pincer', bars: 2, grid: 8, class: 'sustain', meter_class: '4/4', legato: true,
      onsets: ['0', '1/4', '1', '5/4'],
      figure: ['~1', '~8', '~6', '~13'],
      accents: [0.52, 0.46, 0.5, 0.44],
    };
    const fpSound = opts.fifthPincerSound ?? (laneHorror ? 'gm_pad_metallic' : 'gm_string_ensemble_1');
    const fpBars = form.sections.flatMap((sec, i) => Array(sec.bars).fill(i > 0 ? 1 : 0));
    if (fpBars.some(Boolean)) {
      const bindFp = (ctx) => bindFigure(fpFig, ctx, v.meter, { sound: fpSound, octave: 3, loopRoots: true, gainRange: [0.16, 0.26], fx: '.room(0.55)' }).expr;
      extraParts.push(...varySplit(bindFp, fpBars));
      extraSolos._fifth_pincer = bindFp(ctxBar);
      extraInfo.push(`fifth pincer: ${fpSound} holds a second perfect fifth against the chord's own — a semitone above, then a tritone above, voices entering a beat apart (the song's one harmonic device)`);
    }
  }
  if (!fifthPincer && !opts.choirPincer && (opts.bgDissonance ?? (env === 'catacombs' && !priorKeep))) {
    const bgFig = {
      name: 'bg-dissonance', bars: 2, grid: 4, class: 'sustain', meter_class: '4/4', legato: true,
      onsets: ['0', '1'], figure: ['~13', '~6'], accents: [0.55, 0.48],
    };
    const bgSound = fnv(`${name}|bgdis`) % 2 === 0 ? 'gm_tremolo_strings' : 'gm_pad_metallic';
    // "sometimes or all the time" — the song picks which it is.
    const always = fnv(`${name}|bgspan`) % 2 === 0;
    const bgBars = form.sections.flatMap((sec, i) => Array(sec.bars).fill(i > 0 && (always || i % 2 === 1) ? 1 : 0));
    if (bgBars.some(Boolean)) {
      const bindBg = (ctx) => bindFigure(bgFig, ctx, v.meter, { sound: bgSound, octave: 3, loopRoots: true, gainRange: [0.09, 0.16], fx: '.room(0.6)' }).expr;
      extraParts.push(...varySplit(bindBg, bgBars));
      extraSolos._bg_dissonance = bindBg(ctxBar);
      extraInfo.push(`background dissonance: ${bgSound} holds the b9 and the tritone across two bars, ${always ? 'through every interior section' : 'on alternating sections'} (whisper — the song's one harmonic device)`);
    }
  }
  // (b2c) r19/D100 HORROR PUNCTUATION — "with like some small random brief
  // melodies or sounds (like falls or rises or something)". This is the thing
  // he asked for IN PLACE of the tune, so it is deliberately not a tune: a
  // three-note fall or rise through chord tones, over in half a bar, on a lane
  // voice at whisper gain. Two rules make it read as punctuation rather than as
  // another layer. (1) It lands OFF the section grid — every one of the 139
  // layer entries measured in r17 sat exactly on a section start, which is his
  // standing "changes not just in strict section bar" ask, and a gesture that
  // announces boundaries is a transition, not an interjection. (2) It is RARE:
  // one every seven bars or so, never twice in a row, and its direction and
  // beat both come off the bar's own hash so it does not settle into a pulse.
  if (opts.horrorPunct ?? (laneHorror && !priorKeep && !opts.grammarPin)) {
    // a lane voice, and never the lead's — punctuation that shares the tune's
    // timbre reads as the tune restarting
    const PUNCT_VOICE = ['gm_viola', 'gm_cello', 'gm_church_organ', 'gm_pad_metallic']
      .filter((s) => s !== LEAD_SOUND)[fnv(`${name}|hpvoice`) % 3];
    const secStart = new Set(sectionStartBar);
    const puBars = Array(T_ALL).fill(0);
    for (let b = 3; b < T_ALL; b++) {
      if (secStart.has(b) || secStart.has(b + 1)) continue;
      if (puBars.slice(Math.max(0, b - 6), b).some(Boolean)) continue;
      if (fnv(`${name}|hpunct${b}`) % 100 < 34) puBars[b] = 1;
    }
    if (puBars.some(Boolean)) {
      const pOct = /organ|cello|viola|bassoon/.test(LEAD_SOUND) ? 4 : 4;
      const bindFall = (ctx, up) => bindFigure({
        name: up ? 'horror-rise' : 'horror-fall', bars: 1, grid: 8, class: 'sustain',
        meter_class: '4/4', legato: true,
        onsets: ['1/2', '5/8', '3/4'],
        figure: up ? ['R', '3', '5'] : ['5', '3', 'R'],
        accents: [0.44, 0.4, 0.36],
      }, ctx, v.meter, { sound: PUNCT_VOICE, octave: pOct, loopRoots: true, gainRange: [0.1, 0.17], fx: '.room(0.65)' }).expr;
      // per-bar direction, so the gesture is not the same shape every time
      const parts = varySplit((ctx) => bindFall(ctx, false), puBars.map((x, b) => (x && fnv(`${name}|hpdir${b}`) % 2 === 0 ? 1 : 0)));
      const parts2 = varySplit((ctx) => bindFall(ctx, true), puBars.map((x, b) => (x && fnv(`${name}|hpdir${b}`) % 2 === 1 ? 1 : 0)));
      extraParts.push(...parts, ...parts2);
      extraSolos._horror_punct = bindFall(ctxBar, false);
      extraInfo.push(`horror punctuation: ${PUNCT_VOICE} three-note falls/rises at ${puBars.filter(Boolean).length} bars, off the section grid (whisper)`);
    }
  }
  // (b3) r14 CHROMATIC DESCENT (his catacombs "maybe descending semitones" +
  // tense_desert "some layers could have like descending semitones like u
  // did"): a slow 4-semitone chromatic slide over 2 bars on a low bowed
  // voice, masked to the departure (non-A) sections only — a color, not a
  // second dissonance device (it walks INTO chord tones, octave→M6).
  if (!opts.choirPincer && (opts.chromDescent ?? (env === 'catacombs' && !priorKeep))) {
    const cdFig = {
      name: 'chromatic-descent', bars: 2, grid: 4, class: 'sustain', meter_class: '4/4', legato: true,
      onsets: ['0', '1/2', '1/1', '3/2'], figure: ['~12', '~11', '~10', '~9'], accents: [0.55, 0.5, 0.52, 0.5],
    };
    const cdSound = env === 'desert' ? 'gm_string_ensemble_1' : 'gm_cello';
    const cdBars = form.sections.flatMap((sec) => {
      const L = (mfx.sections.find((x) => x.index === sec.index)?.letter ?? '').replace('*', '');
      return Array(sec.bars).fill(L && L !== 'A' ? 1 : 0);
    });
    if (cdBars.some(Boolean)) {
      const bindCd = (ctx) => bindFigure(cdFig, ctx, v.meter, { sound: cdSound, octave: 3, loopRoots: true, gainRange: [0.18, 0.3], fx: '.room(0.4)' }).expr;
      extraParts.push(...varySplit(bindCd, cdBars));
      extraSolos._chrom_descent = bindCd(ctxBar);
      extraInfo.push(`chromatic descent: ${cdSound} 12-11-10-9 semitone slide over 2 bars, departure sections`);
    }
  }

  // (b4) r14 B2 RUB (scary_manor/somber_manor "doesn't feel scary yet"): the
  // manor lane's one harmonic-dissonance device — a whisper-gain held minor
  // 9th over the root on the ghost pad, interior sections only.
  if (opts.b2rub && !opts.horrorOstinato) {
    const rubFig = { name: 'b2-rub', bars: 1, grid: 4, class: 'sustain', meter_class: '4/4', legato: true, onsets: ['0'], figure: ['~13'], accents: [0.5] };
    const rubBars = form.sections.flatMap((sec, i) => Array(sec.bars).fill(i > 0 && i < form.sections.length - 1 ? 1 : 0));
    if (rubBars.some(Boolean)) {
      const bindRub = (ctx) => bindFigure(rubFig, ctx, v.meter, { sound: 'gm_pad_metallic', octave: 4, loopRoots: true, gainRange: [0.08, 0.14], fx: '.room(0.6)' }).expr;
      extraParts.push(...varySplit(bindRub, rubBars));
      extraSolos._b2_rub = bindRub(ctxBar);
      extraInfo.push('b2 rub: gm_pad_metallic held minor-9th shimmer, interior sections (the manor dissonance device)');
    }
  }

  // (b4a) r16 CHOIR PINCER (choir-pincer: "yes" / "try it, but again don't make
  // it replace everything it's just one pattern in a sea of patterns").
  // Measured in his own S.C.A.R.Y. package: the choir holds C# and B in
  // ALTERNATE WHOLE BARS, a semitone above and below the riff's C, and never
  // resolves — the whole harmonic horror budget spent on one idea over a
  // consonant floor, which is his dosing law stated as music. Same shape as
  // the r16 desert wobble, at a quarter of the rate and sung.
  if (opts.choirPincer) {
    const pincerFig = {
      name: 'choir-pincer', bars: 2, grid: 4, class: 'sustain', meter_class: '4/4', legato: true,
      onsets: ['0', '1'], figure: ['~1', '~11'], accents: [0.6, 0.55],
    };
    const pinBars = form.sections.flatMap((sec, i) => Array(sec.bars).fill(i > 0 ? 1 : 0));
    if (pinBars.some(Boolean)) {
      const pinSound = typeof opts.choirPincer === 'string' ? opts.choirPincer : 'choir_male';
      const bindPin = (ctx) => bindFigure(pincerFig, ctx, v.meter, { sound: pinSound, octave: 3, loopRoots: true, gainRange: [0.22, 0.34], fx: '.room(0.6)' }).expr;
      extraParts.push(...varySplit(bindPin, pinBars));
      extraSolos._choir_pincer = bindPin(ctxBar);
      extraInfo.push(`choir pincer: ${pinSound} holds a semitone above and below the root in alternate bars, never resolving (the song's one harmonic device)`);
    }
  }

  // (b4a2) r34 ELECTRIC GUITAR LAYER (opts.guitar — the VOCAL=1 page; his
  // "do we have access to high quality electric guitar? i want to try that as
  // a layer with miku (learning from japanese songs)"). What a J-rock /
  // Vocaloid-rock guitar does under a voice, as figures the engine binds like
  // any other (bindFigure over the song's own chords; masks by section):
  //   verse  — PALM-MUTED 8th-note power chords (R.5), or a 16th GALLOP
  //            (beat, and-of, a-of: 0 / 2/16 / 3/16) on the hash — the
  //            "chug" that carries a verse without crowding the singer;
  //   chorus — OPEN power chords with the octave (R.5.R+) in 8ths, ringing
  //            (legato) — the lift when the hook arrives;
  //   ballad — CLEAN broken-chord 8ths (R 5 R+ 3+ 5+ 3+ R+ 5), the arpeggio
  //            that opens a J-pop ballad.
  // Register: octave 2 — power chords live E2-B3 on a real guitar (the DI
  // library plays B1-D6). Gain under the voice (D77): the guitar is a rhythm
  // part, not a second lead. Sections follow the LETTER: A = verse, any other
  // letter = chorus; an AA song alternates statement by statement; the
  // guitar enters with the voice (no lead section = no guitar).
  if (opts.guitar) {
    const gMode = typeof opts.guitar === 'string' ? opts.guitar : (energetic ? 'rock' : 'arp');
    const EIGHTHS = ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];
    const GFIGS = {
      mute8: { name: 'jrock-mute8', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: EIGHTHS, figure: Array(8).fill('R.5'), accents: [0.95, 0.62, 0.82, 0.62, 0.9, 0.62, 0.82, 0.68] },
      gallop: { name: 'jrock-gallop', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
        onsets: ['0', '1/8', '3/16', '1/4', '3/8', '7/16', '1/2', '5/8', '11/16', '3/4', '7/8', '15/16'],
        figure: Array(12).fill('R.5'), accents: [0.95, 0.6, 0.7, 0.85, 0.6, 0.7, 0.9, 0.6, 0.7, 0.85, 0.6, 0.72] },
      open8: { name: 'jrock-open8', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: true,
        onsets: EIGHTHS, figure: Array(8).fill('R.5.R+'), accents: [0.95, 0.7, 0.85, 0.7, 0.92, 0.7, 0.85, 0.75] },
      arp: { name: 'jrock-arp', bars: 1, grid: 16, class: 'arp', meter_class: '4/4', legato: true,
        onsets: EIGHTHS, figure: ['R', '5', 'R+', '3+', '5+', '3+', 'R+', '5'], accents: [0.8, 0.55, 0.65, 0.6, 0.72, 0.6, 0.65, 0.55] },
    };
    // ---- r34b GUITAR AS THE MAIN THING (his "generate some songs with guitar
    // intentionally in it as a main thing ... just make sure to understand
    // which genres it'd make sense in"). Three MAIN modes, each a genre where
    // a lead guitar belongs, on top of the subtle 'rock'/'arp' layer he liked:
    //   main    — J-rock / anime opening / power pop / Vocaloid rock: the
    //             rhythm guitar louder (still under the voice), an INTRO RIFF
    //             (the A melody played by the guitar over the intro bars — the
    //             anime-OP habit of stating the hook instrumentally first),
    //             and the guitar DOUBLING THE VOCAL an octave down in the
    //             final chorus (the J-rock last-chorus unison);
    //   citypop — clean 16th offbeat chops (3.5.R+ voicings at octave 3) in
    //             the verse, clean 8th strums in the chorus, clean intro riff
    //             and final double — the Tatsuro/Mariya guitar under a voice;
    //   ballad  — the clean arpeggio at main level, clean intro riff, and the
    //             clean guitar joining the voice for the last section.
    const MAIN = /^(main|citypop|ballad)$/.test(gMode);
    // ---- r35 · THE GUITAR PLAYS STACCATO (his ear, five cards in one export) --
    // "the guitar is a bit too wet/sustaining -> it sounds a bit like white
    // noise" (vx_triumphant_boss), "too sustaining so it sounds like white
    // noise" (vx_excited_festival), "when the guitar starts sustaining (like
    // holding), it doesn't sound good. whenever it's just playing staccato
    // notes it sounds good and the octave alternation thats good"
    // (vg_triumphant_training), "whenever the guitar sounds like it's
    // sustaining, it doesn't sound good" (vg_excited_space), "the guitar
    // spamming the same chords doesn't sound good" (vg_excited_fight).
    // Measured: every complained part is the ringing (legato) open-chord
    // chorus on the Sus articulation through the crunch capture; every praised
    // part is the palm-muted verse ("I like the guitar here" on vg_happy_festival
    // is the one open chorus he liked — pinned, it keeps it). So on r35-fresh
    // songs the chorus is palm-muted too: the octave chug (R.5 / R+.5+, the
    // "octave alternation" he named) on B letters and a 3+3+2 push on the
    // bridge letters — two chorus figures by LETTER, not one by hash, which is
    // the "spamming the same chords" answer — and the main-mode riff/double
    // move to the muted articulation as well; the room drops (his "too wet").
    const stacc = opts.guitarStaccato ?? r35();
    GFIGS.chug_oct = { name: 'jrock-chug-oct', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
      onsets: EIGHTHS, figure: ['R.5', 'R.5', 'R+.5+', 'R.5', 'R.5', 'R+.5+', 'R.5', 'R+.5+'], accents: [0.95, 0.62, 0.88, 0.62, 0.9, 0.86, 0.62, 0.9] };
    GFIGS.push332 = { name: 'jrock-push332', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
      onsets: ['0', '1/8', '3/8', '1/2', '3/4', '7/8'], figure: ['R.5.R+', 'R.5', 'R.5.R+', 'R.5', 'R.5.R+', 'R+.5+'], accents: [0.95, 0.55, 0.9, 0.55, 0.92, 0.7] };
    const gMul = Number(opts.guitarGainMul ?? 1);
    const OFF16 = ['1/16', '3/16', '5/16', '7/16', '9/16', '11/16', '13/16', '15/16'];
    GFIGS.chop16 = { name: 'citypop-chop16', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: false,
      onsets: OFF16, figure: Array(8).fill('3.5.R+'), accents: [0.75, 0.6, 0.8, 0.6, 0.78, 0.6, 0.82, 0.62] };
    GFIGS.strum8 = { name: 'citypop-strum8', bars: 1, grid: 16, class: 'comp', meter_class: '4/4', legato: true,
      onsets: EIGHTHS, figure: Array(8).fill('R.3.5.R+'), accents: [0.9, 0.62, 0.78, 0.62, 0.86, 0.62, 0.78, 0.66] };
    const letterOf = (sec) => String(mf.sections.find((x) => x.index === sec.index)?.letter ?? 'A').replace('*', '');
    const leadSecs = form.sections.filter((sec) => sec.lead !== 'none');
    const onlyA = leadSecs.every((sec) => letterOf(sec) === 'A');
    let aCount = 0;
    const roleOf = form.sections.map((sec) => {
      if (sec.lead === 'none') return null;
      if (gMode === 'arp' || gMode === 'ballad') return 'arp';
      const L = letterOf(sec);
      if (onlyA) return (aCount++ % 2 === 0) ? 'verse' : 'chorus';
      // r35: the bridge letters (C, D, ...) take the second chorus figure
      return L === 'A' ? 'verse' : (stacc && MAIN && gMode === 'main' && L !== 'B') ? 'chorus2' : 'chorus';
    });
    const verseFig = fnv(`${name}|guitar-verse`) % 3 === 0 ? 'gallop' : 'mute8';
    const CLEAN = 'gm_electric_guitar_clean', MUTED = 'gm_electric_guitar_muted', OD = 'gm_overdriven_guitar';
    const parts = gMode === 'arp' || gMode === 'ballad'
      // the ballads' leadGain is ~0.47: at [0.34, 0.44] x leadGain the arpeggio
      // rendered at velocity ~20/127 and the sampler's velocity curve + filter
      // put the stem at -74 dB RMS (measured: inaudible, the balance stage
      // clamped). [0.62, 0.8] x leadGain = 0.29-0.38 — still under the lead
      ? [{ key: 'arp', fig: GFIGS.arp, sound: CLEAN, gain: gMode === 'ballad' ? [0.8, 0.95] : [0.62, 0.8], fx: '.room(0.35)', oct: 2 }]
      : gMode === 'citypop'
        ? [{ key: 'verse', fig: GFIGS.chop16, sound: CLEAN, gain: [0.5, 0.62], fx: '.room(0.22)', oct: 3 },
           { key: 'chorus', fig: GFIGS.strum8, sound: CLEAN, gain: [0.55, 0.68], fx: '.room(0.25)', oct: 3 }]
        : stacc
          ? [{ key: 'verse', fig: GFIGS[verseFig], sound: MUTED, gain: MAIN ? [0.55, 0.68] : [0.4, 0.5], fx: '.room(0.06)', oct: 2 },
             { key: 'chorus', fig: GFIGS.chug_oct, sound: MUTED, gain: MAIN ? [0.66, 0.8] : [0.46, 0.58], fx: '.room(0.08)', oct: 2 },
             ...(MAIN ? [{ key: 'chorus2', fig: GFIGS.push332, sound: MUTED, gain: [0.66, 0.8], fx: '.room(0.08)', oct: 2 }] : [])]
          : [{ key: 'verse', fig: GFIGS[verseFig], sound: MUTED, gain: MAIN ? [0.55, 0.68] : [0.4, 0.5], fx: '.room(0.12)', oct: 2 },
             { key: 'chorus', fig: GFIGS.open8, sound: OD, gain: MAIN ? [0.66, 0.8] : [0.46, 0.58], fx: '.room(0.18)', oct: 2 }];
    const cast = [];
    for (const p of parts) {
      const bars = form.sections.flatMap((sec, i) => Array(sec.bars).fill(roleOf[i] === p.key ? 1 : 0));
      if (!bars.some(Boolean)) continue;
      const gr = [Math.round(p.gain[0] * leadGain * gMul * 100) / 100, Math.round(p.gain[1] * leadGain * gMul * 100) / 100];
      const bindG = (ctx) => bindFigure(p.fig, ctx, v.meter, { sound: p.sound, octave: p.oct, loopRoots: true, gainRange: gr, fx: p.fx }).expr;
      extraParts.push(...varySplit(bindG, bars));
      extraSolos[`_guitar_${p.key}`] = bindG(ctxBar);
      cast.push(`${p.key} ${p.fig.name} on ${p.sound} (${bars.filter(Boolean).length} bars, gain ${gr[0]}-${gr[1]})`);
    }
    if (MAIN) {
      // the guitar's MELODY parts: bindMelody on the lead's own cells (the
      // bindLetterDbl option set), an octave under the lead when the lead sits
      // high (the library plays B1-D6), on the mode's lead-guitar voice
      const gSound = gMode === 'main' ? (stacc ? MUTED : OD) : CLEAN;
      const gOct = Math.min(leadOctave, 4);
      const gMel = (L, stmt, gain, ctx) => bindMelody(letterCell(L), ctx, v.meter, {
        style: 'toby-fox', seed: letterSeed(L, stmt), octave: gOct, sound: gSound, fx: `${gainFx(String(gain))}.room(${gMode === 'main' ? 0.2 : 0.3})`,
        hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: false, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(), ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
      }).expr;
      // intro riff: the leading run of no-lead sections plays the A hook
      const introBars = [];
      let inIntro = true;
      for (const sec of form.sections) { if (sec.lead !== 'none') inIntro = false; introBars.push(...Array(sec.bars).fill(inIntro ? 1 : 0)); }
      // the riff takes at most the LAST 8 intro bars: a 16-bar ballad intro
      // (51 s at 75 bpm) opens on the arpeggio alone, then the hook, then the
      // voice — an anime-OP intro states the hook once, it does not loop it
      { let n = 0; for (let i = introBars.length - 1; i >= 0; i--) if (introBars[i]) { if (++n > 8) introBars[i] = 0; } }
      if (introBars.some(Boolean) && form.sections.some((s) => s.lead !== 'none')) {
        const rg = Math.round(0.82 * leadGain * gMul * 100) / 100;
        extraParts.push(...varySplit((ctx) => gMel('A', 0, rg, ctx), introBars));
        extraSolos._guitar_riff = gMel('A', 0, rg, ctxBar);
        cast.push(`intro riff: the A hook on ${gSound} over ${introBars.filter(Boolean).length} intro bars (gain ${rg})`);
      }
      // final chorus: the guitar joins the voice in unison (an octave under)
      const lastIx = form.sections.map((s, i) => (s.lead !== 'none' ? i : -1)).filter((i) => i >= 0).pop();
      if (lastIx != null) {
        const lastSec = form.sections[lastIx];
        const L = letterOf(lastSec);
        const dblBars = form.sections.flatMap((sec, i) => Array(sec.bars).fill(i === lastIx ? 1 : 0));
        const dg = Math.round((gMode === 'main' ? 0.6 : 0.5) * leadGain * gMul * 100) / 100;
        const stmt = form.sections.slice(0, lastIx + 1).filter((s) => s.lead !== 'none' && letterOf(s) === L).length - 1;
        extraParts.push(...varySplit((ctx) => gMel(L, Math.max(0, stmt), dg, ctx), dblBars));
        extraSolos._guitar_double = gMel(L, Math.max(0, stmt), dg, ctxBar);
        cast.push(`final-chorus double: ${gSound} in unison with the voice (${L}, ${lastSec.bars} bars, gain ${dg})`);
      }
    }
    if (cast.length) extraInfo.push(`electric guitar (r34, ${MAIN ? `${gMode.toUpperCase()} — the guitar is the main thing` : 'J-rock layer under the voice'}${stacc ? '; r35 staccato: palm-muted throughout, chorus = octave chug / 3+3+2 push by letter' : ''}${gMul !== 1 ? `; gain x${gMul}` : ''}): ${cast.join('; ')}`);
  }

  // (b4b) r16 WOBBLE TEXTURE. His desert-ornament note, verbatim: "a and b are
  // good, like the string wobble texture for c - it conveys tension and can
  // also be used outside of desert too. I think c would be good if there's a
  // bit more tension".
  //
  // Three things follow from that sentence and all three are here. (1) The
  // TEXTURE ships, not just the melodic ornament. (2) It is not desert-only —
  // opts.wobble opens it to any lane. (3) MORE TENSION, bought without
  // breaking the whisper law: the demo oscillated one degree against its own
  // chromatic neighbour, so there was one semitone rub; this PINCERS the
  // octave root from both sides (~11 below, ~13 above), which is two rubs and
  // the same device as the choir pincer and as the b6-5 ostinato that carries
  // Boiler Mushi. The gain does rise, 0.075-0.085 -> [0.09, 0.16], but the top
  // still lands under the counterline's measured 0.162 floor, so support stays
  // under the lead (D77). The P4 partner is his parallel-fourths ruling —
  // "I approve of both ... I don't want to hardcode anything" — used here as
  // colour on one device rather than as a global.
  const wobbleOn = opts.wobble ?? (!priorKeep && env === 'desert');
  if (wobbleOn) {
    const wobFig = {
      name: 'wobble-pincer', bars: 1, grid: 8, class: 'sustain', meter_class: '4/4', legato: true,
      onsets: ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
      figure: ['~11.~16', '~13.~18', '~11.~16', '~13.~18', '~11.~16', '~13.~18', '~11.~16', '~13.~18'],
      accents: [0.85, 0.5, 0.7, 0.5, 0.8, 0.5, 0.7, 0.5],
    };
    // interior sections only — the same dosing the manor rub uses, so the
    // device arrives rather than being wallpaper
    const wobBars = form.sections.flatMap((sec, i) => Array(sec.bars).fill(i > 0 && i < form.sections.length - 1 ? 1 : 0));
    if (wobBars.some(Boolean)) {
      const wobSound = typeof opts.wobble === 'string' ? opts.wobble : 'gm_string_ensemble_1';
      const bindWob = (ctx) => bindFigure(wobFig, ctx, v.meter, { sound: wobSound, octave: 3, loopRoots: true, gainRange: [0.09, 0.16], fx: '.clip(0.45).room(0.3)' }).expr;
      extraParts.push(...varySplit(bindWob, wobBars));
      extraSolos._wobble = bindWob(ctxBar);
      extraInfo.push(`wobble: ${wobSound} P4 dyad pincering the root a semitone either side, interior sections (whisper)`);
    }
  }

  // (b5) r14 JUNGLE BASS (happy_jungle: "the bass doesn't work" — the slap
  // bounce; env-desert-jungle.md §5: jungle bass is ROUND and tumbao-shaped):
  // root on 1, fifth on the and-of-2, octave on 4, warm synth bass.
  if (env === 'jungle' && !priorKeep && drumBarsShared && !accToBass) {
    const jbFig = {
      name: 'jungle-tumbao', bars: 1, grid: 8, class: 'dance_bass', meter_class: '4/4', legato: false,
      onsets: ['0', '3/8', '3/4'], figure: ['R', '5', 'R+'], accents: [0.9, 0.7, 0.85],
    };
    // pocket seating (verify catch: the B-rooted jungle bass seated at B2 and
    // nearest-motion walked its roots to octave 3 — half the loop had no low
    // end; a high tonic drops the device an octave into the E1-B1 pocket)
    const bindJb = (ctx) => bindFigure(jbFig, ctx, v.meter, { sound: 'gm_synth_bass_1', octave: tonicPc >= 5 ? 1 : 2, loopRoots: true, gainRange: [0.5, 0.8], fx: '.clip(0.95).room(0.1)' }).expr;
    extraParts.push(...varySplit(bindJb, drumBarsShared));
    extraSolos._jungle_bass = bindJb(ctxBar);
    extraInfo.push('jungle bass: gm_synth_bass_1 round tumbao R/5/R+ under the drums');
  }

  // (c) ambience beds — his horror pack, sorted per his note: loops are
  // background beds ("soft white noise basically"), complement not
  // spotlight, "use this sometimes only if it fits" (a third of songs roll
  // none). Keyed beds only join songs in their key. Each trigger plays the
  // file once through; re-triggers every ~file-length bars.
  const AMB_POOLS = {
    manor: ['hx_amb_static', 'hx_amb_atmo', 'hx_amb_haunt_am', 'hx_amb_haunt_dm', 'hx_amb_mountain', 'hx_amb_future'],
    catacombs: ['hx_amb_industrial', 'hx_amb_tv', 'hx_amb_future'],
  };
  const ambPick = opts.ambience === false ? null
    : (opts.ambience?.bed ?? (() => {
      const tonicPc = String(v.keyHint).toLowerCase();
      const pool = (AMB_POOLS[env] ?? []).filter((n) => !SAMPLE_PACK[n].keyNote || SAMPLE_PACK[n].keyNote === tonicPc);
      if (!pool.length || fnv(`${name}|amb`) % 3 === 2) return null;
      return pool[fnv(`${name}|ambbed`) % pool.length];
    })());
  if (ambPick) {
    const ambE = SAMPLE_PACK[ambPick];
    const K = Math.max(4, Math.round((ambE.durS * 0.95) / barSec));
    const ambG = opts.ambience?.gain ?? (0.14 + (fnv(`${name}|ambg`) % 5) / 100);
    const ambExpr = `s("${ambPick}").gain(${ambG})${K > 1 ? `.slow(${K})` : ''}`;
    fxParts.push(ambExpr);
    extraSolos._ambience = ambExpr;
    extraInfo.push(`ambience bed: ${ambPick} re-triggered every ${K} bars at ${ambG}`);
  }

  // (d) one-shot fx — his sorting: risers/crow/growl/stabs play ONCE. Dosing
  // per research/env-horror.md: stingers event-tied and rare, never on a
  // predictable grid. Risers END on their target downbeat.
  {
    const hits = [];
    if (env === 'manor') {
      const pool = ['hx_crow', 'hx_growl', 'hx_stab_strings'];
      const nHits = 1 + (fnv(`${name}|fxn`) % 2);
      for (let i = 0; i < nHits; i++) {
        const snd = pool[fnv(`${name}|fx${i}`) % pool.length];
        const atBar = 4 + (fnv(`${name}|fxb${i}`) % Math.max(1, T_ALL - 12)) + i * 3;
        hits.push({ snd, atBar, gain: 0.26 });
      }
    }
    // the reel transition grammar (battle reels: a riser ENDS on the section
    // boundary, an impact lands ON its downbeat) — opts.riserReentry asks for
    // it anywhere a breakdown exists.
    //
    // r19/D100 — IT IS NO LONGER A CATACOMBS DEFAULT. His ruling, verbatim: "i
    // dont think there should be a drop in catacombs. like before the drop, it
    // sounds good and atmospheric and then it sounds like a discoball after the
    // drop with happy violins and happy piano and happy everything. it should
    // just be the beginning and ambiant horror". A riser that swells into a
    // wardrum impact on the downbeat IS a drop — it is the dance grammar, and
    // D93 filed catacombs as the ACTION lane on my reading, not his. He has now
    // said twice in one session that what he likes in these songs is the part
    // before the tune arrives. The lane moves to ambience: no drop, and the
    // lead thins to a fragment (SONG_OPTS below).
    if (opts.riserReentry && bdReentryBar != null && bdReentryBar < T_ALL) {
      // r18/D99 — align the riser by its AUDIBLE end, not the file end (see
      // audibleS in sample-pack-def.js): the 0.34s of trailing quiet in the file
      // was being scheduled as if it were sound, so the swell finished 0.34s
      // early and left a hole before the impact.
      const riserS = SAMPLE_PACK.hx_riser?.audibleS ?? SAMPLE_PACK.hx_riser?.durS ?? 4.6;
      hits.push({ snd: 'hx_riser', atBar: Math.max(0, bdReentryBar - riserS / barSec), gain: 0.32 });
      hits.push({ snd: 'vc_wardrum', atBar: bdReentryBar, gain: 0.9 });
    }
    // r18/D99 — the citadel gong is GONE. It fired on all four citadel songs at
    // the same place and he rejected it on three of them in one pass, twice in
    // identical words: "the random gong in the middle also doesn't fit the vibe
    // at all" (somber_citadel, tense_citadel), "also gong doesn't fit either"
    // (triumphant_citadel). Nothing defended it. A one-shot that lands in the
    // same spot in every song of a lane is the uniformity he keeps naming, and
    // this one was not even earning its place. Still reachable per song through
    // opts.fxHits if a card ever asks for it.
    if (opts.citadelGong && env === 'citadel' && form.sections.length > 1) {
      hits.push({ snd: 'vc_gong', atBar: sectionStartBar[form.sections.length - 1], gain: 0.55 });
    }
    // r16 (scary-voices: ["guitars"] — "just use the guitars"). One clipped
    // S.C.A.R.Y. stab at the last section start, the same dosing citadel gives
    // its gong. TIMBRAL, so it costs nothing against the one-harmonic-device
    // law; the crunch is the point and he chose it over the cackle and the
    // ghost-choir shimmer.
    if (env === 'catacombs' && !priorKeep && form.sections.length > 1) {
      hits.push({ snd: 'hx_gtr_stab', atBar: sectionStartBar[form.sections.length - 1], gain: 0.5 });
    }
    const hitExprs = [];
    for (const h of [...(opts.fxHits ?? []), ...hits]) {
      const atBar = Math.round((h.atBar ?? 0) * 1000) / 1000;
      const hx = `s("${h.snd}").gain(${h.gain}).slow(${T_ALL})${atBar ? `.late(${atBar})` : ''}`;
      hitExprs.push(hx);
      fxParts.push(hx);
      extraInfo.push(`fx: ${h.snd} once at bar ${Math.round(atBar * 10) / 10} (gain ${h.gain})`);
    }
    if (hitExprs.length) extraSolos._fx = hitExprs.length === 1 ? hitExprs[0] : `stack(${hitExprs.join(', ')})`;
  }

  // (e) melody double — his cave/snow note: "the melody in the right hand
  // piano is a bit too soft and ... doesn't belong as a piano only section.
  // maybe introduce a different element on top of the piano rh that plays
  // the melody too (different from the flute)". Same cells, same seeds, same
  // hold/merge — the (time,midi) multiset is the piano melody's; only the
  // voice and gain differ. Purely additive on the two kept songs.
  let melodyDoubleExpr = null;
  if (opts.melodyDouble) {
    const md = opts.melodyDouble;
    const mdGain = Math.round(leadGain * (md.gainMul ?? 0.45) * 100) / 100;
    const bindLetterDbl = (L, ctxL, stmt = 0) => vocalWriterOn ? writerBind(L, ctxL, stmt, { octave: md.octave ?? leadOctave, sound: md.sound, fx: `${gainFx(mdGain)}.room(0.4)` }) : bindMelody(letterCell(L), ctxL, v.meter, {
      style: 'toby-fox', seed: letterSeed(L, stmt), octave: md.octave ?? leadOctave, sound: md.sound, fx: `${gainFx(mdGain)}.room(0.4)`,
      hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(), ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    });
    melodyDoubleExpr = renderLetterLead(form, mfx, (L, stmt) => {
      const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
      return bindLetterDbl(base0, L.endsWith('*') ? ctxBarV : ctxBar, stmt).expr;
    }, { perStatement: leadStmtVary, phraseBars: leadPhraseBars }).lead;
    if (melodyDoubleExpr) {
      extraSolos._melody_double = melodyDoubleExpr;
      extraInfo.push(`melody double: ${md.sound} rides the piano RH melody at ${mdGain} (his cave/snow note)`);
    }
  }

  // ---- the COMPANION melody (r18/D99) --------------------------------------
  // His loudest ask of the round, on five cards, and once in exasperation:
  // "I want more layers with their own melody man that's what ive been saying"
  // (triumphant_citadel). The clearest statement is excited_fight's: "there
  // should still be an alternate melody singing along with the main piano
  // melody of another instrument the supports it while being different. this is
  // something that should be abstracted to other songs too."
  //
  // MEASURE FIRST (the standing lesson): the arranger has had `counter_melody`
  // and `alternate_melody` parts since D47, so this looked like a dial. It was
  // not. Counted on the judged build: 29 of 43 songs carried NEITHER, and nine
  // of the eleven songs where he asked for it had exactly zero. The roles exist
  // but the role-slate hash almost never casts them — counter_melody was 3 of
  // 108 cast layers suite-wide.
  //
  // So the companion is a generator layer beside the counterline and descant,
  // not a slate entry: it rebinds the LEAD'S OWN CELL with `companion: true`,
  // which keeps the rhythm and phrasing and moves every pitch to a chord tone
  // underneath. Under the lead by construction (D77) and under it in gain.
  let companionExpr = null;
  {
    const castHasOwnMelody = shaped.layers.some((l) => l.derives === 'lead-rhythm' || l.derives === 'independent');
    const companionOn = opts.companion ?? (!priorKeep && !opts.grammarPin && !castHasOwnMelody);
    if (companionOn) {
      const cfg = typeof opts.companion === 'object' ? opts.companion : {};
      // never the lead's own voice, never a choir (D93's G4 gender seam wants a
      // written line, not a harmonised one), and never the salon pool in a
      // serious lane — the same law the handoff pool follows.
      // r18 verify catch: no FLUTE in these pools. A companion sits BELOW the
      // melody by construction, so a high-register voice is the wrong choice on
      // purpose — measured, the flute companion put 10 notes under the bottom of
      // its own patch, and folding those up an octave would have pushed them
      // OVER the lead, inverting the one rule this layer must keep (D77).
      const POOL = (!priorKeep && env === 'desert') ? ['gm_oboe', 'gm_shanai', 'gm_sitar']
        // r19/D100: the VIOLIN leaves this pool. Dropping the melody_backup
        // freed its voice from castSounds, which re-rolled `free` and handed
        // scary_catacombs, x_catacombs, tense_citadel and somber_manor a violin
        // companion — the exact instrument he has now rejected on four cards
        // ("the sharp violins hurt my ears and don't belong"). The viola is the
        // bowed voice that is not sharp.
        : (!priorKeep && laneHorror) ? ['gm_cello', 'gm_church_organ', 'gm_viola']
          // r19/D100: the clarinet leaves the jungle pool — happy_jungle's note
          // names the concert winds as the thing that does not belong there
          : (!priorKeep && env === 'jungle') ? ['gm_kalimba', 'gm_marimba', 'gm_vibraphone', 'gm_pad_warm']
            : ['gm_clarinet', 'gm_vibraphone', 'gm_epiano1'];
      const castSounds = new Set(rendered.layers.map((l) => l.instrument));
      // r19/D100: and never the ACCOMPANIMENT's voice either. castSounds only
      // holds planner layers, so the acc hand was invisible to this filter and
      // both jungle songs landed the companion on gm_marimba — the same voice
      // their acc already plays, 40 and 54 attacks of it exactly simultaneous.
      // A layer whose whole purpose is "its own melody, audibly its own" is
      // worth nothing in the accompaniment's own timbre.
      // the lead and the acc are HARD exclusions — they are the two loudest,
      // most continuous voices, and a companion hidden inside either is not a
      // layer. A quiet support layer is a soft one: if honouring it would leave
      // no voice at all the companion shares with it rather than going silent,
      // because a song losing the layer entirely is the worse outcome.
      const hard = new Set([LEAD_SOUND, accVoiceFor(accFig)]);
      // r21 A/B build, corpus insight I2 (opts.companionFamilySplit): 69.3% of
      // corpus second lines — and 85.9% of the pairs that TRADE phrases —
      // declare a different GM family than the lead. D102's ruling is that
      // register and timbre separate a layer and rhythm does not, and this is
      // the timbre half of it. Asked of the DECLARED family
      // (INSTRUMENTS[...].family), never of a name list: that shape has now
      // failed five times. Soft, like castSounds — sharing a family beats
      // losing the layer.
      const leadFam = INSTRUMENTS[LEAD_SOUND]?.family;
      const famOK = (s) => !opts.companionFamilySplit || !leadFam || INSTRUMENTS[s]?.family !== leadFam;
      const strict = POOL.filter((s) => !hard.has(s) && !castSounds.has(s) && famOK(s));
      const loose = POOL.filter((s) => !hard.has(s) && famOK(s));
      const free = strict.length ? strict : loose.length ? loose : POOL.filter((s) => !hard.has(s));
      const pick = cfg.sound ?? (free.length ? free[fnv(`${name}|companion`) % free.length] : null);
      if (pick) {
        const cSound = opts.fullSynth ? SYNTH_OF(pick) : pick;
        // his separation note (excited_fight: "soft harmony and then really
        // loud melody - big separation ... this is too much"). A companion is a
        // MELODY, not support, so it does not sit in the counterline's whisper
        // band — but it stays clearly under the lead, which is what D77 asks.
        const cGain = Math.round(leadGain * (cfg.gainMul ?? 0.6) * 100) / 100;
        // r18 verify catch, second pass: curating the POOL by instrument was the
        // wrong lever — swapping the flute out for a cello moved the problem
        // rather than fixing it (goofy_casino's cello companion put 98 notes
        // under its patch). The companion follows leadOctave, so a
        // range-limited voice needs the same cap the LEAD gets, for the same
        // reason. Cap by the instrument, not by the pool.
        // r19/D100: and that cap was STILL a name list — the fourth failure of
        // that shape in two rounds. Adding the vibraphone to the jungle pool
        // put 46 of mysterious_jungle's companion notes outside the patch,
        // because `vibraphone` is not in the regex and never would have been
        // until an ear or a render log found it. Every INSTRUMENTS entry
        // already declares its own `range` in octaves; ask the data.
        const cRange = INSTRUMENTS[cSound]?.range;
        const cOct = cfg.octave
          ?? (cRange ? Math.max(cRange[0], Math.min(leadOctave, cRange[1] - 1))
            : leadOctave);
        // r35: under the vocal writer the companion is the writer's own line a
        // diatonic THIRD below (the corpus's verse texture: one counter-note a
        // 3rd/4th under the voice, rhythm-locked; strong beats snap to chord
        // tones through the guard)
        const bindComp = (L, ctxL, stmt = 0) => vocalWriterOn ? writerBind(L, ctxL, stmt, { octave: cOct, sound: cSound, fx: `${gainFx(cGain)}.room(0.4)`, shift: -2 }) : bindMelody(letterCell(L), ctxL, v.meter, {
          style: 'toby-fox', seed: letterSeed(L, stmt), octave: cOct, sound: cSound,
          fx: `${gainFx(cGain)}.room(0.4)`,
          // `hold` MUST be the lead's own value for this letter, not the song
          // default: a sustaining lead voice sets it true per letter, and taking
          // the default instead made the companion's note-merging diverge from
          // the lead's. Measured before the fix: the two lines disagreed on 64
          // of 1362 shared attacks badly enough that the companion sat ABOVE
          // the melody, which is precisely the D77 inversion this layer must
          // never make. It is a harmony line — it has to ride the same rhythm.
          hold: /flute|cello|violin|oboe|shanai|organ|choir/.test(letterSound(L)) ? true : LEAD.hold,
          mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore,
          tailOff: grammarFresh, leapFold: grammarFresh, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(),
          // chordTop is OFF here: the lead is already a two-note chord on its
          // longest note, and thickening the companion too would put four
          // sounding pitches on that attack from two instruments.
          companion: true,
          // r22 · L2: oblique motion is the PLURALITY pair relation in the
          // reference set (27.8%, over parallel 24.7% / contrary 20.9% /
          // similar 19.9%), and a companion that re-picks under every lead
          // note cannot produce it at all.
          obliqueCompanion: opts.obliqueCompanion === true,
          ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
        });
        companionExpr = renderLetterLead(form, mfx, (L, stmt) => {
          const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
          return bindComp(base0, L.endsWith('*') ? ctxBarV : ctxBar, stmt).expr;
        }, { perStatement: leadStmtVary, phraseBars: leadPhraseBars }).lead;
        if (companionExpr) {
          extraSolos._companion = companionExpr;
          extraInfo.push(`companion melody: ${cSound} sings the lead's rhythm on its own chord tones underneath, at ${cGain}`);
        }
      }
    }
  }

  // ==========================================================================
  // r22 — THREE LAYERING DEVICES READ OFF HIS HAND-PICKED MIDI (26 files).
  //
  // His ask: "i only want these specific layering techniques to basically stack
  // on top of the current engine stuff". So each is an opt with no default —
  // the 47 judged songs cannot move — and each is a layer ADDED beside the
  // existing cast rather than a replacement for any of it.
  //
  // Every statistic below is taken inside each file's STEADY SECTION, not the
  // whole file, per his caution that "some songs are abstract or have specific
  // quirks". The core window is the longest stretch where the set of sounding
  // parts holds still at full strength; whole-file averages made the Sm4sh menu
  // (a fifteen-part MEDLEY, each part covering 3% of the file) read like a
  // sparse arrangement, which is a fact about the format and not about music.
  const layerFam = (snd) => INSTRUMENTS[snd]?.family ?? null;
  const otherFamily = (pool, avoid) => {
    const fams = new Set(avoid.map(layerFam).filter(Boolean));
    const free = pool.filter((x) => !avoid.includes(x) && !fams.has(layerFam(x)));
    return free.length ? free : pool.filter((x) => !avoid.includes(x));
  };
  const ECHO_POOL = laneHorror ? ['gm_viola', 'gm_cello', 'gm_pad_metallic']
    : env === 'desert' ? ['gm_oboe', 'gm_shanai', 'gm_pan_flute']
      : env === 'jungle' ? ['gm_kalimba', 'gm_marimba', 'gm_vibraphone']
        : ['gm_vibraphone', 'gm_clarinet', 'gm_epiano1', 'gm_music_box'];

  // ---- L1 · THE ECHO LAYER (opts.echoLayer) --------------------------------
  // 16 of 26 files carry a pair where one part is a CONSTANT-LAG copy of
  // another — 13.5% of all measured pairs. The lag is quantised and clusters:
  // 2 beats (14 pairs), 0.5 (9), 1.5 (8), 1 (7), 0.75 (6). It is not a reverb
  // and not a doubling: the copy sits on a DIFFERENT instrument, quieter, and
  // it lands in the lead's own gaps, which is why it thickens a line without
  // making it louder. Strudel's .late() takes CYCLES and one cycle is one bar,
  // so the beat lag is divided by the meter.
  let echoExpr = null;
  if (opts.echoLayer && rubOk('echo')) {
    const cfg = typeof opts.echoLayer === 'object' ? opts.echoLayer : {};
    const LAGS = [2, 0.5, 1.5, 1, 0.75];            // measured, most common first
    // ---- r24 · AN ECHO THAT CROSSES A CHORD CHANGE IS DISSONANT BY
    // CONSTRUCTION. HIS EAR, three cards: "the harmonica or whatever sounds
    // dissonant from the main melody" (su_happy_shop), "the clarinet or whatever
    // hit some weird notes that changed the vibes" (su_excited_casino), "the
    // clarinet or whatever is sometimes a bit too dissonant" (su_calm_menu) —
    // and the summary line, "you do a dissonance pass and randomly add
    // dissonance at certain places".
    //
    // The echo is a delayed COPY of the lead. Delay it past a chord boundary and
    // the copied pitch sounds against a chord that was never chosen for it. That
    // is not a taste call, it is arithmetic: measured 34.8% non-chord tones on
    // 28 of 28 songs, and the longest lags are the ones that cross.
    //
    // So the lag is bounded by how fast the harmony moves. On a song changing
    // chords every bar, only lags that stay inside a beat survive; a slower
    // harmony can carry the long 2-beat lag the reference set prefers.
    const beatsPerChord = (v.meter === '4/4' ? 4 : 3) * (plan4 ? Math.min(...plan4) : 1);
    const safeLags = LAGS.filter((x) => x <= Math.max(0.5, beatsPerChord / 2));
    const lagPool = safeLags.length ? safeLags : [0.5];
    const lagBeats = cfg.lagBeats ?? lagPool[fnv(`${name}|echolag`) % lagPool.length];
    const pool = otherFamily(ECHO_POOL, [LEAD_SOUND, accVoiceFor(accFig), sparkleSound].filter(Boolean));
    const pick = cfg.sound ?? pool[fnv(`${name}|echo`) % pool.length];
    const eSound = opts.fullSynth ? SYNTH_OF(pick) : pick;
    const eRange = INSTRUMENTS[eSound]?.range;
    const eOct = cfg.octave ?? (eRange ? Math.max(eRange[0], Math.min(leadOctave, eRange[1] - 1)) : leadOctave);
    // measured on the reference pairs: the copy is a SHADOW, well under the
    // line it follows. Never at lead gain — that is a doubling, and D100's
    // melody_backup ruling is exactly what a loud copy sounds like.
    const eGain = Math.round(leadGain * (cfg.gainMul ?? 0.35) * 100) / 100;
    const bindEcho = (L, ctxL, stmt = 0) => bindMelody(letterCell(L), ctxL, v.meter, {
      style: 'toby-fox', seed: letterSeed(L, stmt), octave: eOct, sound: eSound,
      fx: `${gainFx(eGain)}.room(0.5)`,
      hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor,
      cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh,
      minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(),
      ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    });
    const raw = renderLetterLead(form, mfx, (L, stmt) => {
      const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
      return bindEcho(base0, L.endsWith('*') ? ctxBarV : ctxBar, stmt).expr;
    }, { perStatement: leadStmtVary, phraseBars: leadPhraseBars }).lead;
    if (raw) {
      // .late() takes CYCLES and one cycle is one bar, so the beat lag is
      // divided by the METER's beat count. `v.beats` does not exist — the
      // vibe carries `meter`, and `beats` is derived from it above. Reading
      // the wrong one emitted `.late(NaN)`, which Strudel accepted silently
      // and which produced an echo layer that never sounded: 0 of 16.
      echoExpr = `(${raw}).late(${+(lagBeats / beats).toFixed(4)})`;
      // ---- r26 · THE r24 LAG BOUND WAS THE WRONG INEQUALITY ------------------
      // D-entry above bounds the lag by `lag <= beatsPerChord / 2` so a copied
      // note cannot sound against a chord that was never chosen for it. That
      // cannot work, and the arithmetic says why: ANY positive lag carries every
      // note within `lag` of a chord's end across the boundary. Halving the lag
      // halves how many notes cross; it never reaches zero.
      //
      // MEASURED on the shipped suite, before this fix: 784 of 3292 echo notes
      // (23.8%) land in a later bar than their source, and the rate tracks the
      // lag exactly — 0-23% at 0.5 beats, 25-31% at 0.75, 28-48% at 1.5-2.0.
      // su_happy_shop was the worst at 48%, and his card on that very song reads
      // "the harmonica or whatever sounds dissonant from the main melody".
      //
      // The fix is not a smaller lag, it is a REST. A note whose delayed onset
      // would land under a different chord is dropped, which keeps the layer a
      // true copy of the lead instead of a transposed guess — the same law the
      // companion already follows ("a note with no tone available under it
      // becomes a REST", D100) — and makes the echo sparser, which is what the
      // reference set does anyway (57.5% of its parts stop for at least a bar).
      //
      // Implemented as a bar-keyed mask: on a bar whose chord differs from the
      // previous bar's, the first `lagBeats` are gated off; every other bar is
      // untouched. Weights are scaled to integers because a fractional `@` in
      // mini-notation is not worth trusting.
      if (ruleFresh(26) && lagBeats > 0 && Array.isArray(barSyms) && barSyms.length) {
        const W = 4;                                   // quarter-beat resolution
        const head = Math.round(lagBeats * W);
        const tail = Math.round(beats * W) - head;
        if (head > 0 && tail > 0) {
          // THE MASK MUST READ THE HARMONY THAT ACTUALLY PLAYS, not the base
          // loop. First cut keyed on `barSyms` alone and left 158 crossings on
          // 13 songs — every one of them a song with a BRIDGE, where the B
          // sections run `ctxBarV`'s own progression and change chords on bars
          // the base loop does not. Measured: 23.8% -> 5.9% with the base loop,
          // and the residual was 100% bridge bars plus one pinned song.
          const symAt = (i) => ((varyBars[i] && ctxBarV?.harmony?.length)
            ? ctxBarV.harmony[i % ctxBarV.harmony.length]
            : barSyms[i % barSyms.length]);
          const cells = [];
          for (let i = 0; i < form.totalBars; i++) {
            const sym = symAt(i);
            const prev = i === 0 ? null : symAt(i - 1);
            cells.push(sym !== prev ? `[0@${head} 1@${tail}]` : '1');
          }
          const crossings = cells.filter((c) => c !== '1').length;
          echoExpr = `(${echoExpr}).mask("<${cells.join(' ')}>")`;
          extraInfo.push(`echo chord-guard: the first ${lagBeats} beat(s) of each chord CHANGE are gated off `
            + `so a delayed note never sounds under a chord it was not written for (r26 — measured 23.8% of `
            + `echo notes crossed; ${crossings} of ${form.totalBars} bars gated)`);
        }
      }
      extraSolos._echo = echoExpr;
      extraInfo.push(`echo layer: ${eSound} repeats the lead ${lagBeats} beat(s) later at ${eGain} (r22 — 16 of 26 reference files carry one)`);
    }
  }

  // ---- L5 · THE OCTAVE PARTNER (opts.octaveDouble) -------------------------
  // 34.8% of every simultaneous interval in the reference set is a unison or an
  // octave — the single largest class, ahead of P5 10.3% and P4 10.0%, and
  // ahead of thirds+sixths combined (23.3%). The engine currently FORBIDS this:
  // the companion rejects a candidate whose pitch class matches the lead's,
  // calling it "a doubling, not a chord". That is the right rule for the
  // companion, which is meant to be its own line — but it left the engine with
  // no octave partner at all, and the reference material leans on one.
  // It goes BELOW (D77: nothing sits over the lead) on a different family.
  let octaveExpr = null;
  if (opts.octaveDouble && !laneHorror) {
    const cfg = typeof opts.octaveDouble === 'object' ? opts.octaveDouble : {};
    // r24: the sparkle's voice is excluded here too, for the same measured
    // reason as the echo above. The `...(echoExpr ? [] : [])` was a no-op either
    // way and is left as it was — the echo's own voice is a separate question
    // his notes have not raised.
    const pool = otherFamily(ECHO_POOL, [LEAD_SOUND, accVoiceFor(accFig), sparkleSound].filter(Boolean));
    const pick = cfg.sound ?? pool[fnv(`${name}|oct8`) % pool.length];
    const oSound = opts.fullSynth ? SYNTH_OF(pick) : pick;
    const oRange = INSTRUMENTS[oSound]?.range;
    const want = leadOctave - 1;
    const oOct = cfg.octave ?? (oRange ? Math.max(oRange[0], Math.min(want, oRange[1] - 1)) : want);
    const oGain = Math.round(leadGain * (cfg.gainMul ?? 0.4) * 100) / 100;
    const bindOct = (L, ctxL, stmt = 0) => vocalWriterOn ? writerBind(L, ctxL, stmt, { octave: leadOctave, sound: oSound, fx: gainFx(oGain) }) : bindMelody(letterCell(L), ctxL, v.meter, {
      // the LEAD's octave, deliberately: same seed + same cell + same context =
      // the same pitches. The transposition happens on the pattern below, so
      // the interval is an exact octave by construction rather than by luck.
      style: 'toby-fox', seed: letterSeed(L, stmt), octave: leadOctave, sound: oSound,
      fx: gainFx(oGain),
      hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor,
      cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh,
      minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(),
      ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    });
    const octRaw = renderLetterLead(form, mfx, (L, stmt) => {
      const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
      return bindOct(base0, L.endsWith('*') ? ctxBarV : ctxBar, stmt).expr;
    }, { perStatement: leadStmtVary, phraseBars: leadPhraseBars }).lead;
    // down an octave unless the instrument's own declared range cannot take it
    const octDrop = (oRange && leadOctave - 1 < oRange[0]) ? 0 : -12;
    octaveExpr = octRaw && octDrop ? `(${octRaw}).add(note(${octDrop}))` : null;
    if (octaveExpr) {
      extraSolos._octave = octaveExpr;
      extraInfo.push(`octave partner: ${oSound} doubles the lead an octave down at ${oGain} (r22 — unison/octave is 34.8% of reference simultaneities)`);
    }
  }

  // ==========================================================================
  // r28 · THE SERUM PRODUCER'S LAYER RULES — R1, R3, R4, R5 AND THE FINAL BAR
  // ==========================================================================
  // HIS ASK, verbatim: "make a song suite learning and applying patterns and
  // layering and everything from the synth guy from earlier, in the genre his
  // songs are (think layer stack vibe). i feel like not enough of his techniques
  // were applied fully."
  //
  // HE IS RIGHT, AND THE COUNT IS THE ANSWER. research/reel-layers-r22.md ends
  // with six engine-ready rules plus a near-miss seventh. Before this round TWO
  // of the seven were wired — R2 (`frozenSlot`) and R6 (`coprimeCell`) — and
  // both of those are BUDGET-DROPPED on every casual lane: RUB_PRIORITY charges
  // the frozen slot 1.00/bar against a 0.35 lane budget, so it never casts. The
  // `layerStack` preset that he named as a card he likes therefore shipped with
  // its own defining device — the frozen pedal — switched off. Measured on the
  // page he just judged: cp_sus_float_calm's own cast line reads "NOT CAST:
  // coprimeCell, echo, frozenSlot" while the card advertises `layerStack`.
  //
  // So this block wires the five that were only ever `recorded`:
  //   R1  reregister      a layer is EXISTING material re-registered, never new
  //   R3  holdMove        hold-bar / move-bar on a strict 2-bar period
  //   R4  registerBands   disjoint octave bands first, duration class on collision
  //   R5  doublePeriod    one layer gets twice the loop period
  //   --  finalBarBreak   the near-miss: the loop's last bar breaks every pattern
  // plus `motorFall`, which is role B and is ALSO his own compositional
  // instruction from this round's export (see below).
  //
  // ALL OPT-IN, for the measured reason the frozen slot is: rolled by default on
  // unkept songs, a new ostinato moves judged material, and three of these emit
  // pitched layers.
  //
  // -------------------------------------------------------------------------
  // R4 · REGISTER BANDS — allocated FIRST, because everything below asks for one
  // -------------------------------------------------------------------------
  // "Allocate disjoint octave bands first; on a forced collision, separate by
  // note-value class, not by voice." 7 reels / 3 sources for the first clause,
  // 2 reels / 1 source for the second, both explicit about the intent. `DalZ`
  // is the cleanest: "four disjoint octave bands (G3-G4 / C5-D5 / C6-G6 /
  // C7-G8) and never double a pitch"; `DYfk` states the principle outright —
  // "INDEPENDENCE IS BOUGHT WITH REGISTER, NOT RHYTHM."
  //
  // FLAGGED CONFLICT, carried from the research and not resolved here: this
  // partially contradicts D100 (which fixed a merged counterline/descant by
  // keeping the shared voice and moving the RHYTHM) and D102 (which found the
  // shared INSTRUMENT to be the defect). The reels never separate by timbre at
  // all — the layers are numbered instances of one plugin. All three can be
  // true; they are different populations. What this allocator does is the part
  // all three agree on: do not put two layers in the same octave.
  //
  // CLAMPED BY DECLARED DATA, never by a name list (D100, five failures). Note
  // while reading the voice choices below: `gm_synth_strings_1` and
  // `gm_synth_bass_2` — the frozen slot's and coprime cell's own default voices —
  // are NOT in INSTRUMENTS at all, so `INSTRUMENTS[s]?.range` is undefined for
  // them and any clamp written against them silently does nothing. The r28
  // layers therefore use voices that ARE declared, which is what makes the
  // allocation checkable rather than decorative.
  const r28Claimed = new Set();
  if (r28()) {
    // Seeded with every band that is ALREADY SPOKEN FOR by the time r28 places
    // anything: the lead, the accompaniment hand, and the two r23 reel devices.
    // Without the last two the allocator was measurably colliding with them —
    // `hold_move:46 coprime_cell:48` and `reregister:55 frozen_slot:62` on the
    // first build — which makes "disjoint octave bands" a claim about r28's own
    // layers rather than about the stack the listener actually hears.
    for (const o of [leadOctave, accOct, r28FzOct, r28CpOct]) if (o != null) r28Claimed.add(o);
  }
  /**
   * Nearest free octave to `want` inside the instrument's declared `range`,
   * never above `ceil`; `collided` when nothing is free.
   *
   * IT SEARCHES DOWNWARD FIRST, and that is the whole correctness of it. The
   * first cut tried `want-d` and `want+d` alternately, which is the natural
   * "nearest free" allocator and is WRONG HERE: a support layer resolving a
   * collision upward walks toward the tune, and D77 says support stays under
   * the lead. Measured on the first build, with the symmetric search: the
   * hold/move layer realised at midi 94-101 against a lead at 66 — one to two
   * and a half octaves ABOVE it on 12 of 14 songs, and above the lead's own
   * band on every song that had a collision to resolve. That is the frozen
   * slot's r23 defect (midi 88 over a lead at 64) reproduced exactly, and it is
   * the shape of his live complaint this round: "the high melody isn't really
   * that good and is sometimes too loud".
   *
   * `ceil` is a HARD cap, not a preference. Note that bindFigure seats a figure
   * at `C<octave>` and then adds up to a twelfth on top of the root, so a figure
   * asking for octave N realises around octave N to N+1 — which is why callers
   * pass a ceiling two octaves under the lead rather than one.
   */
  const r28Band = (want, range, ceil = null, spread = 4) => {
    const lo = range ? range[0] : 1;
    const hi = Math.min(range ? range[1] : 7, ceil ?? 9);
    if (hi < lo) return { octave: lo, collided: true };
    const w = Math.max(lo, Math.min(want, hi));
    if (!r28Claimed.has(w)) { r28Claimed.add(w); return { octave: w, collided: false }; }
    for (let d = 1; d <= spread; d += 1) {
      if (w - d >= lo && !r28Claimed.has(w - d)) { r28Claimed.add(w - d); return { octave: w - d, collided: false }; }
    }
    for (let d = 1; d <= spread; d += 1) {
      if (w + d <= hi && !r28Claimed.has(w + d)) { r28Claimed.add(w + d); return { octave: w + d, collided: false }; }
    }
    return { octave: w, collided: true };
  };

  // R4 REPORTS WHAT IT ACHIEVED, NOT WHAT IT ASKED FOR. Measured on the built
  // page: the allocator puts the LEAD on top on 14 of 14 songs, which is D77 and
  // is the thing that was broken before it (the hold/move layer realised at midi
  // 94-101 against a lead at 66). What it does NOT achieve is fully disjoint
  // REALISED bands — 0 to 4 pairs per song still sit within 6 semitones of each
  // other — and the reason is worth recording rather than hiding: an octave
  // PARAMETER is not a register. `bindFigure` seats a figure at `C<octave>` and
  // then stacks the chord member on top, so `octave: 3` with a `5` token
  // realises a fifth higher than `octave: 3` with an `R`; `bindMelody` realises
  // a third differently again. Two layers on distinct octave parameters can land
  // in the same actual band. With five or six layers and instrument ranges only
  // three octaves wide there is no allocation that fixes this — the fix would be
  // to allocate on realised pitch, which the generator cannot see because it
  // emits patterns rather than notes. Recorded as the limit it is.
  const r28BandReport = () => {
    const claimed = [...r28Claimed].sort((a, b) => a - b);
    return `register bands (R4): ${claimed.length} distinct octave bands claimed (${claimed.join(', ')}), `
      + 'allocated DOWNWARD from the lead and hard-capped under it — measured, the lead is the top layer on '
      + 'every song. Realised bands can still overlap within a 6th because an octave parameter is not a '
      + 'register (see the note in the source); the reels\u2019 own rule is "INDEPENDENCE IS BOUGHT WITH '
      + 'REGISTER, NOT RHYTHM" (7 reels / 3 sources)';
  };

  // -------------------------------------------------------------------------
  // R1 · A NEW LAYER IS EXISTING MATERIAL RE-REGISTERED (opts.reregister)
  // -------------------------------------------------------------------------
  // 6 reels / 2 sources. "Generate layer n by taking an existing layer's pitch
  // sequence, transposing it by ±12/±24, and changing its note-value class and
  // onset offset. No new pitch class is introduced."
  //
  // `DalZ` is the concrete case and it inverts the engine's whole assumption:
  // the lead ostinato is written FIRST and the bass is then drawn as "literally
  // the lead's downbeat skeleton, sustained and transposed down… adds no new
  // pitch and no new rhythm."
  //
  // The engine already has half of this — the octave partner (r22) rebinds the
  // lead's own cell at the same seed so the pitches are identical by
  // construction. What it does NOT do is the other half, which is the half that
  // makes it a different layer rather than a doubling: CHANGE THE NOTE-VALUE
  // CLASS. So this reuses that mechanism and adds the skeleton.
  //
  // The skeleton comes from `minNote`, not from a separate thinning pass, and
  // that is deliberate: bind.js's tokens() is legato, so dropping an onset makes
  // the PREVIOUS note hold through its slot. Raising minNote to a whole bar
  // therefore yields exactly "the downbeat pitches, sustained" — the reel's own
  // description — rather than a line with holes in it.
  //
  // THIS IS ALSO ROLE A, the sustained floor: "One note per chord, held its full
  // value, monophonic, no ornament, no repeat ... Contour = chord roots, moving
  // only when the chord moves" — 5 reels / 2 sources. Deriving it from the lead
  // rather than from the chord list is what R1 adds to it, and it is the direct
  // answer to his standing complaint about the left hand, four cards on the page
  // he just judged: "the chords repeated in the left hand over and over again
  // dont sound good", "the lefthand is just chords repeated over and over again",
  // "the piano is just chords once again, boring", "it's just a left hand piano
  // which sounds bare". A floor that is the tune's own skeleton is not a chord
  // block.
  if (opts.reregister === true && r28()) {
    const cfg = typeof opts.reregister === 'object' ? opts.reregister : {};
    const rrSound = cfg.sound ?? (opts.fullSynth || synthAcc ? 'gm_pad_warm' : 'gm_pad_bowed');
    const rrRange = INSTRUMENTS[rrSound]?.range;
    // DOWN two octaves from the lead is the reel's own transposition; the band
    // allocator moves it if that octave is already spoken for.
    const rrWant = cfg.octave ?? (leadOctave - 2);
    const { octave: rrOct, collided: rrCollided } = r28Band(rrWant, rrRange, Math.max(2, leadOctave - 1));
    // ---- THE SKELETON IS READ OFF `boundMeta`, AND THREE CUTS GOT HERE ----
    // Each wrong cut was caught by measuring emitted notes, and each failed for
    // a different reason worth keeping:
    //   (1) `minNote: beats` thinned NOTHING. bind.js keeps index 0 and requires
    //       `keep.length >= 2`, so a bar whose every gap is under a whole-bar
    //       floor collapses to one survivor, fails that test, and is left
    //       exactly as it was. Measured: 4-5 notes a bar — the lead an octave
    //       down with `hold` on, which is `melody_backup`, the DOUBLER whose
    //       "louder and wider" D100 calls an anti-goal in an atmosphere lane.
    //   (2) `minNote: beats/2` reached 2.5-5.5 notes a bar, still denser than
    //       the lead itself on one song. A thinning FLOOR is a rule about gaps
    //       and cannot express "one note per bar" at all.
    //   (3) `.segment(1)` samples the value sounding AT THE DOWNBEAT — and a
    //       melody bar that opens with a breath has no value there. Measured:
    //       0.25-0.97 notes a bar where 1.0 was intended, and TWO songs
    //       (both stepwise_floor rows, whose cells all open `~@3`) went
    //       completely SILENT. A layer that vanishes on 2 of 14 songs is not a
    //       layer.
    //
    // `bindMelody` already returns the resolved notes in `boundMeta.notes`, each
    // tagged with its cycle. Taking the FIRST note of each cycle gives the
    // skeleton exactly: one pitch per bar, the tune's own first pitch in that
    // bar, held its full value, and a rest where the tune genuinely has no note.
    // Both claims on the card are then true by construction rather than by luck
    // — one note per bar, and a pitch set that is a subset of the lead's, so no
    // new pitch class can enter however the melody is rebound.
    //
    // The bind options are the LEAD'S OWN, unmodified: same cell, same seed,
    // same octave, same grammar. The layer IS the lead, read once a bar.
    const rrGain = Math.round(leadGain * (cfg.gainMul ?? 0.34) * 100) / 100;
    // ---- A SUSTAINING VOICE MUST BE DIATONIC (D102) ------------------------
    // MEASURED on the first working build: the floor ran 12.9% out-of-key, ABOVE
    // the lead's own 9.5%, even though its pitches are a subset of the same
    // binding. The reason is the sampling — it keeps only the note that opens
    // each bar, so a chromatic approach note that the tune passes through in an
    // eighth becomes the floor's whole bar.
    //
    // That is precisely the shape D102 identifies from two directions: "a line
    // that repeats or holds must be diatonic; one that MOVES may not be", and
    // the corpus's own outlier — "the PAD is the outlier at 9.4% non-chord and
    // only 14.3% resolved. The pad is the part that HOLDS rather than passes,
    // and it is the one that does not resolve." A held chromatic is the drone
    // his ear called "completely off key" in D100.
    //
    // So the skeleton takes the bar's first DIATONIC note, and rests if the bar
    // has none. It never invents a pitch to fill the gap — the floor is allowed
    // to be sparse (sparsity is a legitimate ensemble shape), and inventing one
    // would break R1's own "no new pitch class" guarantee.
    const rrKeyPcs = (() => {
      try {
        const k = parseKey(key);
        return new Set(k.intervals.map((x) => (k.rootPc + x) % 12));
      } catch { return null; }
    })();
    const rrPcOf = (nm) => {
      const m = /^([a-gA-G][#b]?)(-?\d+)$/.exec(String(nm));
      if (!m) return null;
      const T = { c: 0, 'c#': 1, db: 1, d: 2, 'd#': 3, eb: 3, e: 4, f: 5, 'f#': 6, gb: 6, g: 7, 'g#': 8, ab: 8, a: 9, 'a#': 10, bb: 10, b: 11 };
      return T[m[1].toLowerCase()] ?? null;
    };
    /** first DIATONIC bound note of every cycle -> a one-note-per-bar pattern */
    const rrSkeleton = (res) => {
      const first = new Map();
      for (const n of res.boundMeta?.notes ?? []) {
        if (first.has(n.cycle)) continue;
        if (rrKeyPcs) {
          const pc = rrPcOf(n.note);
          if (pc != null && !rrKeyPcs.has(pc)) continue;   // pass over it; do not hold it
        }
        first.set(n.cycle, n.note);
      }
      const P = Math.max(1, res.period ?? 1);
      const seq = [];
      for (let c = 0; c < P; c += 1) seq.push(first.get(c) ?? '~');
      if (!seq.some((x) => x !== '~')) return null;
      return `note("<${seq.join(' ')}>").s("${rrSound}").gain(${rrGain}).room(0.45)`;
    };
    const bindRr = (L, ctxL, stmt = 0) => bindMelody(letterCell(L), ctxL, v.meter, {
      // the LEAD's seed, cell and octave: identical pitch sequence by
      // construction, exactly as the octave partner does it. The transposition
      // is applied to the finished pattern below so the interval is exact.
      style: 'toby-fox', seed: letterSeed(L, stmt), octave: leadOctave, sound: rrSound,
      fx: `${gainFx(rrGain)}.room(0.45)`,
      hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor,
      minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, minNoteLast: noJitter, gridSnap: gridSnapOn, subBarChords: r33(), tissue: r33(),
      cadenceNo7, chromCore,
      tailOff: grammarFresh, leapFold: grammarFresh,
      ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    });
    let rrEmpty = 0;
    const rrRaw = renderLetterLead(form, mfx, (L, stmt) => {
      const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
      const res = bindRr(base0, L.endsWith('*') ? ctxBarV : ctxBar, stmt);
      const sk = rrSkeleton(res);
      if (!sk) { rrEmpty += 1; return res.expr; }   // never emit a silent letter
      return sk;
    }, { perStatement: leadStmtVary, phraseBars: leadPhraseBars }).lead;
    // R1's own transposition range, stated by the rule: "transposing it by
    // ±12/±24". Clamped rather than left as `(rrOct - leadOctave) * 12`, which
    // measured between -5 and -43 semitones across the page — -43 is three and a
    // half octaves under the tune, i.e. a pad in sub-bass territory, and -5 is
    // not a re-registration at all.
    const rrShift = Math.max(-24, Math.min(-12, (rrOct - leadOctave) * 12));
    if (rrRaw) {
      const rrExpr = `(${rrRaw}).add(note(${rrShift}))`;
      extraParts.push(rrExpr);
      extraSolos._reregister = rrExpr;
      extraInfo.push(`re-registered floor (R1): ${rrSound} plays the LEAD'S OWN pitch sequence — same cell, same seed — `
        + `read ONE note per bar (the tune's own first pitch in that bar) and held, so it carries no pitch the tune does not, and moved ${rrShift} semitones`
        + `${rrCollided ? ' (band already claimed, so it separates by note-value class instead — R4’s collision clause)' : ''}`
        + ` (r22 reel R1 + role A, 6 reels / 2 sources: “the bass is literally the lead’s downbeat skeleton, sustained and transposed down”)`);
    }
  }

  // -------------------------------------------------------------------------
  // R3 · HOLD-BAR / MOVE-BAR (opts.holdMove), R5 on top (opts.doublePeriod)
  // -------------------------------------------------------------------------
  // "THE SINGLE MOST REPEATED DEVICE IN THE WHOLE CORPUS" — 4 reels, and the
  // research is equally clear that all four are ONE producer, so it is recorded
  // as single-source and reaches the page as an opt-in, not as a default.
  //   13-25-13 #2  odd bars a whole note C5, even bars quarter notes
  //                F5-C5-D5-D#5 landing back on the held C
  //   DZS8 #3      bar 1 hold, bar 2 F#-E-F# neighbour, bar 3 hold, bar 4 A-B
  //   Da3c #2      whole note on odd bars, EXACTLY TWO notes on even bars at
  //                beat 2 and the & of 3
  //   DYfk         the lead runs the same 4-8-4-8 shape
  //
  // Written against the SCALE LADDER (D101): `R s2 3 s4 5 s6 s7`, where
  // consecutive positions are a step apart by definition and every token
  // resolves against `chordScale`, so the walk cannot spell a foreign pitch.
  // That matters more here than usual — D97's own lesson was that the interval
  // palettes must use scale tokens and never bare `4`/`7`.
  //
  // TWO FORMS, picked by hash, because the reels show two and shipping one is
  // how a device becomes the next monoculture (D97's octave-lift, 52% of
  // composites). `neighbour` is DZS8's three-note turn; `pair` is Da3c's exact
  // two notes at beat 2 and the & of 3.
  //
  // R5 (opts.doublePeriod) doubles the figure to 4 bars and transposes the
  // SECOND statement up an octave — "Its second statement is the first
  // transposed up an octave, or with its held pitch changed" (3 reels / 1
  // source). Composing it onto R3 rather than giving it its own layer is what
  // the reels show: Da3c's #2 does both at once. The point of the rule is that
  // the change has a 4-bar period and NO SECTION BOUNDARY, which is the r17 ask
  // this project has carried unbuilt: "changes not just in strict section bar".
  if (opts.holdMove === true && r28()) {
    const cfg = typeof opts.holdMove === 'object' ? opts.holdMove : {};
    const hmForm = cfg.form ?? (fnv(`${name}|holdmove`) % 2 === 0 ? 'neighbour' : 'pair');
    // `gm_pad_warm`'s declared range is [2,4] against gm_pad_new_age's [3,5]: the
    // clamp can only put a layer where the instrument says it can go, so a
    // support layer that must sit low needs a voice that declares a low floor.
    // Sharing R1's voice is deliberate and is what the reels do — "the layers
    // are separated by REGISTER and RHYTHM, not by timbre", numbered instances
    // of one plugin. (D102 says the shared instrument is the defect; that
    // conflict is flagged in the R4 comment above and not resolved here.)
    const hmSound = cfg.sound ?? (opts.fullSynth || synthAcc ? 'gm_pad_warm' : 'gm_pad_bowed');
    const hmRange = INSTRUMENTS[hmSound]?.range;
    // UNDER THE LEAD (D77), and with room for R5's octave lift on top. Measured
    // on the first build: the realised hold/move sat at D6-C7 against a lead at
    // G4-Bb4 — a support layer a full octave ABOVE the tune, which is the exact
    // defect the frozen slot was caught with in r23 (midi 88 over a lead at 64)
    // and the shape of his "the high melody ... is sometimes too loud" note this
    // round. The request is therefore two octaves down when the lift is on, one
    // when it is not, and the realised medians are checked against the lead.
    const hmWant = cfg.octave ?? (leadOctave - 3);
    const { octave: hmOct, collided: hmCollided } = r28Band(hmWant, hmRange, Math.max(2, leadOctave - 2));
    // bar 0 HOLDS on the 5th; bar 1 MOVES and lands back on it at the next hold.
    // Onsets are bar-relative fractions across the whole multi-bar figure, one
    // unit per bar, so '1' is bar 1's downbeat and '5/4' is its second beat.
    const HM = {
      neighbour: { onsets: ['0', '5/4', '6/4', '7/4'], figure: ['5', 's6', 's7', 's6'], accents: [0.5, 0.4, 0.44, 0.4] },
      pair: { onsets: ['0', '5/4', '13/8'], figure: ['5', 's6', 's7'], accents: [0.5, 0.42, 0.4] },
    }[hmForm];
    const doubled = opts.doublePeriod === true;
    // ---- R5 IS APPLIED TO THE PATTERN, NOT TO THE TOKENS -------------------
    // First cut built a 4-bar figure whose second half repeated the tokens with
    // `+` on each, expecting "the same shape an octave up". MEASURED, it was
    // neither: bar 0 held D6 and bar 2 held Bb6 — a different pitch, up 8
    // semitones. A figure token resolves against the CHORD OF ITS OWN BAR, so
    // the same token over a different chord is a different note, and `+` was
    // being absorbed by the octave clamp. The claim on the card was false.
    //
    // An exact octave can only be guaranteed on the finished PATTERN, which is
    // how the octave partner and the final-bar break both do it. So the figure
    // stays 2 bars and the second statement is `.add(note(12))` over a 4-bar
    // period — the same material by construction, and audibly the same shape.
    const hmFig = {
      name: `holdmove-${hmForm}`, bars: 2, grid: 8, legato: false,
      onsets: HM.onsets, figure: HM.figure, accents: HM.accents,
    };
    // ---- NOT snapSupport'd, and that is a deliberate exception -------------
    // D116 snaps a support note that sits a semitone from a chord tone. Every
    // token here is a SCALE-LADDER position resolved against `chordScale`
    // (D101), so it is diatonic to what the chord implies by construction —
    // and measured, the snap was COLLAPSING the walk: `5 s6 s7` over Gm9 came
    // out D6, D6, D6, three onsets on one pitch. A move bar that does not move
    // is not the device. The out-of-chord rate is measured against the lead's
    // on the built page instead, which is what D116's own law asks for
    // ("support is no more chromatic than the lead").
    // `loopRoots` is what keeps a figure in the register its octave asks for.
    // Without it, measured, this layer realised at midi 86-96 against a lead at
    // 55-67 — one and a half to two and a half octaves ABOVE the tune, from an
    // `octave` request of 3. The frozen slot and the coprime cell both pass it
    // and both sit correctly under the lead on the same page; that is what
    // identified it. The card prints the realised comparison, not the request.
    const bindHm = (ctx) => bindFigure(hmFig, ctx, v.meter, {
      octave: hmOct, sound: hmSound, loopRoots: true,
      gainRange: cfg.gainRange ?? [0.14, 0.26],
      fx: '.room(0.4)', rhythmName: 'hold-move',
    }).expr;
    const hmBars = form.sections.flatMap((sec) => Array(sec.bars).fill(1));
    // R5's lift, as a 4-bar-period transposition of the finished pattern.
    // The lift drops the FIRST statement and leaves the second where the figure
    // already sits, rather than raising the second above it. Same relationship —
    // statement two is an octave over statement one — with the layer's ceiling
    // unchanged, which is what keeps R5 from undoing R4's placement.
    const hmLift = (x) => (doubled ? `(${x}).add(note("<-12@2 0@2>"))` : x);
    if (hmBars.some(Boolean)) {
      extraParts.push(...varySplit(bindHm, hmBars).map(hmLift));
      extraSolos._hold_move = hmLift(bindHm(ctxBar));
      extraInfo.push(`hold-bar / move-bar (R3${doubled ? ' + R5' : ''}): ${hmSound} at octave ${hmOct} holds a whole bar, then `
        + `${hmForm === 'pair' ? 'answers with exactly two notes at beat 2 and the & of 3 (Da3c)' : 'walks a three-note scale-ladder turn (DZS8)'}`
        + ` and lands back on the held pitch${doubled ? '; the second statement is the same shape an octave up, so the change has a 4-bar period and no section boundary (R5)' : ''}`
        + `${hmCollided ? ' — band collision, separated by note-value class instead (R4)' : ''}`
        + ` (r22, the most repeated device in the reel set, 4 reels / 1 source)`);
    }
  }

  // -------------------------------------------------------------------------
  // ROLE B · THE MOTOR, and HIS OWN INSTRUCTION (opts.motorFall)
  // -------------------------------------------------------------------------
  // Role B is "continuous subdivision, zero rests" — 5 reels / 2 sources, in
  // 8ths or 16ths, always well over the topline's density.
  //
  // The SHAPE is his, not the reels'. From this round's export, on
  // cp_kpop_minor_anthem_tense — "one of the best stealth songs" — he asked for
  // something the engine does not have, and specified it exactly: "maybe replace
  // with some synth melodies like repeated four-note falling synths or something
  // (for example one example would be 8th 5th 2nd root repeated over and over
  // again 8th note to convey tension/stealth, or something like that)".
  //
  // "8th 5th 2nd root" is a falling scale figure: the octave, the fifth, the
  // second, the root. In figure tokens that is `R+ 5 s2 R`, and the second is a
  // SCALE token so it resolves against `chordScale` and cannot spell a foreign
  // pitch (D97's measured mistake was writing bare `4`/`7` here).
  //
  // IT PASSES HIS OWN METRONOME TEST (D102), which is why it is a texture and
  // not a pulse: eight onsets a bar is over the 6/bar threshold, but the rule's
  // first clause also requires `distinct shapes <= 1` and this has four; and
  // eight is under the 12/bar gear-change clause. Checked rather than assumed —
  // that rule exists because `fnd_power_fifth_8ths` (eight identical `R.5`
  // tokens) bound the jungle marimba for sixteen bars.
  if (opts.motorFall === true && r28()) {
    const cfg = typeof opts.motorFall === 'object' ? opts.motorFall : {};
    const mfSound = cfg.sound ?? (opts.fullSynth || synthAcc ? 'gm_lead_2_sawtooth' : 'gm_pad_metallic');
    const mfRange = INSTRUMENTS[mfSound]?.range;
    const { octave: mfOct, collided: mfCollided } = r28Band(cfg.octave ?? (leadOctave - 2), mfRange, Math.max(2, leadOctave - 1));
    const mfFig = {
      name: 'motor-fall-8ths', bars: 1, grid: 8, legato: false,
      onsets: ['0', '1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8'],
      figure: ['R+', '5', 's2', 'R', 'R+', '5', 's2', 'R'],
      accents: [0.5, 0.36, 0.34, 0.42, 0.46, 0.34, 0.32, 0.4],
    };
    const bindMf = (ctx) => snapSupport(bindFigure(mfFig, ctx, v.meter, {
      octave: mfOct, sound: mfSound, loopRoots: true,
      gainRange: cfg.gainRange ?? [0.13, 0.24], fx: '.room(0.3).clip(0.5)', rhythmName: 'motor-fall',
    }).expr, barSyms);
    // ROLE B RUNS WITHOUT RESTS — that is its definition ("zero rests", 5 reels).
    // So it is cast on every bar rather than on the energetic sections only,
    // which is what the frozen slot and coprime cell do.
    const mfBars = form.sections.flatMap((sec) => Array(sec.bars).fill(1));
    if (mfBars.some(Boolean)) {
      extraParts.push(...varySplit(bindMf, mfBars));
      extraSolos._motor_fall = bindMf(ctxBar);
      extraInfo.push(`the motor (role B): ${mfSound} at octave ${mfOct} runs a falling 8th-note cell with no rests — `
        + `octave, 5th, 2nd, root, twice a bar, HIS OWN SPEC this round: “repeated four-note falling synths ... `
        + `8th 5th 2nd root repeated over and over again 8th note to convey tension/stealth”. `
        + `4 distinct shapes at 8 onsets/bar, so it passes the D102 metronome test rather than reading as a pulse`
        + `${mfCollided ? '; band collision, separated by note-value class (R4)' : ''}`);
    }
  }

  // -------------------------------------------------------------------------
  // THE NEAR-MISS SEVENTH · THE LOOP'S LAST BAR BREAKS EVERY PATTERN
  // -------------------------------------------------------------------------
  // 5 reels / 2 sources, and the research declines to promote it because 4 of
  // the 5 are one producer: "the loop's final bar is where every layer breaks
  // its own pattern simultaneously — floor splits and displaces by an octave,
  // ornament hits its densest bar, chord voicing spreads widest."
  //
  // Only the FLOOR clause is built here, and only over the r28 floor, because
  // that is the clause with a stated mechanism: `DYfk` leaps up a major 7th,
  // `DalZ` drops an octave, `DZS8` drops an octave at the bar end. Two of the
  // three DROP, and D88 (the bar-4 turnaround) already says the sub drops, so
  // dropping is both the majority reading and consistent with standing law —
  // which is the only reason it is safe to build a single-source device.
  //
  // The period is 4 bars and is independent of the form: every section start and
  // length in the suite divides by 4 (D97), so this lands on the last bar of
  // every 4-bar group whether or not a section boundary is near it.
  if (opts.finalBarBreak === true && r28() && extraSolos._reregister) {
    const fbBars = [];
    for (let b = 0; b < form.totalBars; b += 1) fbBars.push(b % 4 === 3 ? 1 : 0);
    const fbExpr = `(${extraSolos._reregister}).add(note("<${maskString(fbBars.map((x) => (x ? -12 : 0)))}>"))`;
    // replace the plain floor with the one that breaks
    const ix = extraParts.indexOf(extraSolos._reregister);
    if (ix >= 0) extraParts[ix] = fbExpr;
    extraSolos._reregister = fbExpr;
    extraInfo.push('final-bar break: the re-registered floor drops an octave on the last bar of every 4-bar group '
      + '— a turnaround with a 4-bar period that does not consult the section grid (r22 near-miss rule, '
      + '5 reels / 2 sources; DROPS rather than leaps because 2 of its 3 readings drop and D88 already says the sub drops)');
  }

  if (r28() && (opts.reregister === true || opts.holdMove === true || opts.motorFall === true)) {
    extraInfo.push(r28BandReport());
  }
  if (castCapped.length) {
    extraInfo.push(`support under the lead (r29/D77): ${castCapped.join(', ')} — arrange.js caps these at 0.9 ABSOLUTE `
      + `("so the piano stays the subject", its own comment) but never compares them to the lead. Measured on the r28 page, `
      + `takeover-family layers ran 1.91x, 1.60x, 1.53x, 1.53x, 1.25x and 1.09x the tune they support; the 1.91x song is his `
      + '"the synth sometimes is a bit too loud" card');
  }
  if (noJitter) {
    extraInfo.push('no-jitter (r28): the minimum note value now applies to the bar\u2019s LAST onset too, for the lead '
      + 'and every layer derived from it. Measured as an isolation pair on this page — same 14 songs, this flag the only '
      + 'difference — it removes 59% of the notes hanging off the end of a bar (204 -> 84). It does NOT change the overall '
      + 'short-note density (2.390 -> 2.385 tight onsets/bar): what remains is 16th activity elsewhere in the mix, which is '
      + 'a separate problem. His five cards: \u201cthe random short bursts sound weird and erratic\u201d, \u201crandom very '
      + 'quick bursts in the left hand\u201d, \u201cthe piano melody is erratic (random really quick notes) at times which I dislike once again\u201d');
  }


  // ==========================================================================
  // r30 · THE REPEATING-INTERVAL ENERGY FIGURE (opts.synthRise)
  // ==========================================================================
  // HIS ASK, verbatim: "i think you should try the synth/violin rise i mentioned
  // in energetic songs though. like some given intervals and it repeats those
  // intervals over and over to convey energy (changing chords as needed or
  // repeating). i left an example - it's in piano but look at the right side
  // repeating chords - like that kinda energy"
  //
  // "the rise i mentioned" is r28's "the percussive strings I mentioned with
  // their repeated intervals + percussion and boom" — the same device, asked for
  // a second time. He left a 23s Synthesia recording as the reference; it is
  // measured in research/reel-energy-rise-r30.md and the numbers are:
  //
  //   138.4 BPM, one chord per bar, right hand in straight 8ths (median IOI
  //   0.2160s = exactly one 8th), a 3-4 note DESCENDING cell filling half a bar
  //   and repeating: B4-G4-F#4-E4 (5-b3-2-1 in E minor) and C5-G4-F4 (5-2-1).
  //
  // THE FINDING, and the reason this is not just `motorFall` again: THE CELL DOES
  // NOT FOLLOW THE CHORD. `C5 G4 F4` plays unchanged over D, C, F, D, C and F
  // basses; `B4 G4 F#4 E4` over D, B and E. Five different chords, one unchanged
  // cell. That is his own parenthesis — "changing chords as needed or REPEATING"
  // — and it is R2 from the r22 reels ("freeze the body") arriving from a
  // completely independent source: R2 was 4 reels by one producer, this is an
  // anime OST arrangement by someone else.
  //
  // `motorFall` (r28) already plays the same descent — R+ 5 s2 R, his own
  // "8th 5th 2nd root" spec — but it REBINDS on every chord. The freeze is the
  // new thing, and it is the whole device.
  //
  // FROZEN PER SECTION, NOT PER SONG. The reference holds one cell for ~5 bars
  // and swaps when the harmony moves somewhere it no longer fits (the swap at
  // 15.67s lands mid-bar, not on a boundary). A song-long freeze would be a drone
  // over eight chords, which is the shape his ear rejected in D100. So the cell
  // binds against ITS OWN SECTION'S FIRST CHORD and re-derives at the next
  // section.
  //
  // REGISTER IS HIGH AND GAIN IS NOT. The reference sits E4-F5, i.e. at and above
  // the tune — it is the foreground of that arrangement. Four of his r28 cards
  // say a high synth was too loud, and r29's answer was the RELATIVE law (D77):
  // cap the gain against the lead, not the register. So this sits where the
  // reference puts it and stays under the lead in level.
  // accepts `true` or a config object — `synthRise: { direction: 'up' }` silently
  // did nothing under an `=== true` gate, and because the empty case had no else
  // branch it reported nothing either. Both fixed.
  if ((opts.synthRise === true || (opts.synthRise && typeof opts.synthRise === 'object')) && r30()) {
    const cfg = typeof opts.synthRise === 'object' ? opts.synthRise : {};
    // 5 - b3 - 2 - 1 in minor, 5 - 2 - 1 in major: the ladder walked DOWN from
    // the fifth to the root. Scale tokens throughout (D101) so the descent
    // resolves against `chordScale` and cannot spell a foreign pitch — the r22
    // lesson that bare 4/7 wrote out-of-key notes.
    // ---- r31 · HIS SECOND VARIANT, from the reel-1 aside --------------------
    // Verbatim: "the chord that they reveal you could also play those intervals
    // from bottom to top over and over again like D F F# A# repeat and then
    // repeat for another chord. this is good pattern for the genre as a
    // supplement and also for energy vibes for dark vibes"
    //
    // Two differences from the r30 device, and they are the whole variant:
    //   DIRECTION  "from bottom to top" — ASCENDING, where the r30 reference
    //              descends every time (5-b3-2-1).
    //   FREEZING   "then repeat for another chord" — it RE-PITCHES on the chord
    //              change, where the r30 device holds one cell across five.
    // HIS EXAMPLE, CORRECTED BY THE REEL ITSELF. He wrote "D F F# A#", which
    // reads as R-b3-3-#5 and is a strange set. The piano roll he was quoting
    // (reel 1, redbowmusic, "The most overpowered chord in all dark music")
    // spells it **D#** F F# A# — he dropped one sharp. Relative to D# that is
    // 0-2-3-7: ROOT, 9th, b3, 5th. A minor add9 with the 9 voiced BELOW the b3,
    // so a minor 2nd sits inside the chord (F/F#, and C/C# on the next one).
    // That semitone inside a consonant stack is the whole trick, and it is the
    // same shape as D93's fifth-pincer principle: the dissonance is BETWEEN two
    // consonant intervals, not smeared across the voicing.
    // The reel's own next card is "double it and move it 5 notes down", i.e. the
    // identical shape transposed down a fourth — iv(add9) -> i(add9).
    // Tokens: `s2` is the 9th resolved against chordScale, `3` the third, `5` the
    // fifth. Never a bare `7` (the documented foreign-pitch trap).
    //
    // `s7` not `7`: on a plain triad a bare `7` falls back to b7 whatever the key
    // (the documented foreign-pitch trap), while `s7` resolves against
    // `chordScale`. Measured 0.0% out-of-key on the r30 build with scale tokens.
    const riseUp = cfg.direction === 'up';
    const riseMinor = v.family !== 'major';
    const cell = riseUp ? ['R', 's2', '3', '5']
      : riseMinor ? ['5', '3', 's2', 'R'] : ['5', 's2', 'R'];
    const riseFig = riseUp
      ? {
        name: 'rise-up-chordtones', bars: 1, grid: 8, legato: false,
        onsets: ['0', '1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8'],
        figure: [...cell, ...cell],
        accents: [0.6, 0.38, 0.4, 0.46, 0.56, 0.36, 0.38, 0.44],
      }
      : riseMinor
      ? {
        name: 'rise-5-b3-2-1', bars: 1, grid: 8, legato: false,
        onsets: ['0', '1/8', '2/8', '3/8', '4/8', '5/8', '6/8', '7/8'],
        figure: [...cell, ...cell],
        accents: [0.62, 0.4, 0.38, 0.44, 0.58, 0.38, 0.36, 0.42],
      }
      : {
        // the 3-note cell leaves the 4th eighth EMPTY, exactly as the reference
        // does — `C5 G4 F4` then a rest, twice a bar.
        name: 'rise-5-2-1', bars: 1, grid: 8, legato: false,
        onsets: ['0', '1/8', '2/8', '4/8', '5/8', '6/8'],
        figure: [...cell, ...cell],
        accents: [0.62, 0.4, 0.38, 0.58, 0.38, 0.36],
      };
    // METRONOME TEST (D102), checked rather than assumed: 8 onsets/bar is over
    // the 6/bar clause, but that clause also needs <= 1 distinct shape and this
    // has 3-4; and 8 is under the 12/bar gear-change clause. It is a texture.
    const risePerBar = riseFig.onsets.length;
    const riseShapes = new Set(riseFig.figure).size;
    const riseMetronomic = (risePerBar >= 6 && riseShapes <= 1) || risePerBar >= 12;
    const riseSound = cfg.sound ?? (opts.fullSynth || synthAcc ? 'gm_lead_2_sawtooth' : 'gm_string_ensemble_1');
    const riseRange = INSTRUMENTS[riseSound]?.range;
    // REGISTER, and this is the one place the reference is overruled. In the
    // example the right hand IS the tune, so "high" costs nothing there. Our
    // songs already have a lead, and D77 says support sits under it. MEASURED at
    // `octave: leadOctave`: the realised median landed 7-12 semitones ABOVE the
    // lead on 3 of 4 songs (bindFigure seats at C<octave> and the `5` token adds
    // a fifth on top), which is the exact shape of his four r28 "the high synth
    // is too loud" cards. One band down puts it around the tune instead of over
    // it, and the gain cap below does the rest.
    const riseWant = cfg.octave ?? (leadOctave - 1);
    const riseOct = riseRange
      ? Math.max(riseRange[0], Math.min(riseWant, riseRange[1]))
      : riseWant;
    // r29's relative law: support never exceeds the lead.
    const riseGain = cfg.gainRange ?? [
      Math.round(0.34 * leadGain * 100) / 100,
      Math.round(0.62 * leadGain * 100) / 100,
    ];
    // FROZEN PER SECTION: each section's cell is bound against that section's
    // FIRST chord and held for the whole section, which is what the reference
    // does and what separates this from `motorFall`.
    let riseAt = 0;
    const riseParts = [];
    const riseNotes = [];
    form.sections.forEach((sec) => {
      const start = riseAt;
      riseAt += sec.bars;
      if ((ENERGY[sec.archetype] ?? 3) < 3) return;          // energetic sections only
      // FROZEN is the r30 default and the r30 finding. The r31 ascending variant
      // re-pitches instead — "then repeat for another chord" — so it binds
      // against the real per-bar harmony like any other figure.
      const riseFrozen = cfg.frozen ?? !riseUp;
      const frozenSym = barSyms[start % barSyms.length];
      const ctxRise = riseFrozen
        ? { harmony: [frozenSym], barsPerChord: 1, key }
        : ctxBar;
      const expr = bindFigure(riseFig, ctxRise, v.meter, {
        octave: riseOct, sound: riseSound, loopRoots: true,
        gainRange: riseGain, fx: '.room(0.3).clip(0.55)', rhythmName: 'synth-rise',
      }).expr;
      const m = Array(form.totalBars).fill(0);
      for (let b = start; b < start + sec.bars; b += 1) m[b] = 1;
      riseParts.push(`(${expr}).mask("<${maskString(m)}>")`);
      riseNotes.push(riseFrozen ? `${frozenSym}\u00d7${sec.bars}b` : `re-pitched\u00d7${sec.bars}b`);
    });
    if (riseParts.length && !riseMetronomic) {
      extraParts.push(...riseParts);
      extraSolos._synth_rise = riseParts[0];
      extraInfo.push(`synth rise (r30, HIS ASK): ${riseSound} at octave ${riseOct} walks the scale ladder DOWN from the 5th `
        + `${riseUp ? 'UP through the chord tones (R-3-5-s7) in 8ths, twice a bar, RE-PITCHED on every chord \u2014 his r31 aside, "the chord that they reveal you could also play those intervals from bottom to top over and over again ... then repeat for another chord"' : `to the root in 8ths \u2014 ${riseMinor ? '5-b3-2-1' : '5-2-1'} \u2014 twice a bar, and the cell is FROZEN for its whole section`} `
        + `(${riseNotes.join(', ')}) so the harmony moves underneath it instead of re-pitching it. `
        + 'Measured off his own example (a 23s Synthesia recording): 138.4 BPM, 8th-note grid, and one three-note cell held unchanged over '
        + 'FIVE different bass notes. His words: "some given intervals and it repeats those intervals over and over to convey energy '
        + '(changing chords as needed or repeating)". NOTE he called it a "rise" and the reference DESCENDS every time \u2014 what rises is '
        + `the re-attack. Gain ${riseGain[0]}-${riseGain[1]} against the lead's ${leadGain} (r29/D77)`);
    } else if (riseMetronomic) {
      extraInfo.push('synth rise: NOT CAST \u2014 the figure failed the D102 metronome test');
    } else {
      // a device that asks to cast and then does not must SAY so. This branch
      // caught the `=== true` gate bug above: `{ direction: 'up' }` fell through
      // in silence and the card advertised nothing either way.
      extraInfo.push('synth rise: NOT CAST \u2014 no section reached the energy floor');
    }
  }


  // ==========================================================================
  // r31 · CAST A LIBRARY LAYER PATTERN (opts.reelLayers)
  // ==========================================================================
  // HIS ASK: "hardcode these chord progressions and layering patterns by
  // instrument and the pattern they're doing via intervals and rhythm ... the
  // idea is that we can merge all the patterns I feed you and select and choose
  // and combine regardless of what reel they came from, using metadata and
  // verification and which combos work well."
  //
  // The library is `src/lib/layer-patterns.js`: one row per (reel, instrument),
  // each carrying a rhythm (onsets + accents on a grid) and an interval shape
  // (figure tokens). That is exactly a `bindFigure` spec plus placement
  // metadata, so casting one needs no new binder — this block is the adapter,
  // and every pattern goes through the SAME path the engine's own foundations
  // do. Combination is therefore a data question, not a code question, which is
  // what makes "combine regardless of what reel they came from" cheap.
  //
  // Rows are addressed BY NAME and never iterated or length-indexed (the
  // techniques.js rule), so adding a pattern cannot re-roll any existing song.
  if (Array.isArray(opts.reelLayers) && opts.reelLayers.length && r31()) {
    const cast = [];
    for (const [ix, want] of opts.reelLayers.entries()) {
      // r32 BUG FIX (latent since r31): this was `const key = ...`, which
      // SHADOWED the song's own key string a few thousand lines up — so the
      // frozen-layer context below (`{ harmony: [...], barsPerChord: 1, key }`)
      // was handed the ROW NAME as its key. Every frozen reel layer has been
      // spelling its accidentals against "lp_r7_frozen_bell_tune" instead of
      // "Gb:major", and the moment a frozen row carried an s-token it threw
      // outright: `unparseable key "lp_r3_catchy_pluck"`. It only surfaced now
      // because no r31 frozen row used a scale token — `keyUsesFlats` tolerates
      // nonsense and `parseKey` is called lazily.
      const lpName = typeof want === 'string' ? want : want.name;
      const cfg = typeof want === 'object' ? want : {};
      const lp = LAYER_PATTERNS[lpName];
      if (!lp) { extraInfo.push(`reel layer: NO SUCH PATTERN "${lpName}"`); continue; }
      // THE METRONOME TEST (D102) APPLIES TO IMPORTED MATERIAL TOO. A pattern
      // read off someone else's reel has no special standing — if it is a pulse
      // or a gear change by his own rule it does not cast, exactly as a travel
      // destination or a texture would not.
      const perBar = lp.rhythm.onsets.length / (lp.rhythm.bars ?? 1);
      const shapes = new Set(lp.intervals).size;
      if ((perBar >= 6 && shapes <= 1) || perBar >= 12) {
        extraInfo.push(`reel layer ${lpName}: NOT CAST — fails the D102 metronome test `
          + `(${perBar}/bar, ${shapes} distinct shape${shapes === 1 ? '' : 's'})`);
        continue;
      }
      const fig = {
        name: lpName, bars: lp.rhythm.bars ?? 1, grid: lp.rhythm.grid ?? 16,
        legato: lp.rhythm.legato ?? false,
        onsets: lp.rhythm.onsets, figure: lp.intervals, accents: lp.rhythm.accents,
      };
      const snd = cfg.sound ?? (opts.fullSynth || synthAcc ? (lp.synthSound ?? lp.sound) : lp.sound);
      const range = INSTRUMENTS[snd]?.range;
      // Placement follows the ENGINE's laws, not the reel's: allocated downward
      // from the lead and hard-capped under it (r29/D77), because his four "the
      // high synth is too loud" cards outrank a stranger's mix decision.
      const want0 = cfg.octave ?? (leadOctave + (lp.octaveVsLead ?? -2));
      const { octave: oct, collided } = r28Band(want0, range, Math.max(1, leadOctave - 1));
      const gr = cfg.gainRange ?? [
        Math.round((lp.gainVsLead?.[0] ?? 0.28) * leadGain * 100) / 100,
        Math.round((lp.gainVsLead?.[1] ?? 0.55) * leadGain * 100) / 100,
      ];
      // FROZEN vs RE-PITCHED is a property of the pattern as READ, not a default:
      // some reel layers hold one shape across a chord change and some do not,
      // and that distinction is the r30/r31 finding.
      //
      // r33 — THE FROZEN ROW WAS SEATED ON THE WRONG CHORD. The rows declare
      // their degrees relative to the KEY'S TONIC; seating them on barSyms[0]
      // (the loop's FIRST CHORD) re-spells every frozen pitch against whatever
      // chord happens to open the progression. Machine-verified counterfactual
      // on rl_casual_task_r3 (first chord Gm9, tonic F): lp_r3_catchy_pluck as
      // shipped = 71.4% out-of-chord; seated on the tonic per its own spec =
      // 14.3%. The mis-seating QUINTUPLED the frozen hook's dissonance and is
      // the largest single number behind his "most of the instruments sound
      // dissonant". Kept pages keep the mis-seating they were judged with.
      const keyMode = String(key).split(':')[1] ?? 'major';
      const tonicSym = String(key).split(':')[0] + (['major', 'lydian', 'mixolydian'].includes(keyMode) ? '' : 'm');
      const ctxL = lp.frozen ? { harmony: [r33() ? tonicSym : barSyms[0]], barsPerChord: 1, key } : ctxBar;
      const bindL = (ctx) => {
        const e = bindFigure(fig, ctx, v.meter, {
          octave: oct, sound: snd, loopRoots: true, gainRange: gr,
          fx: lp.fx ?? '.room(0.3)', rhythmName: lpName,
        }).expr;
        // r33 verify — the tonic seating REGRESSED one crossed card: a frozen
        // row re-seated per its contract can grind against a HOST reel's
        // harmony it was never played over (lp_r5_offbeat_pluck on the E-major
        // cross went 7 -> 35 m2-against-chord clashes: E held against D# in
        // every ^7 span). On a FAITHFUL card the transcription is the object
        // and stands; on a CROSS, the row is a guest — its semitone rubs snap
        // to an agreeing tone (the r26 support-agreement law, which by design
        // keeps 9ths/6ths/sus colour and moves only foreign pitches and rubs).
        return (r33() && lp.frozen && !opts.reelFaithful) ? snapSupport(e, barSyms) : e;
      };
      const bars = form.sections.flatMap((sec) => Array(sec.bars)
        .fill((ENERGY[sec.archetype] ?? 3) >= (lp.minEnergy ?? 0) ? 1 : 0));
      if (!bars.some(Boolean)) continue;
      extraParts.push(...varySplit(() => bindL(ctxL), bars));
      extraSolos[`_lp_${ix}_${lp.role}`] = bindL(ctxL);
      cast.push(`${lpName} (${lp.role}, ${snd} oct ${oct}${lp.frozen ? ', FROZEN' : ''}${collided ? ', band collision' : ''})`);
    }
    if (cast.length) {
      extraInfo.push(`reel layers (r32): ${cast.join('; ')} \u2014 hardcoded from his 8 layer-stacking reels, `
        + 'each row a rhythm + interval shape read off the piano roll, on the instrument that was actually '
        + 'played (r32 \u2014 r31 substituted a synth for every one of them, which turned the accordion into a '
        + 'square lead and both tubular-bell rows into a music box). Placement and gain still follow the '
        + 'engine\u2019s own laws \u2014 allocated downward from the lead and capped under it \u2014 rather than the '
        + 'reel\u2019s mix, because his four "too loud" cards outrank a stranger\u2019s balance');
    }
  }

  // ---- L4 · LAYERS THAT BREATHE (opts.layerRest) ---------------------------
  // Inside a STEADY section — no section change, no texture change — 57.5% of
  // the reference parts still rest for at least one bar. Median coverage of
  // their own core window: lead 50%, counter 66.7%, acc 62.5%, pad 92.9%,
  // bass 100%. Ours play every bar they are cast in, which is what makes a
  // full arrangement read as a wall. Bass and pad are exempt because the
  // reference exempts them; the rests are PHASE-OFFSET per layer so the
  // texture thins in rotation instead of everyone breathing at once.
  // r22 SECOND PASS — HIS NOTE, TWICE, AND IT IS ABOUT MY OWN DEVICE.
  //   menu_orchestral: "the strings disappear kinda abruptly and whenever they
  //     appeared loudly again it's abrupt. strings should always FADE in at
  //     times like this not just cut in and spawn in"
  //   rain_street: "the cello or viola ... was a bit too loud, and again it
  //     shouldn't just spawn in that loud, it should increase in gradually
  //     especially since its somber"
  // v1 masked the rest bar with a hard 0/1 `.mask()`, so every layer snapped
  // back at full gain the instant its rest ended — the breathing device created
  // the very artefact he is describing. A gain ENVELOPE does the rest AND the
  // ramp in one pattern: 0 through the rest, then two bars climbing back. It
  // also ramps the opening, which is the other half of "always fade in".
  const breathEnvFor = (i) => {
    const period = 8;
    const slot = (i * 3 + 1) % period;             // co-prime step: layers stagger
    const g = [];
    for (let b = 0; b < form.totalBars; b++) {
      const prev1 = (b - 1) % period === slot && b >= 1;
      const prev2 = (b - 2) % period === slot && b >= 2;
      if (b % period === slot) g.push(0);          // the rest itself
      else if (prev1) g.push(0.35);                // first bar back — a swell, not a cut
      else if (prev2) g.push(0.7);
      else if (b === 0) g.push(0.4);               // the song's own opening
      else if (b === 1) g.push(0.75);
      else g.push(1);
    }
    // maskString run-length-encodes any per-bar sequence, gains included
    return maskString(g);
  };
  const layerMixOut = opts.layerRest
    ? layerMixExprs.map((x, i) => {
      const l = shaped.layers[i];
      if (!l || l.derives === 'chords' || /bass|pad/i.test(l.part ?? '')) return x;
      return `(${x}).mul(gain("<${breathEnvFor(i)}>"))`;
    })
    : layerMixExprs;
  // The planner cast is 2-3 layers; the SUPPORT layers (counterline, descant,
  // marcato, sparkle) are extraParts, and they are where the density that reads
  // as a wall actually sits. Breathing only the cast moved 3 of 16 songs.
  // Phase continues past the cast indices so nothing rests in unison.
  // ---- r35 · THE CHORUS DOUBLE (opts.chorusDouble; research/vocaloid-r35.md
  // law 9): in the corpus the accompaniment doubles the sung tune at its
  // onsets 9% of the time in verses and 92% in choruses — 83% an octave UP,
  // and 89% as the top note of a chord strike. That octave-up tune IS "the
  // harmony directly supporting the voice" he heard. Here: the writer's B
  // (chorus) line an octave above the lead on a voice from another family,
  // masked to the B letter's bars, at a real level (0.7 x lead by default).
  let chorusDoubleExpr = null;
  if (vocalWriterOn && opts.chorusDouble) {
    const cfg = typeof opts.chorusDouble === 'object' ? opts.chorusDouble : {};
    const CD_POOL = opts.fullSynth ? ['gm_lead_1_square', 'gm_lead_2_sawtooth', 'gm_epiano1'] : ['gm_epiano1', 'gm_vibraphone', 'gm_flute', 'gm_lead_1_square'];
    const pool = otherFamily(CD_POOL, [LEAD_SOUND, accVoiceFor(accFig)].filter(Boolean));
    const cdSound = cfg.sound ?? pool[fnv(`${name}|chorusdouble`) % pool.length];
    const cdRange = INSTRUMENTS[cdSound]?.range;
    const want = leadOctave + 1;
    const cdOct = cfg.octave ?? (cdRange ? Math.max(cdRange[0], Math.min(want, cdRange[1] - 1)) : want);
    const cdGain = Math.round(leadGain * (cfg.gainMul ?? 0.7) * 100) / 100;
    const chorusBars = barLetter.map((L) => (/^B/.test(L ?? '') ? 1 : 0));
    if (chorusBars.some(Boolean)) {
      const raw = renderLetterLead(form, mfx, (L, stmt) => {
        const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
        return writerBind(base0, L.endsWith('*') ? ctxBarV : ctxBar, stmt, { octave: cdOct, sound: cdSound, fx: `${gainFx(cdGain)}.room(0.3)` }).expr;
      }, { perStatement: leadStmtVary, phraseBars: leadPhraseBars }).lead;
      if (raw) {
        chorusDoubleExpr = `(${raw}).mask("<${maskString(chorusBars)}>")`;
        extraParts.push(chorusDoubleExpr);
        extraSolos._chorus_double = chorusDoubleExpr;
        extraInfo.push(`chorus double (r35): ${cdSound} plays the sung tune an octave up in the chorus (B) bars at ${cdGain} — the corpus's 92% chorus doubling, 9% in verses`);
      }
    }
  }
  const extraOut = opts.layerRest
    ? extraParts.map((x, i) => `(${x}).mul(gain("<${breathEnvFor(i + layerMixExprs.length)}>"))`)
    : extraParts;
  if (opts.layerRest) extraInfo.push(`layer breathing: each CAST layer rests 1 bar in 8, staggered, and FADES back over two bars instead of cutting in (NOT the lead, companion, octave partner or echo — those are assembled outside the breathing envelope, measured r27) (r22 — 57.5% of reference parts rest inside a steady section; his \u201cstrings should always FADE in ... not just cut in and spawn in\u201d)`);

  // r24 — THE ENTRY RAMP. His three cards, one sentence each and all the same:
  //   su_calm_water     "the synth sounds pretty good when it came in but just
  //                      way too loud. it's calm water."
  //   su_excited_space  "when the synth comes in in the middle it's good but way
  //                      too loud."
  //   su_somber_aftermath "the synth is too loud when it comes in but the synth
  //                      itself I like and the notes."
  //
  // MEASURED in the mix, per sound, comparing the mean gain in a voice's FIRST
  // sounding bar against its steady state two bars later: a layer that enters
  // mid-song does not fade in, it enters LOUDER than it then plays.
  // su_somber_aftermath's violin arrives at 1.40x its own steady gain,
  // su_excited_space's flute at 1.37x, its timpani at 1.24x, su_calm_water's pad
  // at 1.06x. Nothing was ramping them: `rampMul` only softens the first bar of a
  // varySplit run to 0.75, and `breathEnvFor` puts its 0.4/0.75 swell at BAR 0 —
  // the song's opening — so a voice whose own opening is bar 40 gets none of it.
  // The section curve then lifts the entry section and the voice arrives on top
  // of the mix.
  //
  // This is also his r22 note reaching a case it had missed: "strings should
  // always FADE in at times like this not just cut in and spawn in", and
  // "it shouldn't just spawn in that loud, it should increase in gradually".
  // The device that answers it existed and was anchored to the wrong bar.
  //
  // Read the entry bar off the layer's OWN mask rather than tracking it
  // separately — the mask is what decides when the voice is first heard, so it
  // cannot drift out of sync with it. A stack of pieces takes the earliest.
  const ENTRY_RAMP = [0.42, 0.72, 0.9];
  const entryRampOn = ruleFresh(24);
  // entry bar and run length, read off the layer's own mask. A stack of pieces
  // takes the earliest entry and the run that starts there.
  const entrySpanOfExpr = (expr) => {
    let bestBar = 0, bestRun = form.totalBars, any = false;
    for (const m of String(expr).matchAll(/\.mask\("<([^"]*)>"\)/g)) {
      any = true;
      let bar = 0, run = 0;
      const toks = m[1].trim().split(/\s+/);
      for (let i = 0; i < toks.length; i++) {
        const [val, n] = toks[i].split('@');
        const len = Number(n ?? 1);
        if (Number(val) !== 0) { run = len; break; }
        bar += len;
      }
      if (bar === 0) return { bar: 0, run: form.totalBars };
      if (!any || bar < bestBar || bestBar === 0) { bestBar = bar; bestRun = run; }
    }
    return any ? { bar: bestBar, run: bestRun } : { bar: 0, run: form.totalBars };
  };
  // r24 — THE STAGGER, and it is the same defect as the entry ramp seen from the
  // other side. His two "beat drop" cards:
  //   su_mysterious_space  "you don't have to always do a beat drop, especially
  //                         in calmer or more atmospheric song."
  //   su_excited_training  "whenever it feels like a beat drop, the note that the
  //                         piano and stuff begins on sort of negates that drop
  //                         because it sounds forced and not like an actual beat
  //                         drop."
  //
  // FIRST HYPOTHESIS, REFUTED BY MEASUREMENT: that the breakdown fires too often
  // (27 of 28 suite songs carry one — "always" is literal) or strips too deep.
  // The depth is fine. Measured as the deepest sustained 2-bar dip against each
  // file's own median voice count, we sit at median 0.69 / p25 0.55 against the
  // reference's 0.75 / 0.63 — a little deeper, not a defect.
  //
  // WHAT IS LEFT is how many voices arrive in the SAME BAR — and the honest
  // version of that number is much smaller than the one I first measured.
  //
  // TWO MEASUREMENT ERRORS, both caught here rather than shipped. (a) The first
  // pass counted every drum SOUND as its own voice while the reference counts a
  // kit as one part (MIDI channel 9), which reported us at a median of 6 and a
  // max of 13 against the reference's 4 and 10. Collapsing our percussion to one
  // voice, as the reference already does, gives median 4 / p75 6 / p90 7 / max 9
  // against 4 / 5 / 6 / 10 — we were about ONE voice over at the top end, not
  // seven. (b) The un-weighted count could not see this fix at all, because a
  // voice ramped to gain 0 still emits a hap; the metric had to be gain-weighted
  // before an A/B on the stagger showed any difference. It is stated here because
  // the first framing of this fix was wrong and the file should say so.
  //
  // So the stagger is a TAIL fix, not a rescue: at a threshold of 5 it takes us
  // to median 4 / p75 5 / p90 6, which is the reference distribution exactly.
  // Staggering smaller groups (threshold 3) overshoots to a median of 3, under
  // the reference — a pile-up of five voices is the drop he is describing; three
  // arriving together is just an arrangement.
  //
  // The repair is in his own words about a reference he liked (Sky_battle): "note
  // how some instruments lead up to their section before they come in like start
  // playing before their section". Delaying rather than anticipating keeps every
  // voice inside the section it was cast for, which anticipation would not.
  // Voices sharing an entry bar are ordered by a hash of their own expression —
  // not by their position in the mix array, which would make the stagger depend
  // on assembly order — and take 0/1/2 bars of silence before their ramp.
  const entryPlan = (exprs) => {
    const span = exprs.map((x) => (x ? entrySpanOfExpr(x) : { bar: 0, run: 0 }));
    const slot = exprs.map(() => 0);
    const byBar = new Map();
    span.forEach((sp, i) => {
      if (!exprs[i] || sp.bar <= 0 || sp.bar >= form.totalBars) return;
      if (sp.run < 4) return;                    // too short a run to delay into
      if (!byBar.has(sp.bar)) byBar.set(sp.bar, []);
      byBar.get(sp.bar).push(i);
    });
    for (const ix of byBar.values()) {
      if (ix.length < 5) continue;
      ix.slice().sort((a, b) => fnv(exprs[a]) - fnv(exprs[b]))
        .forEach((i, k) => { slot[i] = k % 3; });
    }
    return { span, slot };
  };
  const withEntryAt = (expr, sp, slot) => {
    if (!entryRampOn || !expr) return expr;
    const e = sp.bar;
    if (e <= 0 || e >= form.totalBars) return expr;
    // r27 — A RUN GUARD, the one `entryPlan` already has and this did not.
    // Caught by the adversarial verify pass: an ALTERNATING-bar layer (mask
    // `0 1 0 1 0 1 …`, which is what layer_breathing and the 2-bar descant
    // produce) has a leading zero, so `entrySpanOfExpr` reads it as an entry at
    // bar 1 with a run of 1 and this function ramps it — attenuating the layer's
    // FIRST SOUNDING BAR to 0.42 and its second to 0.9, forever, on a layer that
    // never "entered" at all. It fired six times on the r27 page, every one a
    // false positive. `entryPlan` skips these already (`if (sp.run < 4) return`);
    // the ramp simply never got the same test.
    // OPT-IN (`opts.entryRunGuard`). Measured: switched on by default it changes
    // the MIX of nine judged songs (vs_excited_casino, vs_excited_training,
    // vs_happy_festival, vs_nostalgic_shop, vs_mysterious_space, vs_excited_space,
    // vs_calm_shrine, vs_excited_fight, vs_nostalgic_casino) — every one of them a
    // song whose alternating layers he has already heard attenuated. Correct fix,
    // but it is a re-audition, not a bug fix in place.
    if (r27() && opts.entryRunGuard === true && sp.run < 4) return expr;
    const ramp = [...Array(slot).fill(0), ...ENTRY_RAMP];
    const g = Array.from({ length: form.totalBars }, (_, b) =>
      (b >= e && b < e + ramp.length ? ramp[b - e] : 1));
    return `(${expr}).mul(gain("<${maskString(g)}>"))`;
  };

  // r27 — CONTRAST AT BAR ZERO. His loudest complaint on the r26 chordcam page,
  // six cards, escalating to "dislike" and "ive been telling you this for a long
  // time": "piano for a long time again in the beginning", plus, on the two
  // atmospheric ones, "there shouldn't be a drop, it should kinda just fade in".
  //
  // MEASURED across all 23 chordcam songs, in the mix. One metric separates the
  // 11 he judged with ZERO overlap — the entry time of the first voice that is
  // neither piano-family, nor percussion, nor one of the lead's own doublers
  // (_companion/_octave/_echo, which sound at the lead's exact onsets):
  //     complained (7):  16.4  19.6  31.5  33.9  41.1  84.7  230.4 s
  //     liked      (4):   0.0   0.0   0.0   0.0 s
  // Bare-intro seconds alone separates only 10 of 11. cc_neosoul_essence has a
  // bare intro of ZERO and is still the worst case in the set: its two other
  // bar-0 voices are the piano lead's own companion and octave doubler, so the
  // first genuinely different voice arrives at 230 s.
  //
  // The DROP SIZE is not the defect. His four liked songs' largest simultaneous
  // entry is 7/3/9/7 voices — bigger than 5 of the 7 he complained about. It
  // lands at bar 0. So the fix is not "fewer voices", it is "one voice that is
  // not the piano, from the first bar".
  const CONTRAST_FADE = [0.55, 0.70, 0.82, 0.92, 0.97];
  const contrastOn = r27() && !!opts.contrastAtZero;
  const soundOfExpr = (x) => (String(x).match(/\.s\("([^"]+)"/)?.[1] ?? '');
  const isPianoish = (s) => /^(piano|gm_epiano|gm_harpsichord|gm_clavi)/.test(s);
  const pullToZero = (expr) => {
    // rewrite each mask's leading run of 0s to 1s, so the layer sounds from bar 0
    let hit = false;
    const out = String(expr).replace(/\.mask\("<([^"]*)>"\)/g, (whole, body) => {
      const toks = body.trim().split(/\s+/);
      if (!toks.length) return whole;
      const [v0, n0] = toks[0].split('@');
      if (Number(v0) !== 0) return whole;
      hit = true;
      toks[0] = n0 ? `1@${n0}` : '1';
      return `.mask("<${toks.join(' ')}>")`;
    });
    if (!hit) return null;
    // A voice pulled back this far must ARRIVE, not switch on — the "it should
    // kinda just fade in" half of his note.
    //
    // The first fade started at 0.25 and was measured at 4.0-14.3% of the piano's
    // bar-0 gain (median 8.6%), because it MULTIPLIES with the layer's breath
    // envelope, which opens at 0.40: 0.25 x 0.40 = a ten-percent opening. Worse,
    // the breath envelope's rest slot landed inside the fade window, so 6 of 8
    // songs had a bar of EXACT SILENCE inside their fade-in — the device meant to
    // stop a bare piano opening handed one back a bar later.
    //
    // So the fade starts higher and, more importantly, the layer's own breath is
    // suppressed for the length of the fade: one envelope, not two multiplied.
    const g = Array.from({ length: form.totalBars }, (_, b) =>
      (b < CONTRAST_FADE.length ? CONTRAST_FADE[b] : 1));
    const noBreath = out.replace(/\.mul\(gain\("<[^"]*>"\)\)/g, (m) => {
      const body = m.slice(m.indexOf('<') + 1, m.lastIndexOf('>'));
      const toks = body.trim().split(/\s+/);
      let bar = 0, changed = false;
      const kept = toks.map((t) => {
        const [val, n] = t.split('@');
        const len = Number(n ?? 1);
        const inFade = bar < CONTRAST_FADE.length;
        bar += len;
        if (inFade && Number(val) < 1) { changed = true; return n ? `1@${n}` : '1'; }
        return t;
      });
      return changed ? `.mul(gain("<${kept.join(' ')}>"))` : m;
    });
    return `(${noBreath}).mul(gain("<${maskString(g)}>"))`;
  };
  let contrastNote = null;
  if (contrastOn) {
    // ---- WHAT THE ADVERSARIAL VERIFY PASS FOUND, and the three guards it forced.
    //
    // The first cut of this rule fired on 8 songs and was a net NEGATIVE on 7 of
    // them. Measured, not argued:
    //
    // (a) 6 of the 8 pulls were REDUNDANT — the song already had a non-piano
    //     voice at bar 0 (a harmony_support pad/cello/horn at -4.7 to -7.9 dB
    //     under the piano, i.e. genuinely audible). The candidate filter is
    //     `sp.bar > 0`, which excludes every layer ALREADY at bar 0, so the rule
    //     could not see that the song had already passed and fired anyway.
    //
    // (b) 7 of the 8 resurrected layers were LEAD DOUBLERS by declaration —
    //     melody_backup (`derives:'lead'`, "doubles the lead line ... without
    //     adding any new rhythm"), melody_takeover, alternate_melody. Measured
    //     co-onset with the lead 67-100%, and 50-73% of those in unison or at
    //     the octave. D100 is explicit that this is the shape his ear rejected:
    //     "the melody is super loud ... like a lead singer which destroys the
    //     atmosphericness". A doubler is the opposite of a contrast voice.
    //
    // (c) On a single-section form EVERY layer mask is all-1s or all-0s, so
    //     `sp.bar > 0` can only ever select a layer that was cast for ZERO bars.
    //     The rule was not pulling a voice earlier, it was resurrecting a
    //     switched-off layer and playing it for 100% of the song (+12-18% haps).
    //
    // So: skip if the song already passes, refuse lead-derived layers, and refuse
    // a layer that was never cast at all.
    const already = layerMixOut.some((x) => {
      if (!x) return false;
      const sp = entrySpanOfExpr(x);
      return sp.bar === 0 && !isPianoish(soundOfExpr(x));
    });
    // a layer's role is read from the PLANNER's own declaration, never from its
    // sound name — a name-based rule has failed five times in this project
    const derivesLead = (i) => ['lead', 'lead-rhythm'].includes(shaped.layers?.[i]?.derives);
    const neverCast = (x) => /\.mask\("<0@\d+>"\)/.test(String(x));
    if (already) {
      contrastNote = 'not needed — a non-piano voice already sounds in bar 0';
    } else {
      const cand = layerMixOut
        .map((x, i) => ({ x, i, s: soundOfExpr(x), sp: x ? entrySpanOfExpr(x) : null }))
        .filter((c) => c.x && c.sp && c.sp.bar > 0 && !isPianoish(c.s)
          && !derivesLead(c.i) && !neverCast(c.x))
        .sort((a, b) => a.sp.bar - b.sp.bar || (a.s < b.s ? -1 : 1));
      if (!cand.length) {
        contrastNote = 'NO CANDIDATE — every non-piano layer is either a lead doubler or was never cast';
      } else {
        const pulled = pullToZero(cand[0].x);
        if (pulled) {
          layerMixOut[cand[0].i] = pulled;
          contrastNote = `${cand[0].s} pulled from bar ${cand[0].sp.bar} to bar 0`;
        }
      }
    }
  }

  // surface the outcome on the card: a rule that decides NOT to fire has to say
  // so, or the page cannot be audited (the r27 verify pass caught a device that
  // was advertised on a song where it had been suppressed)
  if (contrastOn && contrastNote) extraInfo.push(`contrast at bar 0: ${contrastNote}`);

  // every voice that is NOT the harmonic spine (base accompaniment, the tune
  // itself, the drums) is planned together, so the stagger can see them all.
  //
  // r27: the DRUMS join the plan. Measured on the chordcam page at the bars his
  // "drop" notes point at: of the pitched voices entering there, 17 of 18 were
  // already ramped (median 0.40 of their own median gain, min 0.00) — but 12 of
  // 12 percussion voices entered at 0.90 or above, median 1.00. The pitched half
  // of the arrangement had been fading in for three rounds and the kit was
  // arriving at full level on top of it, which is the whole of what a drop
  // sounds like. This was found by an adversarial verify pass refuting my own
  // "nothing in the suite actually fades in" claim, which was wrong.
  // OPT-IN, not on by default. The rule is right and the measurement behind it
  // is solid, but switching it on here rewrites the drums of every unpinned song
  // on the judged page and invalidates their HQ renders — that is a round of its
  // own with his ear on the result, not a side effect of building a test page.
  const percRampOn = r27() && !!opts.percRamp;
  const rampSrc = [companionExpr, melodyDoubleExpr, echoExpr, octaveExpr, ...layerMixOut, ...extraOut,
    ...(percRampOn ? [drums] : [])];
  const { span: rampSpan, slot: rampSlot } = entryPlan(rampSrc);
  const R = (i) => withEntryAt(rampSrc[i], rampSpan[i], rampSlot[i]);
  const nFixed = 4, nLayer = layerMixOut.length;
  const mixParts = [
    withCurve(bdGainStr ? `(${baseMix}).mul(gain("<${bdGainStr}>"))`
      : (bdMaskStr ? `(${baseMix}).mask("<${bdMaskStr}>")` : baseMix)),
    ...(letterLead.lead ? [withCurve(letterLead.lead, true)] : []),
    ...(companionExpr ? [withCurve(R(0), true)] : []),
    ...(melodyDoubleExpr ? [withCurve(R(1), true)] : []),
    ...(echoExpr ? [withCurve(R(2), true)] : []),
    ...(octaveExpr ? [withCurve(R(3), true)] : []),
    ...layerMixOut.map((x, i) => withCurve(R(nFixed + i), shaped.layers[i]?.derives === 'lead' || shaped.layers[i]?.derives === 'lead-rhythm')),
    ...extraOut.map((x, i) => withCurve(R(nFixed + nLayer + i))),
    // percAllBars also rides THROUGH the breakdown strip (NSMB law: the
    // hand-drum loop never changes across sections — verify catch: the
    // breakdown mask re-created somber desert's 16 drumless bars)
    ...(drums ? [withCurve((() => {
      // r27: take the ramped copy when percRamp is live, then apply the
      // breakdown mask on top — the strip must still cut the kit out.
      const d = percRampOn ? (R(nFixed + nLayer + extraOut.length) ?? drums) : drums;
      return bdMaskStr && !opts.percAllBars ? `(${d}).mask("<${bdMaskStr}>")` : d;
    })())] : []),
    ...fxParts,
  ];
  // r34 VOCAL LEAD (opts.vocalLead, the VOCAL=1 page only — no judged song
  // carries it): the tune is SUNG by the vocal tier (scripts/render-vocal.mjs),
  // so the instrumental lead and its doublers drop to a GUIDE level under the
  // voice instead of doubling it at full gain. The lead's masks are untouched
  // (export-vocal.mjs reads bar presence from the mix by time+pitch, gain-blind),
  // the companion stays (it is harmony, not a double), the octave partner and
  // the melody_backup doubler ride the same guide. `vocalLead: <number>` sets
  // the guide multiplier; `true` = 0.45.
  if (opts.vocalLead) {
    const guide = typeof opts.vocalLead === 'number' ? opts.vocalLead : 0.45;
    const ix = [];
    let k = 1;
    if (letterLead.lead) ix.push(k++);
    if (companionExpr) k++;
    if (melodyDoubleExpr) ix.push(k++);
    if (echoExpr) k++;
    if (octaveExpr) ix.push(k++);
    // cast layers that DOUBLE or TAKE the tune (melody_backup "doubles the
    // lead line", D100; melody_takeover carries it in its own sections, where
    // the vocal sings too) ride the guide; alternate_melody is its own line
    // and stays — independence is what the corpus wants beside a voice (D102)
    const doubled = [];
    for (let i = 0; i < layerMixOut.length; i++) {
      const L = shaped.layers[i];
      // r35 verify catch (his vx_happy_jungle "random fast slightly off-beat
      // synth sounds like glitching"): the layer parts were indexed from the
      // CONSTANT nFixed (= 4, the length of rampSrc's fixed head), but mixParts'
      // head is VARIABLE — base + each present one of lead/companion/double/
      // echo/octave — so on a song whose head is not exactly four entries the
      // guide wrapped a NEIGHBOURING layer and left the takeover at full gain
      // (measured: jungle's kalimba melody_takeover at 0.89 in the mix, bars
      // 14-19, with the guide on some other part). `k` is the true first-layer
      // index. r35-gated: the judged suite keeps the part it was judged with.
      if (/melody_backup|melody_takeover/.test(`${L?.part ?? ''} ${L?.id ?? ''}`)) { ix.push((ruleFresh(35) ? k : nFixed) + i); doubled.push(String(L?.part ?? L?.id).replace(/^.*::/, '')); }
    }
    for (const i of ix) mixParts[i] = `(${mixParts[i]}).mul(gain(${guide}))`;
    extraInfo.push(`vocal lead: the tune is sung (vocal tier, r34); the instrumental lead${ix.length > 1 ? ` and its doublers (${['octave/backup', ...doubled].slice(ix.length > 1 + doubled.length ? 0 : 1).join(', ')})` : ''} play as a x${guide} guide under the voice`);
  }
  // r25 — "PIANO TOO LOUD", seven cards in one export: "piano way too loud. I
  // cant tell what's going on at all" (su_excited_fight), "piano is way too loud"
  // (su_scary_fight), "piano too loud" (su_excited_training), "the piano too loud
  // ... the loud instruments should just be a bit softer" (su_mysterious_cave),
  // "the piano isn't even reverbed or dampered and too loud" (su_calm_water),
  // "piano too loud but better" (su_calm_menu), "cello sucks ... drowns everything
  // else" (su_scary_manor).
  //
  // MEASURED in the mix, median gain of the piano against the median gain of every
  // other PITCHED voice sounding in the same song:
  //          piano   others   ratio   piano's share of the pitched notes
  //   KEPT    0.85    0.28     2.92    53%
  //   SUITE   0.87    0.25     3.49    29%
  // The piano did not get louder — everything around it got quieter AND more
  // numerous. His kept songs carry a median of 5 pitched voices; the suite carries
  // 8. So the piano is still mixed as though it were leading a quintet while it is
  // now 29% of the notes in an octet, and it sits 3.5x over its neighbours.
  //
  // It tracks his verdicts almost exactly. The three songs he was harshest about
  // measure the highest ratios — su_excited_training 3.97, su_excited_fight 3.61,
  // su_scary_manor 4.28, each with the piano at only 9-11% of the notes — and the
  // two he praised measure the lowest: su_triumphant_snow 2.72 ("definitely a
  // solid song") and su_mysterious_desert 2.29 ("big fan of this song").
  //
  // So the trim is not a constant: it is the ensemble size. sqrt keeps it gentle —
  // a quintet is untouched, an octet comes down to 0.79, and the floor stops a
  // twelve-voice song from burying its own lead.
  // r26/D115: state the budget on the card so he is ruling against the number
  // r28: when a page RAISES the budget, say what that bought and what it cost.
  // The default message only fires when something was dropped, so a lifted
  // budget was silent — and a lift is the decision most worth arguing with.
  if (rubBudgetOn && opts.rubBudget != null && opts.rubBudget > (LANE_RUB_BUDGET[env] ?? 0.60) && !rubDropped.length) {
    extraInfo.push(`dissonance budget RAISED to ${rubBudget.toFixed(2)} for this page (${env}'s own is `
      + `${(LANE_RUB_BUDGET[env] ?? 0.60).toFixed(2)}) so the frozen slot can cast at all — it is R2, the reel set's `
      + 'motor device, and at 1.00/bar it does not fit any casual lane\u2019s budget, which is why the `layerStack` card '
      + 'has been shipping WITHOUT its own defining device. MEASURED AS AN ISOLATION PAIR on this page: with the frozen '
      + 'slot the mix runs 3.98 close semitone/tritone hits per bar against the lead, without it 2.89, and the page he '
      + 'judged last round ran 2.51. So R2 costs +38% harmonic friction. The echo layer was switched OFF here to pay for '
      + 'part of it (4.30 -> 3.98) since it is not one of the seven reel rules. His ear decides whether the trade is right');
  }
  if (rubBudgetOn && rubDropped.length) {
    extraInfo.push(`dissonance budget: ${env} allows ${rubBudget.toFixed(2)} close semitone/tritone hits per bar `
      + `— spent ${rubSpend.toFixed(2)} on ${[...rubAllowed].filter((d) => d !== 'sparkle').join(', ')}; `
      + `NOT CAST: ${rubDropped.join(', ')} (r26 — measured costs, colour is not charged, `
      + `and a lane's own device is never metered)`);
  }
  if (handClean && handDropped) {
    extraInfo.push(`left-hand voicing: ${handDropped} simultaneous note(s) dropped because the pair was a `
      + `2nd, 7th, tritone or octave — his 15 kept songs contain ZERO of those in the accompaniment hand `
      + `across 900 pairs, and the suite ran 16.4% (r26)`);
  }
  if (supportSnapOn && supportSnapped) {
    extraInfo.push(`support agreement: ${supportSnapped} note(s) in the descant/counterline snapped to a tone `
      + `that agrees with the bar's chord — his "make them just have supporting roles for the chord progression". `
      + `9ths, 6ths and sus colour are kept; only foreign pitches and semitone rubs move (r26)`);
  }
  const KEPT_VOICES = 5;
  const DRUM_S = /^(md_|vc_|hx_)|^(bd|sd|hh|oh|rim|cp|lt|mt|ht|cr|rd)$/;
  const pitchedVoices = (() => {
    const set = new Set();
    for (const part of mixParts) for (const m of String(part).matchAll(/\.s\("([a-z0-9_]+)"\)/g))
      if (!DRUM_S.test(m[1])) set.add(m[1]);
    return set.size;
  })();
  // Ensemble size alone leaves the calm songs almost untouched — a six-voice song
  // trims to 0.91 — and three of his "piano too loud" cards are exactly those
  // (su_calm_menu, su_calm_water, su_scary_fight). A background-salience song is
  // one where nothing should dominate, so it takes a second, flat trim.
  const salienceTrim = v.salience === 'background' ? 0.88 : 1;
  const pianoTrim = ruleFresh(25) && (pitchedVoices > KEPT_VOICES || salienceTrim < 1)
    ? Math.max(0.72, Math.round(Math.min(1, Math.sqrt(KEPT_VOICES / pitchedVoices)) * salienceTrim * 100) / 100)
    : 1;
  if (pianoTrim < 1) {
    for (let i = 0; i < mixParts.length; i++)
      if (/\.s\("piano"\)/.test(mixParts[i])) mixParts[i] = `(${mixParts[i]}).mul(gain(${pianoTrim}))`;
    // r33 verify: this trim multiplies the piano LEAD's group AFTER the drum
    // cap was computed against that lead, so a "capped" kit ran 1.0-1.44x the
    // lead's realized mean in the mix (15 of 16 songs flagged). When the trim
    // reaches a piano lead, the kit rides the same trim so the capped RATIO
    // survives the multiplication.
    if (r33() && LEAD_SOUND === 'piano') {
      for (let i = 0; i < mixParts.length; i++) {
        if (/s\("[^"]*(?:md_|vc_)/.test(mixParts[i]) && !/note\(/.test(mixParts[i])) {
          mixParts[i] = `(${mixParts[i]}).mul(gain(${pianoTrim}))`;
        }
      }
    }
    extraInfo.push(`piano trim: x${pianoTrim} — ${pitchedVoices} pitched voices against the ${KEPT_VOICES} his kept songs carry (r25, his "piano too loud" x7)${r33() && LEAD_SOUND === 'piano' ? ' — and the kit rides the same trim so the drum cap’s ratio survives (r33)' : ''}`);
  }
  let mix = mixParts.length > 1 ? `stack(${mixParts.join(', ')})` : mixParts[0];

  // r34: a vocal-lead song also exposes the lead AS THE MIX PLAYS IT (masked,
  // per letter and statement, handoffs applied) — export-vocal.mjs sings from
  // it. The unmasked `_lead` is a loop that diverges from the mix in later
  // letters (measured: vx_tense_fight sang 42 of 96 notes off the solo).
  // A melody_takeover layer carries the tune in ITS sections (measured: jungle
  // bars 14-19 on the kalimba, casino bars 16-23 on the square — unsung and
  // guided, so the tune went quiet); its masked mix part joins the sung line.
  const takeoverMix = opts.vocalLead
    ? layerMixOut.filter((x, i) => /melody_takeover/.test(`${shaped.layers[i]?.part ?? ''} ${shaped.layers[i]?.id ?? ''}`))
    : [];
  const leadMixExpr = opts.vocalLead && letterLead.lead
    ? (takeoverMix.length ? `stack(${[letterLead.lead, ...takeoverMix].join(', ')})` : letterLead.lead)
    : null;
  const solos = { _acc: base, _lead: leadBound.expr, ...(leadMixExpr ? { _lead_mix: leadMixExpr } : {}), ...extraSolos, ...(drums ? { _drums: drums } : {}) };
  for (const l of rendered.layers) solos[l.id] = l.expr;
  // D67 (verify-pass finding): a pad's SOLO carries its mix-side base wave —
  // without it the solo plays the flat inner gains the mix overrides, and
  // soloing a layer should sound like what the mix does with it
  for (const l of rendered.layers) {
    if (l.derives !== 'chords') continue;
    solos[l.id] = `${l.expr}.gain("<${[0.85, 1, 1.12, 0.97].map((m) => Math.round(l.gain * 0.72 * m * 100) / 100).join(' ')}>")`;
  }

  // ---- the buildup/drop structure (D63 addendum — his b-52's note) ---------
  // "first 4 measures are buildup, so don't loop those. also do the buildup
  // with the melody and harmony (try a song with this buildup)." Four intro
  // bars that never return: drums-only, +drone, +accompaniment, +riser — then
  // the song proper begins with a DROP (everything at once). Alignment rule:
  // the harmony loop is constrained to 4 bars (opts.loop4) so every expr's
  // period divides the intro and no phase drifts; all masks share the global
  // period 4+T. Letters and the treat still vary the melody/harmony inside.
  let totalBarsOut = form.totalBars;
  let dropInfo = null;
  if (opts.dropIntro) {
    const T = form.totalBars;
    if (loopBars !== 4) throw new Error(`drop song needs a 4-bar loop, got ${loopBars}`);
    if (leadBound.boundMeta.period % 4 !== 0 && 4 % leadBound.boundMeta.period !== 0) {
      throw new Error(`drop song lead period ${leadBound.boundMeta.period} misaligns with the 4-bar intro`);
    }
    const pre = (bars) => maskString([0, 0, 0, 0, ...bars]);
    const gateMain = `"<0!4 1!${T}>"`;
    const ctxIntro = { harmony: [barSyms[0]], barsPerChord: 1, key };
    const droneE = bindFigure(FIGURATIONS_FOUNDATION.fnd_drone_fifth, ctxIntro, v.meter, { sound: 'piano', fx: accFx, octave: 2, rhythmName: 'intro-drone' }).expr;
    const accIn = bindAcc(accFig, ctxIntro);
    const RISER = {
      onsets: ['0/1', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'],
      figure: ['R', '3', '5', 'R+', '3+', '5+', 'R++', '3++'],
      accents: [0.45, 0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 1],
      legato: false, octave: 3, bars: 1, grid: 8, meter_class: '4/4', class: 'arp',
    };
    const riser = bindFigure(RISER, ctxIntro, v.meter, { sound: 'piano', fx: '.room(0.3)', rhythmName: 'intro-riser' }).expr;
    const dIntro = dpStack(opts.dropIntro.pattern, { from: 0, to: 4, gainMul: 0.8 }).expr;
    const dBody = dpStack(opts.dropIntro.pattern, { from: 4, to: 8, gainMul: 0.8 }).expr;
    const introParts = [
      `${dIntro}.mask("<1!4 0!${T}>")`,
      `${droneE}.mask("<0 1 1 1 0!${T}>")`,
      `${accIn}.mask("<0 0 1 1 0!${T}>")`,
      `${riser}.mask("<0 0 0 1 0!${T}>")`,
    ];
    // the drop: accompaniment (with travel+treat masks re-based to 4+T), the
    // letter-formed lead rebuilt on the global timeline, EVERY cast voice in
    // from the first drop bar (chord-reading voices still swap in the treat
    // section), and the pattern's own loop body on drums
    // mirrors basePieces' per-statement salt — the drop path rebuilds the same
    // combos on the 4+T timeline and must bind the identical expressions
    const basePieces2 = [...comboMask.values()].map(({ fig, variant, stmt, bars }) =>
      `${bindAcc(fig, variant ? ctxBarV : ctxBar, stmt)}.mask("<${pre(bars)}>")`);
    const letterBars = new Map();
    barLetter.forEach((L, bar) => {
      if (!L) return;
      if (!letterBars.has(L)) letterBars.set(L, Array(barLetter.length).fill(0));
      letterBars.get(L)[bar] = 1;
    });
    const leadPieces = [...letterBars.entries()].map(([L, bars]) => {
      const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
      return `${bindLetter(base0, L.endsWith('*') ? ctxBarV : ctxBar).expr}.mask("<${pre(bars)}>")`;
    });
    const ones = Array(T).fill(1);
    const layerPieces = rendered.layers.map((l) => {
      const variant = renderedV?.layers.find((x) => x.id === l.id)?.expr ?? null;
      if (variant && varyBars.some(Boolean)) {
        const out = ones.map((_, i) => (varyBars[i] ? 0 : 1));
        return `stack(${l.expr}.mask("<${pre(out)}>"), ${variant}.mask("<${pre(varyBars)}>"))`;
      }
      return `${l.expr}.mask(${gateMain})`;
    });
    // D85 addendum: re-assemble the recorded extras on the 4+T timeline
    // (masks pre()-rebased so nothing phase-drifts, D63). The drop path
    // stays section-curve-exempt (D82: its arc IS the buildup/drop).
    const extraPieces = extraRecs.flatMap(([bindFn, bars]) => {
      const pieces = [];
      const out = bars.map((x, i) => (x && !(ctxBarV && varyBars[i]) ? 1 : 0));
      if (out.some(Boolean)) pieces.push(`${bindFn(ctxBar)}.mask("<${pre(out)}>")${rampMul([0, 0, 0, 0, ...out])}`);
      if (ctxBarV) {
        const inn = bars.map((x, i) => (x && varyBars[i] ? 1 : 0));
        if (inn.some(Boolean)) pieces.push(`${bindFn(ctxBarV)}.mask("<${pre(inn)}>")`);
      }
      return pieces;
    });
    const mainParts = [...basePieces2, ...leadPieces, ...layerPieces, ...extraPieces, `${dBody}.mask(${gateMain})`];
    mix = `stack(${introParts.join(', ')}, ${mainParts.join(', ')})`;
    solos._intro = `stack(${introParts.join(', ')})`;
    solos._dropdrums = dBody;
    totalBarsOut = T + 4;
    dropInfo = `4-bar buildup (drums \u2192 +drone \u2192 +accompaniment \u2192 +riser), never looped inside the song body; drop at bar 5 with every voice in. Drums: ${opts.dropIntro.pattern} \u2014 his note: \u201c${opts.dropIntro.note}\u201d`;
    drumInfo.push(`${opts.dropIntro.pattern} buildup bars 1-4, loop body bars 5-8`);
  }

  // ---- r16 SWING ----------------------------------------------------------
  // His answer was "for some reason, in b the duration of the notes are really
  // really short. but yes otherwise build it" — a bug report and a green light
  // in one sentence. The demo faked swing by subdividing to a 1/96 grid and
  // padding with `~@N` rests, so every note owned one slot of that grid and
  // came out 6x shorter (measured: 0.0104 vs 0.0625 of a bar). Strudel has the
  // real primitive, `swingBy(amount, subdiv)`, which DELAYS the second half of
  // each 1/subdiv window and leaves durations alone — measured on a full mix,
  // 224 haps in, 224 haps out, total duration unchanged.
  //
  // opts.swing is the RATIO he can hear (0.585 = get_proto's measured swing,
  // between straight 0.5 and triplet 0.667); swingBy wants 2*(ratio-0.5).
  // subdiv must be beats*2 to swing SIXTEENTHS — passing 16 is a silent no-op.
  if (opts.swing) {
    const ratio = opts.swing === true ? 0.585 : opts.swing;
    const amt = Math.round((ratio - 0.5) * 2 * 1000) / 1000;
    const sub = opts.swingSubdiv ?? beats * 2;
    mix = `${mix}.swingBy(${amt}, ${sub})`;
    for (const k of Object.keys(solos)) solos[k] = `${solos[k]}.swingBy(${amt}, ${sub})`;
    extraInfo.push(`swing: ${ratio} ratio on offbeat 16ths (swingBy ${amt}, subdiv ${sub}) — onsets shift, durations hold`);
  }

  songs.push({
    name, prompt, vibeNotes: v.notes,
    key, bpm: v.bpm, meter: v.meter, beats, totalBars: totalBarsOut,
    family: v.family, role: v.role,
    exemplar: exName, ops: (e.lineage?.ops ?? []).map((o) => o.op ?? o),
    degrees: e.degrees, symbols, numerals: e.numerals ?? null,
    // only present when the r27 uneven-length plan is live, so adding this
    // inspection field cannot diff a judged page that does not use it
    ...(chordBarPlan ? { chordBarPlan } : {}),
    // accName still names the POOL pick, which is what the travel graph walks
    // from; when the jungle vamp overrides the A figure, report what actually
    // plays or the page reads as though the Alberti were still there.
    accompaniment: accFig.name ?? accName, accClass: accFig.class,
    scheme: mf.scheme, letters: mfx.letters, travel: travelInfo,
    treat: varyInfo ? { op: varyInfo.op, symbols: varyInfo.symbols, kind: varyInfo.kind } : null,
    ensemble: { count: v.ensemble.count, range: v.ensemble.range, fullCast },
    cast: [...rendered.layers.map((l) => `${l.instrument} (${l.id})`), ...extraInfo],
    drums: drumInfo,
    salience: v.salience,
    articulation: `${ART.style}${ART.pedal ? ' + damper pedal' : ''}${LEAD.hold ? ' \u00b7 held lead' : ''}`,
    drop: dropInfo,
    mix, solos,
  });
  CHECKS.push([name, 'mix', mix, v.bpm, beats, totalBarsOut]);
  CHECKS.push([name, '_acc', base, v.bpm, beats, totalBarsOut]);
  if (drums) CHECKS.push([name, '_drums', drums, v.bpm, beats, totalBarsOut]);
}

// D65-D67 per-song asks from his round-2 and round-3 notes
const SONG_OPTS = {
  // r3: halve the piano-only opening; drums swapped lighter+groovier above
  vs_happy_shop: { halveIntro: true },
  // r3: "make the notes with the really short durations hold for longer -
  // it sounds robotic" — a floor under the lead's articulation ratios
  // D91 ("construction and tense fight are much better than the piano
  // versions -> one note is instead of just the one synth being the
  // melody, to vary it a bit"): non-A letters bind the partner synth.
  // VOICE-ONLY on this kept song — cells and seeds unchanged.
  vs_x_construction: { articFloor: 0.9, varyLeadVoice: true },
  // D91 mid-turn: "the note i made about not all synth all the time
  // applies to the triumphant boss song by the way but can be abstracted
  // for most songs" — same voice-only letter variation.
  vs_triumphant_boss: { varyLeadVoice: true },
  // r2: mid-octave offbeat texture + held guide-tone counterline
  // D91: the same voice-only letter variation as construction; the low
  // holding bass + muffled soft chords he praised are untouched.
  vs_tense_fight: { texture: { class: 'offbeat', octave: 4 }, counterline: true, leadGainMul: 0.85, varyLeadVoice: true },
  // r2: "too uniform" + "more layers as soft support"; r3 still: forced AB
  // scheme so the accompaniment actually TRAVELS, pad breathes from bar 1
  vs_somber_aftermath: { accClassPrefer: 'arp', stringsPad: 'add', padFromStart: true, scheme: 'AB' },
  // r2: strings "can't hear them" + secondary melody "way too high";
  // r3: strings "should start from the beginning but very soft"
  // genre-expansion round, his note: cave/snow "melody in the right hand
  // piano is a bit too soft and ... doesn't belong as a piano only section.
  // maybe introduce a different element on top of the piano rh that plays
  // the melody too (different from the flute though)" — a doubling voice
  // rides the same (time,midi) melody; additive-only on both kept songs.
  vs_mysterious_cave: { stringsPad: true, capMelody: true, padFromStart: true, melodyDouble: { sound: 'gm_music_box', gainMul: 0.5 } },
  // r2: strings pad; r3: "from the beginning ... the setting should begin
  // as it starts playing (as its in the snow)"
  vs_nostalgic_snow: { stringsPad: true, padFromStart: true, melodyDouble: { sound: 'gm_celesta', gainMul: 0.5 } },
  // r3 kill faults the MIX not the harmony ("more reverb ... pad too loud
  // ... vary fluidly in dynamics") — base stays, pad breathes from bar 1
  vs_calm_water: { keepBase: true, padFromStart: true, fixChord: ['0:7', '9:m'], padGainMul: 0.85 },
  // D86: the four fully-synth songs (his round-9 ask)
  vs_calm_lab: { fullSynth: true },
  // r10 menu note: "not enough actual melody or texture ... some soft
  // string support would be good" — an added synth-strings pad whose top
  // voice sings the D72 planned phrase.
  // D91: KEPT ("much better ... it feels smooth and flowing") — same
  // judged-with pin as stealth.
  vs_calm_menu: { fullSynth: true, stringsPad: 'add', bridgeHarmony: true, breakdown: true, melodyGrammar: true },
  // r10 stealth note: melody too talky (density halved) + "more tension
  // by having a high texture" (the descant's 9-over-5 cluster, octave 5).
  // D91: KEPT ("I like this a lot actually... conveys stealth") — judged
  // WITH the unkept-path devices, so they pin ON (a keep flipping priorKeep
  // must not strip the bridge/breakdown/grammar he approved).
  vs_tense_stealth: { fullSynth: true, leadDensityMul: 0.25, accClassPrefer: 'sustain', descant: { octave: 5, tension: true }, bridgeHarmony: true, breakdown: true, melodyGrammar: true },
  // D91 (casino note): intro capped by the 16s rule; "melody is too
  // active (jumping too much)" -> density halved + the walk's range
  // wall tightened; "not any supportive counter melody" -> counterline
  // forced. The letter handoff finale he praised is untouched.
// r16: the one song carrying the new swing, where a shuffle is idiomatic.
  // r18: "there's also not any supportive counter melody for the first melody
  // part to support it - I wanna add some" — said again after r17 added the
  // counterline, so the whisper guide-tone is not what he means. The COMPANION
  // is; forced past the cast's own melody voice. "the lead synth is a bit too
  // loud" -> leadGainMul trims the wall his companion now has to sit under.
  vs_excited_casino: { swing: 0.585, fullSynth: true, counterline: true, leadDensityMul: 0.5, leadRangeSteps: 4, companion: true, leadGainMul: 0.85 },
  // D88: the tense lab runs all-synth. D89/D90: "love this ... amazing" — a
  // prose keep with no click yet; grammarPin holds it byte-stable against
  // every melody-grammar correction until his formal keep lands (then D64
  // pins take over).
  vs_tense_lab: { basePin: 'un_famous_ti_sto_post_malone_jackie_chan_ivm7_vm7_im7_vii', fullSynth: true, grammarPin: true },
  // D89/D90: "I like this a lot - layers are good, the drop is good. bass is
  // good." — same prose-keep pin as tense_lab.
  // D91 ("more layers actually, especially in the mid layer because it
  // feels a bit sparse there"): a mid-register comp texture joins —
  // additive only, the grammarPin still holds everything else.
  // r18: the "more layers ... a bit sparse" note is above his scary_manor line and
  // unchanged, so it is stale. I had added a companion on it and moved a PINNED
  // prose keep on leftover advice — reverted. This song is byte-identical again.
  vs_goofy_casino: { basePin: 'vid_fujii_quiz_loop', grammarPin: true, texture: { class: 'comp', octave: 4 } },
  // D89 (round 12). snow: "beginning session too long ... melody too soft.
  // also some bg harmony could be added" — the intro drop is the <=60bpm rule
  // above; here the lead rides up and a synth-strings pad (with the D72
  // singing top voice) joins as the background harmony.
  // D91 ("the strings suddenly jump to be really loud ... a measure
  // every so often"): the pad wave calms — half contrast, narrow bands.
  vs_somber_snow: { leadGainMul: 1.35, stringsPad: 'add', padFromStart: true, padWaveCalm: true },
  // rest: "maybe some strings could actually take the melody. like solo
  // violin or cello ... melody synth is too soft" — the cello takes the A
  // melody in its tenor register, riding above the old ceiling. D90 (his
  // correction): handoffs STAY — the letters still hand off, now from the
  // strings-first pool.
  // D91 ("more texture with more instruments or sub harmony melodies.
  // the strings are still a bit too louder"): cello trimmed 1.35->1.2
  // (0.63->0.56), a whisper strings pad + a low descant join.
  // D91 addendum: the verify pass measured the added oct-3 descant TOPPING
  // the cello in every A-cadence bar (B4 over a held D4 — a D77 violation)
  // — dropped; the pad's singing top + the flute B answer carry the "sub
  // harmony melodies" ask. Pad trimmed x0.8 (its development band measured
  // at lead level, and "the strings are still a bit too louder").
  // r18: calm_rest's note is above his scary_manor line and unchanged — stale, so
  // the pad trim came off. The companion stays: it is the engine-wide default for
  // a song with no own-melody layer, and this one had the sparsest cast in the
  // suite at two layers.
  vs_calm_rest: { leadSound: 'gm_cello', leadOctave: 4, leadGainMul: 1.2, stringsPad: 'add', padGainMul: 0.8 },
  // D91 (training: "doesn't sound 'excited' enough ... staccato strings
  // with their own melody (and accents)"): the marcato layer.
  vs_excited_training: { marcato: true },
  // D91 (nostalgic_shop's first note: intro "literally just chord
  // progression on piano", melody "barely heard", "give It the same
  // treatment u gave tense stealth, calm menu, calm lab"): the 16s
  // intro cap fires, and the stealth/menu/lab layer treatment lands —
  // strings pad from bar 1 with the singing top voice, a mid texture,
  // a descant, the counterline, and the lead riding up. The oompah-
  // drops-out breakdown he likes is untouched.
  // r18: nostalgic_shop's note is above his scary_manor line and unchanged, so the
  // forced companion came off. It already carries an own-melody cast layer.
  vs_nostalgic_shop: { stringsPad: 'add', padFromStart: true, texture: { class: 'offbeat', octave: 3 }, descant: {}, counterline: true, leadGainMul: 1.2 },

  // ---- genre-expansion round (2026-08-27) ---------------------------------
  // THE DESERT FIX (his note: "for the somber desert song we have, it lowkey
  // sounds more like space than desert"): sitar lead (NSMB), iqa' hand drums
  // (env default: ayyub + riq), marimba desert floor + flourish stamps
  // (device blocks), dry room (the desert-pedal override). Harmony was
  // already Phrygian-dominant — the failure was timbre/texture/reverb.
  // r14 (his standing progression ask, researched): the Gerudo motion lane
  // — i-bVI-bVII-V7 in harmonic minor, the iconic game-desert progression.
  // r18: the "doesn't sound like a desert" note is above his scary_manor line and
  // unchanged, so it is stale — this song keeps the drone he ASKED for in the r16
  // triage. `caravan` was authored on that stale reading; it stays in the trope
  // table but opt-in only, so it re-rolls nothing.
  vs_mysterious_desert: { leadSound: 'gm_sitar', desertTrope: 'drone' },
  // somber desert = the duduk trope: one mournful reed over a drone-fifth
  // floor, masmoudi dums every bar — percussion present even at a crawl
  // ("deleting all percussion is what tips it into space").
  // r14 ("the piano is a bit too bare ... add more texture that contributes
  // to the desert vibe (their own harmony melody)! the overall song feels
  // bare"): the acc bows (pad_bowed via the desert acc-voice law), the slow
  // marimba floor joins, and the counterline + descant are FORCED — two
  // harmony melodies beside the oboe.
  // r18: "I think maybe a bit more layering like stuff like the beginning
  // semitone fall would be good though" — a keeper otherwise.
  vs_somber_desert: { leadSound: 'gm_oboe', accClassPrefer: 'sustain', percPatterns: ['masmoudi_slow'], percPresence: 'light', percAllBars: true, keyHint: 'G', counterline: true, descant: {}, desertTrope: 'legacy', companion: true, desertPunct: false },
  // bazaar: maqsum town-warmth + shanai wail
  // r14 ("percussion should be a bit more complex ... melody a bit too
  // 'harmonious' and 'happy' ... more layers and the beginning part is a
  // bit too bare and long since it's just piano"): presence steps up to
  // driving, the drums ride every bar (the intro included), the counterline
  // joins; the melody walks Hijaz via the desert key law; the acc leaves
  // the piano via the desert acc-voice law.
  // r24 ADVERSARIAL CATCH — a PURE PROSE KEEP that was never pinned and moved.
  // His card carries no ask at all: "I like it. I like how you used the piano to
  // fill the mid range and how there's some extra stuff besides just plain chords
  // or foundation stuff". CLAUDE.md's "Prose keeps are real" rule exists for
  // exactly this and I had not applied it here.
  vs_happy_desert: { leadSound: 'gm_shanai', percPatterns: ['maqsum', 'nsmb_doum', 'riq_offbeats'], percPresence: 'driving', percAllBars: true, counterline: true, desertTrope: 'hijaz', accClassPrefer: 'pulse', pinFrom: 'r24' },
  // desert battle (GG Oasis): caravan gallop under a sitar lead
  // r14 ("the main melody should not just be piano ... more layers ... some
  // layers could have like descending semitones like u did"): the handoff
  // pool is desert voices now (no epiano/vibraphone), the chromatic-descent
  // layer is forced, drums ride every bar.
  vs_tense_desert: { leadSound: 'gm_sitar', percPatterns: ['ayyub', 'riq_offbeats'], percAllBars: true, chromDescent: true, counterline: true, desertTrope: 'shuttle', accClassPrefer: 'pulse' },
  // space explore (Mass Effect tier): arp pulse + pad from bar 1, all synth
  // r14 PROSE KEEP ("I really like this! it feels almost liminal"): pinned
  // byte-stable — melodyGrammar and varyLeadVoice hold the judged state the
  // defaults gave it, grammarPin walls off every new engine rule until his
  // keep click lands. REMIND HIM TO CLICK + EXPORT.
  // r18/D99 — the keep-transition law (D91) fired here. His r17 keep click
  // landed on a song judged on the UNKEPT path, so `priorKeep` flipped and the
  // bridge/breakdown gates would have stripped the very features he praised
  // ("the layers that make it more complex"). Measured before pinning: letters,
  // treat, cast, mix and solos all moved. bridgeHarmony + breakdown restore the
  // judged build byte-for-byte.
  vs_calm_space: { basePin: 'vid_prema_dm', fullSynth: true, accClassPrefer: 'arp', padFromStart: true, grammarPin: true, melodyGrammar: true, varyLeadVoice: true, bridgeHarmony: true, breakdown: true },
  // alien: held floor, the 9-over-5 tension descant as the unsettling shimmer
  // fixChord: the retrieved exemplar's v-dim bars trade for Vsus — dim
  // chains are the rejected chromaticism (D88); sus is the space color
  // (open no-3rd voicings, research/env-space.md §2.3)
  // r18: "maybe the melody is a bit too jittery at times (jittery means it jumps
  // around with low duration notes sometimes)". Measured, this one is NOT a
  // density problem — 2.75 notes/bar and a 1.25-beat median with 0% under half
  // a beat, both inside the band of the songs he praised. What it has is the
  // widest intervals in the suite: 83% of its steps leap further than a major
  // third. So the fix is the range wall, not thinning; thinning it would have
  // made a song he likes emptier without touching what he heard.
  vs_mysterious_space: { fullSynth: true, accClassPrefer: 'sustain', padFromStart: true, descant: { octave: 5, tension: true }, fixChord: ['7:o', '7:sus'], leadRangeSteps: 5 },
  // r18: happy_festival's "way too hyper" note is ABOVE his scary_manor line and
  // arrived unchanged, so by his own scoping rule it is a leftover, not a live
  // complaint. The measurement stands if it ever becomes live again: 3.75
  // notes/bar on a 0.75-beat median, against 2.25-3.25 and 1.00-2.00 on the songs
  // he praised. No opts, because he did not ask this round.
  // FTL groove: same bed + drums (the explore/battle pairing law)
  // r18/D99 — the history-less gate bit back. marcatoOn keys on
  // `!CARD_NOTES?.[name]`, so the moment his r17 note landed the marcato layer
  // silently vanished from a song he had just praised ("I like the dissonance")
  // and whose only complaint was the Alberti. The gate is there to stop NEW
  // capabilities re-rolling songs he has spoken about; it must not retract a
  // layer he already heard. Pinned to hold the judged cast.
  vs_excited_space: { fullSynth: true, marcato: true, varyLeadVoice: true },
  // horror ambience: fragmented lead (no hummable tune), sustained floor
  // r14 ("piano too heavy ... chords too basic and bland ... the left hand
  // Alberti ... sounds happy ... doesn't feel scary yet"): the acc band
  // trims to 0.7, the travel blacklist keeps the Alberti out of the B
  // letter, and the b2 rub is the song's one harmonic-dissonance device.
  // r16: the Boiler Mushi ostinato lands here, and it becomes this song's ONE
  // harmonic device (the b2 rub is suppressed in code when it is on). leadOctave
  // 5 buys the second-ranked device from the same measurement — the two-octave
  // register void between a small low ostinato and a small very high tune
  // (measured 23-27 semitones between the hands, against the engine's p90 of
  // 12-17).
  // r18: "it was really good until the section the piano started doing the four
  // note arpeggio walk things and the flute started being the melody - that
  // sounds too happy. everything else before and after im super happy." The
  // arpeggio is handled by the serious-lane class whitelist; the "flute" was
  // the manor's oboe, now the cello; capMelody stops that answer line from
  // climbing to C#7 — a seventh above the lead and off the end of a cello.
  vs_scary_manor: { leadDensityMul: 0.3, accClassPrefer: 'sustain', padFromStart: true, accGainMul: 0.7, b2rub: true, horrorOstinato: true, leadOctave: 5, capMelody: true },
  // dark-piano lament (the PianoX recipe: climax by mass, not speed)
  // r14 ("feels nolstalgic, not really scary ... the piano is a bit too
  // basic once again (the Alberti)"): alberti blacklisted lane-wide, the
  // variation law adds the 'extra stuff', and the b2 rub darkens the held
  // interior.
  vs_somber_manor: { accClassPrefer: 'block', leadDensityMul: 0.5, b2rub: true },
  // the music box (videoplayback-4): high register only, no bass anywhere,
  // no ambience bed — isolation IS the trope
  // r14 ("it feels like a sleep lullaby. not really mysterious"): the
  // bright I-bVII modal trope in F MAJOR was the lullaby — family pins
  // minor, and the descant carries the 9-over-5 tension cluster.
  vs_mysterious_manor: { leadSound: 'gm_music_box', leadOctave: 5, accSound: 'gm_celesta', accOctave: 3, accClassPrefer: 'arp', ambience: false, breakdown: false, family: 'minor', descant: { tension: true } },
  // r14 (all three catacombs notes: "the synths don't really fit ...
  // playful ... not scary at all"): the lane law strips sparkle/funk/chip
  // voices, the violin lead + off-chord stingers + chromatic descent are
  // lane defaults now; scary opens on the ghost pad over a forced
  // industrial bed ("the beginning ... should be more dissonant instrument
  // sounds").
  vs_scary_catacombs: { accClassPrefer: 'pulse', padFromStart: true, ambience: { bed: 'hx_amb_industrial' } },
  // r16: the one catacombs song carrying the choir pincer, which suppresses
  // its stingers and chromatic descent so the dosing law holds.
  vs_tense_catacombs: { accClassPrefer: 'broken_octave', choirPincer: true },
  // r14 ("boogie shuffle on catacombs?"): the riff preference goes — pulse
  // floor like its siblings, the blacklist keeps every boogie out anyway.
  vs_x_catacombs: { accClassPrefer: 'pulse' },
  // epic horror: organ carries the accompaniment, choir via the cast
  // r14 ("too harmonious, sounds like a evening disco dance ball"): the
  // sparkle/funk strip is the lane law; the lead moves to the harpsichord
  // (gothic, not cozy).
  // r18: "still way too harmonious. the rhythm along with the harpsichord's not
  // that dissonant and unique chords still sounds not scary. I like the choir."
  // Measured, the lane explains it: manor carries the b2 rub and catacombs the
  // pincer / chromatic descent / background dissonance, but CITADEL carries no
  // harmonic device at all — D93 made it the most tonal lane on purpose (the
  // Bloodborne law) and a SCARY citadel is where that costs too much. It gets
  // exactly one, and it is the whisper-level background layer he described
  // rather than anything sharp. The drums are NOT changed: he called them
  // "a evening disco dance ball" and the only pattern playing is war_march at
  // light presence, so I do not yet know what he is hearing there.
  // r19/D100 — THE EVENING DISCO DANCE BALL, located at last. His words:
  // "scary citadel's harmony is like groovy synth rhythm". It was never the
  // drums (I had been looking there for two rounds; the only pattern is a quiet
  // war march). Measured, the HARMONY's rhythm: the organ acc struck block
  // chords on EVERY quarter of all 32 bars — four-on-the-floor, the most
  // dance-shaped rhythm there is — with the choir stabbing 1-3-4 over it. My
  // own r18 `accClassPrefer: 'block'` put it there, chasing "too harmonious".
  // Block is in the serious whitelist because it is not PLAYFUL; that says
  // nothing about whether it GROOVES. A dread lane wants its harmony sustained.
  // r19/D100 second pass — "it still sounds too happy. the organ sounds really
  // happy along with the chords and the drum is really groovy". All three are
  // one measurement each:
  //   CHORDS: Bb6 - Ab^7 - Bb^7 - Dbm in G minor. Two of the four are the
  //     RELATIVE MAJOR carrying the two brightest colours in the dialect (a 6th
  //     and a major 7th), and the tonic G minor never sounds at all. Its
  //     exemplar is ut_uwa_so_temperate_p1 — a warm Undertale tune. That is a
  //     happy progression by construction, and the organ just plays it.
  //     Both Bb chords become the tonic minor: Gm - Ab^7 - Gm - Dbm, i-bII^7-
  //     i-bvm. The bII^7's major seventh IS the tonic, so it grinds against the
  //     chord it resolves to, and bv is the tritone. Dark, and still TONAL,
  //     which is the citadel's own law (D93: the most tonal horror lane).
  //   DRUM: `war_march`'s own character string reads "3+3+2 war march" — a
  //     TRESILLO, onsets 0,3,6,8,11,14 in 16ths. It is named for an army and
  //     shaped like a clave, which is why two rounds of looking at "the drums"
  //     for something groovy kept finding nothing. heartbeat_toms is the
  //     library's actual horror floor (tagged horror+sparse): lub-dub on a low
  //     tom, then silence for the rest of the bar.
  // r19/D100 third pass — "pretty spooky actually now, however the organ or
  // whatever is a bit too loud and continuous (so either make it a bit less
  // continuous, with more notes and pauses and extra stuff, or make it
  // softer)". Measured, there are TWO organs: the acc hand on fnd_drone_fifth
  // (72 attacks, 32 of 32 bars, held) AND the planner's harmony_support, also
  // gm_church_organ, 176 attacks across all 32 bars with a band topping 0.708.
  // Continuous twice over, and the loud one — the harmony_support, riding the
  // pad wave up to 0.708 — is the one I never looked at. He offered two fixes
  // ("less continuous ... or softer"); this takes SOFTER on both organs,
  // because it is the one I can make without touching the accompaniment mask
  // machinery that every kept song's byte-stability rides on. If it is still
  // too present, the other half (real pauses) is the next move.
  vs_scary_citadel: { accSound: 'gm_church_organ', accClassPrefer: 'sustain', leadSound: 'gm_harpsichord', bgDissonance: true, fixChord: [['3:6', '0:m'], ['3:^7', '0:m']], percPatterns: ['heartbeat_toms'], accGainMul: 0.72, padGainMul: 0.68 },
  // the dirge: male chant TAKES the melody (featured chant, chest register)
  // r14 ("a bit too bland because it's kinda just the chord progressions
  // ... basically just descending"): pizzicato arps join as a motion layer
  // beside the counterline; the tail-variety law breaks the descending sameness.
  vs_somber_citadel: { leadSound: 'choir_male', leadOctave: 3, accSound: 'gm_church_organ', accClassPrefer: 'sustain', percPatterns: ['war_march'], texture: { class: 'arp', octave: 3 } },
  // r14 ("lead synths sound really playful ... the bass is also playful"):
  // sharp solo violin takes the lead over the war drums; funk bounce is
  // lane-stripped.
  // r16: the wobble outside desert — his "can also be used outside of desert too".
  // r18, four separate complaints on one card: "the melody itself still sound
  // really playful, and cello doesn't really fit as the melody. the shaker
  // doesn't fit either ... the bass is also playful ... the random gong in the
  // middle also doesn't fit the vibe at all". The "cello" is the violin pinned
  // here since r14, capped to octave 4 and so sitting in cello register; the
  // citadel lane voice is the church organ (the Bloodborne law: tonal theme,
  // gothic timbre) and that is what it takes now. Shaker dropped. The gong is
  // gone lane-wide and the arpeggio to the class whitelist.
  vs_tense_citadel: { wobble: true, percPatterns: ['war_gallop'], choirPad: 'choir_male', leadSound: 'gm_church_organ', companion: true },
  // his ask: "1 active song that uses choir (like battle)"
  // r14 ("very playful once again" + the overused melody tail): real brass
  // takes the lead (Bloodborne law — tonal theme, gothic timbre), the tail
  // law varies the phrase endings.
  vs_triumphant_citadel: { percPatterns: ['war_march', 'shaker_urgency'], choirPad: 'choir_male', leadSound: 'gm_trumpet' },
  // his ask: "1 soft song that uses choir (magical)"
  // fixChord: the planing exemplar's minor tonic brightens to I^7 — the
  // magical-sacred lane wants luminous, not dark
  // r14 ("piano too basic again ... more layers could be added"): strings
  // pad + counterline join the choir pad; the variation law un-replicates
  // the arp foundation.
  // r21: "in the middle the piano and the strings get a bit too loud too
  // suddenly and just a bit too loud in general like a jumpscare to hurt my
  // ears" — the second round running on this song ("whenever the piano and
  // strings get louder it's too loud and too sudden"). r20 answered the
  // INTERVAL half of his note and left the dynamics alone, so this is the same
  // complaint unaddressed rather than a new one. padWaveCalm is the documented
  // fix for exactly this shape (D-note: a 1.6x band jump reads as "suddenly
  // really loud"); the two gain multipliers take the "too loud in general" half.
  vs_calm_shrine: { padFromStart: true, accClassPrefer: 'arp', fixChord: ['0:m', '0:^7'], padSound: 'gm_choir_aahs', stringsPad: 'add', counterline: true, padWaveCalm: true, padGainMul: 0.7, accGainMul: 0.8 },
  // reel demos: busy-battle (Cubase reel N1 — marcato/varyLead fire as
  // history-less defaults), jungle groove, abstract nature
  // r14 (his staccato-strings law, and the note: "currently they're just
  // accenting the melody on specific notes"): marcato pinned ON so the
  // rewritten chordal ostinato carries the ask (the card note would have
  // silenced the history-less default).
  vs_excited_fight: { counterline: true, texture: { class: 'offbeat', octave: 3 }, riserReentry: true, marcato: true },
  // r14 ("just basic chords ... the bass doesn't work ... piano melody is
  // too active"): block foundations blacklisted lane-wide, the round
  // jungle tumbao replaces the slap bounce, the melody thins and its walk
  // wall tightens; arps take the acc (the marimba-ostinato idiom).
  // r16: he ruled jungle-mode "both, energy picks"; this is the energetic
  // jungle song (130bpm, foreground percussion), so it is the one that takes
  // the mixolydian side. mysterious_jungle stays on the Stickerbush wash.
  // r18: "look and do research into jungle" — mixo is out (see the trope table),
  // and the vamp is pinned here so the two jungle songs no longer open with the
  // same figure, which was his other note on the pair. The intro halving comes
  // from the bare-intro cap, not from an opt.
  // r19/D100: "also the piano doesn't really fit" — his note names the LEAD
  // voice, which is the one condition under which a song he has spoken about
  // may swap it. The kalimba is the lane's own vouched voice (D94) rather than
  // a guess of mine, and it does not collide with the marimba acc.
  vs_happy_jungle: { leadDensityMul: 0.6, leadRangeSteps: 5, jungleTrope: 'plane', jungleAcc: 'jungle-vamp', leadSound: 'gm_kalimba' },
  // r14 ("piano too basic once again (just triad chords repeated 8 times)"):
  // same arp move; drums stay (he likes them).
// r16: the widened jungle band ([100,132] -> [100,152], his jungle-tempo
  // answer) re-rolled this song's hash from 92 to 122bpm. He asked for the
  // widening so ACTION jungle could run fast, not to speed up the atmospheric
  // Stickerbush-wash song he has already heard at 92. Pinned back.
  // r18: "I also think more layers would be good (think the terraria soundtrack)"
  vs_mysterious_jungle: { leadDensityMul: 0.6, jungleTrope: 'wash', bpm: 92, companion: true },

  // =========================================================================
  // r19/D100 — THE FOUR REEL SONGS. One per progression he sent, each also
  // carrying a LAYER technique the same batch taught, because his ask was both:
  // "all the new voices and chord progressions you extracted ... + the intervals
  // they used for layering and how they layered (what sub melodies they used and
  // techniques rather than just the basic tones)". Working: research/reel-atlas-r19.md.
  // =========================================================================

  // (1) THE "scary^" SONG. Progression + device both from the dantes.studio reel
  // he answered with a verdict. basePin holds the thirdless i5-bII5 ladder;
  // fifthPincer is the sonority itself — a second perfect fifth stacked a
  // semitone (then a tritone) against the chord's own, voices a beat apart.
  // Cave rather than a horror lane on purpose: the lane laws would layer their
  // own devices on top, and the D93 dosing rule says ONE. Lead is fragmented
  // like the manor's so the tune never becomes the subject.
  vs_scary_cave: {
    basePin: 'vid_dantes_scary_fifths', family: 'minor', rawBase: true, fifthPincer: true,
    accClassPrefer: 'sustain', accSound: 'gm_pad_bowed', leadOctave: 4,
    // r21: "the violins a bit too loud still ... something about tremoloing the
    // strings softly or warping them" — he remembered correctly. That is
    // bgDissonance (r18/D99): a BED voice on gm_tremolo_strings, attack thrown
    // away, whisper band. It cannot run here because fifthPincer is this song's
    // one harmonic device (D93 dosing) and suppresses it — but the TIMBRE half
    // is what he is asking for, so the lead takes the tremolo voice instead of
    // the viola. His note names the treatment, which is what authorises a lead
    // voice change on a song he has spoken about.
    leadSound: 'gm_tremolo_strings',
    leadDensityMul: 0.22, percPatterns: ['heartbeat_toms'], percPresence: 'light',
    counterline: false, descant: false, bpm: 68,
    // r20 PROSE KEEP — "love this, scariest song you've made so far". Pinned so
    // no engine-wide rule re-rolls it before the click lands (the D101 walk
    // would otherwise have added 7 events he has not heard). D91 feature-pin:
    // judged on the unkept path, so acc variation and travel rotation stay.
    pinFrom: 'r20',
    // …with the ONE fix his note names, and nothing else: "the loud violin made
    // it a bit less scary though - because it doesn't sound eery or anything
    // like that. it's a constant harmonic powerful lead thing". So: quieter and
    // less constant. The voice STAYS a viola — he did not ask for a swap, and a
    // song he has spoken about never swaps its lead voice unless his note names
    // it. Measured on the judged build: 60 viola attacks over 28 bars.
    leadGainMul: 0.6,
    // cave is not a horror LANE, so the salon companion pool applies and the
    // planner is free to hand the cast a cello — both named explicitly here so
    // the three melodic voices stay three distinct timbres
    fifthPincerSound: 'gm_pad_metallic', companion: { sound: 'gm_church_organ' },
  },

  // (2) THE PLANED-NINTHS SONG. Five-note m9 voicings moved intact down a
  // fourth — no voice-leading, which is the point. The reel's own rhythm is
  // LONG-short-short per 2-bar cell, so the acc takes a sustained class and the
  // marcato supplies the two stabs. Layer plan from the `slayr` breakdown (B2):
  // melodic weight spread thin across several voices instead of one thick lead.
  vs_somber_space: {
    basePin: 'vid_dantes_m9_plane', family: 'minor', rawBase: true, fullSynth: true,
    accClassPrefer: 'sustain', padFromStart: true, marcato: true,
    counterline: true, descant: {}, companion: true, leadDensityMul: 0.5,
    leadGainMul: 0.9, bpm: 76,
    // r20 PROSE KEEP, and his favourite of the four: "I really like this. it's
    // very unique and I love the thing you did with the pad warping thing ...
    // def keep some of the techniques u used here (for the relevant vibe)".
    // No fix asked for, so this is frozen exactly as judged — which per D91
    // means pinning the features it was JUDGED WITH, not just setting the pin:
    // it was heard on the unkept path, so acc variation and the travel rotation
    // were both live and both must stay.
    pinFrom: 'r20',
  },

  // (3) THE WALKING-BASS SONG — his "jazz, unique". Eight chords, one per bar,
  // through the two pivots the dialect cannot spell (the m7b5's flat ninth and
  // the augmented III both live in voicedAs, not in the degrees). Swing is the
  // measured get_proto ratio. The DELTARUNE build order (B1) sets the cast: bed
  // and bass first, melodic voices last and in PAIRS rather than one lead.
  vs_nostalgic_casino: {
    basePin: 'vid_jazz_circle_b9', family: 'major', rawBase: true, swing: 0.585,
    texture: { class: 'comp', octave: 4 }, counterline: true, descant: {},
    companion: true, varyLeadVoice: true, leadDensityMul: 0.7, bpm: 104,
    // r21: "doesnt sound full enough in the mid range (so add more layers in the
    // mid range that fit the vibe) and the drums are a bit too loud".
    // The marcato is the mid-range answer that fits a jazz card: a CHORDAL
    // OSTINATO with its own rhythm (D94, his law verbatim — "mainly harmony,
    // doing its own subharmony or just a rhymic repeat"), not another sustained
    // pad. The corpus sweep says the same thing from the other side: our songs
    // already carry MORE simultaneous voices than real game music (median 3.77
    // there, 5-7 here), so what is missing in the middle is an INDEPENDENT line,
    // not another voice — 88.8% of corpus files have a second independently
    // moving part against 14 of our 43.
    marcato: true, percPresence: 'light',
  },

  // (4) THE DESERT ANSWER. The bviim ladder he labelled "desert chord example",
  // served RAW (D93: the variation pass dilutes a trope). Everything else is the
  // established desert law — dry, hand-drum floor, marimba acc hand, no piano —
  // so that the ONLY new variable is the progression, and his ear can rule on
  // that alone against the four desert songs already in the suite.
  vs_calm_desert: {
    basePin: 'vid_hijaz_bviim', family: 'modal', rawBase: true, keyHint: 'C',
    leadSound: 'gm_shanai', accClassPrefer: 'sustain',
    percPatterns: ['masmoudi_slow'], percPresence: 'light', percAllBars: true,
    counterline: true, companion: true, bpm: 84,
    // r20 PROSE KEEP — "I like it! slow melody with bass makes it sound pretty
    // good ... it fits the vibe and is atmospheric". "doesn't sound fully calm"
    // is an observation he explicitly waved off, not a fix request, so this is
    // frozen as judged (the D101 walk had added 18 events he has not heard).
    // Same D91 feature-pinning as somber_space — judged on the unkept path.
    pinFrom: 'r20',
  },
};
for (const prompt of PROMPTS) {
  const n = `vs_${prompt.emotion ?? 'x'}_${prompt.environment}`;
  buildSong(prompt, n, SONG_OPTS[n] ?? {});
}
// the 11th song — his buildup ask, on the beat that taught it (dp_b_52_s)
buildSong({ emotion: 'excited', environment: 'festival', meter: '4/4' }, 'vs_excited_festival_drop', {
  bpm: 160, loop4: true,
  dropIntro: { pattern: 'dp_b_52_s', note: 'first 4 measures are buildup, so don\u2019t loop those. also do the buildup with the melody and harmony (try a song with this buildup). energetic upbeat' },
});

// ============================================================================
// r21 — THE A/B COMPARISON BUILD (his ask, verbatim): "revert the corpus back
// to what it was before the midi analysis temporarily and then regenerate the
// songs, with only notes you think are really necessary/important insights
// added? i want them side by side for comparison"
//
// The 16 natural-language prompts audition/corpus-suite.html was written from,
// run through THIS engine instead of the corpus-statistics generator. Nothing
// is reverted in src/lib — the MIDI work never wrote there (D95 held), so the
// "revert" is a BACKEND swap: the judged pipeline (vibe compile, click-kept
// exemplar retrieval, planner cast, letter form, tone travel, treats, vouched
// drums, dynamic curves, every taste-canon law) instead of harmony and
// texture composed from corpus statistics.
//
// Gated on CS_COMPARE=1 and written to its own JSON. audition/songs.html is
// NOT rewritten in this mode — the judged baseline is never a side effect.
//
// ENV mapping: the parser (src/lib/prompt-parse.js) is the SAME one the corpus
// page used, so both backends read the same words out of the same sentence.
// Where `engine` differs from the parse it is written down and shown on the
// card, because the engine's environment slot doubles as a FUNCTION slot
// (boss/fight) and the parser ranks by word length, not by function.
const CS_COMPARE = process.env.CS_COMPARE === '1';
const CS_PROMPTS = [
  { n: 'mech_boss_station', p: 'boss fight music for a giant mech battle on an abandoned space station, lots of drums',
    // parser ranks "station" (space) over "boss"; the engine HAS a boss slot and
    // it encodes the function the prompt actually names. Its own alt list agrees.
    engine: { environment: 'boss' }, why: 'parsed env space; took its own alt "boss" — the engine\'s environment slot encodes scene FUNCTION, and "boss fight" is the function here' },
  { n: 'desert_market', p: 'chill background music for a busy desert market town, kind of middle eastern' },
  { n: 'music_box_manor', p: 'creepy music box theme for an abandoned victorian mansion' },
  { n: 'jungle_explore', p: 'upbeat jungle exploration theme with heavy tribal percussion' },
  { n: 'friend_dies', p: 'sad slow piano piece for the scene where the main character\'s friend dies',
    engine: { environment: 'aftermath' }, why: 'parser found no environment at all — "aftermath" is the engine\'s post-event scene, the closest slot it owns' },
  { n: 'lab_stealth', p: 'tense stealth music for sneaking through a research laboratory at night' },
  { n: 'cathedral_epic', p: 'epic triumphant choir music for a final battle in a gothic cathedral' },
  { n: 'underwater_calm', p: 'calm ambient loopable music for an underwater coral reef area' },
  { n: 'casino_groove', p: 'groovy jazzy lounge music for a casino level' },
  { n: 'frozen_ruins', p: 'lonely somber music for frozen ruins in a snowstorm, minimal and sparse',
    engine: { environment: 'snow' }, why: 'parsed "ruins" over "snowstorm" by word length; took its own alt "snow" so this prompt and friend_dies do not both land on aftermath' },
  { n: 'catacomb_action', p: 'fast intense action music for fighting undead in the catacombs' },
  { n: 'diner_goofy', p: 'silly bouncy cartoon music for a chaotic kitchen minigame' },
  { n: 'alien_mystery', p: 'mysterious eerie synth music for discovering an alien structure on a distant planet' },
  { n: 'campfire_rest', p: 'warm nostalgic music for resting at a campfire save point' },
  { n: 'factory_industrial', p: 'industrial mechanical music for a factory level with pounding percussion' },
  { n: 'shrine_choir', p: 'peaceful sacred choir music for an ancient forest shrine' },
];

// The ONLY MIDI-analysis insights that reach this build. Both are per-song opts
// with no default, so no judged song can move; both were chosen because they
// survived the adversarial verify pass that weakened seven of eight headline
// claims, and because the engine could not already express them.
const CS_INSIGHT_TEXT = {
  I2: 'companion timbre — 69.3% of corpus second lines, and 85.9% of the pairs that trade phrases, declare a DIFFERENT GM family than the lead. D102: register and timbre separate a layer; rhythm does not. Asked of INSTRUMENTS[...].family, never of a name list. (opts.companionFamilySplit)',
};
// I1 WAS "voice count": D102 records corpus median concurrency 4.16 against
// "ours 5-7", and this build first shipped a blanket voiceCap: 4 on that basis.
// MEASURED, same probe on both sides — distinct pitched VOICES sounding on a
// 1/16 grid over the first 32 bars of the mix:
//     judged audition/songs.html   mean of per-song medians 4.02 (median 4)
//     corpus reference                                      4.16
// There is no gap. The engine is already at the corpus norm, and the cap took
// this build DOWN to 3.44 — thinner than the corpus AND thinner than the
// judged baseline. The "5-7" figure is not reproducible by a distinct-voice
// count; a NOTE count on the same songs gives 8.72, so the original number
// measured neither. Third wrong corpus figure of this arc, and it is the one I
// acted on: the blanket cap is gone. voiceCap survives only where the PROMPT
// asks for it ("piano piece", "minimal and sparse", "busy"), which is
// prompt-honouring, not a corpus finding.
const CS_INSIGHT_CORRECTED = 'voice count (dropped) — corpus 4.16 vs judged 4.02 measured on the same probe: no gap. The blanket voiceCap made this build thinner than both.';
// deliberately NOT applied, and why — the honest half of "only what's necessary"
const CS_INSIGHT_SKIPPED = [
  'density inversion (2nd line denser when the lead rests, 1.57 vs 0.88) — D102 also concludes our rhythm-LOCKED companion is already the right shape; the inversion belongs to the further free line, which this engine does not cast.',
  'early entry (83.5% of second parts enter at or before the lead\'s first bar) — our layer entries are 139/139 on section starts. Real, but it is the r17 unbuilt ask and a structural change, not an opt.',
  'fewer non-chord tones, bracketed on BOTH sides (corpus approach 48.7% ~ resolution 43.6%; ours 22.8% NCT at 6.1% resolved) — the exit half is already D101\'s resolution law. The approach half is a bind.js change that would move all 43 judged songs.',
  'chromatic licence scaling with realised motion — already reached, more bluntly, by D100\'s hard in-key gate on the companion. Changing a judged mechanism to a better mechanism is its own round.',
];

// prompt words -> engine opts. Modifiers are what the USER typed, not corpus
// findings — honouring them is the baseline the comparison needs, not an insight.
const CS_HORROR_LANES = new Set(['manor', 'catacombs', 'citadel', 'cave']);
function csOpts(mods, v, env, emotion) {
  const o = {
    // I2 on every song in this build. I1 (voiceCap) is NOT a default — see the
    // correction below.
    companionFamilySplit: true,
  };
  // D93's lullaby trap, not a corpus finding: a horror lane whose modal
  // retrieval lands a BRIGHT major trope reads lullaby rather than
  // mysterious. The judged songs pin family per song in SONG_OPTS; a build
  // from raw prompts has no such per-song hand, so the lane states it.
  // Triumphant citadel is the documented exception — D93 makes it the MOST
  // tonal lane (Bloodborne law: tonal theme, gothic timbre).
  if (CS_HORROR_LANES.has(env) && emotion !== 'triumphant') o.family = 'minor';
  // the CONTROL for I2's measurement: CS_NO_FAMSPLIT=1 rebuilds the same
  // sixteen with the split off, so "how many companions changed voice" is a
  // measured before/after and not an assertion.
  if (process.env.CS_NO_FAMSPLIT === '1') o.companionFamilySplit = false;
  if (mods.perc === 'foreground') { o.percPresence = 'foreground'; o.percAllBars = true; }
  if (mods.perc === 'light') o.percPresence = 'light';
  // "piano piece" means piano. voiceCap only trims the PLANNER cast; the
  // counterline and descant are generator layers gated on the ensemble dial,
  // so a cap alone still left two string layers on a solo-piano prompt.
  if (mods.soloPiano) { o.voiceCap = 1; o.companion = false; o.counterline = false; o.descant = false; }
  if (mods.sparse) o.voiceCap = 2;
  if (mods.dense) o.voiceCap = 5;
  if (mods.choir) o.choirPad = true;
  if (mods.strings) o.stringsPad = true;
  if (mods.synth) o.fullSynth = true;
  if (mods.ambient) o.padWaveCalm = true;
  if (mods.musicBox) o.leadSound = 'gm_music_box';
  if (mods.groove) o.swing = 0.585; // D97's measured swing ratio, not a guess
  if (mods.tempo) o.bpm = Math.max(50, Math.round(v.bpm * (1 + mods.tempo)));
  return o;
}

if (CS_COMPARE) {
  const firstCompare = songs.length;
  for (const row of CS_PROMPTS) {
    const P = parsePrompt(row.p);
    // D92 is "4/4 only", and the compile-time re-map only catches 2/4 because
    // 3/4 had never come up: 46 of the 47 judged songs are 4/4 and the 47th is
    // the kept 2/4 exception. Two of these sixteen compiled to 3/4 — a meter
    // his ear has never ruled on — which would confound the A/B with a
    // variable neither backend was asked about. Pinned, and said on the card.
    const prompt = { emotion: P.emotion, environment: P.environment, meter: '4/4', ...(row.engine ?? {}) };
    // a probe compile, only to read the vibe's own bpm before a tempo modifier
    // scales it — buildSong compiles again for real
    const probe = compileVibe({ ...prompt, name: `ce_${row.n}` });
    const opts = csOpts(P.mods, probe, prompt.environment, prompt.emotion);
    const S = buildSong(prompt, `ce_${row.n}`, opts);
    const built = songs[songs.length - 1];
    built.promptText = row.p;
    built.parsed = { emotion: P.emotion, environment: P.environment, mods: P.mods };
    built.engineNote = row.why ?? null;
    built.insights = Object.keys(CS_INSIGHT_TEXT);
    built.optsApplied = Object.fromEntries(Object.entries(opts).map(([k, val]) => [k, val]));
    void S;
  }
  const compare = songs.slice(firstCompare);
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, '.compare-engine.json'), JSON.stringify({
    generated: new Date().toISOString(),
    insights: CS_INSIGHT_TEXT, skipped: CS_INSIGHT_SKIPPED, corrected: CS_INSIGHT_CORRECTED,
    songs: compare.map(({ solos, ...rest }) => ({ ...rest, solos })),
  }));
  console.log(`wrote audition/.compare-engine.json — ${compare.length} engine-backend songs`);
  for (const s of compare) {
    console.log(`  ${s.name}: ${s.key} @${s.bpm} ${s.meter} · ${s.scheme || 'no letters'} over ${s.totalBars} bars · acc ${s.accompaniment} · ${s.ensemble.count}/${s.ensemble.fullCast} voices [${s.cast.join(', ') || 'piano only'}]${s.drums.length ? ` · drums: ${s.drums.join(' + ')}` : ''}`);
  }
}

// ============================================================================
// r22 — THE LAYERING TEST SUITE.
//
// His ask, after hand-importing 26 MIDI files: "regenerate the test suite over
// songs with prompts of whatever you think is relevant to the .midi files and
// you can test out the new stuff and patterns".
//
// So the prompts are drawn from what those files ARE — Sonic Mania zones, a
// Smash menu, Splatoon, NSMBU overworlds, a Pokemon festival, two boss themes,
// an alien invasion, a rest area, a rain cue — and every song is built TWICE:
// once with the three r22 layering devices plus the oblique companion, once
// without. Same name-seed, same everything else, so the only variable in the
// pair is the layering.
const R22 = process.env.R22_LAYERS === '1';
const R22_PROMPTS = [
  { n: 'zone_brass_hook', p: 'upbeat retro platformer zone theme with a big brass hook', ref: 'SM-StudiopolisZoneAct1/2, SM_GreenHillZoneAct2' },
  { n: 'miniboss_drive', p: 'high energy boss battle with driving drums and a synth lead', ref: 'SM-MiniBoss, Grandia2_BattleVersion3, ducktales boss' },
  { n: 'seaside_bounce', p: 'breezy bright seaside level theme, bouncy and upbeat', ref: 'SM-OilOceanZoneAct2, SM_GreenHillZoneAct2' },
  { n: 'saloon_swagger', p: 'goofy western saloon level with honky tonk swagger and groove', ref: 'SM-MirageSaloonZoneAct1K/1ST/2' },
  { n: 'factory_machines', p: 'industrial factory zone with pounding mechanical percussion', ref: 'SM-FlyingBatteryZoneAct1, AFOArmy' },
  { n: 'press_garden_quirk', p: 'quirky mechanical printing press level, playful and precise', ref: 'SM-PressGardenZoneAct1/2' },
  { n: 'alien_invasion', p: 'eerie tense alien invasion theme with strings, on a distant planet', ref: 'AFO-Alien_theme' },
  { n: 'menu_orchestral', p: 'epic sweeping orchestral main menu theme, triumphant', ref: 'Phazonruler_-_Sm4sh_Menu' },
  { n: 'robot_stage', p: 'fast chiptune robot factory stage, energetic and synthy', ref: 'SSBWU-Megaman2_AirMan' },
  { n: 'overworld_guitar', p: 'cheerful overworld theme with acoustic guitar and choir voices', ref: 'NSMBU_Overworld, NSMBU_World_3-1' },
  { n: 'rest_area_warm', p: 'warm nostalgic rest area music, calm and reflective', ref: 'AllStarRestArea' },
  { n: 'island_festival', p: 'festive tropical celebration with steel drums and flute', ref: 'Magikarp_Festival, Jungle-Challenge' },
  { n: 'rain_street', p: 'lonely somber rain at night, minimal and sparse piano', ref: 'shenmue_rain' },
  { n: 'splash_action', p: 'colorful high energy modern action battle theme', ref: 'WIIU_Splatoon_MainTheme' },
  { n: 'jungle_marimba', p: 'upbeat jungle challenge with marimba and heavy tribal percussion', ref: 'Jungle-Challenge' },
  { n: 'final_showdown', p: 'dramatic triumphant final showdown against a giant machine', ref: 'EggReverie, SM3DW_Main_Theme' },
];

// The four devices, each with the number that justifies it. Measured inside
// each reference file's STEADY SECTION (his caution about abstract stretches
// and quirks), never over whole files.
const R22_DEVICES = {
  echoLayer: 'ECHO — 16 of 26 files carry a part that is a constant-lag copy of another (13.5% of all pairs). Lag clusters at 2 beats (14 pairs), 0.5 (9), 1.5 (8), 1 (7), 0.75 (6). Different instrument, well under the line it follows, landing in its gaps.',
  octaveDouble: 'OCTAVE PARTNER — unison/octave is 34.8% of every simultaneous interval in the set, the largest class, ahead of P5 (10.3%), P4 (10.0%) and thirds+sixths combined (23.3%). The engine had banned it outright.',
  layerRest: 'BREATHING — inside a steady section with no texture change, 57.5% of reference parts still rest at least one bar. Median coverage of their own window: lead 50%, counter 66.7%, acc 62.5%, pad 92.9%, bass 100%. Ours play every bar.',
  obliqueCompanion: 'OBLIQUE COMPANION — oblique motion (one voice holds, the other moves) is the plurality pair relation at 27.8%, over parallel 24.7%, contrary 20.9%, similar 19.9%. A companion that re-picks under every lead note cannot make oblique motion at all.',
};

// ============================================================================
// r23 SUITE — a full listening suite with EVERYTHING wired.
//   SUITE=1 node scripts/audition-songs.mjs   ->  audition/suite.html
// ============================================================================
// His ask: "ok, generate a suite of songs for me to analyze" / "with everything
// you learned".
//
// Not an A/B. Twenty-eight fresh songs across the genre map, each built ONCE
// with the whole accumulated stack on — the r22 layering devices, the r22
// second-pass fixes, and the r23 battle + reel devices — in the same keep/kill/
// notes card UI as audition/songs.html so he can judge them AS SONGS and export.
//
// Names are `su_*` so they can never collide with the judged `vs_*` set, and the
// export is tagged `page: 'r23-suite'` with its own localStorage key, so a paste
// from here can never be mistaken for a judged-suite export.
//
// EVERY SONG IS HISTORY-LESS by construction (new name, no verdict, no
// CARD_NOTES), which is exactly the condition every new-capability gate in this
// file is written to require.
const SUITE = process.env.SUITE === '1';
// Lanes that pin their own texture (D93/D94/D100). They still get everything
// else; they do NOT get the coprime cell, which is a plucked pulse and is the
// r23 device most likely to read as a groove where a groove is the documented
// defect ("an evening disco dance ball"). The frozen slot DOES reach them — it
// is a sustained held texture, which is what a dread lane wants.
const SUITE_LANE_LAW = new Set(['manor', 'catacombs', 'citadel', 'desert', 'jungle', 'cave', 'shrine']);
const SUITE_PROMPTS = [
  // ---- the r23 battle work, six ways ------------------------------------
  { e: 'excited', v: 'boss', why: 'battle bass + open fifths + toms, at the top of the tempo band' },
  { e: 'tense', v: 'boss', why: 'the same devices under a tense reading' },
  // r25, his note: "just remove the suspended cymbal from these type of songs"
  { e: 'triumphant', v: 'boss', opts: { noCymbal: true }, why: 'the "epic" end — does open sonority read heroic or hollow?' },
  { e: 'excited', v: 'fight', why: 'battle role, fight lane' },
  // r25, his note: "remove the cymbal. percussion is a bit too loud."
  { e: 'tense', v: 'fight', opts: { noCymbal: true }, why: 'his own r22 fight cards were about drums; this has the tom kit' },
  // r24 PROSE KEEP: "I like this one the most of the fight songs, the different
  // accompaniments work together and resonate."
  // r25 — UNPINNED, because his next note on it ASKS: "still not a fan of the
  // repeating piano chord for this genre (but the piano is better than before) ...
  // piano is way too loud." A pin protects a song from rules its own note never
  // asked for; it does not outrank the note. Measured: pinned, its piano sat at
  // 3.73x its neighbours, the highest left in the suite, while every song around
  // it came down.
  { e: 'scary', v: 'fight', why: 'battle devices against a scary emotion — the measured "battle is LESS dissonant" claim under pressure' },
  // ---- action / chase ----------------------------------------------------
  { e: 'tense', v: 'stealth', why: 'reel devices on a sparse texture' },
  { e: 'excited', v: 'training', why: 'speedhighway-atdawn reference' },
  { e: 'tense', v: 'construction', why: 'industrial percussion + coprime cell' },
  // ---- overworld / exploration ------------------------------------------
  { e: 'calm', v: 'water', why: 'shenmue_sea / shenightfall reference — frozen slot at a slow tempo' },
  { e: 'mysterious', v: 'cave', why: 'dungeoncave reference; lane law, so no coprime cell' },
  { e: 'nostalgic', v: 'snow', why: 'snowy reference' },
  // r24 PROSE KEEP: "I like this ... this is definitely a solid song."
  { e: 'triumphant', v: 'snow', pin: 'r24', why: 'triumphantexpedition — "layering and dynamics and bass and all the melodies"' },
  { e: 'excited', v: 'space', why: 'EggReverie / Sm4sh' },
  { e: 'mysterious', v: 'space', why: 'the slow end of the same lane' },
  // ---- town / diegetic ---------------------------------------------------
  { e: 'happy', v: 'shop', why: 'the plainest possible bed for the reel devices' },
  { e: 'nostalgic', v: 'casino', why: 'Studiopolis — swing + frozen slot' },
  { e: 'happy', v: 'festival', why: 'Magikarp_Festival / Splatoon' },
  // r24 PROSE KEEP: "I like this and the groove ... fits the vibe."
  // r25 — UNPINNED and given a bass. He has now asked twice: "maybe some bass
  // though?" and then "add some bass though? it still wasn't added." The pin is
  // why it wasn't.
  { e: 'goofy', v: 'kitchen', opts: { bassLine: true }, why: 'the playful end — do the r23 devices survive it?' },
  { e: 'excited', v: 'casino', why: 'full synth + coprime cell' },
  // ---- cutscene / rest ---------------------------------------------------
  { e: 'calm', v: 'rest', why: 'shenmue_morning / brightblueday' },
  { e: 'somber', v: 'aftermath', why: 'fangmei_goodbye — sparse, and the frozen slot has to carry' },
  { e: 'romantic', v: 'rest', why: 'soa_reflection — "I like how the duet finishes each other"' },
  // ---- menu ---------------------------------------------------------------
  { e: 'calm', v: 'menu', why: 'full synth, minimal' },
  { e: 'mysterious', v: 'shrine', why: 'lane law; choir territory' },
  // ---- the lanes that own their laws — everything EXCEPT the coprime cell -
  // r24 PROSE KEEP, the strongest in the export: "big fan of this song."
  { e: 'mysterious', v: 'desert', pin: 'r24', why: 'Phrygian dominant, iqa\u2019 floor, marimba \u2014 r23 battle devices excluded by lane' },
  { e: 'happy', v: 'jungle', why: 'dorian vamp, tumbao bass, marimba acc' },
  { e: 'scary', v: 'manor', why: 'ambience lane \u2014 one harmonic device, beds, no kit' },
];

// ============================================================================
// r26/D115 — SONGS BUILT ON THE @ChordCamera PROGRESSIONS
// ============================================================================
// His ask: "moreover make songs with the progressions with various prompts that
// match the vibes, experimenting as needed".
//
// Each row pins ONE of the 19 transcribed progressions as the song's exemplar
// and picks a prompt whose vibe matches what that progression actually does —
// the `moods` and the reading in src/lib/progressions-chordcamera.js. Four of
// them are deliberate SECOND readings of a progression that already appears
// above, because "experimenting as needed" is the interesting half of the ask:
// the chromatic diminished walk in a horror lane, the Neapolitan in a citadel,
// the alphabet bass on a festival, the R&B minor as somber rather than romantic.
//
// SERVED RAW (`rawBase: true`) — D93/D100/r24 all say the same thing: the
// variation pass DILUTES a hand-transcribed loop. It has already turned a
// deliberately thirdless progression into a minor triad once and rewritten the
// V7 a city-pop turnaround lives on. These are transcriptions; they play as
// transcribed, and the engine varies everything ELSE around them.
//
// `family` follows the entry, not the emotion: a progression's own family is a
// fact about the chords, and letting the emotion override it is what D93 calls
// the lullaby trap.
const CHORDCAM = process.env.CHORDCAM === '1';
const CC_PROMPTS = [
  { pin: 'vid_cc_four_scales',      e: 'nostalgic',  v: 'shop',      why: 'bright but shifting — four scales over a walking bass' },
  { pin: 'vid_cc_three_note',       e: 'happy',      v: 'festival',  why: 'three-note chords, fastest harmonic rhythm in the set' },
  { pin: 'vid_cc_rnb_fmin_sparks',  e: 'romantic',   v: 'rest',      why: 'F minor with a major-I spark — warm and yearning' },
  { pin: 'vid_cc_turnaround_fifths', e: 'calm',      v: 'menu',      why: 'polished circle-of-fifths turnaround, perfectly even' },
  { pin: 'vid_cc_neapolitan',       e: 'mysterious', v: 'shrine',    why: 'the Neapolitan sixth as a structural chord, not a passing colour' },
  { pin: 'vid_cc_soothing',         e: 'calm',       v: 'rest',      why: 'pedal bass, one suspension — his "soothing" case' },
  { pin: 'vid_cc_face_dim_walk',    e: 'nostalgic',  v: 'snow',      why: 'the FACE progression: chromatic diminished walk, 3 of 21 reels' },
  { pin: 'vid_cc_mixing_modes',     e: 'mysterious', v: 'space',     why: 'planed major sevenths, rootless shells, modal not functional' },
  { pin: 'vid_cc_chromatic_mod',    e: 'tense',      v: 'stealth',   why: 'parallel sevenths descending by semitone into a modulation' },
  { pin: 'vid_cc_diatonic_twisted', e: 'calm',       v: 'water',     why: 'zero out-of-key chord tones — all colour, no chromaticism' },
  { pin: 'vid_cc_90s_deceptive',    e: 'nostalgic',  v: 'casino',    why: 'two deceptive cadences, both landing on HALF-length chords' },
  { pin: 'vid_cc_cinematic_cmin',   e: 'somber',     v: 'aftermath', why: 'a C pedal under three chords, then the bass finally moves' },
  { pin: 'vid_cc_subv',             e: 'excited',    v: 'casino',    why: 'a tritone-sub dominant, half length, one bar from home' },
  { pin: 'vid_cc_la_folia',         e: 'mysterious', v: 'cave',      why: 'the oldest progression here — the bass is the subject' },
  { pin: 'vid_cc_mode_switch',      e: 'somber',     v: 'snow',      why: 'the same chord major then minor, a semitone apart in the bass' },
  { pin: 'vid_cc_neosoul_essence',  e: 'nostalgic',  v: 'rest',      why: 'highest-confidence read in the pack; a ii-V insert at half length' },
  { pin: 'vid_cc_pedal_point',      e: 'triumphant', v: 'snow',      why: 'four chords over one pedal, then it opens out' },
  { pin: 'vid_cc_warm_passing',     e: 'happy',      v: 'shop',      why: 'the clearest passing chord in the recording' },
  { pin: 'vid_cc_alphabet_bass',    e: 'goofy',      v: 'kitchen',   why: 'a scale-walking bass with the chords invented over it' },
  // ---- the experiments: the same progression read a different way ----------
  { pin: 'vid_cc_face_dim_walk',    e: 'scary',      v: 'manor',     why: 'EXPERIMENT: does the diminished walk read gothic in a horror lane?' },
  { pin: 'vid_cc_neapolitan',       e: 'triumphant', v: 'citadel',   why: 'EXPERIMENT: the Neapolitan as epic rather than soulful' },
  { pin: 'vid_cc_alphabet_bass',    e: 'happy',      v: 'festival',  why: 'EXPERIMENT: the walking bass at festival tempo' },
  { pin: 'vid_cc_rnb_fmin_sparks',  e: 'somber',     v: 'aftermath', why: 'EXPERIMENT: the major-I spark read as consolation, not warmth' },
];

// ===========================================================================
// r27 — THE @vanrivermusic TEST PAGE.
//
// His ask, verbatim: "generate songs using the patterns we took from them. be
// in-depth. the songs should just be 16-32 bars long, just to test it".
//
// THE PROMPTS ARE HIS OWN WORDS. Every reel in the recording he handed over has
// a purple bubble under it in the DM thread where he wrote what the progression
// is FOR. Those labels are the emotion/environment mapping here — they are not
// my reading of the chords, and where a reel carries no label the row says so
// and the prompt is marked a guess.
//
// WHAT IS BEING TESTED, beyond the progressions themselves:
//
//   uneven chord length   `chordUnits` straight off the pack. 16 bars is the
//                         shortest length at which the measured ratios survive
//                         rounding (at 8 a 7-chord loop flattens to all-1s).
//   contrast at bar 0     the r26 chordcam measurement: his four zero-complaint
//                         songs all have a non-piano voice from bar 0, his seven
//                         complained-about ones do not for at least 16 seconds.
//   percussion ramp       the kit was the one thing arriving at full gain on the
//                         drop bar while every pitched voice around it faded in.
//   the r22 synth layers  frozenSlot IS the Serum producer's motor (a frozen
//                         body with one slot carrying the harmony, 4 reels);
//                         layerRest is his alternate-bar answer layer;
//                         coprimeCell is the ornament that straddles the barline.
//                         Applied ONLY on non-niche lanes, which is both his
//                         restriction and what research/reel-layers-r22.md
//                         requires: all 9 face-cam reels are in MINOR with zero
//                         modal or non-Western evidence, so nothing there
//                         transfers to desert, jungle or a horror lane on its
//                         own authority.
// ===========================================================================
// Pick the loop length whose ROUNDED bar plan is closest to the measured unit
// shares. L1 distance between the two normalised distributions; ties go to the
// shorter loop. Reported per song on the page so the rounding is visible.
function vrBestTarget(units, targets = [16, 32]) {
  // A longer loop always scores at least as well on L1 — more bars means finer
  // rounding — so a bare argmin would send every song to 32 and quietly ignore
  // "the songs should just be 16-32 bars long". The margin says a longer loop
  // must be BETTER BY A REAL AMOUNT (5 points of total distribution mass), not
  // merely better, before it is worth the extra length.
  const MARGIN = 0.05;
  const sum = units.reduce((a, b) => a + b, 0);
  const want = units.map((u) => u / sum);
  let best = targets[0], bestErr = Infinity;
  for (const T of targets) {
    const plan = weightedBarPlan(units, T);
    if (!plan) continue;
    const B = plan.reduce((a, b) => a + b, 0);
    const err = plan.reduce((a, b, i) => a + Math.abs(b / B - want[i]), 0);
    if (err < bestErr - MARGIN) { bestErr = err; best = T; }
  }
  return best;
}

// ===========================================================================
// r28 — audition/layerstack.html : A SUITE IN THE SERUM PRODUCER'S GENRE
// ===========================================================================
//   LAYERSTACK=1 node scripts/audition-songs.mjs  ->  audition/layerstack.html
//
// HIS ASK: "make a song suite learning and applying patterns and layering and
// everything from the synth guy from earlier, in the genre his songs are (think
// layer stack vibe). i feel like not enough of his techniques were applied
// fully."
//
// WHY HE IS RIGHT, IN ONE MEASUREMENT. research/reel-layers-r22.md ends with six
// engine-ready rules and a near-miss seventh. Two were wired (R2 frozenSlot, R6
// coprimeCell) and BOTH are dropped by the r26 lane dissonance budget on every
// casual lane — the frozen slot alone is charged 1.00/bar against a 0.35 budget.
// So on the page he judged, cp_sus_float_calm advertises `layerStack` while its
// own cast line reads "NOT CAST: coprimeCell, echo, frozenSlot". The preset's
// defining device has never sounded.
//
// This page wires the other five (R1, R3, R4, R5, the final-bar break) plus role
// B, and lifts the budget so R2 and R6 can actually cast.
//
// THE BUDGET LIFT IS NOT A LOOPHOLE, and it is the one decision here worth
// arguing with. `LANE_RUB_BUDGET` exempts a lane's SIGNATURE device by
// construction — desert's wobble, horror's pincer — on the principle that the
// idiom's own friction is the idiom. In this genre the frozen slot IS the
// signature device: R2 is "the frozen tones re-colour themselves as the chord
// moves", which means manufacturing a rub on every chord that does not contain
// them. That is the sound, not a defect in it. The realised rub rate is measured
// and printed on every card so his ear judges it knowing the number.
//
// WHAT THE GENRE IS, from the research and nothing else: minor (all 9 reels,
// zero major/modal/non-Western), 63-127 BPM, all-synth (numbered instances of
// one plugin), 2-4 bar loops, and drumless in 7 of 9. Tempi are pinned to the
// reel each progression was read from rather than derived from the emotion,
// because tempo is part of what makes it the genre.
//
// NICHE LANES ARE UNREACHABLE, twice over: every rule goes through `r28()`, and
// no row names a niche environment. His r27 ruling and the research's own §5.2
// agree, so this is not a courtesy.
// ===========================================================================
// r30 — audition/energy.html : HIS LABELS, SERVED AT A HIGHER ENERGY
// ===========================================================================
//   ENERGY=1 node scripts/audition-songs.mjs  ->  audition/energy.html
//
// This page answers BOTH halves of his r30 message at once, because they are the
// same feature.
//
// HALF ONE — the labels. His ruling: "no i mean label-wise for that song, x song
// could also be used given other various prompts rather than specific that one.
// so that instrument preset and pattern and what not works." A song he likes is a
// FINISHED OBJECT; what widens is the set of prompts it may be served for. That
// is `src/lib/song-labels.js`, built from his own notes only.
//
// HALF TWO — the energy layer. His r28 clause, repeated in r30: "if it's
// energetic just add the percussive strings I mentioned with their repeated
// intervals + percussion and boom", and then "try the synth/violin rise ... some
// given intervals and it repeats those intervals over and over to convey energy".
//
// Put together: serving a labelled song at a HIGHER energy means ADDING layers to
// the song he already judged, never regenerating it. So every core appears TWICE:
//
//   card 1  the song exactly as he judged it (byte-identical mix expected)
//   card 2  the same song + the r30 rise + the marcato + percussion
//
// The A/B is therefore clean by construction — one variable, and the base card is
// checkable against the judged page.
// ===========================================================================
// r31 — audition/reels.html : THE LAYER PATTERNS, RECOMBINED
// ===========================================================================
//   REELS=1 node scripts/audition-songs.mjs  ->  audition/reels.html
//
// HIS ASK: "the idea is that we can merge all the patterns I feed you and select
// and choose and combine regardless of what reel they came from, using metadata
// and verification and which combos work well" ... "once you're done, generate a
// song suite showing and experimenting with what you learned".
//
// So the page is built in three deliberate blocks:
//
//   FAITHFUL   one song per vibe class, using ONLY that class's own reel layers.
//              This is the control: does the hardcoding reproduce the vibe he
//              labelled? If a faithful card misses, the transcription is wrong
//              and no amount of recombination will save it.
//   CROSSED    the actual ask — stacks built from layers of DIFFERENT reels,
//              chosen by `comboScore` (disjoint registers, low onset overlap, a
//              complete bass/harmony/top set). The score and its reasons print on
//              the card, so a combination he dislikes can be read back against
//              the numbers that picked it.
//   DEVICE     his reel-1 aside on its own: the ascending re-pitched arpeggio
//              ("play those intervals from bottom to top over and over again ...
//              then repeat for another chord"), against the r30 descending frozen
//              form, so the two are separable by ear.
//
// The three replicate reels (3, 5, 8 — all "sounds like 3") get a card each in
// FAITHFUL, because they are the only vibe with independent samples and therefore
// the only place his ear can tell me whether the shared features are the vibe.
const REELS_PAGE = process.env.REELS === '1';

const ENERGY_PAGE = process.env.ENERGY === '1';

// r34 — THE VOCAL SUITE (his ask: "generate some more primarily vocal songs -
// like a suite, of various types, but mostly energetic"). VOCAL=1 builds
// audition/vocal.html: new songs under new names (vx_*), each with
// `vocalLead` so the instrumental lead is a guide under the sung tune, a
// backbeat kit on the energetic ones, and the companion as the harmony voice.
// The vocal itself is rendered by scripts/render-vocal.mjs --page
// audition/vocal.html <name>, which also renders the HQ mix if missing.
const VOCAL_PAGE = process.env.VOCAL === '1';
const VX_PROMPTS = [
  // ---- energetic (8) --------------------------------------------------------
  // ---- r35: HIS FIRST EXPORT ON THIS PAGE (2026-09-12), per card -------------
  // "with HQ on, I can't hear the accordion ... guitar doesn't really fit this
  // vibe and is a bit too sustaining ... otherwise it's a good song" -> the
  // guitar leaves; the voice stays where he judged it (+3, no complaint).
  { e: 'excited',    v: 'festival', why: 'festival pop anthem — the brightest lane, four-on-the-floor kit with a backbeat, chorus hooks repeat on the returning letter', extra: { guitar: false }, vocalDb: 3 },
  // "8th vocal note sounds like screaming" (A5 held, export-vocal's r35 ceiling),
  // "random cymbal" (seam crash), "voice a bit too loud for a energetic section
  // - learn this" (the balance law -> 0), "guitar too wet/sustaining" (staccato)
  { e: 'triumphant', v: 'boss',     why: 'power anthem — marcato strings and a driving kit under a soaring line', extra: { marcato: true } },
  // "random fast slightly off-beat synth sounds like glitching" — measured: the
  // kalimba melody_takeover at 0.89 in bars 14-19, un-guided (the index bug)
  { e: 'happy',      v: 'jungle',   why: 'dance — the tumbao bass and marimba vamp of the jungle lane as a groove under a voice' },
  { e: 'excited',    v: 'space',    why: 'synth-pop — the all-synth lane is the voice’s home genre (a Vocaloid song is a synth song)', extra: { fullSynth: true } },
  // "love the guitar here, sounds better than without!" — a prose keep: pinned
  // as judged, open chorus and all, voice at the judged +3
  { e: 'excited',    v: 'casino',   why: 'swing / funk — the swung 16ths lane, a syllabic vocal riding the shuffle', extra: { fullSynth: true, swing: 0.585, leadRangeSteps: 4, pinFrom: 'r35', voicedColor: true }, vocalDb: 3 },
  // "random cymbal is in the middle of the section ... I like this song though"
  // -> pinned, the seam crash is the one named change
  { e: 'tense',      v: 'fight',    why: 'rock drive — the offbeat texture and counterline of the fight lane under a tense sung line', extra: { texture: { class: 'offbeat', octave: 3 }, counterline: true, pinFrom: 'r35', crashSeams: true }, vocalDb: 3 },
  // "the guitar sounds good but makes it less 'happy shop' so doesn't fit the
  // genre ... overall good though" -> the guitar leaves, nothing else moves
  { e: 'happy',      v: 'shop',     why: 'bright everyday pop — the shop lane’s groovy chill beat at a singable tempo', extra: { guitar: false, pinFrom: 'r35', voicedColor: true }, vocalDb: 3 },
  // vocalDb = the voice over the band's RMS in its sung spans (render-vocal.mjs
  // reads it from the page; the suite default is +3). HIS r34 NOTES: "in
  // excited training, make the voice softer -> since it's energetic, the
  // voice should not completely overpower the energetic instruments" -> 0;
  // "make the romantic song voice just a bit softer (to a lesser degree)" -> +1.5.
  // r35: "the spamming piano drowns out the other stuff and is a bit too loud
  // (I think use another instrument for the spamming chord stuff)" — measured:
  // the acc hand at 0.90-1.00 against a x0.45 lead guide (16 attacks a bar).
  // The hand moves to the electric piano and to 0.6x.
  { e: 'excited',    v: 'training', why: 'sports montage — marcato ostinato and a rising kit', extra: { marcato: true, accSound: 'gm_epiano1', accGainMul: 0.6 }, vocalDb: 0 },
  // ---- two slower ones so the suite has a ballad side ---------------------
  // KEEP (clicked, r34-vocal export) + "piano is a bit too loud ... in HQ it's
  // so much better and the voice melody is so good. fits so well". The keep
  // pins harmony and base (D64); `keepFresh` keeps every rule it was JUDGED
  // with live (the keep-transition law, D91/D118) and pinFrom walls off this
  // round's; the acc trim is the one named change. Voice at the judged +3.
  { e: 'nostalgic',  v: 'snow',     why: 'ballad — the royal-road lane; long held vowels, the register pushed up for snow', extra: { keepFresh: true, pinFrom: 'r35', voicedColor: true, accGainMul: 0.8 }, vocalDb: 3 },
  // "at the very beginning, there's a bit of a glitch. otherwise it's very
  // good" -> pinned; the head fade is in render-vocal.mjs
  { e: 'romantic',   v: 'rest',     why: 'slow ballad — two anchor chords, the voice carries almost everything', extra: { pinFrom: 'r35', voicedColor: true }, vocalDb: 1.5 },
];

const LAYERSTACK = process.env.LAYERSTACK === '1';
const LS_PROMPTS = [
  // ---- the descending loop: 4 of 9 reels, one producer's habit --------------
  { pin: 'sr_descend_bvi_v', e: 'somber',     v: 'space',   bpm: 102, motor: false,
    why: 'The set’s most common shape (i-bVII-bVI-V, four reels) at its own reel’s tempo. Everything on: floor re-registered off the lead, hold/move at a 4-bar period, frozen pedal, coprime ornament.' },
  { pin: 'sr_descend_bvi_v', e: 'tense',      v: 'stealth', bpm: 102, motor: true,
    why: 'HIS OWN SPEC this round, on “one of the best stealth songs”: “repeated four-note falling synths ... 8th 5th 2nd root repeated over and over again 8th note to convey tension/stealth”. That figure is role B, the motor — this is the row it is built for.' },
  { pin: 'sr_descend_bvi_v', e: 'nostalgic',  v: 'rest',    bpm: 63, motor: false,
    why: 'The slowest tempo in the reel set (DY77’s 63). The hold/move layer is the whole texture at this speed — the test of whether R3 carries a song on its own.' },
  // ---- the all-minor variant: no leading tone anywhere ----------------------
  { pin: 'sr_descend_iv_v',  e: 'calm',       v: 'rest',    bpm: 69, motor: false,
    why: 'Da3c’s own loop and tempo — the reel that carries the hold-bar/move-bar layer AND the beats-2-and-4 lead. Nothing pulls, so the loop can repeat forever.' },
  { pin: 'sr_descend_iv_v',  e: 'somber',     v: 'snow',    bpm: 69, motor: false,
    why: 'The same loop moved to a bright lane. His note last round: “I also feel like snow is higher on the piano in terms of octaves rather than being so low” — the register bands are pushed up a step here.' },
  { pin: 'sr_descend_iv_v',  e: 'mysterious', v: 'menu',    bpm: 75, motor: false,
    why: 'DYfk’s tempo, and the reel that states the principle this page is built on: “INDEPENDENCE IS BOUGHT WITH REGISTER, NOT RHYTHM.”' },
  // ---- the relative-major lift: the register-discipline reel ----------------
  { pin: 'sr_iii_vi_v',      e: 'nostalgic',  v: 'snow',    bpm: 91, motor: false,
    why: 'DalZ’s loop and tempo — the reel with four disjoint octave bands that never double a pitch, and the one whose bass is drawn as the lead’s own downbeats. R1 and R4 are both read off this reel.' },
  { pin: 'sr_iii_vi_v',      e: 'mysterious', v: 'space',   bpm: 91, motor: true,
    why: 'The same loop with the motor running under it, so the falling 8ths can be heard against a lifting progression rather than a descending one.' },
  // ---- three chords, and the one reel with drums ----------------------------
  { pin: 'sr_vi_v_three',    e: 'tense',      v: 'lab',     bpm: 95, motor: true, drums: true,
    why: '13-20-54’s loop — the only reel of the nine with hand-placed, deliberately off-grid drums (2-3 kicks per 2 bars, empty bars between, hats explicitly NOT a 16th grid). Drums on for that reason and no other.' },
  { pin: 'sr_vi_v_three',    e: 'mysterious', v: 'cave',    bpm: 78, motor: false,
    why: 'The same three chords slowed and drumless, to hear whether the layer stack alone fills a 32-bar song without a kit under it — which is what 7 of the 9 reels actually are.' },
  // ---- the walking bass reel: R2's own source ------------------------------
  { pin: 'sr_stepwise_floor', e: 'mysterious', v: 'space',  bpm: 80, motor: false,
    why: 'DZS8’s loop and tempo, harmonised from its BASS MOTION rather than from a chord list. This is the reel R2 comes from — the frozen dyad that reads 9+b3, then #11+5, then 5+b6 without changing a note.' },
  { pin: 'sr_stepwise_floor', e: 'calm',       v: 'water',  bpm: 80, motor: false,
    why: 'The stepwise loop at its own tempo in a calm lane. His “the two note together variation in the left hand ... matches the vibe of calm water so I like it here” is the one place he has endorsed a dyad in the left hand — this is where the re-registered floor has to earn it.' },
  // ---- the chromatic one, and the only second producer ---------------------
  { pin: 'sr_planing_chrom',  e: 'tense',      v: 'casino', bpm: 127, motor: true, drums: true,
    why: 'Dcbb’s loop and tempo, and a DIFFERENT producer from the other five — which is also why R6 (the coprime cell) has two independent sources rather than one. Four-on-the-floor is the other drum reel’s reading, not this one’s, so the kit stays sparse.' },
  { pin: 'sr_planing_chrom',  e: 'mysterious', v: 'stealth', bpm: 110, motor: false,
    why: 'r29, MOVED BY HIS EAR. This row was mysterious/lab and it is the one card he rejected outright: "dissonance in the piano and the synths. not a very good song - not good combination and instruments seem dissonant". The SAME progression in casino/tense he described as "an unsettling casino ... where something is obviously wrong. dissonance but patterns individually work fine". Measured, vertical friction is not the difference and runs backwards — the casino song has 38.53 close semitone/tritone pairs a bar against this one\u2019s 20.84. So the chromatic slide needs a lane that WANTS unease; stealth is the nearest one that does.' },
];

const VANRIVER = process.env.VANRIVER === '1';
const VR_PROMPTS = [
  // ---- his labelled reels: the prompt IS his bubble --------------------------
  { pin: 'vid_vr_romantic',   e: 'romantic',   v: 'rest',     bars: 32,
    why: 'HIS LABEL: "romantic". Two anchor chords of four units each with every approach chord at half a unit or less — the widest length ratio in the pack.' },
  { pin: 'vid_vr_shop',       e: 'happy',      v: 'shop',     bars: 16,
    why: 'HIS LABEL: "casual day / shop vibes". The one metrically EVEN reel: its interest is the parallel major/minor pivot on one root, not the rhythm.' },
  { pin: 'vid_vr_cloudy',     e: 'nostalgic',  v: 'snow',     bars: 16,
    why: 'HIS LABEL: "relaxing chord progression (cloudy/moody day)". The ROYAL ROAD (IV-V-iii-vi) — the J-pop/city-pop backbone, and the iii arrives as two half-length re-voicings rather than one held chord.' },
  { pin: 'vid_vr_hotel',      e: 'calm',       v: 'menu',     bars: 16,
    why: 'HIS LABEL: "relaxing classy Libby music (like if ur in a clean place like a hotel)". The clearest length law in the set: v minor holds 1.5 units, then the SAME root becomes V7(b9) for 0.5.' },
  { pin: 'vid_vr_reflective', e: 'somber',     v: 'rest',     bars: 16,
    why: 'HIS LABEL: "reflective, sleepy, relaxing music" — and the reel he wrote the pinky-to-thumb playing instruction on. Six structural chords at one unit each, one diminished passing chord at a QUARTER.' },
  { pin: 'vid_vr_moody',      e: 'mysterious', v: 'space',    bars: 32,
    why: 'HIS LABEL: "moody environment". Widest spread in the pack, 0.5 to 3 units — two long chromatic-mediant anchors approached through a chain of short unstable chords.' },
  // ---- the two unlabelled reels: the prompt is a GUESS and says so -----------
  { pin: 'vid_vr_funky',      e: 'happy',      v: 'casino',   bars: 16,
    why: 'NO LABEL FROM HIM — prompt is a guess. A chromatic root descent A-Ab-G where the BORROWED chord is the long one and the diatonic chords pass; the reel that inverts the length law.' },
  { pin: 'vid_vr_ineedyourears', e: 'excited', v: 'training', bars: 16,
    why: 'NO LABEL FROM HIM — prompt is a guess. The reel the subdivision finding is clearest on: 25 attacks under a 3-unit chord, 9 under a 1-unit chord, ~6/s either way.' },
  // ---- experiments: the same progression read against a different prompt -----
  { pin: 'vid_vr_hotel',      e: 'romantic',   v: 'rest',     bars: 16,
    why: 'EXPERIMENT: his "hotel" progression read as romantic instead of poised — does the V7(b9) flare read as warmth?' },
  { pin: 'vid_vr_cloudy',     e: 'calm',       v: 'water',    bars: 16,
    why: 'EXPERIMENT: the royal road at a calm tempo, to hear whether the progression or the lane is doing the work.' },
  { pin: 'vid_vr_moody',      e: 'tense',      v: 'stealth',  bars: 32,
    why: 'EXPERIMENT: "moody environment" pushed to tense — the diminished chain against a stealth lane.' },
];

// ---------------------------------------------------------------------------
// r27b — THE HAND-AUTHORED CITY-POP / K-POP PACK, applied.
//
// His ask: "i liked citypop and kpop a lot ... let's trying hardcoding a lot of
// chord progressions, tagging them with emtadata of when to apply, and then
// applying them in songs (with other stuff of course)."
//
// Every row below is CHOSEN BY THE TAGS, not by me: the prompt is written first
// and `citypopFor({emotion, environment, bpm})` picks the progression. `expect`
// records which entry I believe the tags select, and the build ASSERTS it — so
// if a later edit to the tags changes the selection, the build says so instead of
// silently swapping a song's harmony.
//
// "with other stuff of course" is the two synth devices he named in the same
// message: `layerStack` and `funkBounce`, both KEPT videolab cards (D87).
// ---------------------------------------------------------------------------
// Each row NAMES the progression (that is the "hardcoding" half of his ask) and
// the build then CHECKS that the entry's own tags admit the prompt (the
// "tagging them with metadata of when to apply" half). Naming it and verifying
// the tags is stronger than letting a score pick: a scorer that ranks
// cp_circle_of_fifths above cp_royal_road for a nostalgic shop is not wrong
// exactly, but it is not a decision anyone made, and the first build did exactly
// that on three of twelve rows.
const CP_PROMPTS = [
  { pin: 'cp_sus_float',        e: 'calm',       v: 'menu',      opts: { layerStack: true },
    why: 'HIS "lobby" case. A sus that never resolves, on the layer stack: frozen pedal, accent-line harmony, no drums.' },
  // r33: PROSE KEEP ("this is a good theme, very groovy, I like it. no
  // complaints") — pinFrom stops this round's rules; voicedColor keeps the
  // colour upgrade the pin would otherwise retract (colorFresh reads
  // !opts.pinFrom — the exact D118 catch-22, resolved by forcing the judged
  // capability explicitly).
  { pin: 'cp_royal_road',       e: 'nostalgic',  v: 'shop',      opts: { pinFrom: 'r33', voicedColor: true },
    why: 'The ROYAL ROAD (IV-V-iii-vi) — the J-pop backbone, and the progression his "cloudy/moody day" reel turned out to be.' },
  { pin: 'cp_lobby_sixnine',    e: 'calm',       v: 'rest',      opts: { layerStack: true },
    why: 'HIS "hotel lobby": a 6/9 tonic with no leading tone anywhere, and the V short enough to be a hinge rather than a cadence.' },
  { pin: 'cp_jtto_turnaround',  e: 'romantic',   v: 'rest',      opts: {},
    why: 'The neo-soul turnaround, played UNEVEN: the two stable chords hold 1.5 units and the two that move take 0.5.' },
  { pin: 'cp_lobby_static',     e: 'happy',      v: 'shop',      opts: {},
    why: 'HIS "casual day / shop vibes": TWO chords, two units each. Everything interesting has to come from the figure.' },
  { pin: 'cp_komuro',           e: 'triumphant', v: 'festival',  opts: {},
    why: 'The Komuro progression — starts on the relative minor and arrives at the major tonic. The one that actually closes.' },
  { pin: 'cp_kpop_bright_hook', e: 'excited',    v: 'casino',    opts: { bassLine: true },
    why: "K-pop descending-bass hook + HIS funk bounce (the engine's own opts.funkBass, widened by opts.bassLine): gm_slap_bass_2 on the 0-3/8-1/2-7/8 grid." },
  { pin: 'cp_kpop_minor_anthem', e: 'tense',     v: 'stealth',   opts: { bassLine: true },
    why: 'The one entry that suits an action lane — bVII instead of V, so it drives without ever resolving. Moved off "boss" because the battle lane gives the low end to the acc hand (accToBass), and the funk bounce stands down there — one low voice at a time.' },
  { pin: 'cp_descending_bass',  e: 'nostalgic',  v: 'snow',      opts: {},
    why: 'The city-pop signature: a MINOR IV and a chromatic bass descent under static upper voices — the motion our acc hand has never had.' },
  // r33: PROSE KEEP ("I like this song a lot ... really good") — same pin +
  // forced colour as cp_royal_road above.
  { pin: 'cp_planing_maj7',     e: 'mysterious', v: 'space',     opts: { layerStack: true, pinFrom: 'r33', voicedColor: true },
    why: 'Parallel major sevenths moved intact, on the layer stack. Modal, no dominant — an atmosphere lane progression.' },
  { pin: 'cp_backdoor',         e: 'somber',     v: 'aftermath', opts: {},
    why: 'The backdoor cadence: arrives at the tonic from bVII, so it reads as consolation rather than resolution.' },
  { pin: 'cp_secondary_chain',  e: 'happy',      v: 'kitchen',   opts: {},
    why: 'Secondary dominants throughout, every one of them SHORT — the shape r26 measured him complaining about when a support layer doubles down on it.' },
];

let CP_FIRST = 0;
function buildCityPop() {
  CP_FIRST = songs.length;
  for (const row of CP_PROMPTS) {
    const entry = PROGRESSIONS_CITYPOP[row.pin];
    if (!entry) { console.error(`citypop: missing ${row.pin}`); continue; }
    const w = entry.appliesWhen;
    // THE TEMPO COMES FROM THE IDIOM, NOT FROM THE VIBE. The vibe compiler gives
    // "calm rest" 50bpm and "excited casino" 176 — both outside every entry's
    // declared range, and the first build simply dropped five of twelve songs
    // because of it. That is the tags doing their job: a lounge turnaround at
    // 176bpm is not city-pop. So when the vibe's tempo falls outside the idiom's
    // range the song is pinned to the nearest edge of that range, and the page
    // says so. The alternative — widening every range until nothing is excluded —
    // would delete the only piece of knowledge the bpm tag carries.
    const v0 = compileVibe({ emotion: row.e, environment: row.v, meter: '4/4', name: `cp_probe_${row.e}_${row.v}` });
    const bpm = Math.min(w.bpm[1], Math.max(w.bpm[0], v0.bpm));
    const retuned = bpm !== v0.bpm ? `${v0.bpm} -> ${bpm}` : null;
    // the tags must admit the prompt we are about to build — this is the check
    // that keeps `appliesWhen` honest rather than decorative
    const admits = citypopFor({ emotion: row.e, environment: row.v, bpm });
    if (!admits.some((x) => x.name === row.pin)) {
      console.error(`citypop: ${row.pin} tags do NOT admit ${row.e}/${row.v} @${bpm}bpm `
        + `(admitted: ${admits.map((x) => x.name).join(', ') || 'nothing'})`);
    }
    const name = `cp_${row.pin.replace('cp_', '')}_${row.e}`;
    buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
      bpm,
      basePin: row.pin,
      rawBase: true,
      family: entry.family,
      chordUnits: entry.chordUnits,
      chordUnitBars: vrBestTarget(entry.chordUnits),
      totalBarsCap: Math.min(32, 2 * vrBestTarget(entry.chordUnits)),
      // ---- r28 · THE KEEP-TRANSITION LAW, FOURTH BITE (D91/D99/D101) --------
      // His 23 notes on this page were imported this round, and importing them
      // MOVED 15 of the 23 songs — measured by rebuilding against a pre-import
      // copy of verdicts.js. Nothing in r28 touched them; the notes alone did it.
      //
      // The mechanism is the D99 law verbatim: "a gate that stops NEW
      // capabilities must not RETRACT old ones". Six gates in this file read
      // `!CARD_NOTES?.[name]` so a new roll only lands on a history-less song.
      // The instant he writes a note about one, those gates flip and the song
      // loses what he was listening to. `colorFresh` (line ~747) is the worst of
      // them because it governs the HARMONY: 14 songs lost their `voicedAs`
      // colour upgrade and their `degrees`, `symbols` and `numerals` all changed
      // — including cp_royal_road_nostalgic, on which he wrote "this is a good
      // theme, very groovy, I like it. no complaints", and cp_planing_maj7_
      // mysterious, "I like this song a lot ... really good". Those are prose
      // keeps, and a prose keep is a keep.
      //
      // So the page pins what it was JUDGED with, explicitly. `pinFrom` is the
      // usual instrument (D101) and is the WRONG one here: `colorFresh` reads
      // `!opts.pinFrom` as well, so pinning the song would drop the very upgrade
      // it is meant to protect. The explicit opt-in is what states the intent.
      // ONE flag, not three. Pinning feature-by-feature is how a judged layer
      // gets silently dropped (D101: "six flags, seven next round") — and it
      // overshot when tried here, forcing varyLeadVoice and leadDynamics ON for
      // songs whose defaults had them OFF and moving all 23 mixes. `noteBlind`
      // says the thing that is actually true: this page's own notes are not
      // evidence that its songs have a history, because they ARE its first
      // judgement. The six history-less gates then behave exactly as they did on
      // the build he listened to.
      noteBlind: true,
      contrastAtZero: true,
      percRamp: true,
      metronomeAcc: true,
      entryRunGuard: true,
      ...row.opts,
      r23: true, deepDrums: true, echoLayer: true, octaveDouble: true,
      obliqueCompanion: true, percBackbeat: true, supportFigure: true,
      scaleTokensInKey: true, companionFamilySplit: true,
    });
    const S = songs[songs.length - 1];
    S.why = row.why;
    S.pinned = row.pin;
    S.idiomName = entry.idiomName;
    S.published = entry.voicedAs.join('  ');
    S.units = entry.chordUnits.join(' ');
    S.appliesWhen = w;
    S.retuned = retuned;
    // MEASURED, not requested: read the device back off the song's own cast list.
    // `devices` used to echo row.opts, which reported a funk bounce on a song
    // where it had been suppressed.
    const castTxt = (S.cast ?? []).join(' | ');
    const fired = [];
    if (/funk bounce: gm_slap_bass_2/.test(castTxt)) fired.push('funkBounce');
    if (row.opts.layerStack) fired.push('layerStack');
    S.devices = fired.join(', ') || 'none';
    S.devicesAsked = Object.keys(row.opts).join(', ') || 'none';
    S.alsoAdmitted = admits.map((x) => x.name).filter((n) => n !== row.pin).join(', ') || '(only this one)';
  }
}

let RL_FIRST = 0;
if (REELS_PAGE) {
  RL_FIRST = songs.length;
  const CLASSES = Object.entries(VIBE_CLASSES);
  // r32 — HIS RULING: "why so many duplicate names? surely you have more
  // scenarios." Measured on the page he judged: 5 of 16 songs were happy/menu
  // and 3 were mysterious/space. A vibe class now spends its OWN prompt list
  // rather than always taking `lanes[0]`/`emotions[0]`, so no two cards on the
  // page claim the same (emotion, environment) pair.
  const usedPrompts = new Set();
  const promptFor = (cls, salt) => {
    const combos = [];
    for (const env of cls.lanes) for (const emo of cls.emotions) combos.push([emo, env]);
    const start = fnv(`${salt}|prompt`) % Math.max(1, combos.length);
    for (let i = 0; i < combos.length; i += 1) {
      const [emo, env] = combos[(start + i) % combos.length];
      if (!usedPrompts.has(`${emo}|${env}`)) { usedPrompts.add(`${emo}|${env}`); return { emotion: emo, environment: env, meter: '4/4' }; }
    }
    const [emo, env] = combos[start];
    return { emotion: emo, environment: env, meter: '4/4' };
  };

  // r33 — per-card answers to his notes, keyed BY NAME so they can never leak
  // to another card:
  //  - r5: "more of a sneaky/goofy vibe because of the boogy, not happy" (the
  //    D122 riff-pool shape reaching his ear a second time — prefer pulse) +
  //    "maybe add more layers" (the companion is his most-repeated love);
  //  - cross_casual_task: "it should be more layers";
  //  - cross_industrial_mission: "the percussion too loud and doesn't really
  //    fit the vibe" — the kit stood at FOREGROUND with 52.9% of ALL mix
  //    events on a lab card; one notch down.
  const REELS_CARD_OPTS = {
    // (accSound pins the hand to the piano — the class swap alone re-rolled
    // the acc voice to a synth bass at 0.99x the lead, r33 verify)
    rl_casual_task_r5: { accClassPrefer: 'pulse', companion: true, accSound: 'piano' },
    rl_cross_casual_task: { companion: true },
    rl_cross_industrial_mission: { percPresence: 'driving' },
    // r33: PROSE KEEP — "love this vibe ... otherwise love the layering and it
    // fits the vibe", his strongest card of the round, with exactly ONE
    // complaint: "main synth is too loud". Measured: the complaint is the
    // gm_epiano1 melody complex (lead 0.46 + register copy 0.42 + acc 0.34 —
    // three layers on one sound, 47% of all onsets). So the song is PINNED
    // from this round's rules and gets only the named fix: a 15% trim on the
    // lead complex (leadGainMul is opts-level, so it survives the pin; the acc
    // rides accUnderLead x leadGain and trims with it).
    rl_device_rise_down: { pinFrom: 'r33', leadGainMul: 0.85 },
  };
  const mk = (name, prompt, opts, meta) => {
    // r32: a FAITHFUL card takes a LEAN default set. The rich set below exists
    // to make an ENGINE arrangement good; spreading it before `...opts` would
    // hand `octaveDouble: true` etc. straight past opts.reelFaithful's stand-down.
    // r33 additions to BOTH sets: `noHandoff` — the D90 handoff chain put the
    // tune on flute/vibraphone/epiano at 1.01-1.04x the lead's gain in its
    // 78-83 register, and those segments are TEN of his sixteen r33 complaint
    // cards ("flute too loud" x5, "glockenspiel way too loud" x2 — there is no
    // glockenspiel on the page, it is gm_vibraphone — "melody synth", r1's
    // "second section randomly got louder" = the same-timbre 2.54x jump at the
    // first handoff seam, and r2's "the piano just abruptly cuts off" = the
    // lead stopping dead at its handoff). A reel plays one instrument per
    // role; the tune keeps its voice. `ambientSwell` — his cross_casual_task_
    // active ask, defaulted page-wide exactly as he said ("abstracted to other
    // songs too").
    const base = opts.reelFaithful
      ? {
        totalBarsCap: 32, noteBlind: true, noJitter: true, supportUnderLead: true,
        metronomeAcc: true, entryRunGuard: true, scaleTokensInKey: true,
        percBackbeat: true, deepDrums: true, noHandoff: true, ambientSwell: true,
        // r33: the reel's harmony plays AS TRANSCRIBED — the bridge/treat
        // departure recoloured rl_dark_space_r1's two madd9 chords into D#- and
        // A#-MAJOR triads for bars 12-19 (a `mixture` op; 32 out-of-key notes =
        // 100% of the song's OOK, exactly the section his "is major for some
        // reason" names). D122 already set accVary/accTravel false here for the
        // same reason; the harmony departure was the half still standing.
        bridgeHarmony: false, rawHarmony: true,
      }
      : {
        totalBarsCap: 32, noteBlind: true, noJitter: true, supportUnderLead: true,
        textureVary: true, layerRest: true, metronomeAcc: true, entryRunGuard: true,
        echoLayer: false, r23: true, deepDrums: true, octaveDouble: true,
        obliqueCompanion: true, percBackbeat: true, supportFigure: true,
        scaleTokensInKey: true, companionFamilySplit: true, noHandoff: true, ambientSwell: true,
        // r33: crossed cards keep the reel's harmony untouched too (same
        // mixture-recolour risk; a cross is engine layers over REEL harmony)
        bridgeHarmony: false, rawHarmony: true,
      };
    buildSong(prompt, name, { ...base, ...(REELS_CARD_OPTS[name] ?? {}), ...opts });
    const S = songs[songs.length - 1];
    Object.assign(S, meta);
    const castTxt = (S.cast ?? []).join(' | ');
    const m = /reel layers \(r3[12]\): ([^|]+)/.exec(castTxt);
    S.reelLayersCast = m ? m[1].trim() : (opts.reelLayers ? 'NONE CAST — check the metronome test / energy floor' : 'n/a (device card, no library layers)');
    return S;
  };

  // The reel's own harmony, served with its measured sub-bar rhythm (r32).
  const harmonyOf = (prog, progKey) => (progKey ? {
    basePin: progKey, rawBase: true,
    ...(prog.family ? { family: prog.family } : {}),
    ...(prog.bpm ? { bpm: prog.bpm } : {}),
    // AND THE REEL'S ACTUAL KEY — `keyHint` is otherwise picked by hashing the
    // song NAME (r30/D120), so a "faithful" card would render the reel's
    // progression in an arbitrary tonic.
    ...(prog.key ? { keyHint: String(prog.key).split(':')[0] } : {}),
    // …AND ITS MODE. `family` only distinguishes major/minor, so a modal reel
    // (reel 8 is D dorian) was built in the parallel MAJOR — his "the melody in
    // the glockenspiel doesn't sound on key".
    ...(String(prog.key).includes(':') && !['major', 'minor'].includes(String(prog.key).split(':')[1])
      ? { keyScale: String(prog.key).split(':')[1] } : {}),
    // r32 · THE SUB-BAR HARMONIC RHYTHM. This is the fix for his "it should be
    // hardcoded more faithfully to the reel". r31 expressed every reel through
    // `chordUnits`, which allocates whole BARS, so reel 7's four-chords-per-bar
    // turnaround became four bars and reel 4's seventeen chords became four.
    ...(Array.isArray(prog.chordBeats) ? { chordBeats: prog.chordBeats } : {}),
  } : {});

  // pick the mutually-compatible set of a reel's rows, primary first
  const stackOf = (rows) => {
    const out = [];
    for (const l of [...rows].sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0))) {
      if (out.some((c) => (c.exclusiveWith ?? []).includes(l.name)
        || (l.exclusiveWith ?? []).includes(c.name))) continue;
      out.push(l);
    }
    return out;
  };

  // ---- BLOCK 1 · FAITHFUL --------------------------------------------------
  // One song per (vibe class, reel) from that reel's OWN layers, its OWN chords
  // at their OWN harmonic rhythm, in its OWN key, on its OWN instruments, with
  // the engine's discretionary cast stood down (opts.reelFaithful).
  for (const [vibe, cls] of CLASSES) {
    for (const reel of cls.reels) {
      const mine = stackOf(layersFor({ vibe }).filter((l) => l.reel === reel));
      if (!mine.length) continue;
      const progEntry = Object.entries(REEL_PROGRESSIONS).find(([, p]) => p.reel === reel);
      const [progKey, prog] = progEntry ?? [null, null];
      const sc = comboScore(mine.map((l) => l.name));
      const name = `rl_${vibe}_r${reel}`;
      // the reel's chord row takes the ACC slot rather than stacking beside the
      // engine's own harmony hand (r32 — see opts.reelAcc)
      const accRow = mine.find((l) => l.role === 'chords');
      const rest = mine.filter((l) => l !== accRow);
      mk(name, promptFor(cls, name), {
        ...(prog ? harmonyOf(prog, progKey) : {}),
        ...(accRow ? { reelAcc: accRow.name, accSound: accRow.sound, accOctave: 3 } : {}),
        reelLayers: rest.map((l) => l.name),
        reelFaithful: true,
        // AND THE REEL'S OWN INSTRUMENTS. r31 set `fullSynth: true` on every
        // card, and the adapter reads `lp.synthSound` when it is on — so the
        // accordion became a square lead, the pizzicato strings a sawtooth, the
        // contrabass a synth bass and BOTH tubular-bell rows a music box. That
        // last substitution is most of his "the vibraphone is a bit overused in
        // general": gm_music_box was on 15 of 16 songs and not one reel row
        // names it. A faithful card plays what was played.
        fullSynth: false,
      }, {
        block: 'FAITHFUL', vibeClass: vibe, sourceReel: reel, hisLabel: cls.his,
        combo: `${sc.score}/100 — ${sc.reasons.join(' · ')}`,
        why: `FAITHFUL (r32): reel ${reel}'s own layers, its own chords AT ITS OWN HARMONIC RHYTHM `
          + `(${prog?.chordBeats?.length ?? '?'} chords over ${prog?.chordBeats ? prog.chordBeats.reduce((a, b) => a + b, 0) / 4 : '?'} bars), `
          + `in its own key (${prog?.key ?? '?'}), on its own instruments — and with the engine's `
          + `discretionary cast stood down. His label for that reel: "${cls.his}". `
          + 'r31 served this reel as four chords of one bar each with a full engine arrangement on top; '
          + 'he heard that as "the combination wasn’t that good".',
      });
    }
  }

  // ---- BLOCK 2 · CROSSED ---------------------------------------------------
  // HIS ASK: "combine regardless of what reel they came from ... using metadata
  // and verification and which combos work well". A cross keeps a reel's
  // HARMONY (r32 — r31 let these retrieve whatever the engine had, and 5 of 6
  // came out on a non-reel progression; his "it has some random Egyptian chord
  // D13" is `vid_citypop_c_a`, which no reel ever played) and crosses the
  // LAYERS over it.
  const ROLE_ORDER = ['bass', 'chords', 'pad', 'pluck', 'arp', 'lead', 'counter', 'perc'];
  for (const [vibe, cls] of CLASSES) {
    // THE POOL MUST BE VIBE-ANCHORED OR EVERY CROSS CONVERGES (r31, measured:
    // three vibes produced the identical stack). A cross starts from the vibe's
    // own material and reaches outward.
    const own = layersFor({ vibe });
    const others = Object.entries(LAYER_PATTERNS)
      .map(([nm, lp]) => ({ ...lp, name: nm }))
      .filter((l) => !l.vibes.includes(vibe));
    const pool = [...own, ...others];
    if (own.length < 1 || pool.length < 3) continue;
    const chosen = [];
    for (const role of ROLE_ORDER) {
      const cands = pool.filter((l) => l.role === role && !chosen.some((c) => c.name === l.name)
        && !chosen.some((c) => (c.exclusiveWith ?? []).includes(l.name) || (l.exclusiveWith ?? []).includes(c.name)));
      if (!cands.length) continue;
      let best = null;
      for (const c of cands) {
        const s2 = comboScore([...chosen, c].map((x) => x.name));
        if (!best || s2.score > best.sc.score) best = { c, sc: s2 };
      }
      if (best && (chosen.length < 2 || best.sc.score >= comboScore(chosen.map((x) => x.name)).score)) chosen.push(best.c);
      if (chosen.length >= 5) break;
    }
    if (chosen.length < 3) continue;
    const reels = [...new Set(chosen.map((c) => c.reel))];
    if (reels.length < 2) continue;                                   // not a CROSS unless it crosses
    if (!chosen.some((c) => c.vibes.includes(vibe))) continue;        // and it keeps its own vibe
    // the harmony comes from a reel in the cross — preferring the vibe's own
    const hostReel = reels.find((r) => cls.reels.includes(r)) ?? reels[0];
    const hostEntry = Object.entries(REEL_PROGRESSIONS).find(([, p]) => p.reel === hostReel);
    const [hostKey, hostProg] = hostEntry ?? [null, null];
    const sc = comboScore(chosen.map((c) => c.name));
    const name = `rl_cross_${vibe}`;
    const accRow = chosen.find((c) => c.role === 'chords');
    const rest = chosen.filter((c) => c !== accRow);
    mk(name, promptFor(cls, name), {
      ...(hostProg ? harmonyOf(hostProg, hostKey) : {}),
      ...(accRow ? { reelAcc: accRow.name, accSound: accRow.sound, accOctave: 3 } : {}),
      reelLayers: rest.map((c) => c.name),
      reelFaithful: true, fullSynth: false,
    }, {
      block: 'CROSSED', vibeClass: vibe, sourceReel: reels.join('+'), hisLabel: cls.his,
      combo: `${sc.score}/100 — ${sc.reasons.join(' · ')}`,
      why: `CROSSED: layers taken from reels ${reels.join(', ')} and stacked over reel ${hostReel}'s `
        + `own chords (${hostProg?.key ?? '?'}), chosen greedily by the combination score — disjoint `
        + 'registers, low onset overlap, a complete bass/harmony/top set. This is the ask: "combine '
        + 'regardless of what reel they came from". The score that picked this stack is printed above, '
        + 'so if it sounds wrong you can tell me which term is lying.',
    });
  }

  // ---- BLOCK 3 · THE REEL-1 DEVICE, A/B ------------------------------------
  // His aside on reel 1: "the chord that they reveal you could also play those
  // intervals from bottom to top over and over again like D F F# A# repeat and
  // then repeat for another chord". That is the r30 rise INVERTED — ascending,
  // and re-pitched instead of frozen.
  const DEV_PROMPTS = [{ emotion: 'mysterious', environment: 'space', meter: '4/4' },
    { emotion: 'tense', environment: 'lab', meter: '4/4' }];
  for (const [ix, [dir, note]] of [['down', 'r30 — DESCENDING and FROZEN, as measured off the Demon Slayer example (one cell held over five different chords)'],
    ['up', 'r31 — ASCENDING and RE-PITCHED, his reel-1 aside: "those intervals from bottom to top over and over again ... then repeat for another chord"']].entries()) {
    mk(`rl_device_rise_${dir}`, DEV_PROMPTS[ix], {
      basePin: 'sr_stepwise_floor', rawBase: true, family: 'minor', bpm: 80,
      // his note on the A card: "otherwise this song sounds good but synths a bit
      // too loud". Measured, the loud synth is the ACC — gm_epiano1 at 1.81x the
      // lead, because the acc's band tops out at an absolute 1.0 and never looks
      // at the tune (see opts.accUnderLead). The cast layers were already capped
      // relative to the lead by r29; only the acc was not.
      accUnderLead: true,
      layerStack: true, rubBudget: 1.60, frozenSlot: true, coprimeCell: true,
      reregister: true, holdMove: true, doublePeriod: true, finalBarBreak: true,
      synthRise: dir === 'up' ? { direction: 'up' } : true,
    }, {
      block: 'DEVICE', vibeClass: 'dark_space', sourceReel: dir === 'up' ? 1 : null,
      hisLabel: VIBE_CLASSES.dark_space.his, combo: 'n/a — single device A/B',
      why: `DEVICE A/B, ${dir === 'up' ? 'B' : 'A'}: the rise ${dir === 'up' ? 'ASCENDING' : 'DESCENDING'}. ${note}. `
        + 'Same device, same settings — the direction and the freeze are the only variables. '
        + '(r32: the two cards now take DIFFERENT prompts, per "why so many duplicate names?")',
    });
  }
}
let EN_FIRST = 0;
if (ENERGY_PAGE) {
  EN_FIRST = songs.length;
  // The rows are HIS LABELS, read from src/lib/song-labels.js — a song is on this
  // page only because one of his notes put it there. `servedAs` is the prompt the
  // label says it also covers, so the card can be judged as that prompt.
  const EN_ROWS = [
    { pin: 'sr_stepwise_floor', e: 'mysterious', v: 'space', bpm: 80, label: 'ls_stepwise_floor_mysterious',
      servedAs: { emotion: 'tense', environment: 'lab' } },
    { pin: 'sr_stepwise_floor', e: 'calm', v: 'water', bpm: 80, label: 'ls_stepwise_floor_calm',
      servedAs: { emotion: 'calm', environment: 'menu' } },
    { pin: 'sr_iii_vi_v', e: 'mysterious', v: 'space', bpm: 91, label: 'ls_iii_vi_v_mysterious',
      // its layerstack row carries motorFall; the base card must carry it too or
      // it is not the song he judged (caught by the byte compare — `mix` differed)
      motor: true,
      servedAs: { emotion: 'triumphant', environment: 'boss' } },
    { pin: 'sr_descend_iv_v', e: 'somber', v: 'snow', bpm: 69, label: 'ls_descend_iv_v_somber',
      servedAs: { emotion: 'somber', environment: 'aftermath' } },
  ];
  for (const row of EN_ROWS) {
    const entry = PROGRESSIONS_SERUM[row.pin];
    if (!entry) { console.error(`missing progression ${row.pin}`); continue; }
    // The BASE options are byte-for-byte the r28/r29 layerstack row, so card 1
    // reproduces exactly what he judged. Any drift here invalidates the A/B.
    const base = {
      basePin: row.pin, rawBase: true, family: 'minor', bpm: row.bpm,
      totalBarsCap: 32, layerStack: true, rubBudget: 1.60,
      reregister: true, holdMove: true, doublePeriod: true, finalBarBreak: true,
      motorFall: row.motor === true, frozenSlot: true, coprimeCell: true, layerRest: true,
      noJitter: true, supportUnderLead: true, textureVary: true, noteBlind: true,
      echoLayer: false,
      r23: true, deepDrums: true, octaveDouble: true,
      obliqueCompanion: true, percBackbeat: true, supportFigure: true,
      scaleTokensInKey: true, companionFamilySplit: true,
      metronomeAcc: true, entryRunGuard: true,
    };
    for (const lift of [false, true]) {
      // BOTH CARDS ARE BUILT UNDER THE JUDGED SONG'S NAME, then the energised one
      // is renamed for display. This is not cosmetic: `keyHint` is
      // `weightedPick(KEY_POOLS[family], fnv(`${name}|tonic`))` and a dozen other
      // choices hash on the name too, so building the pair under two names would
      // give them different KEYS and different retrievals — measured this round,
      // five names for one prompt produced C, G, A, D and A#. The A/B would then
      // be testing the name, not the energy.
      const name = row.label;
      buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
        ...base,
        // THE ONLY DIFFERENCE between the two cards. Everything above is shared.
        ...(lift ? {
          synthRise: true,          // r30, his example
          marcato: true,            // "the percussive strings I mentioned"
          percPresence: 'background', // "+ percussion and boom"
        } : {}),
      });
      const S = songs[songs.length - 1];
      if (lift) S.name = `${row.label}_energised`;
      S.pinned = row.pin;
      S.idiomName = entry.idiomName;
      S.published = entry.voicedAs.join('  ');
      S.hisLabel = SONG_LABELS[row.label]?.source ?? null;
      S.servesLine = servesLine(row.label);
      S.servedAs = `${row.servedAs.emotion} / ${row.servedAs.environment}`;
      S.why = lift
        ? `ENERGISED. The same song as the card above plus three additions and nothing else: the r30 synth rise (his example), the marcato ("the percussive strings I mentioned with their repeated intervals") and percussion ("+ percussion and boom"). If the base card and this one differ anywhere else, that is a bug.`
        : `BASE \u2014 the song as he judged it on audition/layerstack.html. His label says it also serves ${row.servedAs.emotion}/${row.servedAs.environment}; this card is here so the energised one has an honest control.`;
      const castTxt = (S.cast ?? []).join(' | ');
      S.devices = [
        /synth rise \(r30/.test(castTxt) ? 'r30 rise' : null,
        /marcato:/.test(castTxt) ? 'marcato' : null,
        (S.drums ?? []).length ? 'percussion' : null,
      ].filter(Boolean).join(', ') || 'none (base)';
    }
  }
}

let VX_FIRST = 0;
if (VOCAL_PAGE) {
  VX_FIRST = songs.length;
  for (const row of VX_PROMPTS) {
    const name = `vx_${row.e}_${row.v}`;
    const energetic = !/nostalgic|romantic|calm|somber|sad/.test(row.e);
    buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
      vocalLead: true, companion: true,
      // r35: his first export on this page is its first judgement, not a
      // history (D118's noteBlind) — without it 15 notes would strip what he
      // heard from 15 songs before a line of engine code changed
      noteBlind: true,
      // r34: the electric guitar layer (his ask) — rock figures under the
      // energetic eight, the clean arpeggio under the two ballads
      guitar: energetic ? 'rock' : 'arp',
      ...(energetic ? { percBackbeat: true, deepDrums: true } : {}),
      ...(row.extra ?? {}),
    });
    const S = songs[songs.length - 1];
    S.why = row.why;
    S.vocalSuite = true;
    // r35 · THE VOCAL BALANCE LAW — his "voice a bit too loud for a energetic
    // section - learn this" (vx_triumphant_boss), then "voice still too loud"
    // / "vocals too loud" / "voice too loud" / "voice way too loud" on four of
    // the six guitar-main songs at the +3 dB default. Measured, the realized
    // K-weighted vocal-over-band did NOT separate the complained songs from
    // the praised ones (5.2 dB on boss vs 5.7 on casino, "love"), so this is
    // his ear's law, not a mechanism: an energetic song sits the voice AT the
    // band (0 dB over its sung-span RMS; training was judged there without a
    // loudness complaint), a calm one 1.5 dB over (romantic_rest, "very
    // good"). A row's own `vocalDb` pins what he judged or asked for.
    S.vocalDb = row.vocalDb ?? (energetic ? 0 : 1.5);
  }
  // ---- r34b GUITAR-MAIN SONGS (his "generate some songs with guitar
  // intentionally in it as a main thing ... understand which genres it'd make
  // sense in. generate some more songs from scratch in vocals.html, taking
  // inspiration from jpop and relevant genres"). Six new songs, four energetic,
  // each in a genre where a lead guitar is idiomatic, on the hand-authored
  // J-pop / city-pop idiom progressions where one fits the lane (the tempo
  // clamped into the idiom's own range, as the citypop page does). The other
  // session's toppack-r34 read-out is not written up yet; these are built
  // from the idiom library and the genres' known habits, and are to be
  // revisited when research/toppack-r34.md lands.
  const VG_PROMPTS = [
    // r35, his card: "voice still too loud" (-1.5, under the law's 0), "cymbal
    // not before the drop of a section" (seam crash), "the guitar spamming the
    // same chords doesn't sound good" (two chorus figures by letter, staccato)
    { e: 'excited',    v: 'fight',    guitar: 'main',    pin: 'cp_kpop_minor_anthem', genre: 'anime opening / J-rock', bpm: 140, vocalDb: -1.5,
      why: 'The minor anthem loop (im9-bVIΔ7-bVIIsus) at 140 under palm-muted verse chug, open chorus chords, the A hook as a guitar intro riff and the guitar in unison with the voice for the last chorus — the anime-OP shape.' },
    // r35, his card: "remove the really high woodwind in the middle that plays
    // for a little bit. I like the guitar here. instrumental is good" —
    // measured: the C-letter handoff put the tune on gm_epiano1 at 83-96 for
    // bars 16-23, and the clarinet companion peaks at 84 in the same bars.
    // Both go (noHandoff; companion an octave down); the rest is pinned, the
    // open-chorus guitar he liked included; voice at the judged +3.
    { e: 'happy',      v: 'festival', guitar: 'main',    pin: 'cp_komuro',            genre: 'power pop / idol rock', bpm: 136, vocalDb: 3, extra: { pinFrom: 'r35', noHandoff: true, companion: { octave: 3 } },
      why: 'The Komuro progression (vi-IV-V-I), the 90s J-pop backbone, at 140 with a driving kit; guitar riff intro, gallop or chug verse, ringing chorus.' },
    // r35, his card: "the melody for the vocal doesn't sound good, and when the
    // guitar starts sustaining (like holding), it doesn't sound good" — the
    // tune re-rolled by `leadSeedSalt` (eight candidates measured on the sung
    // line: salt 1 has the most steps (0.23 vs 0.18), the fewest zigzag leaps
    // (0.07 vs 0.12) and the narrowest useful range; D138), guitar staccato
    { e: 'triumphant', v: 'training', guitar: 'main',    pin: 'cp_kpop_bright_hook',  genre: 'sports anthem J-rock', bpm: 140, extra: { marcato: true, leadSeedSalt: 1 },
      why: 'The bright descending-bass hook (IΔ7-V/VII-vim7-IVΔ7) at 145 with marcato strings beside the guitar — the tournament-arc anthem.' },
    // r35, his card: "guitar too loud, and vocals too loud. also the fifth vocal
    // note sounds like screaming ... whenever the guitar sounds like it's
    // sustaining, it doesn't sound good" -> guitar x0.75 + staccato, voice 0,
    // the A5 folds (export-vocal ceiling)
    { e: 'excited',    v: 'space',    guitar: 'main',    pin: null,                   genre: 'Vocaloid electro-rock', bpm: 128, extra: { fullSynth: true, guitarGainMul: 0.75 },
      why: 'The all-synth lane with the guitar as the second main voice — a Vocaloid rock song is synths plus one loud guitar; harmony from the engine so the suite is not all idiom loops.' },
    // r35, his card: "voice way too loud, but the melody is good, and the guitar
    // fits well with the piano. love the instrumental too for the vibe, but the
    // strings a bit too loud ... starts really soft and then becomes really
    // loud" -> pinned (a prose keep), voice -1, the swell fixed in the render
    // tier (build-sfz skipSwell + the horn off fluidsynth)
    { e: 'nostalgic',  v: 'shop',     guitar: 'citypop', pin: 'cp_royal_road',        genre: 'city pop', vocalDb: -1, extra: { pinFrom: 'r35' },
      why: 'The royal road (IV-V-iii-vi) at 108 with clean 16th offbeat chops in the verse and clean strums in the chorus, clean riff and double — the city-pop guitar under a voice.' },
    // r35, his card: "really good, love this. voice too loud though and violin
    // much too loud. guitar a bit too loud" -> pinned (a prose keep), voice 0,
    // guitar x0.75; the "violin" is the string swell (render tier)
    { e: 'romantic',   v: 'water',    guitar: 'ballad',  pin: 'cp_descending_bass',   genre: 'guitar ballad', vocalDb: 0, extra: { pinFrom: 'r35', guitarGainMul: 0.75 },
      why: 'The descending-bass turnaround (IVΔ7-ivm6-iiim7-VI7-iim7-V7sus) at 76: the clean arpeggio carries the song, the guitar states the hook alone first and joins the voice at the end.' },
  ];
  for (const row of VG_PROMPTS) {
    const name = `vg_${row.e}_${row.v}`;
    const energetic = !/nostalgic|romantic|calm|somber|sad/.test(row.e);
    const entry = row.pin ? PROGRESSIONS_CITYPOP[row.pin] : null;
    // tempo: the row's own (a genre tempo — power pop at 136, not the vibe's
    // 113), else the vibe's clamped into the idiom's range; the pinless
    // electro-rock row states 128 because "excited space" compiled at 83
    let bpm = row.bpm;
    if (entry) {
      const v0 = compileVibe({ emotion: row.e, environment: row.v, meter: '4/4', name: `vg_probe_${row.e}_${row.v}` });
      bpm = Math.min(entry.appliesWhen.bpm[1], Math.max(entry.appliesWhen.bpm[0], bpm ?? v0.bpm));
    }
    buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
      vocalLead: true, companion: true, guitar: row.guitar, noteBlind: true,
      // VG_SALT_PROBE="<song>:<salt>" — the measurement hook behind a row's
      // `leadSeedSalt` pin (r35): build with candidate salts, score each tune's
      // singability, pin the winner on the row
      ...(process.env.VG_SALT_PROBE && process.env.VG_SALT_PROBE.split(':')[0] === name ? { leadSeedSalt: Number(process.env.VG_SALT_PROBE.split(':')[1]) } : {}),
      ...(entry ? { basePin: row.pin, rawBase: true } : {}),
      ...(bpm ? { bpm } : {}),
      ...(energetic ? { percBackbeat: true, deepDrums: true } : {}),
      ...(row.extra ?? {}),
    });
    const S = songs[songs.length - 1];
    S.why = row.why;
    S.vocalSuite = true;
    S.guitarMain = row.guitar;
    S.genre = row.genre;
    S.vocalDb = row.vocalDb ?? (energetic ? 0 : 1.5); // r35 balance law (above)
    if (entry) S.idiomName = entry.idiomName;
  }
}

// ============================================================================
// r35 — THE VOCALOID SUITE (VOCALOID=1 -> audition/vocaloid.html) and THE
// VOCAL LAB (VOCALAB=1 -> audition/vocalab.html). research/vocaloid-r35.md.
//
// His ask: "generate a suite of songs with these vibes, with a more diverse
// range of prompts that are actual descriptions (like mock-ups of user
// descriptions, not just two words), with vocaloids". Each row is a DESCRIPTION;
// src/lib/describe.js parses it into the engine's (emotion, environment) plus
// energy / family / genre / explicit hints, and the card shows the parse so a
// wrong reading is visible. Every song: the r35 vocal writer (the sung line
// composed from the corpus rules), the chorus double (the tune an octave up in
// B bars), the companion a third below, `noteBlind` (his first export is its
// first judgement), and the r35 vocal balance law (energetic 0 dB, calm +1.5).
// The tempo is stated per row — the corpus's bands (77–210, median 162) are
// not what the vibe table would compile — and the voice's key family follows
// the description (67% of the set is minor).
// ============================================================================
const VOCALOID_PAGE = process.env.VOCALOID === '1';
const VOCALAB_PAGE = process.env.VOCALAB === '1';
const VO_PROMPTS = [
  { id: 'chase',      bpm: 176, text: 'a frantic late-night city chase, synths everywhere, the singer breathless and furious' },
  { id: 'goodbye',    bpm: 84,  text: 'a soft bittersweet goodbye at a train station in the rain, piano and strings, sung gently' },
  { id: 'fireworks',  bpm: 168, text: 'summer festival at dusk, fireworks, a bright idol-pop chorus everyone can clap along to, guitar and a big backbeat' },
  { id: 'android',    bpm: 150, text: 'a lonely android wandering an empty mall after closing, cold synths, a wistful voice that keeps repeating one line' },
  { id: 'villain',    bpm: 132, text: 'a villain\'s theme sung with a smirk, sinister minor pop, harpsichord stabs, the voice low and teasing' },
  { id: 'opening',    bpm: 180, text: 'a sports-anime opening, driving guitars at 180 bpm, huge triumphant chorus, the voice high and clear' },
  { id: 'cafe',       bpm: 108, text: 'rainy-day cafe pop, relaxed and warm, brushed drums, the singer half-whispering over an electric piano' },
  { id: 'reflection', bpm: 195, text: 'a boss fight against your own reflection, breakneck rock, the melody shouting short phrases, no room to breathe' },
  { id: 'lullaby',    bpm: 76,  text: 'a tender lullaby for a robot, music box and pads, slow, the voice barely above a hum, no drums' },
  { id: 'rooftop',    bpm: 140, text: 'a rooftop confession at sunrise, hopeful pop-rock, builds from a quiet verse to a soaring chorus with strings' },
  { id: 'sugar',      bpm: 128, text: 'a glitchy hyper-pop sugar rush, ridiculous and playful, 16th-note syllables over a bouncing bass at 128 bpm' },
  { id: 'corridor',   bpm: 150, text: 'a haunted school corridor at midnight, eerie minor pop, whispered verses and a desperate belted chorus' },
  { id: 'march',      bpm: 120, text: 'a marching anthem for a losing army, somber but defiant, drums like footsteps, a choir under the last chorus' },
  { id: 'kitchen',    bpm: 165, text: 'a ridiculous kitchen cooking-show jingle, goofy and fast, the singer tripping over tongue-twisters' },
];
/** the shared r35 vocal-song options from a description parse */
function vocaloidOpts(d, row) {
  const energetic = d.energy === 'high' || (d.energy === 'mid' && !/sad|calm|romantic|somber|nostalgic/.test(d.emotion));
  const bpm = row.bpm ?? d.bpm ?? (d.energy === 'high' ? 172 : d.energy === 'low' ? 84 : 132);
  return {
    opts: {
      vocalLead: true, vocalWriter: true, chorusDouble: true, companion: true, noteBlind: true,
      scheme: 'ABABCB', bpm,
      ...(d.family ? { family: d.family } : {}),
      ...(d.genre === 'electro' || d.hints.fullSynth ? { fullSynth: true } : {}),
      ...(d.hints.guitar === false ? { guitar: false } : d.genre === 'rock' || d.hints.guitar ? { guitar: 'rock' } : d.genre === 'ballad' ? { guitar: 'arp' } : {}),
      ...(d.hints.marcato ? { marcato: true } : {}),
      ...(d.hints.swing ? { swing: d.hints.swing } : {}),
      ...(d.hints.noDrums ? { percPresence: 'none' } : energetic ? { percBackbeat: true, deepDrums: true } : {}),
      ...(row.extra ?? {}),
    },
    energetic, bpm,
    vocalDb: row.vocalDb ?? d.hints.vocalDb ?? (energetic ? 0 : 1.5),
  };
}
let VO_FIRST = 0;
if (VOCALOID_PAGE) {
  VO_FIRST = songs.length;
  for (const row of VO_PROMPTS) {
    const d = describePrompt(row.text);
    const { opts: o, bpm, vocalDb } = vocaloidOpts(d, row);
    const name = `vo_${row.id}`;
    buildSong({ emotion: d.emotion, environment: d.environment, meter: '4/4' }, name, o);
    const S = songs[songs.length - 1];
    S.description = row.text;
    S.parsed = explainPrompt(d);
    S.why = `"${row.text}" → ${explainPrompt(d)} · ${bpm} bpm${d.hints && Object.values(d.hints).some((x) => x !== undefined) ? ' · hints ' + JSON.stringify(Object.fromEntries(Object.entries(d.hints).filter(([, x]) => x !== undefined))) : ''}`;
    S.vocalSuite = true;
    S.vocalDb = vocalDb;
  }
}
// THE LAB: A/B cards built under ONE name (D120 — the key and every retrieval
// hash on the name) and renamed for display; one variable per card. The base
// is one prompt at one tempo; each card lists its hypothesis + question.
const VL_BASE = { emotion: 'excited', environment: 'festival', bpm: 168, family: 'minor',
  opts: { vocalLead: true, vocalWriter: true, chorusDouble: true, companion: true, noteBlind: true, scheme: 'ABABCB', percBackbeat: true, deepDrums: true, guitar: 'rock' } };
const VL_CARDS = [
  { id: 'writer', hypothesis: 'A line written at the corpus\'s syllable rate with steps, pickups and a returning hook reads as a SUNG tune; the instrumental lead sung as-is reads as an instrument.', question: 'Which one sounds like a singer wrote it — and is the written one still "good", not just different?',
    variants: [['lead', { vocalWriter: false, chorusDouble: false }, 'the r34 path: the instrumental lead sung as exported'], ['writer', {}, 'the r35 writer: 8th-note syllables, step/repeat walk, 8th breaths, hook + answer, chorus +4 with the octave double']] },
  { id: 'rate', hypothesis: 'The corpus sings ~3.9 syllables/s at any tempo. Slower reads as a ballad singer on a fast band; faster reads as rap.', question: 'Which syllable rate fits an energetic song at 168 — is 3.9 the sweet spot, or does his ear want fewer?',
    variants: [['slow', { vocalWriter: { rate: 2.4 } }, '2.4 syllables/s (3.4 notes/bar)'], ['corpus', { vocalWriter: { rate: 3.9 } }, '3.9 syllables/s (5.6 notes/bar) — the corpus median'], ['fast', { vocalWriter: { rate: 5.2 } }, '5.2 syllables/s (7.4 notes/bar)']] },
  { id: 'starts', hypothesis: 'Phrases that start on a pickup or an off-8th (91% of the corpus) sound sung; phrases that all start on the downbeat sound like a lead instrument.', question: 'Does the downbeat-start version sound stiffer, or does his ear not hear the difference?',
    variants: [['downbeat', { vocalWriter: { startBias: 0 } }, 'every phrase starts on beat 1'], ['pickup', { vocalWriter: { startBias: 6 } }, 'every phrase starts on the beat-4 pickup'], ['mixed', {}, 'the corpus table: pickup 26% / off-8th 23% / beat 2 / beat 3 / downbeat 9%']] },
  { id: 'breath', hypothesis: 'An 8th-note rest between phrases (the corpus median) is what makes the line phrase; no rest reads as one endless line, a quarter rest reads as hesitant.', question: 'Which breath length sounds like a singer breathing?',
    variants: [['none', { vocalWriter: { breathBias: 0 } }, 'no rest between phrases (legato)'], ['eighth', { vocalWriter: { breathBias: 1 } }, 'an 8th rest — the corpus median'], ['quarter', { vocalWriter: { breathBias: 2 } }, 'a quarter rest']] },
  { id: 'lift', hypothesis: 'The chorus sits 3–5 semitones above the verse in the corpus. No lift makes the chorus a second verse; a big lift (8) pushes the voice toward its ceiling.', question: 'How much chorus lift does his ear want — none, the corpus +4, or the dramatic +8?',
    variants: [['flat', { vocalWriter: { lift: { chorus: 0, bridge: 0 } } }, 'chorus at the verse register'], ['plus4', { vocalWriter: { lift: { chorus: 4, bridge: 2 } } }, 'chorus +4 semitones (the corpus)'], ['plus8', { vocalWriter: { lift: { chorus: 8, bridge: 3 } } }, 'chorus +8 semitones']] },
  { id: 'double', hypothesis: 'The chorus\'s octave-up instrumental double (92% of corpus choruses, 9% of verses) is what makes the chorus a chorus; without it the voice alone carries the lift.', question: 'Does the octave double in the chorus support the voice, and at what level — 0.7 x lead or full?',
    variants: [['off', { chorusDouble: false }, 'no chorus double'], ['on', { chorusDouble: true }, 'the tune an octave up in B bars at 0.7 x lead'], ['loud', { chorusDouble: { gainMul: 1.0 } }, 'the tune an octave up at 1.0 x lead']] },
  { id: 'span', hypothesis: 'The corpus keeps 80% of a song\'s notes inside 11 semitones (span 3 degrees each side of the home); a narrow line reads as a chant, a wide one as an instrumental.', question: 'Which home width sounds like a singer\'s range?',
    variants: [['narrow', { vocalWriter: { span: 2 } }, 'span 2 degrees (a 7-semitone home)'], ['corpus', { vocalWriter: { span: 3 } }, 'span 3 (an 11-semitone home) — the corpus'], ['wide', { vocalWriter: { span: 5 } }, 'span 5 (a 17-semitone home)']] },
  { id: 'companion', hypothesis: 'The corpus verse is a bass plus ONE counter-note a 3rd/4th under the voice; the companion a diatonic third below, rhythm-locked to the writer, is that texture.', question: 'Does the third-below companion support the voice or muddy it?',
    variants: [['none', { companion: false }, 'no companion'], ['third', { companion: true }, 'the companion a diatonic third below, same rhythm']] },
  { id: 'tempo', hypothesis: 'The syllable law: at 120 the same singer sings 16ths and 8 notes a bar; at 180, 8ths and 5 a bar — the same rate in seconds.', question: 'Do both tempos sound like the same singer, or does the 120 version sound rushed?',
    variants: [['bpm120', { bpm: 120 }, 'the base prompt at 120 bpm (16th pairs, ~8 notes/bar)'], ['bpm180', { bpm: 180 }, 'the base prompt at 180 bpm (8ths, ~5 notes/bar)']] },
];
let VL_FIRST = 0;
if (VOCALAB_PAGE) {
  VL_FIRST = songs.length;
  for (const card of VL_CARDS) {
    for (const [vid, delta, what] of card.variants) {
      const name = `vl_${card.id}`;
      const base = { ...VL_BASE.opts, bpm: VL_BASE.bpm, family: VL_BASE.family };
      const merged = { ...base, ...delta };
      // an object-valued vocalWriter delta merges with the base object form
      if (delta.vocalWriter && typeof delta.vocalWriter === 'object') merged.vocalWriter = { ...(typeof base.vocalWriter === 'object' ? base.vocalWriter : {}), ...delta.vocalWriter };
      buildSong({ emotion: VL_BASE.emotion, environment: VL_BASE.environment, meter: '4/4' }, name, merged);
      const S = songs[songs.length - 1];
      S.name = `${name}_${vid}`;
      S.labCard = card.id; S.labVariant = vid;
      S.why = `CARD ${card.id} · ${card.hypothesis} · Q: ${card.question} · THIS VARIANT: ${what}`;
      S.vocalSuite = true;
      S.vocalDb = 0;
    }
  }
}

let LS_FIRST = 0;
if (LAYERSTACK) {
  LS_FIRST = songs.length;
  for (const row of LS_PROMPTS) {
    const entry = PROGRESSIONS_SERUM[row.pin];
    if (!entry) { console.error(`missing progression ${row.pin}`); continue; }
    const name = `ls_${row.pin.replace('sr_', '')}_${row.e}`;
    buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
      basePin: row.pin,
      rawBase: true,
      family: 'minor',
      bpm: row.bpm,
      // 16-32 bars, his instruction for a test suite. The reels are 2-4 bar
      // loops, so 32 bars is eight statements of the harmony — enough for a
      // 4-bar-period device (R5, the final-bar break) to state itself repeatedly.
      totalBarsCap: 32,
      // ---- his kept videolab card: fullSynth + frozenSlot + no drums ---------
      layerStack: true,
      // ...except on the two rows whose own reels have drums. 7 of 9 reels are
      // drumless and the two that are not CONTRADICT each other on the kick, so
      // nothing generalises; these two get a kit because their source has one.
      ...(row.drums ? { percPresence: 'background' } : {}),
      // ---- THE BUDGET LIFT, argued in the page header above ------------------
      // Without this the frozen slot and the coprime cell — the only two of the
      // seven reel rules that were already wired — do not cast at all, which is
      // the defect this page exists to fix.
      rubBudget: 1.60,
      // ---- the five rules that were only ever `recorded` ---------------------
      reregister: true,       // R1 — a layer is existing material re-registered
      holdMove: true,         // R3 — hold-bar / move-bar, 2-bar period
      doublePeriod: true,     // R5 — ...doubled to 4, second statement +8ve
      finalBarBreak: true,    // the near-miss: the loop's last bar breaks
      motorFall: row.motor === true,   // role B, and his own stealth spec
      // R4 (register bands) needs no flag: it is the allocator the four above
      // draw their octaves from, and it reports a collision on the card.
      // ---- the two that were wired but never fired --------------------------
      frozenSlot: true,       // R2
      coprimeCell: true,      // R6
      layerRest: true,        // role H — the answer layer's alternate-bar rest
      // ---- his most-repeated complaint, five cards on the page he just judged -
      noJitter: true,
      // ---- r29: his four "too loud" cards and his "every song so far" card ----
      supportUnderLead: true,
      textureVary: true,
      // ---- r29: `noteBlind`, and this page PROVED why it exists ---------------
      // r28 added the flag for the vanriver/citypop loops and did not add it
      // here, because this page had no notes yet. It has them now, and importing
      // them moved 2 of the 14 songs before a single line of engine code changed
      // — both by DELETING THE MARCATO, whose gate is
      // `energetic && !priorKeep && historyLess()`.
      //
      // The two songs are `ls_vi_v_three_tense` and `ls_planing_chrom_tense`, and
      // on the first of them his note reads "no complaints ... I like the synth
      // that has like a percussive part (low high high low low repeat)" — which
      // IS the marcato (`support-R5oct [R-5-R+-5]`). His praise for a layer
      // deleted that layer. On `ls_iii_vi_v_mysterious` he asks for it by name
      // for other songs: "just add the percussive strings I mentioned with their
      // repeated intervals + percussion and boom".
      noteBlind: true,
      // ---- everything current, since these are history-less songs ------------
      // ECHO OFF, and it is a measured trade rather than a preference. Lifting
      // the rub budget to admit the frozen slot admits the echo too, and the two
      // together put this page at 4.30 close semitone/tritone hits per bar
      // against the 2.51 of the page he judged last round — a 71% increase on
      // material whose notes already say "the piano is a bit dissonant from the
      // strings at times" and "sometimes a bit dissonant". The echo is not one
      // of the seven reel rules; the frozen slot is R2. So the budget buys the
      // rule and not the extra.
      echoLayer: false,
      r23: true, deepDrums: true, octaveDouble: true,
      obliqueCompanion: true, percBackbeat: true, supportFigure: true,
      scaleTokensInKey: true, companionFamilySplit: true,
      metronomeAcc: true, entryRunGuard: true,
    });
    const S = songs[songs.length - 1];
    S.why = row.why;
    S.pinned = row.pin;
    S.idiomName = entry.idiomName;
    S.published = entry.voicedAs.join('  ');
    S.reelSource = entry.source;
    S.reelRead = entry.read;
    S.sourceBpm = entry.sourceBpm;
    // MEASURED off the song's own cast list, never echoed from the opts — the
    // r27 lesson: `devices` used to report a funk bounce on a song where it had
    // been suppressed, because it read the request rather than the result.
    const castTxt = (S.cast ?? []).join(' | ');
    const fired = [];
    if (/re-registered floor \(R1\)/.test(castTxt)) fired.push('R1 re-register');
    if (/frozen slot:/.test(castTxt)) fired.push('R2 frozen slot');
    if (/hold-bar \/ move-bar \(R3/.test(castTxt)) fired.push('R3 hold/move');
    if (/octave \d+/.test(castTxt)) fired.push('R4 register bands');
    if (/R3 \+ R5\)/.test(castTxt)) fired.push('R5 double period');
    if (/coprime cell:/.test(castTxt)) fired.push('R6 coprime cell');
    if (/the motor \(role B\)/.test(castTxt)) fired.push('role B motor');
    if (/final-bar break:/.test(castTxt)) fired.push('final-bar break');
    if (/layer breathing:/.test(castTxt)) fired.push('role H answer');
    S.rules = fired.join(', ') || 'NONE — this is a bug, report it';
    S.rulesMissing = ['R1 re-register', 'R2 frozen slot', 'R3 hold/move', 'R4 register bands',
      'R5 double period', 'R6 coprime cell', 'final-bar break', 'role H answer']
      .filter((r) => !fired.includes(r)).join(', ') || '(none)';
  }
}

let VR_FIRST = 0;
if (VANRIVER) {
  VR_FIRST = songs.length;
  for (const row of VR_PROMPTS) {
    const entry = PROGRESSIONS_VANRIVER[row.pin];
    if (!entry) { console.error(`missing progression ${row.pin}`); continue; }
    const name = `vr_${row.pin.replace('vid_vr_', '')}_${row.e}`;
    // a non-niche lane in his sense: no desert, no jungle, no horror lane. The
    // r22 synth-layer devices are gated on this and nothing else.
    const nonNiche = !['desert', 'jungle', 'manor', 'catacombs', 'citadel'].includes(row.v);
    buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
      basePin: row.pin,
      rawBase: true,
      family: entry.family,
      // THE HARMONIC LOOP MUST REPEAT. Adversarial verify caught this: switching
      // `chordUnits` on also stretched each progression across the WHOLE song, so
      // loop repetitions went from 2-8 to exactly 1.00 on all 23 songs and the
      // harmonic rhythm slowed 2x-8x (median 4x). One song held a single chord for
      // 40 seconds. That makes the ear test unanswerable — it cannot separate
      // "uneven chord length" from "four times slower and never repeats", which is
      // this project's own ab-demos-share-a-constant trap. Two loop passes inside
      // the 16-32 bars he asked for keeps the length device and gives the harmony
      // back its rate.
      totalBarsCap: Math.min(32, 2 * vrBestTarget(entry.chordUnits)),
      // ---- r27: the reel findings -------------------------------------------
      chordUnits: entry.chordUnits,
      // The bar target is CHOSEN BY FIDELITY, not by a rule of thumb. Every
      // chord needs at least one bar, so a long progression inside a short loop
      // cannot express its ratios however the weights are allocated: at 16 bars
      // vid_vr_romantic's published 8:1 renders 2:1, and at 32 it renders 8:1
      // exactly. But longer is not always better — rounding at 16 overshot
      // vid_vr_hotel's 3:1 to 5:1, and that is a distortion in the other
      // direction. So both lengths are laid out and the one whose realised bar
      // shares sit closest to the measured unit shares wins, 16 on a tie
      // because he asked for short test songs.
      chordUnitBars: vrBestTarget(entry.chordUnits),
      // ---- r28 · THE KEEP-TRANSITION LAW, FOURTH BITE (D91/D99/D101) --------
      // His 23 notes on this page were imported this round, and importing them
      // MOVED 15 of the 23 songs — measured by rebuilding against a pre-import
      // copy of verdicts.js. Nothing in r28 touched them; the notes alone did it.
      //
      // The mechanism is the D99 law verbatim: "a gate that stops NEW
      // capabilities must not RETRACT old ones". Six gates in this file read
      // `!CARD_NOTES?.[name]` so a new roll only lands on a history-less song.
      // The instant he writes a note about one, those gates flip and the song
      // loses what he was listening to. `colorFresh` (line ~747) is the worst of
      // them because it governs the HARMONY: 14 songs lost their `voicedAs`
      // colour upgrade and their `degrees`, `symbols` and `numerals` all changed
      // — including cp_royal_road_nostalgic, on which he wrote "this is a good
      // theme, very groovy, I like it. no complaints", and cp_planing_maj7_
      // mysterious, "I like this song a lot ... really good". Those are prose
      // keeps, and a prose keep is a keep.
      //
      // So the page pins what it was JUDGED with, explicitly. `pinFrom` is the
      // usual instrument (D101) and is the WRONG one here: `colorFresh` reads
      // `!opts.pinFrom` as well, so pinning the song would drop the very upgrade
      // it is meant to protect. The explicit opt-in is what states the intent.
      // ONE flag, not three. Pinning feature-by-feature is how a judged layer
      // gets silently dropped (D101: "six flags, seven next round") — and it
      // overshot when tried here, forcing varyLeadVoice and leadDynamics ON for
      // songs whose defaults had them OFF and moving all 23 mixes. `noteBlind`
      // says the thing that is actually true: this page's own notes are not
      // evidence that its songs have a history, because they ARE its first
      // judgement. The six history-less gates then behave exactly as they did on
      // the build he listened to.
      noteBlind: true,
      contrastAtZero: true,
      percRamp: true,
      metronomeAcc: true,
      entryRunGuard: true,
      // ---- r22: the Serum producer's layer devices, non-niche lanes only -----
      frozenSlot: nonNiche,
      coprimeCell: nonNiche,
      layerRest: nonNiche,
      // ---- everything current, since these are history-less songs ------------
      r23: true,
      deepDrums: true, echoLayer: true, octaveDouble: true,
      obliqueCompanion: true, percBackbeat: true, supportFigure: true,
      scaleTokensInKey: true, companionFamilySplit: true,
    });
    const S = songs[songs.length - 1];
    S.why = row.why;
    S.pinned = row.pin;
    S.hisLabel = entry.hisLabel;
    S.published = entry.voicedAs.join('  ');
    S.units = entry.chordUnits.join(' ');
    S.reelTitle = entry.song;
    S.attacks = entry.attacksPerChord.join(' ');
  }
  buildCityPop();
}

let CC_FIRST = 0;
if (CHORDCAM) {
  CC_FIRST = songs.length;
  for (const row of CC_PROMPTS) {
    const entry = PROGRESSIONS_CHORDCAMERA[row.pin];
    if (!entry) { console.error(`missing progression ${row.pin}`); continue; }
    const name = `cc_${row.pin.replace('vid_cc_', '')}_${row.e}`;
    buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
      basePin: row.pin,
      rawBase: true,
      family: entry.family,
      // history-less songs, so every current rule applies — including the r26
      // lane dissonance budget, which is the point of building them now
      r23: true, frozenSlot: true, coprimeCell: true,
      deepDrums: true, echoLayer: true, octaveDouble: true, layerRest: true,
      obliqueCompanion: true, percBackbeat: true, supportFigure: true,
      scaleTokensInKey: true, companionFamilySplit: true,
    });
    const S = songs[songs.length - 1];
    S.why = row.why;
    S.pinned = row.pin;
    S.published = entry.voicedAs.join('  ');
    S.units = entry.chordUnits.join(' ');
    S.reelTitle = entry.song;
  }
}

let SUITE_FIRST = 0;
if (SUITE) {
  SUITE_FIRST = songs.length;
  for (const row of SUITE_PROMPTS) {
    const name = `su_${row.e}_${row.v}`;
    const laneLaw = SUITE_LANE_LAW.has(row.v);
    buildSong({ emotion: row.e, environment: row.v, meter: '4/4' }, name, {
      // r24: A PROSE KEEP IS A KEEP. `pinFrom` states the intent — rules from
      // that round on do not reach this song — where pinning feature-by-feature
      // is how a judged layer gets silently dropped (D101).
      ...(row.pin ? { pinFrom: row.pin } : {}),
      ...(row.opts ?? {}),
      // ---- r23 ----
      r23: true,
      frozenSlot: true,
      coprimeCell: !laneLaw,
      // battle bass / battle kit / the two measured support figures switch
      // themselves on from `v.role` where the lane permits; nothing to pass.
      // ---- r24 ----
      deepDrums: true,      // his "our drum vst isnt that good ... doesnt sound like deep reel drums"
      // voicedColor and bandKit default on for a history-less song; a pinned
      // prose keep (row.pin) refuses both through the same gate.
      // ---- r22 ----
      echoLayer: true, octaveDouble: true, layerRest: true, obliqueCompanion: true,
      percBackbeat: true, supportFigure: true, scaleTokensInKey: true,
      companionFamilySplit: true,
    });
    const S = songs[songs.length - 1];
    S.why = row.why;
  }
}

// ============================================================================
// r23 — THE STRESS-TEST PAGE.  R23=1 node scripts/audition-songs.mjs
// ============================================================================
// His ask: "also, using the midi, show me what you learned by making new songs
// so i can stress test", alongside "for the boss fights learn what makes them
// actually feel energetic with stakes on the line and epic through their
// layering patterns and what they do in each instrument and rhythm and
// intervals", and the scoping instruction that governs both: "lots of the
// techniques and intervals behind his layering should own be applied to
// applicable genres. not specific ones like jungle or desert or etc."
//
// Fourteen prompts drawn from the MIDI files he hand-picked, each built TWICE
// from the same name-seed: once with the r23 device family, once without. Two
// things are ON IN BOTH so they are not the variable — `percBackbeat` (his "for
// the drums there isn't even a dum being hit") and `scaleTokensInKey` (his "bad
// note in G#", which he named on BOTH r22 variants, i.e. a bug not a taste).
//
// audition/songs.html is NOT written in this mode.
const R23 = process.env.R23 === '1';
const R23_PROMPTS = [
  // Every row states its environment EXPLICITLY. The parser is good enough to
  // rank words but the engine's environment slot doubles as a FUNCTION slot
  // (fight/boss/rest), and leaving that to word length put "warm nostalgic
  // morning music" into `fight` at 156bpm with a battle kit. That turned out to
  // be a genuine parser bug ('war' matching inside 'warm' — fixed in
  // src/lib/prompt-parse.js this round), but the lesson stands: a stress-test
  // page should not also be testing the parser.
  // ---- battle / boss: where the r23 measurements came from ----------------
  { n: 'boss_machine', p: 'intense boss battle music against a giant machine, heavy drums', env: 'boss',
    ref: 'Grandia2_BattleVersion3, SA2B_Boss_1-KM' },
  { n: 'boss_final', p: 'epic final boss battle music, high stakes and heroic', env: 'boss',
    ref: 'soa_battle-2, soabattlev12 ("I like how the layering")' },
  { n: 'fight_airship', p: 'fast action battle music on the deck of a flying airship', env: 'fight',
    ref: 'Skies_Deck_Battle ("layering of strings, the drums, the harmony... love it"), Sky_battle' },
  { n: 'fight_miniboss', p: 'short punchy mechanical miniboss fight, energetic', env: 'fight',
    ref: 'SM-MiniBoss, SSBWU-Megaman2_AirMan, ducktalesremasteredbosstheme' },
  { n: 'fight_enemy', p: 'tense dangerous enemy encounter music', env: 'fight',
    ref: 'enemy_chaos ("I like the melody - conveys enemy, and the drums"), Hand_combat' },
  { n: 'chase_facility', p: 'high tension chase music escaping through a military facility', env: 'lab',
    ref: 'RedRum-JimmyQTEChase ("conveys tension"), military facility, Jungle-Challenge' },
  // ---- NOT battle: the same reel devices on other genres, which is the whole
  //      point of his "applicable genres" instruction --------------------
  { n: 'casino_jazz', p: 'groovy jazzy lounge music for a city casino level', env: 'casino',
    ref: 'SM-StudiopolisZoneAct1 / Act2' },
  { n: 'festival_hook', p: 'upbeat festival music with a catchy hook and lots of percussion', env: 'festival',
    ref: 'Magikarp_Festival, WIIU_Splatoon_MainTheme' },
  { n: 'water_nightfall', p: 'calm reflective music by the sea at night', env: 'water',
    ref: 'shenmue_sea ("rhythmic pulse of the bass"), shenightfall ("chord progression feels like night")' },
  { n: 'cave_dungeon', p: 'mysterious uneasy music for an underground dungeon cave', env: 'cave',
    ref: 'dungeoncave ("I like the left hand, but its complex")' },
  { n: 'snow_expedition', p: 'triumphant expedition music crossing a snowy mountain', env: 'snow',
    ref: 'snowy, triumphantexpedition ("layering and dynamics and bass and all the melodies")' },
  { n: 'rest_morning', p: 'warm nostalgic morning music at a camp, heartfelt piano and strings', env: 'rest',
    ref: 'shenmue_morning ("feels heartfelt like a new day"), brightblueday' },
  { n: 'training_speed', p: 'fast energetic music for a highway speed course at dawn', env: 'training',
    ref: 'speedhighway-atdawn ("layering and melody and harmony melody"), expedition' },
  { n: 'space_arena', p: 'mysterious floating music for a strange sky arena', env: 'space',
    ref: 'EggReverie, Phazonruler_-_Sm4sh_Menu' },
];

// Each device with the number that justifies it, stated on the page so he is
// ruling against the measurement rather than against my description.
const R23_DEVICES = {
  driveBass: 'BATTLE BASS = A PEDAL, NOT A WALK \u2014 battle basses repeat 62.2% of their notes against 36.8% for his non-battle picks, walk stepwise LESS (19.8% vs 31.5%) and play FEWER notes per bar (5.38 vs 6.71). Straight 8ths on one pitch, grid x.x.x.x.x.x.x.x. in 6 of 10, longest identical-pitch run 13-144 notes. The engine\u2019s low voice either walked or held; neither is this.',
  hammerSupport: 'THE SUPPORT LAYER HAMMERS ONE PITCH \u2014 pure-repeat bar shapes are 34.2% of battle support bars against 7.0% elsewhere, the largest single separation in the analysis (4.9x). The modal shape is three onsets, all the same note. This is his own note arriving from the data: "the violins can go root third fifth or root fifth 8th repeatedly 8th note style ... to make it sound more action and high stakes".',
  openFifths: 'OPEN, NOT TENSE \u2014 octave/unison dyads are 36.1% of battle sounding pairs vs 28.3%, fifths 15.3% vs 13.0%, bare power-fifth chords 11.7% vs 4.9% (2.4x), and THIRDS GO DOWN (15.5% vs 20.2%). Meanwhile tritones 1.7% vs 2.3%, semitones 1.0% vs 1.8%, diminished 0.8% vs 1.5%: battle music is LESS dissonant than his other picks. Stakes are made of open intervals, not tension intervals.',
  battleKit: 'TOMS ARE THE BATTLE DRUM \u2014 1.887 tom hits/bar against 0.313 (6.0x), crash on 19.8% of bars vs 13.8%. Hats go the other way: FEWER (5.2/bar vs 6.7) and on 8ths not 16ths (16th-position share 8.8% vs 21.9%). A battle kit is not a busier kit.',
  frozenSlot: 'FREEZE THE BODY, MOVE ONE SLOT (reel R2, 4 reels / 1 source) \u2014 one slot of a repeating figure tracks the chord and every other pitch is held FIXED for the whole loop, so the same frozen dyad re-reads as 9+b3, then #11+5, then 5+b6 as the harmony moves under it. Variation by RE-HARMONISATION rather than by substitution, which is the D101 distinction arriving from the reels.',
  coprimeCell: 'A CELL LENGTH COPRIME WITH THE BAR (reel R6, 2 reels / 2 INDEPENDENT sources) \u2014 a 3-eighth cell in a 4/4 bar restarts on a different beat every bar and realigns only every 3. Change with zero note edits and NO SECTION BOUNDARY, which is the r17 ask this project has carried unbuilt for six rounds (measured then: 139 of 139 layer entries land exactly on a section start).',
};
const R23_HONEST = [
  'THE CONTRAST IS HIS OWN SET, NOT A CORPUS. 13 battle files against 43 non-battle files, all from the two folders he hand-picked. Both sides are music he chose, so a difference is a battle property rather than a taste property \u2014 but n is small and nothing here is counted into src/lib (D95).',
  'THE FIRST PASS OF THIS ANALYSIS WAS WRONG AND IS NOT WHAT IS SHOWN. It reported "minor share: battle 100.0%, other 0.0%" and a flat 0.0% for every chord quality. Cause: a MEDIAN taken over a 0/1 indicator, which is not a statistic. The real minor share is 69.2% vs 46.5%. Project law \u2014 a suspiciously clean number is a bug until proven otherwise.',
  'THE ROLE GATE DOES NOT OUTRANK A LANE LAW. Five of the seven battle/boss songs on the judged page are CITADEL, and D93/D100 already settled that a dread lane wants its harmony sustained ("an evening disco dance ball"). The battle devices exclude horror, desert and jungle, which pin their own floors.',
  'THE REEL DEVICES ARE OPT-IN BECAUSE OF A MEASUREMENT, NOT CAUTION. Rolled by hash on every unkept song they moved TEN of the judged 47, including scary_catacombs, tense_citadel and happy_jungle \u2014 the same lanes again. They ship on here and reach the suite when your ear says so.',
  'NOT ANSWERED BY THIS: velocity. His reference MIDIs are near-uniform (stdev 9.2 battle vs 9.3 other, snare ghost-notes in 2 of 12 files), so nothing in this set can teach dynamics. The "bare minimum" drum complaint is answered here with toms and a crash, not with velocity shaping.',
  'ALSO NOT THE MECHANISM: harmonic rhythm. Battle chord changes measured 1.31/bar against 1.38 \u2014 no faster. Battle music does not get its urgency from moving harmony more often.',
];

if (R23) {
  const first = songs.length;
  const built = [];
  for (const row of R23_PROMPTS) {
    const P = parsePrompt(row.p);
    const prompt = { emotion: P.emotion, environment: row.env, meter: '4/4' };
    const probe = compileVibe({ ...prompt, name: `r23_${row.n}` });
    const base = {
      ...csOpts(P.mods, probe, prompt.environment, prompt.emotion),
      // ON IN BOTH VARIANTS so neither is the variable being judged
      percBackbeat: true, scaleTokensInKey: true,
    };
    // r23: battle/boss cues pin family MINOR. Measured 69.2% minor against
    // 46.5% for his non-battle picks, and the first build of this page put
    // FOUR of the five battle prompts in MAJOR — E, C, B and F major at
    // 170-190bpm, which reads as a victory fanfare rather than a fight. Same
    // shape as D93's lullaby trap in the horror lanes, arriving via role.
    if (['fight', 'boss'].includes(row.env)) base.family = 'minor';
    const seedName = `r23_${row.n}`;
    for (const [tag, extra] of [
      ['r23', { r23: true, frozenSlot: true, coprimeCell: true }],
      // THE CONTROL HAS TO SAY NO EXPLICITLY. First build of this page leaked
      // the battle devices into it: `battleRole` defaults on for a HISTORY-LESS
      // song (D99's rule), and every song here is new, so the control got the
      // battle bass and the open-fifth support too and the A/B measured
      // nothing. Verified after the fix by diffing the two casts.
      ['r23base', { driveBass: false, battleKit: false, supportFigure: false }],
    ]) {
      buildSong(prompt, seedName, { ...base, ...extra });
      const S = songs[songs.length - 1];
      S.name = `${tag}_${row.n}`;
      S.promptText = row.p; S.reference = row.ref; S.variant = tag;
      S.pairKey = row.n; S.role = probe.role;
      built.push(S);
    }
  }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, '.r23-stress.json'), JSON.stringify({
    generated: new Date().toISOString(), devices: R23_DEVICES, honest: R23_HONEST,
    songs: songs.slice(first).map(({ solos, ...rest }) => ({ ...rest, solos })),
  }));
  console.log(`wrote audition/.r23-stress.json \u2014 ${built.length} songs (${R23_PROMPTS.length} prompts x 2 variants)`);
}

if (R22) {
  const first = songs.length;
  const built = [];
  for (const row of R22_PROMPTS) {
    const P = parsePrompt(row.p);
    const prompt = { emotion: P.emotion, environment: P.environment, meter: '4/4' };
    const probe = compileVibe({ ...prompt, name: `r22_${row.n}` });
    const base = csOpts(P.mods, probe, prompt.environment, prompt.emotion);
    // The pair MUST differ ONLY in the devices. buildSong hashes `name` for
    // every retrieval it makes — exemplar, cell, cast, travel — so the two
    // variants are built under the SAME name and relabelled afterwards. Giving
    // the control its own name would re-roll all of that and the A/B would be
    // comparing two different songs instead of one song's layering.
    const seedName = `r22_${row.n}`;
    for (const [tag, extra] of [
      ['r22', {
        echoLayer: true, octaveDouble: true, layerRest: true, obliqueCompanion: true,
        // r22 second pass, straight off his notes on the first one
        percBackbeat: true,     // "there isn't even a dum being hit it's just hihat"
        supportFigure: true,    // "root third fifth ... 8th note style ... 'action' and 'high stakes'"
        scaleTokensInKey: true, // "bad note in G# in the first bar" — he named it on BOTH variants
      }],
      ['r22base', {}],
    ]) {
      buildSong(prompt, seedName, { ...base, ...extra });
      const S = songs[songs.length - 1];
      S.name = `${tag}_${row.n}`;   // page-addressable; the seed above is what was hashed
      S.promptText = row.p; S.reference = row.ref; S.variant = tag;
      S.pairKey = row.n; S.devices = tag === 'r22' ? Object.keys(R22_DEVICES) : [];
      built.push(S);
    }
  }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, '.r22-layers.json'), JSON.stringify({
    generated: new Date().toISOString(), devices: R22_DEVICES,
    songs: songs.slice(first).map(({ solos, ...rest }) => ({ ...rest, solos })),
  }));
  console.log(`wrote audition/.r22-layers.json — ${built.length} songs (${R22_PROMPTS.length} prompts x 2 variants)`);
}

// ---- every mix through the engine's own transpiler -------------------------
let checked = 0;
for (const [name, tid, expr, bpm, beats, totalBars] of CHECKS) {
  const code = `setcpm(${bpm}/${beats})\np: stack(${expr})`;
  const ev = await evaluateSong(code);
  const haps = hapsByLabel(ev, 0, Math.max(8, totalBars ?? 8)).get('p');
  if (!haps || haps.error || !haps.haps.length) {
    throw new Error(`${name}/${tid} produced no haps: ${haps?.error ?? 'empty'}`);
  }
  checked++;
}

// D81: songs with an HQ render (audition/hq/<name>.wav, scripts/render-hq.mjs)
// get an hq flag — the page offers the same HQ playback mode as videolab
for (const s of songs) s.hq = existsSync(join(OUT, 'hq', `${s.name}.wav`));
// Vocal tier (r34): a song with audition/hq/<name>.withvocal.wav (scripts/
// render-vocal.mjs — the tune sung by a DiffSinger voice, timbre-converted
// with RVC, laid over the HQ mix) gets a vocal flag; the page's "Vocal"
// toggle swaps it in when HQ mode is on. The field is only SET when the file
// exists, so songs without a vocal render keep their DATA byte-identical.
for (const s of songs) if (existsSync(join(OUT, 'hq', `${s.name}.withvocal.wav`))) s.vocal = true;
const DATA = { songs: songs.map(({ solos, ...rest }) => ({ ...rest, solos })) };
const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
// CS_COMPARE builds extra songs into `songs`; writing songs.html from that
// array would append 16 unjudged cards to the judged baseline. The comparison
// mode writes its own JSON (above) and leaves songs.html alone.
if (SUITE) {
  // Same card UI as the judged page — he judges these the way he judges
  // everything — but rekeyed so a paste from here can never be imported as a
  // judged-suite export, and so its localStorage cannot collide with his
  // in-progress verdicts on songs.html.
  //
  // ONLY the su_* songs. `buildSong` appends to the shared `songs` array, so the
  // page built above carries all 47 judged cards as well; rendering that would
  // put judged material on an unjudged page under a different verdict key, which
  // is precisely how a stale keep gets re-litigated.
  const suiteHtml = page({ songs: songs.slice(SUITE_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:suite-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:suite-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:suite-cards')
    .replace("page: 'songs'", "page: 'r23-suite'")
    .replace('<title>vibe songs — audition</title>', '<title>r23 suite — everything wired</title>');
  writeFileSync(join(OUT, 'suite.html'), suiteHtml);
  const inl = suiteHtml.slice(suiteHtml.lastIndexOf('<script>') + 8, suiteHtml.lastIndexOf('</script>'));
  acorn.parse(inl, { ecmaVersion: 'latest' });
  console.log(`wrote audition/suite.html — ${songs.length - SUITE_FIRST} songs, full r22+r23 stack (page script parses clean, ${(inl.length / 1024).toFixed(0)} KB)`);
} else if (CHORDCAM) {
  // Same rule as the suite page: render ONLY the cc_* songs. buildSong appends
  // to the shared array, so `page()` above carries all 47 judged cards too, and
  // putting judged material on an unjudged page under a different verdict key is
  // how a stale keep gets re-litigated.
  const ccHtml = page({ songs: songs.slice(CC_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:chordcam-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:chordcam-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:chordcam-cards')
    .replace("page: 'songs'", "page: 'r26-chordcam'")
    .replace('<title>vibe songs — audition</title>', '<title>r26 — songs on the @ChordCamera progressions</title>');
  writeFileSync(join(OUT, 'chordcam.html'), ccHtml);
  const inl2 = ccHtml.slice(ccHtml.lastIndexOf('<script>') + 8, ccHtml.lastIndexOf('</script>'));
  acorn.parse(inl2, { ecmaVersion: 'latest' });
  console.log(`wrote audition/chordcam.html — ${songs.length - CC_FIRST} songs on ${new Set(CC_PROMPTS.map((r) => r.pin)).size} transcribed progressions (page script parses clean, ${(inl2.length / 1024).toFixed(0)} KB)`);
} else if (REELS_PAGE) {
  const rlHtml = page({ songs: songs.slice(RL_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:reels-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:reels-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:reels-cards')
    .replace("page: 'songs'", "page: 'r31-reels'")
    .replace('<title>vibe songs — audition</title>', '<title>r31 — the reel layer patterns, recombined</title>');
  writeFileSync(join(OUT, 'reels.html'), rlHtml);
  const inl6 = rlHtml.slice(rlHtml.lastIndexOf('<script>') + 8, rlHtml.lastIndexOf('</script>'));
  acorn.parse(inl6, { ecmaVersion: 'latest' });
  const built = songs.slice(RL_FIRST);
  const byBlock = {};
  for (const b of built) byBlock[b.block] = (byBlock[b.block] ?? 0) + 1;
  console.log(`wrote audition/reels.html — ${built.length} songs (${Object.entries(byBlock).map(([k, v]) => `${v} ${k}`).join(', ')}), page script parses clean, ${(inl6.length / 1024).toFixed(0)} KB`);
  for (const b of built) console.log(`   ${b.name.padEnd(28)} ${b.reelLayersCast}`);
} else if (VOCAL_PAGE) {
  const vxHtml = page({ songs: songs.slice(VX_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:vocal-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:vocal-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:vocal-cards')
    .replace(/motif-engine:songs-hq/g, 'motif-engine:vocal-hq')
    .replace(/motif-engine:songs-vocal/g, 'motif-engine:vocal-vocal')
    .replace("page: 'songs'", "page: 'r34-vocal'")
    .replace('<title>vibe songs — audition</title>', '<title>r34 — the vocal suite</title>');
  writeFileSync(join(OUT, 'vocal.html'), vxHtml);
  const inlv = vxHtml.slice(vxHtml.lastIndexOf('<script>') + 8, vxHtml.lastIndexOf('</script>'));
  acorn.parse(inlv, { ecmaVersion: 'latest' });
  const built = songs.slice(VX_FIRST);
  console.log(`wrote audition/vocal.html — ${built.length} songs (${built.filter((s) => s.vocal).length} with a vocal render), page script parses clean, ${(inlv.length / 1024).toFixed(0)} KB`);
  for (const b of built) console.log(`   ${b.name.padEnd(24)} ${b.bpm}bpm ${b.key}  ${b.hq ? 'HQ' : '--'} ${b.vocal ? 'VOCAL' : '--'}`);
} else if (VOCALOID_PAGE) {
  const voHtml = page({ songs: songs.slice(VO_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:vocaloid-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:vocaloid-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:vocaloid-cards')
    .replace(/motif-engine:songs-vocal/g, 'motif-engine:vocaloid-vocal')
    .replace("page: 'songs'", "page: 'r35-vocaloid'")
    .replace('<title>vibe songs — audition</title>', '<title>r35 — the Vocaloid suite (description prompts)</title>');
  writeFileSync(join(OUT, 'vocaloid.html'), voHtml);
  const inlvo = voHtml.slice(voHtml.lastIndexOf('<script>') + 8, voHtml.lastIndexOf('</script>'));
  acorn.parse(inlvo, { ecmaVersion: 'latest' });
  const built = songs.slice(VO_FIRST);
  console.log(`wrote audition/vocaloid.html — ${built.length} songs (${built.filter((s) => s.vocal).length} with a vocal render), page script parses clean, ${(inlvo.length / 1024).toFixed(0)} KB`);
  for (const b of built) console.log(`   ${b.name.padEnd(18)} ${String(b.bpm).padStart(3)}bpm ${b.key.padEnd(9)} ${b.hq ? 'HQ' : '--'} ${b.vocal ? 'VOCAL' : '--'}  ${b.parsed}`);
} else if (VOCALAB_PAGE) {
  const vlHtml = page({ songs: songs.slice(VL_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:vocalab-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:vocalab-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:vocalab-cards')
    .replace(/motif-engine:songs-vocal/g, 'motif-engine:vocalab-vocal')
    .replace("page: 'songs'", "page: 'r35-vocalab'")
    .replace('<title>vibe songs — audition</title>', '<title>r35 — the vocal lab (one variable per card, sung)</title>');
  writeFileSync(join(OUT, 'vocalab.html'), vlHtml);
  const inlvl = vlHtml.slice(vlHtml.lastIndexOf('<script>') + 8, vlHtml.lastIndexOf('</script>'));
  acorn.parse(inlvl, { ecmaVersion: 'latest' });
  const built = songs.slice(VL_FIRST);
  console.log(`wrote audition/vocalab.html — ${built.length} variants on ${VL_CARDS.length} cards (${built.filter((s) => s.vocal).length} with a vocal render), page script parses clean, ${(inlvl.length / 1024).toFixed(0)} KB`);
  for (const b of built) console.log(`   ${b.name.padEnd(22)} ${String(b.bpm).padStart(3)}bpm ${b.key.padEnd(9)} ${b.hq ? 'HQ' : '--'} ${b.vocal ? 'VOCAL' : '--'}`);
} else if (ENERGY_PAGE) {
  const enHtml = page({ songs: songs.slice(EN_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:energy-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:energy-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:energy-cards')
    .replace("page: 'songs'", "page: 'r30-energy'")
    .replace('<title>vibe songs — audition</title>', '<title>r30 — his labels, served at a higher energy</title>');
  writeFileSync(join(OUT, 'energy.html'), enHtml);
  const inl5 = enHtml.slice(enHtml.lastIndexOf('<script>') + 8, enHtml.lastIndexOf('</script>'));
  acorn.parse(inl5, { ecmaVersion: 'latest' });
  const built = songs.slice(EN_FIRST);
  console.log(`wrote audition/energy.html — ${built.length} songs (${built.length / 2} cores x base/energised), page script parses clean, ${(inl5.length / 1024).toFixed(0)} KB`);
  for (const b of built.filter((x) => x.name.endsWith('_energised'))) console.log(`   ${b.name}: ${b.devices}`);
} else if (LAYERSTACK) {
  // Same rule as the chordcam and vanriver pages: render ONLY the ls_* songs.
  // buildSong appends to the shared array, so `page()` carries every judged card
  // too, and putting judged material on an unjudged page under a different
  // verdict key is how a stale keep gets re-litigated.
  const lsHtml = page({ songs: songs.slice(LS_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:layerstack-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:layerstack-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:layerstack-cards')
    .replace("page: 'songs'", "page: 'r28-layerstack'")
    .replace('<title>vibe songs — audition</title>', '<title>r28 — the layer stack, all seven reel rules</title>');
  writeFileSync(join(OUT, 'layerstack.html'), lsHtml);
  const inl4 = lsHtml.slice(lsHtml.lastIndexOf('<script>') + 8, lsHtml.lastIndexOf('</script>'));
  acorn.parse(inl4, { ecmaVersion: 'latest' });
  const lsBuilt = songs.slice(LS_FIRST);
  const missing = lsBuilt.filter((x) => x.rulesMissing !== '(none)');
  console.log(`wrote audition/layerstack.html — ${lsBuilt.length} songs on ${new Set(LS_PROMPTS.map((r) => r.pin)).size} reel progressions (page script parses clean, ${(inl4.length / 1024).toFixed(0)} KB)`);
  if (missing.length) {
    console.log(`  RULES NOT FIRING on ${missing.length} song(s):`);
    for (const m of missing) console.log(`    ${m.name}: ${m.rulesMissing}`);
  } else {
    console.log('  all eight tracked rules fired on all songs');
  }
} else if (VANRIVER) {
  // Same rule as the chordcam page: render ONLY the vr_* songs. buildSong
  // appends to the shared array, so `page()` carries every judged card too, and
  // putting judged material on an unjudged page under a different verdict key is
  // how a stale keep gets re-litigated.
  const vrHtml = page({ songs: songs.slice(VR_FIRST).map(({ solos, ...rest }) => ({ ...rest, solos })) })
    .replace(/motif-engine:song-verdicts/g, 'motif-engine:vanriver-verdicts')
    .replace(/motif-engine:song-notes/g, 'motif-engine:vanriver-notes')
    .replace(/motif-engine:song-cards/g, 'motif-engine:vanriver-cards')
    .replace("page: 'songs'", "page: 'r27-vanriver'")
    .replace('<title>vibe songs — audition</title>', '<title>r27 — songs on the @vanrivermusic progressions</title>');
  writeFileSync(join(OUT, 'vanriver.html'), vrHtml);
  const inl3 = vrHtml.slice(vrHtml.lastIndexOf('<script>') + 8, vrHtml.lastIndexOf('</script>'));
  acorn.parse(inl3, { ecmaVersion: 'latest' });
  const built = songs.slice(VR_FIRST);
  const barsRange = built.length ? `${Math.min(...built.map((x) => x.totalBars))}-${Math.max(...built.map((x) => x.totalBars))}` : '-';
  console.log(`wrote audition/vanriver.html — ${built.length} songs on ${new Set(VR_PROMPTS.map((r) => r.pin)).size} transcribed progressions, ${barsRange} bars (page script parses clean, ${(inl3.length / 1024).toFixed(0)} KB)`);
} else if (!CS_COMPARE && !R22 && !R23) {
  writeFileSync(join(OUT, 'songs.html'), html);
  console.log(`wrote audition/songs.html — ${songs.length} vibe-prompted songs (10 + the buildup/drop song)`);
} else {
  console.log(`${CS_COMPARE ? 'CS_COMPARE' : R23 ? 'R23' : 'R22_LAYERS'}=1 — audition/songs.html NOT written (judged baseline untouched)`);
}
for (const s of songs) {
  console.log(`  ${s.name}: ${s.key} @${s.bpm} ${s.meter} · ${s.scheme || 'no letters'} over ${s.totalBars} bars · acc ${s.accompaniment} (${s.articulation})${s.travel.length ? ` → ${s.travel.length} travel` : ''} · ${s.ensemble.count}/${s.ensemble.fullCast} voices [${s.cast.join(', ') || 'piano only'}]${s.drums.length ? ` · drums: ${s.drums.join(' + ')}` : ''}${s.treat ? ` · treat ${s.treat.op}` : ''}${s.drop ? ' · BUILDUP+DROP' : ''}`);
}
console.log(`  ${checked}/${CHECKS.length} exprs evaluated green through the engine's own transpiler`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>vibe songs — audition</title>
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
  .meta { font-size:12px; color:var(--dim); margin:3px 0; }
  .sym { font-family: ui-monospace, Menlo, monospace; font-size:12.5px; margin:4px 0; }
  select { background:#1e1e28; color:var(--fg); border:1px solid #3a3a4a; border-radius:6px; padding:3px 7px; font:inherit; }
  .acts { display:flex; gap:6px; margin-top:8px; align-items:center; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  .notebox { width:100%; margin-top:7px; padding:4px 7px; font-size:12px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.12); border-radius:4px; color:inherit; }
  .notebox::placeholder { opacity:.4; }
  details { margin-top:5px; font-size:12px; color:var(--dim); }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>vibe songs — 10 environmental + emotional prompts</h1>
    <span class="now" id="now">— click ▶ on a card —</span>
    <button id="hqmode" title="play pre-rendered HQ wavs (audition/hq/) where available">HQ: off</button>
    <button id="vocalmode" title="with HQ on: play the render with the sung vocal (audition/hq/<song>.withvocal.wav) where one exists">Vocal: off</button>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">first play loads the instruments</span>
  </div>
  <div class="row" style="margin-top:6px">
    <span class="dim">each song: varied click-kept harmony · letter-form melody · foundation accompaniment that TRAVELS between letters · environment-cast instruments on the ensemble dial · treat at the last reprise · articulation per vibe (staccato/legato/damper) · drums = YOUR vouched patterns where the note fits · #11 is the buildup→drop song from your b-52's note</span>
  </div>
</header>
<main id="cards"></main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script src="sample-pack.js"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:song-verdicts';
const LSN = 'motif-engine:song-notes';
let verdicts = {};
try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
let notes = {};
try { notes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch {}
// D73 (the videolab export broke on a removed card's stale verdict): keys
// that name no current card are pruned on load — they were imported the
// round they were made, and dereferencing them breaks export.
const known = {};
DATA.songs.forEach(function (s) { known[s.name] = true; });
Object.keys(verdicts).forEach(function (n) { if (!known[n]) delete verdicts[n]; });
Object.keys(notes).forEach(function (n) { if (!known[n]) delete notes[n]; });
let playing = null;
const $ = (id) => document.getElementById(id);
const save = () => { localStorage.setItem(LS, JSON.stringify(verdicts)); localStorage.setItem(LSN, JSON.stringify(notes)); };
const solo = {};

// D81: HQ mode — play the pre-rendered wav where one exists (mix only;
// solos use the browser synth unless a per-solo wav exists)
const LSHQ = 'motif-engine:songs-hq';
let hqMode = false;
try { hqMode = localStorage.getItem(LSHQ) === '1'; } catch {}
const HQ_AUDIO = new Audio();
HQ_AUDIO.loop = true;
function hqButton() { $('hqmode').textContent = 'HQ: ' + (hqMode ? 'ON' : 'off'); $('hqmode').style.fontWeight = hqMode ? 'bold' : ''; }
const LSVOC = 'motif-engine:songs-vocal';
let vocalMode = false;
try { vocalMode = localStorage.getItem(LSVOC) === '1'; } catch {}
function vocalButton() { $('vocalmode').textContent = 'Vocal: ' + (vocalMode ? 'ON' : 'off'); $('vocalmode').style.fontWeight = vocalMode ? 'bold' : ''; }

function codeFor(s) {
  const which = solo[s.name] || 'mix';
  const expr = which === 'mix' ? s.mix : s.solos[which];
  if (!expr) return null;
  return 'setcpm(' + s.bpm + '/' + s.beats + ')\\np: stack(' + expr + ')';
}
async function play(s) {
  const which = solo[s.name] || 'mix';
  if (hqMode && s.hq && which === 'mix') {
    rtStop();
    const withVocal = !!(vocalMode && s.vocal);
    HQ_AUDIO.src = 'hq/' + s.name + (withVocal ? '.withvocal.wav' : '.wav');
    HQ_AUDIO.currentTime = 0;
    try { await HQ_AUDIO.play(); } catch (e) { $('now').textContent = 'HQ playback failed: ' + e.message; return; }
    playing = s.name;
    $('now').textContent = '\\u25b6 ' + s.name + ' (HQ wav' + (withVocal ? ' + vocal' : (vocalMode ? ' \\u00b7 no vocal render' : '')) + ')';
    render();
    return;
  }
  HQ_AUDIO.pause();
  const code = codeFor(s);
  if (!code) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = s.name;
  $('now').textContent = '\\u25b6 ' + s.name + ' (' + which + (hqMode && !s.hq ? ' \\u00b7 no HQ render' : '') + (vocalMode && which !== 'mix' ? ' \\u00b7 solos have no vocal' : '') + ')';
  render();
}
function stop() { rtStop(); HQ_AUDIO.pause(); HQ_AUDIO.currentTime = 0; playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }
// r24 — HIS BUG REPORT: "when i put notes in and click play button on another
// song, some text gets capped and after the cap it just disappears".
// div.textContent -> innerHTML escapes &, < and > but NOT the double quote, and
// every note is written back into a value="..." attribute on re-render. His own
// writing style is full of quotes — "somber aftermath", "forceful", "relaxed",
// "tip toe-y" — so the attribute closed at his first quote and the rest of the
// note was parsed as markup and dropped. It bit 7 of the 8 audition pages
// (audition-triage.mjs was the one that escaped quotes correctly).
const ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function esc(t) { return t == null ? '' : String(t).replace(/[&<>"']/g, function (c) { return ESC_MAP[c]; }); }

function render() {
  $('cards').innerHTML = DATA.songs.map(function (s) {
    const v = verdicts[s.name];
    const opts = ['mix'].concat(Object.keys(s.solos)).map(function (k) {
      return '<option' + ((solo[s.name] || 'mix') === k ? ' selected' : '') + '>' + k + '</option>';
    }).join('');
    return '<div class="card' + (playing === s.name ? ' playing' : '') + (v ? ' ' + v : '') + '">' +
      '<div class="row"><span class="vibe">' + esc((s.prompt.emotion ? s.prompt.emotion + ' ' : '') + s.prompt.environment) + '</span>' +
      '<span class="dim">' + esc(s.name) + '</span>' +
      (s.hq ? '<span class="dim" style="background:#1d3a2a;color:#9fdcb0;padding:0 6px;border-radius:3px" title="has an HQ render">HQ</span>' : '') +
      (s.vocal ? '<span class="dim" style="background:#3a1d3a;color:#dc9fdc;padding:0 6px;border-radius:3px" title="has a sung vocal render (HQ on + Vocal on)">VOCAL</span>' : '') +
      '<button data-play="' + s.name + '">\\u25b6 play</button>' +
      '<select data-solo="' + s.name + '">' + opts + '</select></div>' +
      '<div class="meta">' + s.key + ' \\u00b7 ' + s.bpm + 'bpm ' + s.meter + ' \\u00b7 ' + s.totalBars + ' bars \\u00b7 form ' + esc(s.scheme || '(no letters)') + ' \\u00b7 role ' + s.role + ' \\u00b7 ' + s.salience + '</div>' +
      '<div class="sym">' + esc(s.symbols.join(' ')) + (s.treat ? '  \\u2192 treat(' + esc(s.treat.op) + '): ' + esc(s.treat.symbols.join(' ')) : '') + '</div>' +
      '<div class="meta">acc: ' + esc(s.accompaniment) + ' (' + esc(s.accClass) + ')' + (s.travel.length ? ' \\u00b7 travel: ' + esc(s.travel.join(' \\u00b7 ')) : '') + '</div>' +
      '<div class="meta">voices ' + s.ensemble.count + ' of cast ' + s.ensemble.fullCast + ': ' + esc(s.cast.join(', ') || 'piano only') + (s.drums.length ? ' \\u00b7 drums: ' + esc(s.drums.join(' + ')) : ' \\u00b7 no drums') + '</div>' +
      '<details><summary>why (compile trace + harmony lineage)</summary>' +
      esc('exemplar ' + s.exemplar + (s.ops.length ? ' \\u2192 ' + s.ops.join(', ') : ' (unvaried)')) + '<br>' +
      s.vibeNotes.map(esc).join('<br>') + '</details>' +
      '<div class="acts">' +
      '<button class="k' + (v === 'keep' ? ' on' : '') + '" data-v="keep" data-n="' + s.name + '">keep</button>' +
      '<button class="x' + (v === 'kill' ? ' on' : '') + '" data-v="kill" data-n="' + s.name + '">kill</button>' +
      '</div>' +
      '<input class="notebox" data-note="' + s.name + '" placeholder="notes\\u2026 (what works, what breaks the vibe)" value="' + esc(notes[s.name] || '') + '">' +
      '</div>';
  }).join('');
  $('tally').textContent = Object.keys(verdicts).length + '/' + DATA.songs.length + ' judged \\u00b7 ' + Object.keys(notes).filter(function (k) { return notes[k]; }).length + ' notes';
  document.querySelectorAll('[data-play]').forEach(function (b) {
    b.onclick = function () { play(DATA.songs.find(function (s) { return s.name === b.dataset.play; })); };
  });
  document.querySelectorAll('[data-solo]').forEach(function (sel) {
    sel.onchange = function () {
      solo[sel.dataset.solo] = sel.value;
      if (playing === sel.dataset.solo) play(DATA.songs.find(function (s) { return s.name === sel.dataset.solo; }));
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
$('hqmode').onclick = function () {
  hqMode = !hqMode;
  try { localStorage.setItem(LSHQ, hqMode ? '1' : '0'); } catch {}
  hqButton();
  stop();
};
hqButton();
$('vocalmode').onclick = function () {
  vocalMode = !vocalMode;
  try { localStorage.setItem(LSVOC, vocalMode ? '1' : '0'); } catch {}
  // the vocal lives in the HQ render: turning it on turns HQ on too (his
  // "i dont hear the vocals" — HQ off plays the browser synth, which has none)
  if (vocalMode && !hqMode) { hqMode = true; try { localStorage.setItem(LSHQ, '1'); } catch {} hqButton(); }
  vocalButton();
  stop();
};
vocalButton();
$('export').onclick = function () {
  // DERIVED format (D60): page-local songs export degrees + exemplar base, so
  // import-verdicts.mjs lands them in DERIVED_VERDICTS unchanged
  const derived = {};
  Object.keys(verdicts).forEach(function (n) {
    const s = DATA.songs.find(function (x) { return x.name === n; });
    if (!s) return; // stale key from an earlier round — already imported then
    derived[n] = { verdict: verdicts[n], family: s.family, degrees: s.degrees, base: s.exemplar };
  });
  const out = {
    page: 'songs', generated: new Date().toISOString(),
    derived: derived,
    notes: Object.fromEntries(Object.entries(notes).filter(function (kv) { return kv[1] && kv[1].trim(); })),
    songs: DATA.songs.map(function (s) { return { name: s.name, prompt: s.prompt, degrees: s.degrees, base: s.exemplar, family: s.family }; }),
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
