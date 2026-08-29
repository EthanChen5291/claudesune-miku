#!/usr/bin/env node
// THE CORPUS SUITE — songs written from natural-language prompts, built by
// composing the measured techniques in scripts/corpus-techniques.mjs.
//
// WHY A SEPARATE GENERATOR. scripts/audition-songs.mjs is owned by another
// session this round and carries 43 judged songs with per-song pins; touching it
// risks moving judged material. This builds alongside it, imports src/ read-only,
// and emits its own page. Nothing here writes to src/ or to audition/songs.html.
//
// WHAT IS BEING TESTED. Each song states, in its own log, which measured
// mechanisms it combines and what the corpus number behind each one was. The
// point is to hear whether the measurements produce music, not to prove them.
//
// PROMPTS ARE REAL SENTENCES. His ask: "instead of just like 'x emotion x
// atmosphere' do like real prompts that users would do". So the input is the kind
// of thing someone actually types, and a parser maps it onto the engine's vibe
// vocabulary plus technique selections — which is itself part of what is being
// auditioned, because a wrong parse is a wrong song.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileVibe } from '../src/lib/vibes.js';
import { renderProgression } from '../src/binder/harmony.js';
import { parseDegrees } from '../src/lib/progressions.js';
import { bindFigure, bindMelody } from '../src/binder/bind.js';
import { MELODY_RHYTHMS_UNDERTALE } from '../src/lib/rhythms-undertale.js';
import { INSTRUMENTS } from '../src/lib/instruments.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { chordTones } from '../src/harness/chords.js';
import { dpStack } from './drum-render.js';
import * as T from './corpus-techniques.mjs';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const pcOf = (sym) => { const m = String(sym).match(/^([A-G])([b#]?)/); return m ? (PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12 : 0; };
const NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// ============================================================ NL PROMPT PARSER
//
// Moved to src/lib/prompt-parse.js (r21 A/B build) so the engine backend reads
// the same words out of the same sentence. Re-exported here: this page and the
// comparison page must agree on what a prompt MEANS, or the A/B is measuring
// the parser instead of the music.
import { parsePrompt } from '../src/lib/prompt-parse.js';
export { parsePrompt };

// ============================================================ HARMONY BUILDER

/**
 * Build a progression by COMPOSING the measured harmonic mechanisms rather than
 * retrieving a canned one:
 *   - root motion from the measured axis distribution (static 29.8 / step 26.2 /
 *     fifth 22.9 / third 19.4) — step + static outweigh fifth motion
 *   - RECOLOUR as a first-class move (29.4% of all change events)
 *   - modal degrees as base furniture (bVI 79.1%, bVII 77.4%, iv 60.0% in minor)
 *   - the pre-tonic approach drawn from a mode-weighted pool, not a dominant rule
 *   - COLOUR CONTOUR: rich on the approach, plain on the arrival
 *   - PLANING as a legal move
 */
function buildHarmony(seed, keyMode, tonicPc, len, { colourBias = 0, thirdless = 0 } = {}) {
  const log = [];
  const roots = [tonicPc];
  const ops = ['tonic'];
  for (let i = 1; i < len; i++) {
    const s = `${seed}|h${i}`;
    // land the approach chord before a planned tonic return at the end
    if (i === len - 1) { roots.push(tonicPc); ops.push('return'); continue; }
    if (i === len - 2) { roots.push((tonicPc + T.approachRoot(keyMode, s)) % 12); ops.push('approach'); continue; }
    const modal = T.MODAL_DEGREES[keyMode] ?? T.MODAL_DEGREES.minor;
    if (T.rnd(`${s}|modal`) < 0.34) { roots.push((tonicPc + modal[Math.floor(T.rnd(`${s}|md`) * modal.length)]) % 12); ops.push('modal'); continue; }
    roots.push(T.nextRoot(roots[i - 1], s)); ops.push('motion');
  }
  // qualities, with the colour contour applied
  const bias = roots.map((r, i) => {
    const nextIsTonic = i + 1 < roots.length && roots[i + 1] === tonicPc;
    const isTonic = r === tonicPc;
    return colourBias + (isTonic ? -0.35 : nextIsTonic ? 0.45 : 0);
  });
  let syms = roots.map((r, i) => {
    const thin = T.rnd(`${seed}|3l${i}`) < thirdless;
    return NAMES[r] + T.qualityFor((r - tonicPc + 12) % 12, keyMode, `${seed}|q${i}`, { colourBias: bias[i], thirdless: thin });
  });
  // RECOLOUR pass: a static-root repeat becomes a re-spelling, never a literal repeat
  let recolours = 0;
  for (let i = 1; i < syms.length; i++) {
    if (roots[i] !== roots[i - 1]) continue;
    syms[i] = T.recolour(syms[i - 1], keyMode, `${seed}|rc${i}`);
    if (syms[i] !== syms[i - 1]) { recolours++; ops[i] = 'recolour'; }
  }
  // PLANING: occasionally slide the previous quality to the new root
  let planes = 0;
  for (let i = 1; i < syms.length; i++) {
    if (roots[i] === roots[i - 1] || T.rnd(`${seed}|pl${i}`) > 0.18) continue;
    const q = syms[i - 1].replace(/^[A-G][b#]?/, '');
    syms[i] = NAMES[roots[i]] + q; planes++; ops[i] = 'plane';
  }
  log.push(`roots ${roots.map((r) => NAMES[r]).join(' ')}`);
  log.push(`ops ${ops.join(' ')}`);
  log.push(`${recolours} recolour(s), ${planes} planing move(s)`);
  return { symbols: syms, roots, ops, log };
}

// ============================================================ SONG BUILDER

const MEL_CELLS = Object.entries(MELODY_RHYTHMS_UNDERTALE).map(([name, e]) => ({ name, ...e }));

function buildSong(promptText, name, tweaks = {}) {
  const P = parsePrompt(promptText);
  const seed = name;
  const exp = [];       // the experiment log
  const spec = { emotion: P.emotion, environment: P.environment, name };
  // D93: a horror lane whose modal retrieval lands a BRIGHT major trope reads
  // lullaby, not mysterious — pin the family. The emotion's family override is
  // what does it: "fighting undead in the catacombs" compiled to F MAJOR because
  // `excited` overrode the lane. Corpus agrees the lanes are minor-leaning
  // (creepy 77%, menacing 71%, haunted 62% vs a 54% baseline).
  const HORROR_LANES = new Set(['manor', 'catacombs', 'citadel', 'cave']);
  if (HORROR_LANES.has(P.environment) && P.emotion !== 'triumphant') spec.family = 'minor';
  const v = compileVibe(spec);
  const keyMode = v.family === 'major' ? 'major' : 'minor';
  const tonicPc = pcOf(v.keyHint.split(':')[0]);
  const key = `${NAMES[tonicPc]}:${keyMode}`;
  let bpm = v.bpm;
  if (P.mods.tempo) bpm = Math.max(50, Math.min(190, Math.round(bpm * (1 + P.mods.tempo))));
  const beats = Number(v.meter.split('/')[0]);

  exp.push(`PARSE  "${promptText}"`);
  exp.push(`  -> emotion=${P.emotion ?? '(none)'} environment=${P.environment ?? '(none)'}` +
    (P.altEmotions.length || P.altEnvironments.length ? `  [also saw ${[...P.altEmotions, ...P.altEnvironments].join(', ')}]` : '') +
    (Object.keys(P.mods).length ? `  mods=${JSON.stringify(P.mods)}` : ''));
  exp.push(`  -> key ${key}, ${bpm}bpm, ${v.meter}`);

  // ---- HARMONY -------------------------------------------------------------
  const progLen = 4 + Math.floor(T.rnd(`${seed}|plen`) * 3) * 2;   // 4, 6 or 8 chords
  const colourBias = 0.15 + (P.mods.sparse ? -0.1 : 0) + (P.emotion === 'scary' || P.emotion === 'somber' ? 0.1 : 0);
  const thirdlessRate = P.environment === 'desert' ? 0.29 : P.environment === 'space' ? 0.18 : 0.12;
  const H = buildHarmony(seed, keyMode, tonicPc, progLen, { colourBias, thirdless: thirdlessRate });
  exp.push(`HARMONY  ${H.symbols.join(' ')}`);
  for (const l of H.log) exp.push(`  ${l}`);
  exp.push(`  colour contour: rich on the approach, plain on the arrival (corpus: 17.7% triad approaching a tonic vs 29.5% on it)`);
  exp.push(`  thirdless rate ${thirdlessRate} (corpus desert 0.29 vs 0.18 baseline)`);

  // DIALECT GUARD — an unknown symbol yields an empty tone set and the binder
  // silently substitutes fixed default intervals. Fail loudly instead.
  const bad = T.badSymbols(H.symbols, chordTones);
  if (bad.length) throw new Error(`${name}: illegal chord symbol(s) ${bad.join(', ')} — voicing library returns no tones, figures would use default intervals`);

  const totalBars = 32;
  const barSyms = Array.from({ length: totalBars }, (_, b) => H.symbols[b % H.symbols.length]);
  const ctx = { harmony: barSyms, barsPerChord: 1, key };

  // ---- THE ACCOMPANIMENT HAND ---------------------------------------------
  // Thickness comes from STACKING THIN PARTS (single acc part reaches >=4 notes
  // on 5.4% of attacks; the whole hand on 21.2%), and the layers must differ in
  // onset density by a MULTIPLE (pad 0.89 / acc 2.88 / arp 7.81).
  const handParts = [];
  const handRoles = P.mods.sparse ? ['pad', 'acc'] : P.mods.dense ? ['pad', 'acc', 'arp'] : ['pad', 'acc'];
  // Energy raises the hand's onset count. Corpus: battle/boss carry the highest
  // melodic and drum density of any lane, and a 174bpm action cue that strikes
  // twice a bar is not an action cue.
  const energy = ['excited', 'tense', 'triumphant'].includes(P.emotion) ? 1.9
    : ['scary', 'happy', 'goofy'].includes(P.emotion) ? 1.35
    : ['somber', 'sad', 'calm', 'nostalgic'].includes(P.emotion) ? 0.7 : 1;
  handRoles.forEach((role, ri) => {
    const dens = T.densityFor(role, `${seed}|${role}`) * (role === 'pad' ? 1 : energy);
    const n = Math.max(1, Math.round(dens));
    const toks = role === 'pad'
      ? [T.figureMember(`${seed}|pad`, { colour: colourBias })]
      : T.dyadTokens(n, `${seed}|${role}`, { colour: colourBias + 0.2 });
    // PHASE-OFFSET each hand part. The stratification finding is that layers
    // differ in onset density by a MULTIPLE — if they also share a phase they
    // collapse into one homorhythmic block, which measured as 0% single-note and
    // ~48% four-note attacks on two songs: every part striking together. Offset
    // the grid so coincidence is partial and the vertical width VARIES.
    const grid = beats * 4;
    const phase = ri === 0 ? 0 : Math.round((grid / Math.max(2, n)) * (ri / handRoles.length));
    const onsets = Array.from({ length: toks.length }, (_, i) =>
      `${(Math.round(i * grid / toks.length) + phase) % grid}/${grid}`);
    const order = onsets.map((o, i) => [Number(o.split('/')[0]), i]).sort((a, b) => a[0] - b[0]);
    handParts.push({
      role, dens,
      toks: order.map(([, i]) => toks[i]),
      onsets: order.map(([p]) => `${p}/${grid}`),
    });
  });
  exp.push(`HAND  ${handParts.map((h) => `${h.role}(${h.toks.length} onsets/bar: ${h.toks.join(' ')})`).join('  ')}`);
  exp.push(`  interval-above-bass sampled from the measured 12-class distribution, not {R,b3,3,5} (corpus 65.2% core vs engine 99.3%)`);
  exp.push(`  dyad ostinato is the DEFAULT acc shape (corpus: half of acc parts never exceed 2 notes)`);
  exp.push(`  densities differ by a multiple: ${handParts.map((h) => h.dens.toFixed(2)).join(' / ')}`);

  // ---- FORM ---------------------------------------------------------------
  const introBars = P.mods.ambient ? 0 : T.pick(T.INTRO_BARS, `${seed}|intro`);
  const layerIds = ['pad', 'acc', 'bass', 'lead', 'companion'];
  const entries = T.staggerOpening(layerIds, `${seed}|stag`);
  // entry jitter around the 4-bar grid for anything entering mid-piece
  const jittered = {};
  for (const [id, bar] of Object.entries(entries)) {
    jittered[id] = bar === 0 ? 0 : T.jitterEntry(Math.max(1, Math.round(bar / 4) * 4), `${seed}|${id}`, { min: 1, max: 12 });
  }
  exp.push(`FORM  intro ${introBars} bars (corpus: bars not seconds; 38.5% of intros are ODD, 48% have none)`);
  exp.push(`  entries ${Object.entries(jittered).map(([k, b]) => `${k}@${b}`).join(' ')}`);
  exp.push(`  entry jitter drawn from {-1:20.4%, 0:43.1%, +1:20.6%, +2:15.8%} around the 4-bar grid`);
  exp.push(`  (corpus: 51.4% of layer entries land on an ODD bar; engine ships 139/139 on a boundary)`);
  const holdout = T.holdoutFraction(layerIds.length);
  exp.push(`  roster ${layerIds.length} -> holdout ${(100 * holdout).toFixed(0)}% (corpus: >=6 parts fail to assemble 64% of the time)`);

  // ---- MELODY -------------------------------------------------------------
  const heldT = P.emotion === 'somber' || P.emotion === 'sad' ? 0.85
    : P.emotion === 'calm' || P.emotion === 'nostalgic' ? 0.65
    : P.emotion === 'tense' || P.emotion === 'excited' ? 0.12 : 0.4;
  const prof = T.heldProfile(heldT);
  const cell = MEL_CELLS[Math.floor(T.rnd(`${seed}|cell`) * MEL_CELLS.length)];
  const artic = T.pick(T.ARTIC, `${seed}|artic`);
  const thicken = T.thickenChoice(seed);
  exp.push(`MELODY  cell "${cell.name}", held-profile t=${heldT} -> ${prof.notesPerActiveBar.toFixed(1)} notes/active bar, median ${prof.medDurBars.toFixed(2)} bars, range ${prof.range}`);
  exp.push(`  held-vs-jittery is ONE latent parameter moving duration+density+range+repeat together (corpus: they fall together, tempo does not move)`);
  exp.push(`  articulation "${artic}" (ratio ${T.articRatio[artic]}) held constant for the section — 65.8% of corpus gaps are articulation, not breath`);
  exp.push(`  dyad accent on ~${(100 * T.DYAD_ACCENT_RATE).toFixed(1)}% of notes, interval class "${thicken}" chosen ONCE and held in parallel`);
  exp.push(`  (corpus lead is 97.44% monophonic; when thickened it commits to one class: 3rd 26.7%, octave 19.0%, 4th 14.3%)`);

  // ---- COMPANION -----------------------------------------------------------
  const compIv = T.companionInterval(seed);
  const leadActive = 0.55 + T.rnd(`${seed}|la`) * 0.3;
  const compDens = T.companionDensity(leadActive);
  const licence = T.chromaticLicence(prof.range, 0.07);
  exp.push(`COMPANION  interval ${compIv} semitones (same-register device: corpus median gap between the two highest non-bass parts is 5 semitones, NOT the -12 to the harmony hand)`);
  exp.push(`  density ratio ${compDens} vs lead (corpus inverts: lead resting -> companion denser 1.57; lead continuous -> 0.88)`);
  exp.push(`  chromatic licence ${licence.toFixed(3)} scaled by realised range ${prof.range} (corpus: static lines have median out-of-key EXACTLY 0; the chromatic drone is 0.16% of files)`);

  // ---- DOUBLING ------------------------------------------------------------
  const dmode = T.pick(T.DOUBLE_MODE, `${seed}|dbl`);
  const dOff = dmode === 'echo' ? T.pick(T.ECHO_OFFSET, `${seed}|off`) : 0;
  exp.push(`DOUBLING  ${dmode}${dmode === 'echo' ? ` at ${dOff} beat` : ''} (corpus: 48.5% of files carry one — unison 41.6%, echo 42.6%, octave 15.8%; echo clusters at 1/2 and 1/4 beat)`);

  // ---- PERCUSSION ----------------------------------------------------------
  const env = P.environment ?? 'rest';
  const colourPercP = T.COLOUR_PERC_BY_ENV[env] ?? 0.125;
  const latch = T.pick(T.SYNC_LATCH, `${seed}|latch`);
  const period = T.pick(T.DRUM_PERIOD, `${seed}|per`);
  let percPresence = P.mods.perc ?? v.percussion.presence;
  const floorLane = T.PERC_FLOOR_LANES.has(env);
  let percNote = '';
  if (percPresence === 'none' && floorLane) {
    percPresence = 'light';
    percNote = ` — FLOOR ENFORCED: emotion tried to zero the percussion in a lane that is 95% drummed (corpus: only 5% of desert tracks are drumless vs 69% of somber tracks). This is the somber-desert-reads-as-space trap.`;
  }
  exp.push(`PERCUSSION  presence=${percPresence}${percNote}`);
  exp.push(`  kit "${T.drumPattern(P.environment, latch, energy, seed)}" chosen by environment/latch/energy from a weighted pool, not a fixed name`);
  exp.push(`  syncopation latch "${latch}" drawn ONCE per song (corpus is bimodal: 45.0% under 5% odd-16th, 30.7% over 30%)`);
  exp.push(`  ${period}-bar drum cell (corpus: a bar is 1.6x likelier to match the bar FOUR back than the one before)`);
  exp.push(`  colour-percussion probability ${colourPercP} for "${env}" (corpus: jungle 40.3%, forest 26.9%, desert 25.5% vs boss 5.9%) — layered OVER an unchanged kit`);
  exp.push(`  accent by ARTICULATION not velocity (corpus median on-beat vs off-beat velocity difference is exactly 0.00)`);

  return { name, promptText, P, v, key, bpm, beats, totalBars, H, barSyms, ctx, handParts, energy,
    introBars, jittered, prof, cell, artic, thicken, compIv, compDens, licence, dmode, dOff,
    percPresence, latch, period, colourPercP, exp };
}


// ============================================================ MIX BUILDER
//
// Turns a song plan into playable Strudel. Every layer here exists because a
// measurement said it should, and the mask/entry logic is where the FORM findings
// (entry jitter, staggered opening, the concurrency arch, the thinning tail) are
// actually applied rather than merely described.

const maskOf = (bars) => bars.map((b) => (b ? 1 : 0)).join(' ');
const clampOct = (sound, oct) => {
  // Clamp by DECLARED DATA (INSTRUMENTS[sound].range), never by a name list —
  // "a list of forbidden names has now failed four times in three rounds".
  const r = INSTRUMENTS[sound]?.range;
  return r ? Math.max(r[0], Math.min(r[1], oct)) : oct;
};

/** pick a voice whose declared lanes/parts suit the role, by measured family mix */
function voiceFor(role, seed, { synth = false, lane = null } = {}) {
  const wants = { lead: 'lead', pad: 'pad', acc: 'mid', bass: 'low', companion: 'mid' }[role] ?? 'mid';
  const cands = Object.entries(INSTRUMENTS).filter(([, e]) => (e.lanes || []).includes(wants));
  const pool = (cands.length ? cands : Object.entries(INSTRUMENTS))
    .filter(([n]) => (synth ? /synth|lead|saw|square|pad/i.test(n) : true));
  const use = pool.length ? pool : Object.entries(INSTRUMENTS);
  return use[Math.floor(T.rnd(seed) * use.length)][0];
}

function buildMix(S) {
  const { ctx, beats, totalBars, prof, exp } = S;
  const meter = S.v.meter;
  const parts = [];
  const solos = {};
  const bar1 = { harmony: [S.barSyms[0]], barsPerChord: 1, key: S.key };

  // ---- the concurrency ARCH + thinning TAIL, as bar masks -------------------
  // corpus: ~45% of the cast absent at the start, ~42% gone by the end, long flat
  // plateau; the characteristic gesture is a thinning tail, not an interior dip.
  const maskFor = (entryBar, { tail = 0 } = {}) => {
    const b = [];
    for (let i = 0; i < totalBars; i++) {
      const pos = i / totalBars;
      let on = i >= entryBar;
      if (tail && pos > 0.80 && T.rnd(`${S.name}|tail${tail}|${i}`) < (pos - 0.80) / 0.20 * 0.75) on = false;
      b.push(on ? 1 : 0);
    }
    return b;
  };

  // ---- BASS ---------------------------------------------------------------
  const bassSound = S.P.mods.synth ? 'gm_synth_bass_1' : 'gm_acoustic_bass';
  const bassFig = {
    name: 'cs_bass', bars: 1,
    onsets: ['0/1', '1/2'],
    figure: ['R', T.figureMember(`${S.name}|bassfig`, { colour: 0.1 })],
    accents: [0.95, 0.7],
  };
  try {
    const e = bindFigure(bassFig, ctx, meter, { octave: clampOct(bassSound, 2), sound: bassSound, loopRoots: true, gainRange: [0.5, 0.75], fx: '.room(0.2)' }).expr;
    const m = maskOf(maskFor(S.jittered.bass ?? 0, { tail: 1 }));
    parts.push(`${e}.mask("<${m}>")`);
    solos.bass = e;
  } catch (err) { exp.push(`  !! bass bind failed: ${err.message}`); }

  // ---- THE HAND: several THIN parts whose coincidence makes the thickness ---
  S.handParts.forEach((h, i) => {
    const snd = h.role === 'pad' ? (S.P.mods.choir ? 'gm_choir_aahs' : 'gm_string_ensemble_1')
      : S.P.mods.synth ? 'gm_lead_2_sawtooth' : 'gm_acoustic_grand';
    const fig = {
      name: `cs_${h.role}`, bars: 1,
      onsets: h.onsets, figure: h.toks,
      accents: h.toks.map((_, k) => 0.55 + 0.2 * ((k % 3) === 0 ? 1 : 0)),
    };
    try {
      const oct = clampOct(snd, h.role === 'pad' ? 4 : 3);
      const e = bindFigure(fig, ctx, meter, { octave: oct, sound: snd, loopRoots: true,
        gainRange: h.role === 'pad' ? [0.16, 0.26] : [0.3, 0.5],
        fx: h.role === 'pad' ? '.room(0.6).clip(1.4)' : '.room(0.3)' }).expr;
      const m = maskOf(maskFor(S.jittered[h.role] ?? 0, { tail: 2 + i }));
      parts.push(`${e}.mask("<${m}>")`);
      solos[h.role] = e;
    } catch (err) { exp.push(`  !! ${h.role} bind failed: ${err.message}`); }
  });

  // ---- LEAD ---------------------------------------------------------------
  const leadSound = S.P.mods.musicBox ? 'gm_music_box'
    : S.P.mods.choir ? 'gm_choir_aahs'
    : S.P.mods.synth ? 'gm_lead_1_square'
    : voiceFor('lead', `${S.name}|lead`, { synth: false });
  const leadOct = clampOct(leadSound, 5);
  try {
    const lb = bindMelody(S.cell, ctx, meter, {
      style: 'toby-fox', seed: 7, octave: leadOct, sound: leadSound,
      gainRange: [0.72, 0.95], fx: '.room(0.3)',
      hold: prof.medDurBars > 0.2, mergeRepeats: true,
      articFloor: T.articRatio[S.artic],
    });
    const m = maskOf(maskFor(S.jittered.lead ?? 0));
    parts.push(`${lb.expr}.mask("<${m}>")`);
    solos.lead = lb.expr;
    S.leadExpr = lb.expr;
  } catch (err) { exp.push(`  !! lead bind failed: ${err.message}`); }

  // ---- COMPANION: same-register, density inverted against the lead ---------
  const compSound = voiceFor('companion', `${S.name}|comp`, { synth: S.P.mods.synth });
  try {
    const cb = bindMelody(S.cell, ctx, meter, {
      style: 'toby-fox', seed: 23, octave: clampOct(compSound, leadOct + (S.compIv < -6 ? -1 : 0)),
      sound: compSound, gainRange: [0.16, 0.26], fx: '.room(0.4)',
      hold: true, mergeRepeats: true,
    });
    const m = maskOf(maskFor(S.jittered.companion ?? 0, { tail: 5 }));
    parts.push(`${cb.expr}.mask("<${m}>")`);
    solos.companion = cb.expr;
  } catch (err) { exp.push(`  !! companion bind failed: ${err.message}`); }

  // ---- DOUBLING: echo is a real layer that costs no new material -----------
  if (S.dmode === 'echo' && S.leadExpr) {
    const off = S.dOff / beats;   // beats -> cycles
    parts.push(`${S.leadExpr}.late(${off.toFixed(4)}).gain(0.28).room(0.5)`);
    exp.push(`  echo layer emitted: lead delayed ${S.dOff} beat at 0.28 gain`);
  } else if (S.dmode === 'octave' && S.leadExpr) {
    parts.push(`${S.leadExpr}.add(note(-12)).gain(0.3)`);
    exp.push(`  octave-double layer emitted at 0.3 gain`);
  }

  // ---- PERCUSSION ---------------------------------------------------------
  if (S.percPresence !== 'none') {
    const g = { light: 0.42, driving: 0.55, foreground: 0.68 }[S.percPresence] ?? 0.45;
    const pat = T.drumPattern(S.P.environment, S.latch, S.energy ?? 1, S.name);
    try {
      // dpStack returns { expr, bars } — interpolating the OBJECT silently
      // produced "[object Object]" inside the mix and broke 10 of 16 transpiles.
      const d = dpStack(pat, { gainMul: g });
      const dExpr = typeof d === 'string' ? d : d?.expr;
      if (!dExpr || typeof dExpr !== 'string') throw new Error(`dpStack gave no expr for ${pat}`);
      parts.push(dExpr); solos.drums = dExpr;
      exp.push(`  kit bound: ${pat} (${d.bars ?? '?'}-bar pattern)`);
    } catch (err) {
      // fall back to a hand-built kit so a missing pattern name never kills a song
      const kick = S.latch === 'syncopated' ? 'bd ~ ~ bd ~ bd ~ ~' : 'bd ~ ~ ~ bd ~ ~ ~';
      const snare = '~ ~ sd ~ ~ ~ sd ~';
      const hat = S.latch === 'straight' ? 'hh*8' : 'hh*8';
      const kit = `stack(s("${kick}").gain(${(g * 0.9).toFixed(2)}), s("${snare}").gain(${(g * 0.8).toFixed(2)}), s("${hat}").gain(${(g * 0.35).toFixed(2)}))`;
      parts.push(kit); solos.drums = kit;
      exp.push(`  drum pattern "${pat}" unavailable — hand-built ${S.latch} kit used`);
    }
  }

  const mix = parts.length > 1 ? `stack(${parts.join(', ')})` : (parts[0] ?? 's("~")');
  return { mix, solos };
}


// ============================================================ PAGE

function page(DATA) {
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>corpus suite — songs from the 31.6k-file analysis</title>
<style>
 body{background:#12131a;color:#e8e8ef;font:14px/1.55 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;margin:0;padding:28px}
 h1{font-size:20px;margin:0 0 4px} .sub{color:#8a8fa3;margin-bottom:22px;max-width:70ch}
 .song{background:#1a1c26;border:1px solid #272a38;border-radius:10px;padding:16px 18px;margin-bottom:14px}
 .hd{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
 .nm{font-weight:600;font-size:15px} .meta{color:#8a8fa3;font-size:12px}
 .prompt{color:#c7d2fe;font-style:italic;margin:6px 0 10px;font-size:14px}
 button{background:#2b3550;color:#dbe4ff;border:1px solid #3d4a6e;border-radius:6px;padding:5px 13px;cursor:pointer;font-size:13px}
 button:hover{background:#374466} button.on{background:#4b6a3f;border-color:#63894f}
 .chords{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#f0c987;margin:8px 0;font-size:13px}
 details{margin-top:8px} summary{cursor:pointer;color:#8a8fa3;font-size:12px;user-select:none}
 pre{white-space:pre-wrap;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;color:#a8b0c8;background:#141620;padding:11px;border-radius:6px;overflow-x:auto;margin:8px 0 0}
 .m{display:inline-block;background:#232735;border-radius:4px;padding:1px 7px;margin:2px 4px 2px 0;font-size:11px;color:#9fb3d9}
 .warn{color:#e0a86b}
 .notebox{width:100%;box-sizing:border-box;margin-top:9px;background:#0f1118;color:#e8e8ef;border:1px solid #2b3040;border-radius:6px;padding:8px 10px;font:13px/1.4 inherit}
 .notebox:focus{outline:none;border-color:#4a5a80;background:#121520}
 .notebox.has{border-color:#3d5a3d}
 button.k,button.x{padding:4px 11px;font-size:12px}
 button.k.on{background:#3f6a45;border-color:#4f8959}
 button.x.on{background:#6a3f3f;border-color:#8a5050}
 #bar{position:sticky;top:0;background:#12131a;padding:10px 0 14px;margin-bottom:6px;z-index:5;display:flex;gap:12px;align-items:center;border-bottom:1px solid #272a38}
 #tally{color:#8a8fa3;font-size:12px}
</style></head><body>
<h1>Corpus suite — 16 songs from natural-language prompts</h1>
<div class="sub">Every song is built by composing measured mechanisms from the 31,652-file VGMusic analysis.
Each carries its own experiment log: which techniques it combines, the corpus number behind each, and what the
built mix actually measured. Click a name to play.</div>
<div id="bar"><button id="export">copy verdicts JSON</button><span id="tally"></span></div>
<div id="list"></div>
<script src="${'https://unpkg.com/@strudel/web@1.1.0/dist/index.js'}"></script>
<script>
const DATA = ${JSON.stringify(DATA)};
${RUNTIME_JS}
// Verdict state. SEPARATE localStorage keys from songs.html on purpose: that
// page prunes any verdict whose name it does not know, so sharing a key would
// silently delete every suite verdict the next time it was opened.
const LS = 'motif-engine:corpus-suite-verdicts';
const LSN = 'motif-engine:corpus-suite-notes';
let verdicts = {}; try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) {}
let notes = {}; try { notes = JSON.parse(localStorage.getItem(LSN) || '{}'); } catch (e) {}
const known = {}; DATA.songs.forEach((s) => { known[s.name] = 1; });
Object.keys(verdicts).forEach((n) => { if (!known[n]) delete verdicts[n]; });
Object.keys(notes).forEach((n) => { if (!known[n]) delete notes[n]; });
const save = () => { localStorage.setItem(LS, JSON.stringify(verdicts)); localStorage.setItem(LSN, JSON.stringify(notes)); };
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const tally = () => {
  document.getElementById('tally').textContent =
    Object.keys(verdicts).length + '/' + DATA.songs.length + ' judged \u00b7 ' +
    Object.keys(notes).filter((k) => notes[k] && notes[k].trim()).length + ' notes';
};

const list = document.getElementById('list');
DATA.songs.forEach((s, i) => {
  const d = document.createElement('div'); d.className = 'song';
  const meas = s.measured && !s.measured.error
    ? \`<span class="m">\${s.measured.attacks} attacks</span><span class="m">1-note \${Math.round(100*s.measured.singleShare)}%</span><span class="m">4+ \${Math.round(100*s.measured.fourPlusShare)}%</span><span class="m">\${s.measured.voices} voices</span>\`
    : '<span class="m warn">not evaluated</span>';
  d.innerHTML = \`<div class="hd"><button data-i="\${i}">play</button><span class="nm">\${s.name}</span>
    <button class="k\${verdicts[s.name] === 'keep' ? ' on' : ''}" data-v="keep" data-n="\${s.name}">keep</button>
    <button class="x\${verdicts[s.name] === 'kill' ? ' on' : ''}" data-v="kill" data-n="\${s.name}">kill</button>
    <span class="meta">\${s.key} · \${s.bpm}bpm · \${s.meter} · \${s.totalBars} bars</span></div>
    <div class="prompt">"\${s.prompt}"</div>
    <div class="chords">\${s.symbols.join('   ')}</div>
    <div>\${meas}</div>
    <details><summary>experiment log — what was combined and why</summary><pre>\${s.log}</pre></details>
    <input class="notebox\${notes[s.name] ? ' has' : ''}" data-note="\${s.name}"
           placeholder="notes… what works, what breaks the vibe" value="\${esc(notes[s.name] || '')}">\`;
  list.appendChild(d);
});
tally();

// notes: persist as you type
list.addEventListener('input', (e) => {
  const box = e.target.closest('input[data-note]'); if (!box) return;
  notes[box.dataset.note] = box.value;
  box.classList.toggle('has', !!box.value.trim());
  save(); tally();
});

// keep / kill, click again to clear
list.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-v]'); if (!b) return;
  const n = b.dataset.n;
  if (verdicts[n] === b.dataset.v) delete verdicts[n]; else verdicts[n] = b.dataset.v;
  save(); tally();
  const card = b.closest('.song');
  card.querySelectorAll('button[data-v]').forEach((x) => x.classList.toggle('on', verdicts[n] === x.dataset.v));
});

document.getElementById('export').onclick = function () {
  const out = {
    page: 'corpus-suite', generated: new Date().toISOString(),
    verdicts: verdicts,
    notes: Object.fromEntries(Object.entries(notes).filter((kv) => kv[1] && kv[1].trim())),
    songs: DATA.songs.map((s) => ({ name: s.name, prompt: s.prompt, key: s.key, bpm: s.bpm, symbols: s.symbols })),
  };
  const txt = JSON.stringify(out, null, 2);
  const done = () => { this.textContent = 'copied!'; setTimeout(() => { this.textContent = 'copy verdicts JSON'; }, 1200); };
  if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, () => { rtCopy(txt); done(); });
  else { rtCopy(txt); done(); }
};
document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') rtStop(); });

let cur = null;
list.addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-i]'); if (!b) return;
  const s = DATA.songs[Number(b.dataset.i)];
  // rtPlay/rtStop are the runtime's ACTUAL entry points (audition-runtime.js).
  // An earlier draft called ensureRuntime()/playCode()/hush(), none of which
  // exist — the page rendered fine and every button was dead.
  if (cur === b) { rtStop(); b.textContent = 'play'; b.classList.remove('on'); cur = null; return; }
  if (cur) { cur.textContent = 'play'; cur.classList.remove('on'); }
  cur = b; b.textContent = 'loading…'; b.classList.add('on');
  const ok = await rtPlay('setcpm(' + s.bpm + '/' + s.beats + ')\\np: ' + s.mix);
  b.textContent = ok ? 'stop' : 'error';
  if (!ok) { b.classList.remove('on'); cur = null; }
});
</script></body></html>`;
}

// ============================================================ THE PROMPTS

export const SUITE = [
  { n: 'cs_mech_boss_station', p: 'boss fight music for a giant mech battle on an abandoned space station, lots of drums' },
  { n: 'cs_desert_market', p: 'chill background music for a busy desert market town, kind of middle eastern' },
  { n: 'cs_music_box_manor', p: 'creepy music box theme for an abandoned victorian mansion' },
  { n: 'cs_jungle_explore', p: 'upbeat jungle exploration theme with heavy tribal percussion' },
  { n: 'cs_friend_dies', p: 'sad slow piano piece for the scene where the main character\'s friend dies' },
  { n: 'cs_lab_stealth', p: 'tense stealth music for sneaking through a research laboratory at night' },
  { n: 'cs_cathedral_epic', p: 'epic triumphant choir music for a final battle in a gothic cathedral' },
  { n: 'cs_underwater_calm', p: 'calm ambient loopable music for an underwater coral reef area' },
  { n: 'cs_casino_groove', p: 'groovy jazzy lounge music for a casino level' },
  { n: 'cs_frozen_ruins', p: 'lonely somber music for frozen ruins in a snowstorm, minimal and sparse' },
  { n: 'cs_catacomb_action', p: 'fast intense action music for fighting undead in the catacombs' },
  { n: 'cs_diner_goofy', p: 'silly bouncy cartoon music for a chaotic kitchen minigame' },
  { n: 'cs_alien_mystery', p: 'mysterious eerie synth music for discovering an alien structure on a distant planet' },
  { n: 'cs_campfire_rest', p: 'warm nostalgic music for resting at a campfire save point' },
  { n: 'cs_factory_industrial', p: 'industrial mechanical music for a factory level with pounding percussion' },
  { n: 'cs_shrine_choir', p: 'peaceful sacred choir music for an ancient forest shrine' },
];

// ============================================================ MAIN

const built = [];
for (const { n, p } of SUITE) {
  try { const S = buildSong(p, n); Object.assign(S, buildMix(S)); built.push(S); }
  catch (e) { console.log(`FAILED ${n}: ${e.message}`); }
}

// ---- VALIDATE: every mix through the engine's own evaluator, and MEASURE what
// came out. A mix that transpiles is not a mix that plays the intended music —
// the project's own doctrine is "never trust 'returned OK', measure".
const report = [];
for (const S of built) {
  const code = `setcpm(${S.bpm}/${S.beats})\np: stack(${S.mix.replace(/^stack\(|\)$/g, '')})`;
  try {
    const ev = await evaluateSong(code);
    const haps = hapsByLabel(ev, 0, Math.min(16, S.totalBars)).get('p')?.haps ?? [];
    const pitched = haps.filter((h) => h.value?.note != null);
    const byTick = new Map();
    for (const h of pitched) {
      const t = Math.round(Number(h.whole?.begin ?? h.part.begin) * 64);
      byTick.set(t, (byTick.get(t) || 0) + 1);
    }
    const widths = [...byTick.values()];
    const four = widths.filter((w) => w >= 4).length;
    const one = widths.filter((w) => w === 1).length;
    const sounds = new Set(haps.map((h) => h.value?.s).filter(Boolean));
    S.measured = {
      haps: haps.length, pitched: pitched.length, attacks: widths.length,
      singleShare: widths.length ? one / widths.length : 0,
      fourPlusShare: widths.length ? four / widths.length : 0,
      voices: sounds.size,
    };
    report.push(`${S.name.padEnd(24)} haps=${String(haps.length).padStart(5)} attacks=${String(widths.length).padStart(4)} 1-note=${(100 * S.measured.singleShare).toFixed(0)}% 4+=${(100 * S.measured.fourPlusShare).toFixed(0)}% voices=${sounds.size}`);
  } catch (e) {
    S.measured = { error: e.message.slice(0, 90) };
    report.push(`${S.name.padEnd(24)} EVAL FAILED: ${e.message.slice(0, 90)}`);
  }
}
// ---- emit the page
const DATA = { songs: built.map((S) => ({
  name: S.name, prompt: S.promptText, key: S.key, bpm: S.bpm, beats: S.beats,
  meter: S.v.meter, totalBars: S.totalBars, symbols: S.H.symbols,
  mix: S.mix, measured: S.measured, log: S.exp.join('\n'),
})) };
writeFileSync(join(OUT, 'corpus-suite.html'), page(DATA));
console.log(`wrote audition/corpus-suite.html`);

// ---- the experiment write-up, generated from the same data as the page
const md = [];
md.push('# Corpus suite — 16 songs, and the experiment behind each\n');
md.push('Every song here is built by COMPOSING measured mechanisms from the 31,652-file');
md.push('VGMusic analysis (`research/vgmusic-atlas-r20.md`, `research/vgmusic-techniques-r20.md`).');
md.push('Nothing is hardcoded: each mechanism is a weighted pool sampled with a per-song seed,');
md.push('so the same technique realises differently in every song, and the techniques compose.\n');
md.push('Prompts are the kind of sentence a user actually types. The parser that maps them onto');
md.push('the engine\'s vocabulary is itself part of the experiment — a wrong parse is a wrong song.\n');
md.push('Play them at `audition/corpus-suite.html`. Generator: `scripts/audition-corpus-suite.mjs`,');
md.push('technique library: `scripts/corpus-techniques.mjs`.\n');
md.push('**Measured columns** are taken from the built mix through the engine\'s own evaluator,');
md.push('not from the plan — corpus reference is 43.1% single-note attacks and 17.7% four-plus.\n');
md.push('| song | prompt | key/bpm | attacks | 1-note | 4+ | voices |');
md.push('|---|---|---|---|---|---|---|');
for (const S of built) {
  const m = S.measured || {};
  md.push(`| \`${S.name}\` | ${S.promptText} | ${S.key} ${S.bpm} | ${m.attacks ?? '-'} | ${m.singleShare != null ? Math.round(100 * m.singleShare) + '%' : '-'} | ${m.fourPlusShare != null ? Math.round(100 * m.fourPlusShare) + '%' : '-'} | ${m.voices ?? '-'} |`);
}
md.push('\n---\n');
for (const S of built) {
  const m = S.measured || {};
  md.push(`## ${S.name}\n`);
  md.push(`> "${S.promptText}"\n`);
  md.push(`**${S.key} · ${S.bpm}bpm · ${S.v.meter} · ${S.totalBars} bars**  `);
  md.push(`**Progression:** \`${S.H.symbols.join('  ')}\`  `);
  md.push(`**Measured from the built mix:** ${m.attacks ?? '?'} pitched attacks · ${m.singleShare != null ? Math.round(100 * m.singleShare) : '?'}% single-note · ${m.fourPlusShare != null ? Math.round(100 * m.fourPlusShare) : '?'}% four-plus · ${m.voices ?? '?'} voices\n`);
  md.push('```');
  md.push(S.exp.join('\n'));
  md.push('```\n');
}
writeFileSync(join(ROOT, 'research/corpus-suite-experiments.md'), md.join('\n'));
console.log('wrote research/corpus-suite-experiments.md');

console.log('\n--- VALIDATION (measured from the evaluated mix, first 16 bars) ---');
for (const r of report) console.log('  ' + r);
const okN = built.filter((S) => !S.measured?.error).length;
console.log(`  ${okN}/${built.length} mixes evaluate`);
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'corpus-suite-log.txt'),
  built.map((s) => `${'='.repeat(78)}\n${s.name}\n${'='.repeat(78)}\n` + s.exp.join('\n')).join('\n\n'));
console.log(`built ${built.length} song plans -> audition/corpus-suite-log.txt`);
for (const s of built) console.log(`  ${s.name.padEnd(26)} ${s.key.padEnd(10)} ${String(s.bpm).padStart(3)}bpm  ${s.H.symbols.join(' ')}`);
