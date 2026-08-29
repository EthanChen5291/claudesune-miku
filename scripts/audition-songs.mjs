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
import { exemplarPool, variationsOf, varyProgression } from '../src/lib/harmony-vary.js';
import { VERDICTS, DERIVED_VERDICTS, CARD_NOTES } from '../src/lib/verdicts.js';
import { renderProgression } from '../src/binder/harmony.js';
import { parseDegrees, ALL_PROGRESSIONS } from '../src/lib/progressions.js';
import { dpStack } from './drum-render.js';
import { bindFigure, bindMelody, normalizeRhythm } from '../src/binder/bind.js';
import { FIGURATIONS_FOUNDATION } from '../src/lib/figurations-foundation.js';
import { FND_TRAVEL } from '../src/lib/figuration-graph.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { INSTRUMENTS } from '../src/lib/instruments.js';
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
function melodyRhythm(meter, bpm, seedName, { target: forced = null, accDensity = 0, accOnsets = null, beats = 4, exclude = [], maxDensity = null, heldFirst = false } = {}) {
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
  return { name: pick.name, onsets: pick.onsets, accents: pick.accents, artic: pick.artic, density: pick.density, target, interlock: Math.round(ranked[0].s * 100) / 100 };
}

function barPlan(n) {
  const B = (n % 4 === 0 || n === 2) ? n : Math.ceil(n / 4) * 4;
  if (B === n) return null;
  const base = Math.floor(B / n), rem = B % n;
  return Array.from({ length: n }, (_, i) => (i < rem ? base + 1 : base));
}

// ---- drums: mini-notation from a rhythms.js percussion entry ---------------
const BAND_SOUND = { low: 'bd', mid: 'sd', high: 'hh' };
const PRESENCE_GAIN = { light: 0.5, driving: 0.7, foreground: 0.85 };
function drumExpr(name, presence) {
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
  const sound = entry.sound ?? BAND_SOUND[entry.band] ?? 'sd';
  const gmax = PRESENCE_GAIN[presence] ?? 0.6;
  const slots = Array(G * r.bars).fill('~');
  const gains = Array(G * r.bars).fill('0');
  r.onsets.forEach(([n, d], i) => {
    const ix = Math.round((n / d) * G);
    if (ix < slots.length) { slots[ix] = entry.sounds?.[i] ?? sound; gains[ix] = String(Math.round(r.accents[i] * gmax * 100) / 100); }
  });
  let expr = `s("${slots.join(' ')}").gain("${gains.join(' ')}")`;
  if (r.bars > 1) expr += `.slow(${r.bars})`;
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
  const priorKeep = judged?.verdict === 'keep';
  const env = prompt.environment;
  // r14 LANE LAW (his catacombs/citadel notes — "the synths don't really fit
  // ... they both make it sound playful", "boogie shuffle on catacombs?",
  // "sounds like a evening disco dance ball"): the horror lanes, and the
  // desert/jungle lanes behind them, refuse the engine's PLAYFUL defaults —
  // music-box sparkle, slap-bass funk bounce, chip leads, latin/boogie
  // foundations. Unkept songs only; a kept song keeps what he judged.
  const laneHorror = ['manor', 'catacombs', 'citadel'].includes(env);
  const laneSerious = !priorKeep && (laneHorror || env === 'desert' || env === 'jungle');
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
  const basePinned = opts.basePin
    && (EX.entries.some(([n]) => n === opts.basePin) || ALL_PROGRESSIONS[opts.basePin])
    ? opts.basePin : null;
  const [exName] = basePinned ? [basePinned]
    : (priorKeep || opts.keepBase) && judged?.base && EX.entries.some(([n]) => n === judged.base)
    ? [judged.base]
    : pool[fnv(`${name}|exemplar`) % pool.length];
  // r19/D100 — opts.rawBase generalises D93's desert law ("Serve trope
  // progressions RAW — the variation pass dilutes them") to any hand-pinned
  // reel progression. Measured on the first build of the four reel songs: the
  // variation pass turned the thirdless `F5 Gb5 F5 Gb5` into `F5 Gb5 F5 Em` —
  // an E MINOR TRIAD in the one progression whose entire point is that it has
  // no thirds — and swapped two of the jazz circle's eight chords for sus
  // chords, including the V9 the circle turns on.
  const vars = (phrygianLock || opts.rawBase) ? [] : variationsOf(exName, {
    count: 1, intensity: 0.3 + v.colorBias * 0.4, budget: 2, seed: `${name}|harmony`,
  });
  let e = vars[0] ?? (EX.entries.find(([n]) => n === exName) ?? pool.find(([n]) => n === exName)
    ?? [exName, ALL_PROGRESSIONS[exName]])[1];
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
  const key = `${v.keyHint}:${desertScale ?? (v.family === 'minor' ? 'minor' : 'major')}`;
  const symbols = renderProgression(e, key);
  const plan4 = barPlan(symbols.length);
  const barSyms = plan4 ? symbols.flatMap((sym, i) => Array(plan4[i]).fill(sym)) : symbols;
  const loopBars = barSyms.length;
  const ctxBar = { harmony: barSyms, barsPerChord: 1, key };

  // ---- accompaniment: a ratified foundation in the vibe's classes ----------
  let accPool = RATIFIED_FND.filter(([, f]) => v.figClasses.includes(f.class) && f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === '4/4');
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
  const accFig = horrorOstinato ?? jungleVamp ?? { ...accFig0, name: accName, ...(accHalfTime ? { bars: (accFig0.bars ?? 1) * 2 } : {}) };
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
    && !DERIVED_VERDICTS?.[name] && !CARD_NOTES?.[name]
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
  const LEAD_SOUND = opts.leadSound ?? stringLeadRoll ?? horrorLeadDefault ?? (opts.fullSynth ? (v.bpm >= 120 ? 'gm_lead_2_sawtooth' : 'gm_epiano1')
    : synthAcc ? (v.bpm >= 120 ? 'gm_lead_2_sawtooth' : 'gm_lead_1_square') : 'piano');
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
  const leadFx = ART.pedal ? `.gain(${leadGain}).room(0.7)` : `.gain(${leadGain}).room(0.25)`;
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
  const freshRules = !priorKeep && !opts.grammarPin && opts.pinFrom !== 'r20';
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
          if (String(t).includes('.')) return setTop(t, PAL[(k++ + cyc) % PAL.length]);
          if (!RECOLOURABLE.test(core)) return t;
          return PAL[(k++ + cyc) % PAL.length] + oct;
        }
        const pick = pickResolving(PAL, b.fig[i + 1] ?? b.fig[0], cyc + (k++));
        if (!pick) return t;
        if (String(t).includes('.')) return setTop(t, pick);
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
          if (String(t).includes('.')) return setTop(t, PAL[(k++ + cyc) % PAL.length]);
          if (!RECOLOURABLE.test(core)) return t;
          return PAL[(k++ + cyc) % PAL.length] + oct;
        }
        const pick = pickResolving(PAL, b.fig[i + 1] ?? b.fig[0], cyc + (k++));
        if (!pick) return t;
        if (String(t).includes('.')) return setTop(t, pick);
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
        return `${parts.join('.')}.${tc}${to}`;
      });
      return placed ? { on: b.on.slice(), fig, acc: b.acc.slice() } : null;
    }],
    ['dyad', (b) => {
      const PARTNER = { R: 's4', 3: 's6', 4: 's7', 5: 's2', 6: 's2', 7: 's4', 9: '5' };
      const fig = b.fig.map((t, i) => {
        if (i % 2 === 0) return t;
        const [core, oct] = octSplit(t);
        if (String(t).includes('.')) {
          const [tc, to] = topOf(t);
          return `${t}.${PARTNER[tc] ?? 's2'}${to}`;
        }
        const p = PARTNER[core];
        return p ? `${core}${oct}.${p}${oct}` : t;
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
      fig[i] = setTop(fig[i], DESC[k++ % DESC.length]);
    }
    const last = fig.length - 1;
    // r16 verify catch: this used to REPLACE the last token outright, so a
    // block-chord bar (`R.3.5`) ended on one bare note two octaves above the
    // rest of the hand. The approach tone belongs on TOP of the stack, not
    // instead of it.
    fig[last] = setTop(fig[last], 's7');
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
        if (out && events(out) >= quota) return out;
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
        if (tone) b.fig[i] = setTop(b.fig[i], tone);
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
  const bindAcc = (fig0, ctx, salt = 0) => bindFigure(accVaryOn ? varyFig(fig0, salt) : fig0, ctx, v.meter, {
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
    ...(opts.accGainMul
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
    octave: Math.max(1, Math.min(4, Math.max(fig0.octave ?? accOct, v.register.accFloor ?? 0, opts.accOctave ?? 0,
      !priorKeep && env === 'jungle' ? 3 : 0))),
  }).expr;
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
  const leadSeed = fnv(name);
  const leadBound = bindMelody(leadCell, ctxBar, v.meter, {
    style: 'toby-fox', seed: leadSeed, octave: leadOctave, sound: LEAD_SOUND, fx: leadFx,
    hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
  });
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
  plan.layers = plan.layers.slice(0, v.ensemble.count);
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
    counterRhythmFor: (target, seedName) => melodyRhythm(v.meter, v.bpm, seedName, { target, accOnsets, beats }),
    figureFor: () => accFig,
    // D65: the lead's manner reaches EVERY melodic layer the arranger binds
    // (round 2: "trumpet still should much more hold"), and support pads are
    // real chord voicings over a low frame (his strings rule)
    leadOpts: { hold: LEAD.hold, mergeRepeats: LEAD.merge, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0 },
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
  const LEAD_CURVE = curveOf(secMul.map((m) => Math.round(((1 + m) / 2) * 100) / 100));
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
  const letterSeed = (L) => (L === 'A' ? leadSeed : fnv(`${name}|melody|${L}`));
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
  const HANDOFF_POOL = !priorKeep && env === 'desert'
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
        ? ['gm_violin', 'gm_cello', 'gm_flute']
        : ['gm_flute', 'gm_vibraphone', 'gm_epiano1'];
  const letterSound = (L) => {
    // D91 (his construction/fight praise, "instead of just the one synth
    // being the melody, to vary it a bit"): a synth-lead song may vary the
    // lead voice per letter even when the cast carries a melody voice —
    // non-A letters bind the partner synth (saw<->square). Voice-only on
    // the two kept songs: same cells, same seeds, the notes are identical.
    // Default only on history-less synth songs (nothing judged re-rolls).
    const varyLead = opts.varyLeadVoice ?? ((synthAcc || opts.fullSynth) && !priorKeep && !opts.grammarPin
      && !DERIVED_VERDICTS?.[name] && !CARD_NOTES?.[name]);
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
  const bindLetter = (L, ctxL) => {
    const snd = letterSound(L);
    return bindMelody(letterCell(L), ctxL, v.meter, {
      style: 'toby-fox', seed: letterSeed(L), octave: leadOctave, sound: snd, fx: leadFx,
      hold: /flute|cello|violin|oboe|shanai|organ|choir/.test(snd) ? true : LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    });
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
  if (!vary && mf.varySection != null) {
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
  const edgesFrom = FND_TRAVEL
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
  const letterLead = renderLetterLead(form, mfx, (L) => {
    const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
    return bindLetter(base0, L.endsWith('*') ? ctxBarV : ctxBar).expr;
  });
  const lettersOf = (l) => [...new Set(form.sections
    .filter((s) => s.active.includes(l.id) && s.lead !== 'none')
    .map((s) => mf.sections.find((x) => x.index === s.index)?.letter)
    .filter(Boolean))];
  const layerMixExprs = shaped.layers.map((l) => {
    let orig = l.expr;
    let variant = renderedV?.layers.find((x) => x.id === l.id)?.expr ?? null;
    if (l.derives === 'lead' || l.derives === 'lead-rhythm') {
      const Ls = lettersOf(l);
      if (Ls.length === 1 && Ls[0] !== 'A') {
        const sustainy = /trumpet|trombone|horn|oboe|clarinet|flute|recorder|ocarina|voice|choir|string|cello|violin|viola|bassoon|pan_flute/.test(l.instrument);
        const opts = {
          style: 'toby-fox', octave: l.octave, sound: l.instrument, fx: `.gain(${l.gain})`,
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
    const pats = catacombAmbience ? ['heartbeat_toms'] : (opts.percPatterns ?? v.percussion.patterns);
    const presence = catacombAmbience ? 'light' : (opts.percPresence ?? v.percussion.presence);
    const byBand = (band) => pats.find((p) => RHYTHMS[p]?.band === band);
    // r16: the selector took ONE low-band pattern and one high, then capped at
    // two — so his desert-perc answer ("add it as a 3rd pattern") was
    // unreachable: even an explicit percPatterns list naming a second low-band
    // floor was silently dropped. A song that NAMES its patterns may now seat
    // two low-band floors; the env-default path is untouched, so no song that
    // did not ask for it gains a drum.
    const lows = pats.filter((p) => RHYTHMS[p]?.band === 'low');
    let picks = opts.percPatterns
      ? [...new Set([...lows.slice(0, 2), byBand('high')].filter(Boolean))].slice(0, 3)
      : [...new Set([byBand('low') ?? pats[0], byBand('high')].filter(Boolean))].slice(0, 2);
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
    if (drumBars.some(Boolean)) {
      const parts = picks.map((p) => drumExpr(p, presence));
      const dm = maskString(drumBars);
      drumBarsShared = drumBars;
      const stackd = parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`;
      drums = /^1(@\d+)?$/.test(dm) ? stackd : `${stackd}.mask("<${dm}>")`;
      drumInfo.push(...picks.map((p) => `${p} (${RHYTHMS[p].band}) at ${presence}`));
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
  const extraInfo = [];
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
    if (opts.texture) texSpecs.push(opts.texture);
    if ((energetic && !pianoVibe) || opts.fullSynth) {
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
      texSpecs.push({ class: laneSerious ? 'block' : 'offbeat', octave: 3 });
    }
    // r14 lane law: horror textures stab on orchestral voices (pizzicato,
    // harpsichord), not the kalimba/supersaw chip pair; jungle keeps the
    // kalimba (it IS the lane voice), desert takes the marimba side.
    const texSounds = !priorKeep && laneHorror ? ['gm_pizzicato_strings', 'gm_harpsichord']
      : !priorKeep && env === 'desert' ? ['gm_marimba', 'gm_kalimba']
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
        if (tPool.length) { spec = { ...spec, class: cls }; break; }
      }
      if (!tPool.length) return;
      const [tName, tFig0] = tPool[fnv(`${name}|texture${ti ? ti + 1 : ''}`) % tPool.length];
      usedT.add(tName);
      const tFig = { ...tFig0, name: tName };
      // r14: a horror texture never falls back to the piano stab — the lane
      // voices carry it at any tempo (somber_citadel's pizzicato arps)
      const tSound = (!priorKeep && laneHorror) || synthAcc || v.bpm >= 120 ? texSounds[ti % texSounds.length] : 'piano';
      const tFx = tSound === 'supersaw' ? '.lpf(2600).room(0.25).clip(0.5)' : accFx;
      // octave capped at 3: at 4 the chord tokens' tops poked ABOVE the
      // leads (verify pass: kalimba Ab5-D6 vs lead peaks F5-C6 on three
      // songs) — support tops sit UNDER the melody (D77)
      const bindT = (ctx, salt = 0) => bindFigure(salt ? varyFig(tFig, salt) : tFig, ctx, v.meter, { sound: tSound, loopRoots: true, gainRange: [0.3, 0.52], fx: tFx, octave: Math.min(spec.octave, 3) }).expr;
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
        extraInfo.push(`texture ${tName} (${spec.class}, oct ${Math.min(spec.octave, 3)}, ${tSound})`);
      }
    });
  }
  // D73 ("also for appropriate songs i want to try a deep bass like in
  // beats. does strudel have a sound for that?" — yes: the pure sine at
  // octave 1 IS the beats sub, the same physics as an 808's body): on fast
  // beat-forward songs a sub-bass holds the chord root at octave 1, masked
  // to the same bars the beat plays, so bass and beat arrive as one floor.
  // Policy, not a song patch: any driving/foreground drum song >= 140bpm.
  if (synthAcc && !accToBass) extraInfo.push('acc hand on gm_epiano1 (synth spread \u2014 his round-9 rule)');
  if (accToBass) {
    extraInfo.push('bass pulse: acc roots on gm_synth_bass_1 (the piano low part IS the bass — his fight note)');
  } else if (drumBarsShared && v.bpm >= 140 && ['driving', 'foreground'].includes(v.percussion.presence)) {
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
    const bindCl = (ctx) => bindFigure(clHold, ctx, v.meter, clOpts).expr;
    const bindClimb = (ctx) => bindFigure(clClimb, ctx, v.meter, clOpts).expr;
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
  // D91 (training: "it doesn't sound 'excited' enough ... some staccato
  // strings/synths with their own sub harmony should be added here to make
  // it more exciting ... with their own melody (and accents)"): the MARCATO
  // layer — staccato strings with their own melodic line and accents,
  // riding the busy sections BESIDE the sustained ambience (his "of course
  // not all" — counterline/descant stay legato). opts.marcato forces;
  // default only on history-less energetic songs (nothing he has judged or
  // noted re-rolls under a new device).
  const marcatoOn = opts.marcato ?? (energetic && !priorKeep && !DERIVED_VERDICTS?.[name] && !CARD_NOTES?.[name]);
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
    const mcShape = fnv(`${name}|marcshape`) % 2;
    const mcFig = mcShape === 0
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
    const bindMc = (ctx) => bindFigure(mcFig, ctx, v.meter, {
      octave: tonicPc >= 5 ? 3 : 4, sound: mcSound, loopRoots: true,
      gainRange: [0.22, 0.42], fx: '.clip(0.4).room(0.25)', rhythmName: 'marcato',
    }).expr;
    const mcBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 4 ? 1 : 0));
    if (mcBars.some(Boolean)) {
      extraParts.push(...varySplit(bindMc, mcBars));
      extraSolos._marcato = bindMc(ctxBar);
      extraInfo.push(`marcato: staccato ${mcSound} ${mcShape === 0 ? 'dyad subharmony (R.3-3.5-R.5-3.6 walk)' : 'dyad rhythmic repeat (3+3+2 grid)'} (oct 4, busy sections)`);
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
    const bindD = (ctx) => bindFigure(dFig, ctx, v.meter, { octave: dOct, sound: dSound, loopRoots: true, gainRange: [0.15, 0.28], fx: '.room(0.5)', rhythmName: 'descant' }).expr;
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
  if (opts.sparkle !== false && !laneSerious && v.bpm >= 90 && v.meter === '4/4') {
    const spChime = {
      name: 'sparkle-chime', bars: 1, onsets: ['0', '1/2'],
      figure: ['R', '5'], accents: [0.5, 0.4], legato: false,
    };
    const spPickup = {
      name: 'sparkle-pickup', bars: 1, onsets: ['3/4', '7/8'],
      figure: ['5', '6'], accents: [0.42, 0.5], legato: false,
    };
    const spOpts = { octave: 6, sound: 'gm_music_box', loopRoots: true, gainRange: [0.15, 0.3], fx: '.room(0.5).clip(0.9)', rhythmName: 'sparkle' };
    const bindChime = (ctx) => bindFigure(spChime, ctx, v.meter, spOpts).expr;
    const bindPick = (ctx) => bindFigure(spPickup, ctx, v.meter, spOpts).expr;
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
  if (opts.funkBass !== false && !laneSerious && !accToBass && drumBarsShared
    && v.meter === '4/4' && v.bpm >= 96 && v.bpm < 140
    && ['driving', 'foreground'].includes(v.percussion.presence)) {
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
  let bdReentryBar = null; // genre-expansion: the bar the full texture returns on
  // opts.breakdown === true forces it for a song JUDGED with a breakdown —
  // a new keep must not lose the section-strip he approved
  if ((opts.breakdown === true || (opts.breakdown !== false && !priorKeep)) && !opts.dropIntro && form.sections.length >= 3) {
    const interiorAll = form.sections.filter((sec, i) => i > 0 && i < form.sections.length - 1);
    const interior = interiorAll.filter((sec) => (ENERGY[sec.archetype] ?? 3) <= 2);
    // prefer the form's own breathing point; else strip the section before
    // the finale (every praised lab song breaks down SOMEWHERE)
    const bd = interior.length ? interior[interior.length - 1] : interiorAll[interiorAll.length - 1];
    if (bd) {
      const bdBars = form.sections.flatMap((sec) => Array(sec.bars).fill(sec.index === bd.index ? 0 : 1));
      bdMaskStr = maskString(bdBars);
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
    const bindLetterDbl = (L, ctxL) => bindMelody(letterCell(L), ctxL, v.meter, {
      style: 'toby-fox', seed: letterSeed(L), octave: md.octave ?? leadOctave, sound: md.sound, fx: `.gain(${mdGain}).room(0.4)`,
      hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore, tailOff: grammarFresh, leapFold: grammarFresh, chordTop: chordTopOn, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0, ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
    });
    melodyDoubleExpr = renderLetterLead(form, mfx, (L) => {
      const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
      return bindLetterDbl(base0, L.endsWith('*') ? ctxBarV : ctxBar).expr;
    }).lead;
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
      const strict = POOL.filter((s) => !hard.has(s) && !castSounds.has(s));
      const free = strict.length ? strict : POOL.filter((s) => !hard.has(s));
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
        const bindComp = (L, ctxL) => bindMelody(letterCell(L), ctxL, v.meter, {
          style: 'toby-fox', seed: letterSeed(L), octave: cOct, sound: cSound,
          fx: `.gain(${cGain}).room(0.4)`,
          // `hold` MUST be the lead's own value for this letter, not the song
          // default: a sustaining lead voice sets it true per letter, and taking
          // the default instead made the companion's note-merging diverge from
          // the lead's. Measured before the fix: the two lines disagreed on 64
          // of 1362 shared attacks badly enough that the companion sat ABOVE
          // the melody, which is precisely the D77 inversion this layer must
          // never make. It is a harmony line — it has to ride the same rhythm.
          hold: /flute|cello|violin|oboe|shanai|organ|choir/.test(letterSound(L)) ? true : LEAD.hold,
          mergeRepeats: LEAD.merge, articFloor: artFloor, cadenceNo7, chromCore,
          tailOff: grammarFresh, leapFold: grammarFresh, minNote: grammarFresh ? (opts.leadMinNote ?? 1) : 0,
          // chordTop is OFF here: the lead is already a two-note chord on its
          // longest note, and thickening the companion too would put four
          // sounding pitches on that attack from two instruments.
          companion: true,
          ...(opts.leadRangeSteps ? { rangeSteps: opts.leadRangeSteps } : {}),
        });
        companionExpr = renderLetterLead(form, mfx, (L) => {
          const base0 = L.endsWith('*') ? L.slice(0, -1) : L;
          return bindComp(base0, L.endsWith('*') ? ctxBarV : ctxBar).expr;
        }).lead;
        if (companionExpr) {
          extraSolos._companion = companionExpr;
          extraInfo.push(`companion melody: ${cSound} sings the lead's rhythm on its own chord tones underneath, at ${cGain}`);
        }
      }
    }
  }

  const mixParts = [
    withCurve(bdMaskStr ? `(${baseMix}).mask("<${bdMaskStr}>")` : baseMix),
    ...(letterLead.lead ? [withCurve(letterLead.lead, true)] : []),
    ...(companionExpr ? [withCurve(companionExpr, true)] : []),
    ...(melodyDoubleExpr ? [withCurve(melodyDoubleExpr, true)] : []),
    ...layerMixExprs.map((x, i) => withCurve(x, shaped.layers[i]?.derives === 'lead' || shaped.layers[i]?.derives === 'lead-rhythm')),
    ...extraParts.map((x) => withCurve(x)),
    // percAllBars also rides THROUGH the breakdown strip (NSMB law: the
    // hand-drum loop never changes across sections — verify catch: the
    // breakdown mask re-created somber desert's 16 drumless bars)
    ...(drums ? [withCurve(bdMaskStr && !opts.percAllBars ? `(${drums}).mask("<${bdMaskStr}>")` : drums)] : []),
    ...fxParts,
  ];
  let mix = mixParts.length > 1 ? `stack(${mixParts.join(', ')})` : mixParts[0];

  const solos = { _acc: base, _lead: leadBound.expr, ...extraSolos, ...(drums ? { _drums: drums } : {}) };
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
  vs_happy_desert: { leadSound: 'gm_shanai', percPatterns: ['maqsum', 'nsmb_doum', 'riq_offbeats'], percPresence: 'driving', percAllBars: true, counterline: true, desertTrope: 'hijaz', accClassPrefer: 'pulse' },
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
const DATA = { songs: songs.map(({ solos, ...rest }) => ({ ...rest, solos })) };
const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'songs.html'), html);
console.log(`wrote audition/songs.html — ${songs.length} vibe-prompted songs (10 + the buildup/drop song)`);
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
    HQ_AUDIO.src = 'hq/' + s.name + '.wav';
    HQ_AUDIO.currentTime = 0;
    try { await HQ_AUDIO.play(); } catch (e) { $('now').textContent = 'HQ playback failed: ' + e.message; return; }
    playing = s.name;
    $('now').textContent = '\\u25b6 ' + s.name + ' (HQ wav)';
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
  $('now').textContent = '\\u25b6 ' + s.name + ' (' + which + (hqMode && !s.hq ? ' \\u00b7 no HQ render' : '') + ')';
  render();
}
function stop() { rtStop(); HQ_AUDIO.pause(); HQ_AUDIO.currentTime = 0; playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }
function esc(t) { const d = document.createElement('div'); d.textContent = t == null ? '' : String(t); return d.innerHTML; }

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
