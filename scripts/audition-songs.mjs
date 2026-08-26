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

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileVibe } from '../src/lib/vibes.js';
import { exemplarPool, variationsOf, varyProgression } from '../src/lib/harmony-vary.js';
import { VERDICTS } from '../src/lib/verdicts.js';
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
  vs_happy_shop: { pattern: 'dp_boom_tap', note: 'very very chill beat, like waiting room or something' },
  vs_x_construction: { pattern: 'dp_working', note: 'relaxed chill beat. first two measures are a bit more energetic than last two' },
  vs_tense_fight: { pattern: 'dp_residual_stress_study', note: 'rising tension (video game)' },
  vs_triumphant_boss: { pattern: 'dp_8obit_electrowerk66', note: 'hot' },
};

const songs = [];
const CHECKS = [];
function buildSong(prompt, name, opts = {}) {
  const v = compileVibe({ ...prompt, name, ...(opts.bpm ? { bpm: opts.bpm } : {}) }); // prompt may carry a meter override (the drop song pins 4/4)
  const beats = Number(v.meter.split('/')[0]) || 4;
  const key = `${v.keyHint}:${v.family === 'minor' ? 'minor' : 'major'}`;

  // ---- harmony: a varied click-kept exemplar of the vibe's family ----------
  let famPool = EX.entries.filter(([n, e]) => clicked(n) && e.family === v.family);
  if (opts.loop4) {
    const four = famPool.filter(([, e]) => parseDegrees(e.degrees).length === 4);
    if (four.length) famPool = four;
  }
  const pool = famPool.length ? famPool : EX.entries.filter(([n]) => clicked(n));
  const [exName] = pool[fnv(`${name}|exemplar`) % pool.length];
  const vars = variationsOf(exName, {
    count: 1, intensity: 0.3 + v.colorBias * 0.4, budget: 2, seed: `${name}|harmony`,
  });
  const e = vars[0] ?? EX.entries.find(([n]) => n === exName)[1];
  const symbols = renderProgression(e, key);
  const plan4 = barPlan(symbols.length);
  const barSyms = plan4 ? symbols.flatMap((sym, i) => Array(plan4[i]).fill(sym)) : symbols;
  const loopBars = barSyms.length;
  const ctxBar = { harmony: barSyms, barsPerChord: 1, key };

  // ---- accompaniment: a ratified foundation in the vibe's classes ----------
  let accPool = RATIFIED_FND.filter(([, f]) => v.figClasses.includes(f.class) && f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === v.meter);
  if (!accPool.length) accPool = RATIFIED_FND.filter(([, f]) => f.meter_class === '4/4');
  const [accName, accFig0] = accPool[fnv(`${name}|acc`) % accPool.length];
  const accFig = { ...accFig0, name: accName };
  const accDensity = accFig.onsets.length / (accFig.bars ?? 1);
  const accOnsets = accFig.onsets;
  const accOct = Math.max(1, Math.min(3, v.register.accOctave));
  // D63 articulation: style-level duration + damper on top of each pattern's
  // own authored legato (bindFigure honours entry.legato; .clip scales it)
  const ART = v.articulation ?? { style: 'detached', pedal: false };
  const accFx = ART.pedal ? '.clip(1.25).room(0.4)'
    : ART.style === 'staccato' ? '.clip(0.55).room(0.15)'
    : ART.style === 'legato' ? '.clip(1.1).room(0.3)'
    : '.room(0.25)';
  const leadFx = ART.pedal ? '.gain(0.85).room(0.4).clip(1.15)' : '.gain(0.85).room(0.25)';
  const bindAcc = (fig, ctx) => bindFigure(fig, ctx, v.meter, { sound: 'piano', fx: accFx, octave: Math.max(1, Math.min(3, fig.octave ?? accOct)) }).expr;
  const base = bindAcc(accFig, ctxBar);

  // ---- melody + arrangement (the undertale mix pipeline) -------------------
  const leadCell = melodyRhythm(v.meter, v.bpm, name, { accDensity, accOnsets, beats });
  const leadSeed = fnv(name);
  const leadBound = bindMelody(leadCell, ctxBar, v.meter, {
    style: 'toby-fox', seed: leadSeed, octave: v.register.leadOctave, sound: 'piano', fx: leadFx,
  });
  const plan = planArrangement({
    name, song: name, family: v.family, role: v.role, moods: v.moods, instBias: v.instBias,
    bpm: v.bpm, meter: v.meter, loopBars,
    leadPeriod: leadBound.boundMeta.period,
    accDensity, accOctave: accOct, leadDensity: leadCell.density, palette: INSTRUMENTS,
  });
  // D62 ensemble dial: the vibe's voice count CAPS the cast before the form
  const fullCast = plan.layers.length;
  plan.layers = plan.layers.slice(0, v.ensemble.count);
  const renderCtx = (ctx) => renderArrangement(plan, {
    harmonyContext: ctx, meter: v.meter, style: 'toby-fox',
    leadRhythm: leadCell, leadSeed,
    counterRhythmFor: (target, seedName) => melodyRhythm(v.meter, v.bpm, seedName, { target, accOnsets, beats }),
    figureFor: () => accFig,
  });
  const rendered = renderCtx(ctxBar);
  const form = planForm(plan);
  const shaped = renderForm(rendered.layers, leadBound.expr, form);

  // ---- letters (D59) -------------------------------------------------------
  const mf = planMelodyForm(form, { name });
  const letterCellMemo = new Map([['A', leadCell]]);
  const letterCell = (L) => {
    if (!letterCellMemo.has(L)) {
      const used = [...letterCellMemo.values()].map((c) => c.name);
      letterCellMemo.set(L, melodyRhythm(v.meter, v.bpm, `${name}|${L}`, { accDensity, accOnsets, beats, exclude: used }));
    }
    return letterCellMemo.get(L);
  };
  const letterSeed = (L) => (L === 'A' ? leadSeed : fnv(`${name}|melody|${L}`));
  const bindLetter = (L, ctxL) => bindMelody(letterCell(L), ctxL, v.meter, {
    style: 'toby-fox', seed: letterSeed(L), octave: v.register.leadOctave, sound: 'piano', fx: leadFx,
  });

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
        const opts = {
          style: 'toby-fox', octave: l.octave, sound: l.instrument, fx: `.gain(${l.gain})`,
          seed: l.derives === 'lead' ? letterSeed(Ls[0]) : l.seed,
        };
        orig = bindMelody(letterCell(Ls[0]), ctxBar, v.meter, opts).expr;
        if (ctxBarV) variant = bindMelody(letterCell(Ls[0]), ctxBarV, v.meter, opts).expr;
      }
    }
    const act = maskBarsFor(l.id, form);
    const inVary = act.map((x, i) => (x && varyBars[i] ? 1 : 0));
    if (variant && inVary.some(Boolean)) {
      const outVary = act.map((x, i) => (x && !varyBars[i] ? 1 : 0));
      const parts = [`${variant}.mask("<${maskString(inVary)}>")`];
      if (outVary.some(Boolean)) parts.unshift(`${orig}.mask("<${maskString(outVary)}>")`);
      return parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`;
    }
    const m = maskString(act);
    return /^1(@\d+)?$/.test(m) ? orig : `${orig}.mask("<${m}>")`;
  });

  // ---- drums: vouched dp_* where a vibe note matches, else engine perc -----
  let drums = null;
  const drumInfo = [];
  const dpPick = !opts.dropIntro && v.percussion.presence !== 'none' ? (DP_DRUMS[name] ?? null) : null;
  if (dpPick) {
    const T = form.totalBars;
    const probe = dpStack(dpPick.pattern, {});
    const d = [16, 12, 8, 6, 4, 2, 1].find((x) => x <= probe.bars && T % x === 0) ?? 1;
    const { expr } = dpStack(dpPick.pattern, { from: 0, to: d, gainMul: PRESENCE_GAIN[v.percussion.presence] ?? 0.65 });
    const drumBars = form.sections.flatMap((sec) =>
      Array(sec.bars).fill((ENERGY[sec.archetype] ?? 3) >= 3 ? 1 : 0));
    if (drumBars.some(Boolean)) {
      const dm = maskString(drumBars);
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
      const stackd = parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`;
      drums = /^1(@\d+)?$/.test(dm) ? stackd : `${stackd}.mask("<${dm}>")`;
      drumInfo.push(...picks.map((p) => `${p} (${RHYTHMS[p].band}) at ${v.percussion.presence}`));
    }
  }

  const mixParts = [baseMix, ...(letterLead.lead ? [letterLead.lead] : []), ...layerMixExprs, ...(drums ? [drums] : [])];
  let mix = mixParts.length > 1 ? `stack(${mixParts.join(', ')})` : mixParts[0];

  const solos = { _acc: base, _lead: leadBound.expr, ...(drums ? { _drums: drums } : {}) };
  for (const l of rendered.layers) solos[l.id] = l.expr;

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
    cast: rendered.layers.map((l) => `${l.instrument} (${l.id})`),
    drums: drumInfo,
    salience: v.salience,
    articulation: `${ART.style}${ART.pedal ? ' + damper pedal' : ''}`,
    drop: dropInfo,
    mix, solos,
  });
  CHECKS.push([name, 'mix', mix, v.bpm, beats, totalBarsOut]);
  CHECKS.push([name, '_acc', base, v.bpm, beats, totalBarsOut]);
  if (drums) CHECKS.push([name, '_drums', drums, v.bpm, beats, totalBarsOut]);
}

for (const prompt of PROMPTS) buildSong(prompt, `vs_${prompt.emotion ?? 'x'}_${prompt.environment}`);
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
let playing = null;
const $ = (id) => document.getElementById(id);
const save = () => { localStorage.setItem(LS, JSON.stringify(verdicts)); localStorage.setItem(LSN, JSON.stringify(notes)); };
const solo = {};

function codeFor(s) {
  const which = solo[s.name] || 'mix';
  const expr = which === 'mix' ? s.mix : s.solos[which];
  if (!expr) return null;
  return 'setcpm(' + s.bpm + '/' + s.beats + ')\\np: stack(' + expr + ')';
}
async function play(s) {
  const code = codeFor(s);
  if (!code) return;
  $('now').textContent = RT.ready ? '…' : 'starting audio…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = s.name;
  $('now').textContent = '\\u25b6 ' + s.name + ' (' + (solo[s.name] || 'mix') + ')';
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '\\u2014 stopped \\u2014'; render(); }
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
$('export').onclick = function () {
  // DERIVED format (D60): page-local songs export degrees + exemplar base, so
  // import-verdicts.mjs lands them in DERIVED_VERDICTS unchanged
  const derived = {};
  Object.keys(verdicts).forEach(function (n) {
    const s = DATA.songs.find(function (x) { return x.name === n; });
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
