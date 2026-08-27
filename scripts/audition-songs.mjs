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
import { VERDICTS, DERIVED_VERDICTS } from '../src/lib/verdicts.js';
import { renderProgression } from '../src/binder/harmony.js';
import { parseDegrees } from '../src/lib/progressions.js';
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
function melodyRhythm(meter, bpm, seedName, { target: forced = null, accDensity = 0, accOnsets = null, beats = 4, exclude = [] } = {}) {
  const target = forced ?? melodyDensityTarget(bpm, accDensity);
  let pool = MEL_CELLS.filter((c) => c.meter_class === meter);
  if (!pool.length) pool = MEL_CELLS.filter((c) => c.meter_class === '4/4');
  if (exclude.length) {
    const rest = pool.filter((c) => !exclude.includes(c.name));
    if (rest.length) pool = rest;
  }
  let band = pool.filter((c) => Math.abs(c.density - target) <= DENSITY_BAND);
  if (!band.length) {
    const sorted = pool.map((c) => ({ c, d: Math.abs(c.density - target) })).sort((a, b) => a.d - b.d);
    band = sorted.filter((x) => x.d <= sorted[0].d + 1).map((x) => x.c);
  }
  const accSet = new Set(accOnsets ? barSteps(accOnsets) : []);
  const ranked = band
    .map((c) => ({ c, s: interlockScore(accSet, c, beats) }))
    .sort((a, b) => b.s - a.s || b.c.seen - a.c.seen || (a.c.name < b.c.name ? -1 : 1));
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
  const sound = BAND_SOUND[entry.band] ?? 'sd';
  const gmax = PRESENCE_GAIN[presence] ?? 0.6;
  const slots = Array(G * r.bars).fill('~');
  const gains = Array(G * r.bars).fill('0');
  r.onsets.forEach(([n, d], i) => {
    const ix = Math.round((n / d) * G);
    if (ix < slots.length) { slots[ix] = sound; gains[ix] = String(Math.round(r.accents[i] * gmax * 100) / 100); }
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
  const v = compileVibe({ ...prompt, name, ...(opts.bpm ? { bpm: opts.bpm } : {}) }); // prompt may carry a meter override (the drop song pins 4/4)
  const beats = Number(v.meter.split('/')[0]) || 4;
  const key = `${v.keyHint}:${v.family === 'minor' ? 'minor' : 'major'}`;

  // ---- harmony: a varied click-kept exemplar of the vibe's family ----------
  const judged = DERIVED_VERDICTS?.[name];
  const priorKeep = judged?.verdict === 'keep';
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
  // D64 (his calm-water kill: "chord progression isn't good" on a dim chain):
  // a low-chromaticism vibe prefers PLAIN-TRIAD exemplars (the D51 taste
  // signal). Applied only where no keep is at stake — a song he kept must not
  // re-roll its harmony under a rule change.
  if (!priorKeep && (v.colorBias ?? 0) <= 0.2 && famPool.length > 3) {
    const plainness = (deg) => {
      const t = deg.split(' ');
      return t.filter((x) => !x.includes(':') || /:m$/.test(x)).length / t.length;
    };
    const ranked = [...famPool].sort((a, b) => plainness(b[1].degrees) - plainness(a[1].degrees) || a[0].localeCompare(b[0]));
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
  const [exName] = (priorKeep || opts.keepBase) && judged?.base && EX.entries.some(([n]) => n === judged.base)
    ? [judged.base]
    : pool[fnv(`${name}|exemplar`) % pool.length];
  const vars = variationsOf(exName, {
    count: 1, intensity: 0.3 + v.colorBias * 0.4, budget: 2, seed: `${name}|harmony`,
  });
  let e = vars[0] ?? EX.entries.find(([n]) => n === exName)[1];
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
    const [from, to] = opts.fixChord;
    e = {
      ...e, degrees: e.degrees.split(' ').map((t) => (t === from ? to : t)).join(' '), numerals: null,
      lineage: { ...(e.lineage ?? {}), ops: [...(e.lineage?.ops ?? []), { op: `fixChord ${from}->${to} (D73)` }], changed: true },
    };
  }
  const symbols = renderProgression(e, key);
  const plan4 = barPlan(symbols.length);
  const barSyms = plan4 ? symbols.flatMap((sym, i) => Array(plan4[i]).fill(sym)) : symbols;
  const loopBars = barSyms.length;
  const ctxBar = { harmony: barSyms, barsPerChord: 1, key };

  // ---- accompaniment: a ratified foundation in the vibe's classes ----------
  let accPool = RATIFIED_FND.filter(([, f]) => v.figClasses.includes(f.class) && f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === '4/4');
  // D65 (aftermath: "too uniform where it's just one chord repeated again and
  // again slowly") — a song may ask for a MOVING class outright
  if (opts.accClassPrefer) {
    const pref = accPool.filter(([, f]) => f.class === opts.accClassPrefer);
    if (pref.length) accPool = pref;
  }
  const [accName, accFig0] = accPool[fnv(`${name}|acc`) % accPool.length];
  // D73 (kitchen, the THIRD "way too hyper", now aimed at the piano: "still
  // way too hyper in the piano key. like way too hyper and fast"): a very
  // fast staccato 2/4 song halves the piano's pulse — the same figure spans
  // two bars, so the oom-pah breathes at half rate while the tempo (and the
  // drums he already approved) stays. The lead thins below, same trigger.
  const accHalfTime = v.meter === '2/4' && v.bpm >= 150 && (v.articulation?.style === 'staccato');
  const accFig = { ...accFig0, name: accName, ...(accHalfTime ? { bars: (accFig0.bars ?? 1) * 2 } : {}) };
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
  const accOnsets = accFig.onsets;
  const accOct = Math.max(1, Math.min(3, v.register.accOctave));
  // D63 articulation: style-level duration + damper on top of each pattern's
  // own authored legato (bindFigure honours entry.legato; .clip scales it)
  const ART = v.articulation ?? { style: 'detached', pedal: false };
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
  // D64/D65 (his boss note, twice): when foreground drums play, the melody
  // rides louder — the boost stepped 0.12 → 0.18 ("could still be a bit louder")
  const leadGain = Math.min(1, Math.round((0.85 * LEAD.gainMul + (v.percussion.presence === 'foreground' ? 0.18 : 0)) * 100) / 100);
  const accFx = ART.pedal ? '.clip(1.25).room(0.5)'
    : ART.style === 'staccato' ? '.clip(0.55).room(0.15)'
    : ART.style === 'legato' ? '.clip(1.1).room(0.3)'
    : '.room(0.25)';
  // D65/D67 (cave/snow round 2, then cave + water round 3 — "more reverb"
  // three times): the pedal vibes' whole piano sits in a wetter room
  const leadFx = ART.pedal ? `.gain(${leadGain}).room(0.7)` : `.gain(${leadGain}).room(0.25)`;
  // D81: loopRoots everywhere (the D76 spiral guard); the accToBass branch
  // binds gainRange so its accents sound (D78) instead of one flat velocity
  const bindAcc = (fig, ctx) => bindFigure(fig, ctx, v.meter, {
    sound: accToBass ? 'gm_synth_bass_1' : 'piano',
    loopRoots: true,
    ...(accToBass ? { gainRange: [0.6, 0.95] } : {}),
    fx: accToBass ? '.room(0.15).clip(0.95)' : accFx,
    // the vibe's accFloor lifts a pattern's home octave (water: "too low"),
    // never lowers it — a wide oom-pah keeps its cellar
    octave: Math.max(1, Math.min(4, Math.max(fig.octave ?? accOct, v.register.accFloor ?? 0))),
  }).expr;
  const base = bindAcc(accFig, ctxBar);

  // ---- melody + arrangement (the undertale mix pipeline) -------------------
  const leadTarget = Math.max(2, Math.round(melodyDensityTarget(v.bpm, accDensity) * LEAD.densityMul));
  const leadCell = melodyRhythm(v.meter, v.bpm, name, { target: leadTarget, accDensity, accOnsets, beats });
  const leadSeed = fnv(name);
  const leadBound = bindMelody(leadCell, ctxBar, v.meter, {
    style: 'toby-fox', seed: leadSeed, octave: v.register.leadOctave, sound: 'piano', fx: leadFx,
    hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: opts.articFloor ?? null,
  });
  // D73: half-time thinning changes only the SOUNDING piano — the planner
  // still sees the pre-thinning lead (the 0.55 fast-song cap), or the cast
  // re-rolls under the new numbers (measured twice on kitchen: first a
  // pizzicato appeared, then a xylophone — extra voices on the song he
  // wants calmer)
  let planCell = leadCell, planPeriod = leadBound.boundMeta.period;
  if (accHalfTime) {
    const t0 = Math.max(2, Math.round(melodyDensityTarget(v.bpm, accDensity) * 0.55));
    planCell = melodyRhythm(v.meter, v.bpm, name, { target: t0, accDensity, accOnsets, beats });
    planPeriod = bindMelody(planCell, ctxBar, v.meter, {
      style: 'toby-fox', seed: leadSeed, octave: v.register.leadOctave, sound: 'piano', fx: leadFx,
      hold: LEAD.hold, mergeRepeats: LEAD.merge, articFloor: opts.articFloor ?? null,
    }).boundMeta.period;
  }
  const plan = planArrangement({
    name, song: name, family: v.family, role: v.role, moods: v.moods, instBias: v.instBias,
    bpm: v.bpm, meter: v.meter, loopBars,
    leadPeriod: planPeriod,
    accDensity, accOctave: accOct, leadDensity: planCell.density, palette: INSTRUMENTS,
  });
  // D62 ensemble dial: the vibe's voice count CAPS the cast before the form
  const fullCast = plan.layers.length;
  plan.layers = plan.layers.slice(0, v.ensemble.count);
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
        l.octave = Math.min(l.octave, Math.max(3, v.register.leadOctave - 2));
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
        instrument: 'gm_string_ensemble_1', octave: 4, gain: 0.42, mass: 0.7,
        entry: 'bed', canLead: false, addsDensity: 0, seed: fnv(`${name}::strings_pad`),
      });
    }
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
    leadOpts: { hold: LEAD.hold, mergeRepeats: LEAD.merge },
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
      letterCellMemo.set(L, melodyRhythm(v.meter, v.bpm, `${name}|${L}`, { target: leadTarget, accDensity, accOnsets, beats, exclude: used }));
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
  const HANDOFF_POOL = ['gm_flute', 'gm_vibraphone', 'gm_epiano1'];
  const letterSound = (L) => {
    if (L === 'A' || castHasMelodyVoice || opts.noHandoff) return 'piano';
    const others = [...new Set((mf.sections ?? []).map((x) => (x.letter ?? '').replace('*', '')).filter((x) => x && x !== 'A'))].sort();
    const ix = others.indexOf(L);
    if (ix < 0) return 'piano';
    return HANDOFF_POOL[(fnv(`${name}|handoff`) + ix) % HANDOFF_POOL.length];
  };
  const bindLetter = (L, ctxL) => {
    const snd = letterSound(L);
    return bindMelody(letterCell(L), ctxL, v.meter, {
      style: 'toby-fox', seed: letterSeed(L), octave: v.register.leadOctave, sound: snd, fx: leadFx,
      hold: snd === 'gm_flute' ? true : LEAD.hold, mergeRepeats: LEAD.merge, articFloor: opts.articFloor ?? null,
    });
  };

  // ---- the treat (D59): harmony varies at the last reprise -----------------
  let vary = null;
  if (mf.varySection != null) {
    const t = varyProgression(e, {
      budget: 1, intensity: 0.4, seed: `${name}|treat`,
      allow: ['recolour', 'suspend', 'mixture', 'alter_dominant'],
    });
    if (t.lineage.changed) vary = t;
  }
  let mfx = mf;
  let ctxBarV = null;
  let renderedV = null;
  let varyInfo = null;
  const varyBars = form.sections.flatMap((sec) => Array(sec.bars).fill(sec.index === mf.varySection ? 1 : 0));
  if (vary) {
    const symbolsV = renderProgression(vary, key);
    const barSymsV = plan4 ? symbolsV.flatMap((sym, i) => Array(plan4[i]).fill(sym)) : symbolsV;
    ctxBarV = { harmony: barSymsV, barsPerChord: 1, key };
    varyInfo = { op: vary.lineage.ops[0]?.op ?? vary.lineage.ops[0], symbols: symbolsV };
    renderedV = renderCtx(ctxBarV);
    const vs = mf.sections.find((s) => s.varyHarmony);
    mfx = {
      ...mf,
      sections: mf.sections.map((s) => (s.varyHarmony ? { ...s, letter: `${s.letter}*` } : s)),
      letters: [...mf.letters, `${vs.letter}*`],
    };
  }

  // ---- tone travel (D62): each new letter's accompaniment walks an edge ----
  const extraLetters = [...new Set(mf.sections.map((s) => s.letter).filter((L) => L && L !== 'A'))];
  const edgesFrom = FND_TRAVEL
    .filter((t) => t.a === accName || t.b === accName)
    .map((t) => ({ other: t.a === accName ? t.b : t.a, cost: t.cost, devices: t.devices }))
    .filter((t) => FIGURATIONS_FOUNDATION[t.other]?.ratified && FIGURATIONS_FOUNDATION[t.other].meter_class === v.meter);
  const letterFig = new Map([['A', accFig]]);
  const travelInfo = [];
  extraLetters.forEach((L, i) => {
    const edge = edgesFrom[i] ?? null;
    if (edge) {
      letterFig.set(L, { ...FIGURATIONS_FOUNDATION[edge.other], name: edge.other });
      travelInfo.push(`${L}: ${accName} → ${edge.other} (${edge.devices[0]}, cost ${edge.cost})`);
    } else {
      letterFig.set(L, accFig);
    }
  });
  // per-bar accompaniment: which figuration, over which harmony
  const barLetter = form.sections.flatMap((sec) => {
    const L = mfx.sections.find((x) => x.index === sec.index)?.letter ?? null;
    return Array(sec.bars).fill(L);
  });
  const comboMask = new Map(); // `${fig.name}|${variant}` -> bars 0/1
  barLetter.forEach((L, bar) => {
    const base0 = L && L.endsWith('*') ? L.slice(0, -1) : L;
    const fig = letterFig.get(base0) ?? accFig;
    const variant = ctxBarV != null && varyBars[bar] === 1;
    const k = `${fig.name}|${variant ? 'v' : 'o'}`;
    if (!comboMask.has(k)) comboMask.set(k, { fig, variant, bars: Array(barLetter.length).fill(0) });
    comboMask.get(k).bars[bar] = 1;
  });
  const basePieces = [...comboMask.values()].map(({ fig, variant, bars }) => {
    const expr = bindAcc(fig, variant ? ctxBarV : ctxBar);
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
          hold: sustainy || LEAD.hold, mergeRepeats: l.derives === 'lead',
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
    const wave = (center) => `"<${[0.85, 1, 1.12, 0.97].map((m) => Math.round(center * m * 100) / 100).join(' ')}>"`;
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
      return `${base}.gain(${wave(k[1] === 's' ? l.gain * 1.15 : l.gain * 0.72)})`;
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
  } else if (!opts.dropIntro && v.percussion.presence !== 'none' && v.percussion.patterns.length) {
    const byBand = (band) => v.percussion.patterns.find((p) => RHYTHMS[p]?.band === band);
    const picks = [...new Set([byBand('low') ?? v.percussion.patterns[0], byBand('high')].filter(Boolean))].slice(0, 2);
    const drumBars = form.sections.flatMap((sec) =>
      Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    if (drumBars.some(Boolean)) {
      const parts = picks.map((p) => drumExpr(p, v.percussion.presence));
      const dm = maskString(drumBars);
      drumBarsShared = drumBars;
      const stackd = parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`;
      drums = /^1(@\d+)?$/.test(dm) ? stackd : `${stackd}.mask("<${dm}>")`;
      drumInfo.push(...picks.map((p) => `${p} (${RHYTHMS[p].band}) at ${v.percussion.presence}`));
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
  const varySplit = (bindFn, bars) => {
    const pieces = [];
    const out = bars.map((x, i) => (x && !(ctxBarV && varyBars[i]) ? 1 : 0));
    if (out.some(Boolean)) pieces.push(`${bindFn(ctxBar)}.mask("<${maskString(out)}>")${rampMul(out)}`);
    if (ctxBarV) {
      const inn = bars.map((x, i) => (x && varyBars[i] ? 1 : 0));
      if (inn.some(Boolean)) pieces.push(`${bindFn(ctxBarV)}.mask("<${maskString(inn)}>")`);
    }
    return pieces;
  };
  if (opts.texture) {
    const tPool = RATIFIED_FND.filter(([n, f]) => f.class === opts.texture.class && f.meter_class === v.meter && n !== accName);
    if (tPool.length) {
      const [tName, tFig0] = tPool[fnv(`${name}|texture`) % tPool.length];
      const tFig = { ...tFig0, name: tName };
      const bindT = (ctx) => bindFigure(tFig, ctx, v.meter, { sound: 'piano', loopRoots: true, gainRange: [0.22, 0.42], fx: accFx, octave: opts.texture.octave }).expr;
      const tBars = form.sections.flatMap((sec) => Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 4 ? 1 : 0));
      if (tBars.some(Boolean)) {
        extraParts.push(...varySplit(bindT, tBars));
        extraSolos._texture = bindT(ctxBar);
        extraInfo.push(`texture ${tName} (${opts.texture.class}, oct ${opts.texture.octave})`);
      }
    }
  }
  // D73 ("also for appropriate songs i want to try a deep bass like in
  // beats. does strudel have a sound for that?" — yes: the pure sine at
  // octave 1 IS the beats sub, the same physics as an 808's body): on fast
  // beat-forward songs a sub-bass holds the chord root at octave 1, masked
  // to the same bars the beat plays, so bass and beat arrive as one floor.
  // Policy, not a song patch: any driving/foreground drum song >= 140bpm.
  if (accToBass) {
    extraInfo.push('bass pulse: acc roots on gm_synth_bass_1 (the piano low part IS the bass — his fight note)');
  } else if (drumBarsShared && v.bpm >= 140 && ['driving', 'foreground'].includes(v.percussion.presence)) {
    // D73 (+addendum 2): where the acc is NOT a root pulse the bass can
    // take over (boss's 16th octave-bounce stays piano), the sub instead
    // HOLDS the bar root under the beat — on gm_synth_bass_1, not bare
    // sine, and at octave 2: "i can't hear it" killed the pure sine.
    const subFig = { name: 'sub-bass', bars: 1, onsets: ['0'], figure: ['R'], accents: [0.8], legato: true };
    const bindSub = (ctx) => bindFigure(subFig, ctx, v.meter, { octave: 2, sound: 'gm_synth_bass_1', loopRoots: true, gainRange: [0.6, 0.9], fx: '.clip(1.02)' }).expr;
    extraParts.push(...varySplit(bindSub, drumBarsShared));
    extraSolos._sub_bass = bindSub(ctxBar);
    extraInfo.push('sub-bass: gm_synth_bass_1 held roots (oct 2) under the beat');
  }
  if (opts.counterline) {
    const clFig = { name: 'counterline', bars: 1, onsets: ['0'], figure: ['3'], accents: [0.72], legato: true };
    // D67 (fight: "strings a bit too loud"): 0.42 → 0.3
    // D81 (strings "too loud" four rounds running on the lab): whisper band
    const bindCl = (ctx) => bindFigure(clFig, ctx, v.meter, { octave: 4, sound: 'gm_string_ensemble_1', loopRoots: true, gainRange: [0.12, 0.24], fx: '.room(0.45)', rhythmName: 'counterline' }).expr;
    const clBars = form.sections.flatMap((sec) => Array(sec.bars).fill(sec.lead !== 'none' ? 1 : 0));
    if (clBars.some(Boolean)) {
      extraParts.push(...varySplit(bindCl, clBars));
      extraSolos._counterline = bindCl(ctxBar);
      extraInfo.push('counterline: held guide-tones (strings, oct 4)');
    }
  }

  const mixParts = [
    withCurve(baseMix),
    ...(letterLead.lead ? [withCurve(letterLead.lead, true)] : []),
    ...layerMixExprs.map((x, i) => withCurve(x, shaped.layers[i]?.derives === 'lead' || shaped.layers[i]?.derives === 'lead-rhythm')),
    ...extraParts.map((x) => withCurve(x)),
    ...(drums ? [withCurve(drums)] : []),
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
    const basePieces2 = [...comboMask.values()].map(({ fig, variant, bars }) =>
      `${bindAcc(fig, variant ? ctxBarV : ctxBar)}.mask("<${pre(bars)}>")`);
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
    const mainParts = [...basePieces2, ...leadPieces, ...layerPieces, `${dBody}.mask(${gateMain})`];
    mix = `stack(${introParts.join(', ')}, ${mainParts.join(', ')})`;
    solos._intro = `stack(${introParts.join(', ')})`;
    solos._dropdrums = dBody;
    totalBarsOut = T + 4;
    dropInfo = `4-bar buildup (drums \u2192 +drone \u2192 +accompaniment \u2192 +riser), never looped inside the song body; drop at bar 5 with every voice in. Drums: ${opts.dropIntro.pattern} \u2014 his note: \u201c${opts.dropIntro.note}\u201d`;
    drumInfo.push(`${opts.dropIntro.pattern} buildup bars 1-4, loop body bars 5-8`);
  }

  songs.push({
    name, prompt, vibeNotes: v.notes,
    key, bpm: v.bpm, meter: v.meter, beats, totalBars: totalBarsOut,
    family: v.family, role: v.role,
    exemplar: exName, ops: (e.lineage?.ops ?? []).map((o) => o.op ?? o),
    degrees: e.degrees, symbols, numerals: e.numerals ?? null,
    accompaniment: accName, accClass: accFig.class,
    scheme: mf.scheme, letters: mf.letters, travel: travelInfo,
    treat: varyInfo ? { op: varyInfo.op, symbols: varyInfo.symbols } : null,
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
  vs_x_construction: { articFloor: 0.9 },
  // r2: mid-octave offbeat texture + held guide-tone counterline
  vs_tense_fight: { texture: { class: 'offbeat', octave: 4 }, counterline: true },
  // r2: "too uniform" + "more layers as soft support"; r3 still: forced AB
  // scheme so the accompaniment actually TRAVELS, pad breathes from bar 1
  vs_somber_aftermath: { accClassPrefer: 'arp', stringsPad: 'add', padFromStart: true, scheme: 'AB' },
  // r2: strings "can't hear them" + secondary melody "way too high";
  // r3: strings "should start from the beginning but very soft"
  vs_mysterious_cave: { stringsPad: true, capMelody: true, padFromStart: true },
  // r2: strings pad; r3: "from the beginning ... the setting should begin
  // as it starts playing (as its in the snow)"
  vs_nostalgic_snow: { stringsPad: true, padFromStart: true },
  // r3 kill faults the MIX not the harmony ("more reverb ... pad too loud
  // ... vary fluidly in dynamics") — base stays, pad breathes from bar 1
  vs_calm_water: { keepBase: true, padFromStart: true, fixChord: ['0:7', '9:m'], padGainMul: 0.85 },
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
