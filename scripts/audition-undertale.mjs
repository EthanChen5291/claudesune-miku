#!/usr/bin/env node
// Builds audition/undertale.html — the ear-check pass over everything extracted
// from audios/Undertale MIDI (D30). A separate page from unison.html for the
// same reason that page is separate from progressions.html: different corpus,
// different provenance, and a verdict must be attributable to its pool.
//
// Four tabs:
//   progressions  166 chord loops solved from the songs, played as comping under
//                 the corpus's own figurations. NEEDS EAR marks low chord
//                 coverage or an ambiguous key solve.
//   figures       85 accompaniment figurations — the "movement of the fingers"
//                 with the chord factored out. THE point of this pass: each
//                 figure plays over ANY progression (its own song's, a minor
//                 axis, a major pop loop …) to hear that the movement survives
//                 re-harmonisation.
//   development   observed A->B figure moves (repitch, blockify, octave lift…),
//                 rendered as 4 bars of A then 4 bars of B over one progression.
//   melody        the observation notes (undertale-melody.md) — no entries, by
//                 design.
//
// As with the other pages: every pattern is generated HERE by the real binder,
// and the browser only assembles strings.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import { RUNTIME_JS } from './audition-runtime.js';
import { PROGRESSIONS_UNDERTALE } from '../src/lib/progressions-undertale.js';
import { FIGURATIONS_UNDERTALE, DEVELOPMENT_UNDERTALE } from '../src/lib/figurations-undertale.js';
import { parseDegrees } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindFigure, bind, bindMelody, bindMelodySpec } from '../src/binder/bind.js';
import { ATLAS, ATLAS_SECTIONS } from '../src/lib/atlas.js';
import { MELODIES_TIER2 } from '../src/lib/melodies-tier2.js';
import { MELODY_RHYTHMS_UNDERTALE } from '../src/lib/rhythms-undertale.js';
import { INSTRUMENTS } from '../src/lib/instruments.js';
import { planArrangement, renderArrangement, planForm, renderForm } from '../src/binder/arrange.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { readMidi } from '../src/ingest/midi.js';
import { onsetClusters } from '../src/ingest/piano.js';
import { midiToNoteName, keyUsesFlats } from '../src/binder/theory.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';
const PIANO = 'github:felixroos/dough-samples/main/piano.json';
const FULL = process.argv.includes('--full');

const KEY_FOR = (fam) => (fam === 'minor' ? 'C:minor' : 'C:major');

// ---- textures: the corpus's own figures, one per class ---------------------
const figList = Object.entries(FIGURATIONS_UNDERTALE);
function pickTexture(cls) {
  const ok = figList
    .filter(([, e]) => e.class === cls && e.meter_class === '4/4' && !e.needsEar)
    .sort((a, b) => b[1].seen - a[1].seen);
  return ok[0]?.[0] ?? null;
}
const TEXTURES = [
  { id: 'arp', label: 'arp', fig: pickTexture('arp') ?? pickTexture('arp_up') },
  { id: 'oompah', label: 'oom-pah', fig: pickTexture('oompah') },
  { id: 'block', label: 'block', fig: pickTexture('block') },
  { id: 'ostinato', label: 'ostinato', fig: pickTexture('ostinato') },
].filter((t) => t.fig);

// ---- progressions ---------------------------------------------------------
// Everything renders in the SOLVED KEY at the source's meter and bpm — audition
// round 2 finding: transposing to C at a flat 110 destroyed recognizability
// even where the extracted data was right. Two ground-truth references per
// card: the 'true chords' texture (correct barsPerChord, at half-bar
// resolution) and the verbatim source-MIDI slice of the loop span.

/** legato token grid: steps (0..G) + values -> mini-notation for one bar */
function grid(steps, values, G) {
  const at = (v, k) => (k === 1 ? String(v) : `${v}@${k}`);
  const toks = [];
  if (steps[0] > 0) toks.push(at('~', steps[0]));
  for (let i = 0; i < steps.length; i++) {
    const next = i + 1 < steps.length ? steps[i + 1] : G;
    toks.push(at(values[i], Math.max(1, next - steps[i])));
  }
  return toks.join(' ');
}

/** verbatim playback of the loop span, straight from the MIDI file */
function sourceExpr(e) {
  const midi = readMidi(join(ROOT, e.source));
  const barTicks = midi.ppq * 4 * (midi.timeSig[0] / midi.timeSig[1]);
  const bars = Math.min(e.loopBars, 8);
  const t0 = e.atBar * barTicks;
  const span = midi.notes.filter((n) => n.tick >= t0 && n.tick < t0 + bars * barTicks);
  if (!span.length) return null;
  const flats = keyUsesFlats(e.sourceKey);
  const noteBars = [], gainBars = [];
  for (let b = 0; b < bars; b++) {
    const inBar = span.filter((n) => Math.floor((n.tick - t0) / barTicks) === b);
    if (!inBar.length) { noteBars.push('~'); gainBars.push('0.5'); continue; }
    const clusters = onsetClusters(inBar.map((n) => ({ ...n, tick: n.tick - t0 - b * barTicks })), barTicks, 1 / 96);
    const steps = [], vals = [], gains = [];
    for (const c of clusters) {
      const step = Math.min(95, Math.round((c.tick / barTicks) * 96));
      if (steps.length && steps[steps.length - 1] === step) continue;
      steps.push(step);
      const names = [...new Set(c.notes.map((n) => n.midi))].sort((a, b) => a - b).map((m) => midiToNoteName(m, { flats }));
      vals.push(names.length === 1 ? names[0] : `[${names.join(',')}]`);
      gains.push(String(Math.round((Math.max(...c.notes.map((n) => n.velocity)) / 127) * 100) / 100));
    }
    noteBars.push(grid(steps, vals, 96));
    gainBars.push(grid(steps, gains, 96));
  }
  const wrap = (xs) => (xs.length === 1 ? xs[0] : `<${xs.map((x) => `[${x}]`).join(' ')}>`);
  return `note("${wrap(noteBars)}").s("piano").gain("${wrap(gainBars)}").room(0.2)`;
}

/** chord sounding at each BAR START of the loop (barsPerChord walk) */
function barChords(symbols, barsPerChord, loopBars) {
  const out = [];
  let i = 0, acc = 0;
  for (let b = 0; b < loopBars; b++) {
    while (i < barsPerChord.length - 1 && acc + barsPerChord[i] <= b) { acc += barsPerChord[i]; i++; }
    out.push(symbols[i]);
  }
  return out;
}

// ---- melody demo (D35/D40): a bindMelody line over the own pattern ---------
// The rhythm is RETRIEVED from the corpus's own mined melodic cells
// (MELODY_RHYTHMS_UNDERTALE, D40) rather than authored: melody audition round 5
// measured the remaining "same-y" as rhythmic monoculture — one hand-written
// cell for all 165 cards. Selection is by meter, then by a tempo-appropriate
// DENSITY target (a 16-note bar is a blur at 175bpm and a comfortable run at
// 70), then seeded per progression so neighbours differ. Ties break by
// recurrence, so a song gets a cell Toby actually played a lot.
const fnv = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
const MEL_CELLS = Object.entries(MELODY_RHYTHMS_UNDERTALE).map(([name, e]) => ({ name, ...e }));
// Energy (D41/D42): the melody's rhythmic density is decided AT GENERATION
// TIME, never by a user knob — Ethan's clarification. It is derived from
// DENSITY COMPLEMENTARITY, the first of the two-hand principles his round-6
// ear pass produced: the two hands must not compete at the same rate. A bar
// has a budget of activity (looser at slow tempi, tighter at fast ones); the
// accompaniment spends first, and the melody gets what is left. That is why
// Megalovania (10 accompaniment onsets a bar) now gets a 3-note melody where
// the old tempo-only rule gave it 8 and sounded "very hyper", while the two
// cards Ethan singled out — His Theme (0.5) and Gaster's (5.0) — are
// bit-identical, because the rule explains why they already worked.
function activityBudget(bpm) { return Math.max(8, Math.min(15, Math.round(16 - (bpm || 110) / 40))); }
function melodyDensityTarget(bpm, accDensity) {
  return Math.max(2, Math.min(12, Math.round(activityBudget(bpm) - accDensity)));
}
// INTERLOCK (D44). Ethan's round-7 correction: "hyper is fine if the situation
// calls for it — lots of good songs have a busy left AND right hand, they just
// complement each other." So density is no longer a ceiling, it is a CENTRE:
// any cell within a band of the target is admissible, and the winner is the one
// that best COUNTERS the accompaniment — filling its gaps, agreeing with it on
// strong beats, and not blurring it off-beat. Gaster's Theme is the case that
// proves it: two busy hands (5 and 9 onsets a bar) that interlock rather than
// collide, which the old nearest-density-plus-hash rule found only by luck.
const R48 = 48;
const posOf = (o) => { const [n, d] = String(o).split('/').map(Number); return n / d; };
const barSteps = (onsets) => onsets.map((o) => Math.round((posOf(o) % 1) * R48) % R48);
function interlockScore(accSet, cell, beats) {
  let lockStrong = 0, lockWeak = 0, fill = 0;
  for (const p of barSteps(cell.onsets)) {
    if (accSet.has(p)) { if (p % (R48 / beats) === 0) lockStrong++; else lockWeak++; }
    else fill++;
  }
  // filling gaps is the point; agreeing on a strong beat is an accent shared;
  // agreeing off-beat just smears two attacks together
  return (fill * 1.0 + lockStrong * 0.8 - lockWeak * 0.6) / Math.sqrt(cell.onsets.length);
}
const DENSITY_BAND = 3;
function melodyRhythm(meter, bpm, seedName, { target: forced = null, accDensity = 0, accOnsets = null, beats = 4 } = {}) {
  const target = forced ?? melodyDensityTarget(bpm, accDensity);
  let pool = MEL_CELLS.filter((c) => c.meter_class === meter);
  if (!pool.length) pool = MEL_CELLS.filter((c) => c.meter_class === '4/4');
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



const ARRANGE_WARNINGS = [];
const progressions = Object.entries(PROGRESSIONS_UNDERTALE).map(([name, e]) => {
  const key = e.sourceKey;
  const symbols = renderProgression(e, key);
  const ctx = { harmony: symbols, barsPerChord: 1, key };
  const ctxBar = { harmony: barChords(symbols, e.barsPerChord, e.loopBars), barsPerChord: 1, key };
  const exprs = {};
  // the song's OWN interval deployment over its own chords — the default
  // texture, because Toby's harmony IS its deployment, not block voicings
  if (e.ownFigure) {
    exprs.own = bindFigure(e.ownFigure, ctxBar, e.meter, { sound: 'piano', fx: '.room(0.25)' }).expr;
  }
  for (const t of TEXTURES) {
    exprs[t.id] = bindFigure(FIGURATIONS_UNDERTALE[t.fig], ctx, '4/4', { sound: 'piano', fx: '.room(0.25)' }).expr;
  }
  // own + melody: the D35 pipeline heard end-to-end — chord-scale note supply,
  // anchors snapped, approach slots, toby-fox profile, seeded per entry. The
  // rhythm's density is DERIVED (above), not chosen in the UI.
  const atlas = ATLAS.progressions[name];
  const role = atlas.context?.role ?? null;
  const beats = Number(e.meter.split('/')[0]) || 4;
  const accDensity = e.ownFigure ? e.ownFigure.onsets.length / e.ownFigure.bars : 0;
  const accOnsets = e.ownFigure ? e.ownFigure.onsets : null;
  const base = exprs.own ?? exprs[TEXTURES[0].id];
  const leadCell = melodyRhythm(e.meter, e.bpm, name, { accDensity, accOnsets, beats });
  const leadSeed = fnv(name);
  const leadBound = bindMelody(leadCell, ctxBar, e.meter, {
    style: 'toby-fox', seed: leadSeed, octave: 5, sound: 'piano', fx: '.gain(0.85).room(0.25)',
  });
  exprs.ownmel = `stack(${base}, ${leadBound.expr})`;

  // ---- the arrangement (D43): which instruments join, and what they play ----
  const plan = planArrangement({
    name, song: e.song, family: e.family, role, moods: atlas.context?.moods ?? null,
    bpm: e.bpm, meter: e.meter, loopBars: e.loopBars,
    leadPeriod: leadBound.boundMeta.period,
    accDensity, accOctave: e.ownFigure?.octave ?? null,
    leadDensity: leadCell.density, palette: INSTRUMENTS,
  });
  const rendered = renderArrangement(plan, {
    harmonyContext: ctxBar, meter: e.meter, style: 'toby-fox',
    leadRhythm: leadCell, leadSeed,
    counterRhythmFor: (target, seedName) => melodyRhythm(e.meter, e.bpm, seedName, { target, accOnsets, beats }),
    figureFor: () => FIGURATIONS_UNDERTALE[TEXTURES[0].fig],
  });
  for (const w of rendered.warnings) ARRANGE_WARNINGS.push(`${name}: ${w}`);
  // ---- the form (D47): who plays WHEN, across the loop's repetitions --------
  const form = planForm(plan);
  const shaped = renderForm(rendered.layers, leadBound.expr, form);
  // full mix: the accompaniment runs throughout (it is the song's identity);
  // the lead and every layer are masked to the sections that own them
  const mixParts = [base, ...(shaped.lead ? [shaped.lead] : []), ...shaped.layers.map((l) => l.formExpr)];
  exprs.mix = mixParts.length > 1 ? `stack(${mixParts.join(', ')})` : mixParts[0];
  // solo: each layer alone, UNMASKED, for ear-checking one contribution at a
  // time — plus a "_form" that plays the mix so the shape itself is audible
  const soloExprs = { _base: base, _lead: leadBound.expr };
  for (const l of rendered.layers) soloExprs[l.id] = l.expr;
  // tier 2 (D38): an AUTHORED melody through the bindMelodySpec guard — only
  // where a spec exists; the client falls back to the tier-1 line elsewhere
  if (MELODIES_TIER2[name]) {
    const t2 = bindMelodySpec(MELODIES_TIER2[name], ctxBar, e.meter, { sound: 'piano', fx: '.gain(0.9).room(0.25)' });
    if (t2.warnings.length) throw new Error(`tier-2 spec ${name} has guard warnings — fix the spec: ${t2.warnings.join('; ')}`);
    exprs.ownmel2 = `stack(${exprs.own ?? exprs[TEXTURES[0].id]}, ${t2.expr})`;
  }
  // true chord rhythm: one cycle = HALF a bar (cpm factor 2), each chord
  // weighted by its real duration, so 0.5-bar passing chords stop being
  // stretched to whole bars
  const weighted = symbols.map((sym, i) => {
    const w = Math.round(e.barsPerChord[i] * 2);
    return w === 1 ? sym : `${sym}@${w}`;
  }).join(' ');
  exprs.chords = `chord("<${weighted}>").dict('ireal').voicing().s("piano").room(0.25)`;
  const bass = bind(RHYTHMS.offbeat_8ths, CONTOURS.bass_root_five, ctx, '4/4', {
    octave: 2, sound: 'piano', fx: '.gain(0.7)',
  }).expr;
  return {
    name, song: e.song, family: e.family, numerals: e.numerals, symbols,
    length: parseDegrees(e.degrees).length,
    barsPerChord: e.barsPerChord, loopBars: e.loopBars, reps: e.reps, atBar: e.atBar,
    meter: e.meter, beats: Number(e.meter.split('/')[0]), bpm: e.bpm ?? 110,
    sourceKey: e.sourceKey, keyMargin: e.keyMargin,
    coverage: e.coverage, needsEar: !!e.needsEar, hasT2: !!exprs.ownmel2,
    melCell: leadCell.name, melDensity: leadCell.density, melTarget: leadCell.target,
    melInterlock: leadCell.interlock, melRepeat: leadBound.boundMeta.phrase.repeat,
    accDensity: Math.round(accDensity * 10) / 10,
    form: {
      sectionBars: form.sectionBars, totalBars: form.totalBars, notes: form.notes,
      sections: form.sections.map((s) => ({
        i: s.index, archetype: s.archetype, startBar: s.startBar, bars: s.bars,
        energy: s.energy, lead: s.lead, mass: s.massSounding, why: s.why,
        active: s.active.map((id) => {
          const l = rendered.layers.find((x) => x.id === id);
          return l ? l.instrument.replace('gm_', '') : id;
        }),
      })),
    },
    plan: {
      budget: plan.budget, spent: plan.spent, headroom: plan.headroomStart, notes: plan.notes,
      massAtOnce: plan.massAtOnce,
      layers: shaped.layers.map((l) => ({
        id: l.id, part: l.part, instrument: l.instrument, character: l.instrumentCharacter,
        contributes: l.contributes, lane: l.lane, octave: l.octave, gain: l.gain,
        range: l.range, clamped: l.clampedToRange, level: l.level,
        rhythmSource: l.rhythmSource, shares: l.sharesLaneWithPiano, why: l.why,
        sections: l.sections, mask: l.formMask,
      })),
    },
    solo: soloExprs,
    section: atlas.section, sectionLabel: ATLAS_SECTIONS.progressions[atlas.section].label,
    similar: atlas.neighbors.blend, context: atlas.context,
    exprs, bass, src: sourceExpr(e),
  };
});

// ---- figures --------------------------------------------------------------
// Test progressions the figures are re-applied to. 'own' resolves per figure.
const CONTEXTS = [
  { id: 'own', label: 'own song' },
  { id: 'axis', label: 'i VI III VII', degrees: '0:m 8 3 10', family: 'minor' },
  { id: 'pop', label: 'I V vi IV', degrees: '0 7 9:m 5', family: 'major' },
  { id: 'epic', label: 'i III VII VI', degrees: '0:m 3 10 8', family: 'minor' },
];
function ctxHarmony(c) {
  const key = KEY_FOR(c.family);
  return { harmony: renderProgression({ degrees: c.degrees, numerals: c.label }, key), barsPerChord: 1, key };
}
const progBySong = new Map(); // best loop per song: trusted first, then coverage
for (const p of progressions) {
  const cur = progBySong.get(p.song);
  if (!cur || (cur.needsEar && !p.needsEar) || (cur.needsEar === p.needsEar && p.coverage > cur.coverage)) {
    progBySong.set(p.song, p);
  }
}
const figures = figList.map(([name, e]) => {
  const topSong = (e.songs[0] ?? '').replace(/ \(\d+\)$/, '');
  const own = progBySong.get(topSong);
  const exprs = {};
  const labels = {};
  for (const c of CONTEXTS) {
    if (c.id === 'own') {
      if (own) {
        const key = KEY_FOR(own.family);
        const ctx = { harmony: own.symbols, barsPerChord: 1, key };
        exprs.own = bindFigure(e, ctx, e.meter_class, { sound: 'piano', fx: '.room(0.25)' }).expr;
        labels.own = `${own.numerals} (${topSong})`;
      }
      continue;
    }
    exprs[c.id] = bindFigure(e, ctxHarmony(c), e.meter_class, { sound: 'piano', fx: '.room(0.25)' }).expr;
    labels[c.id] = c.label;
  }
  const atlas = ATLAS.figures[name];
  return {
    name, cls: e.class, role: e.role, meter: e.meter_class, grid: e.grid,
    figure: e.figure, onsets: e.onsets.length, octave: e.octave, legato: e.legato,
    seen: e.seen, songs: e.songs, fit: e.fit, needsEar: !!e.needsEar,
    micro: !!e.microtiming,
    section: atlas.section, sectionLabel: ATLAS_SECTIONS.figures[atlas.section].label,
    similar: atlas.neighbors.blend, context: atlas.context,
    exprs, labels,
  };
});

// ---- development ----------------------------------------------------------
// A move plays as 4 bars of the FROM figure, then 4 bars of the TO figure, over
// one progression — the octave difference between the two entries is preserved
// by raising the higher side's tokens.
function stretchTokens(figure, delta) {
  if (delta <= 0) return figure;
  return figure.map((t) => t.split('.').map((m) => m + '+'.repeat(delta)).join('.'));
}
function concatMove(a, b, barsEach = 4) {
  const octave = Math.min(a.octave, b.octave);
  const parts = { onsets: [], figure: [], accents: [], microtiming: [] };
  const add = (e, offset) => {
    const fig = stretchTokens(e.figure, e.octave - octave);
    for (let k = 0; k < barsEach; k++) {
      for (let i = 0; i < e.onsets.length; i++) {
        const [n, d] = e.onsets[i].split('/').map(Number);
        parts.onsets.push(`${n + (k + offset) * d}/${d}`);
        parts.figure.push(fig[i]);
        parts.accents.push(e.accents[i]);
        parts.microtiming.push(e.microtiming ? (e.microtiming[i] ?? '0') : '0');
      }
    }
  };
  add(a, 0);
  add(b, barsEach);
  const hasMicro = parts.microtiming.some((m) => m !== '0');
  return {
    bars: barsEach * 2, onsets: parts.onsets, figure: parts.figure, accents: parts.accents,
    ...(hasMicro ? { microtiming: parts.microtiming } : {}),
    octave, legato: a.legato && b.legato,
  };
}
const development = DEVELOPMENT_UNDERTALE.map((m, i) => {
  const a = FIGURATIONS_UNDERTALE[m.from];
  const b = FIGURATIONS_UNDERTALE[m.to];
  const combined = concatMove(a, b);
  const ctx = ctxHarmony(CONTEXTS[1]); // minor axis
  return {
    name: `move_${i}_${m.from}__${m.to}`,
    from: m.from, to: m.to, relation: m.relation, seen: m.seen, examples: m.examples,
    expr: bindFigure(combined, ctx, a.meter_class, { sound: 'piano', fx: '.room(0.25)' }).expr,
  };
});

// ---- melody notes ---------------------------------------------------------
const melodyMd = readFileSync(join(ROOT, 'undertale-melody.md'), 'utf8');
function mdToHtml(md) {
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const lines = md.split('\n');
  const out = [];
  let inList = false;
  for (const line of lines) {
    const b = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`(.+?)`/g, '<code>$1</code>');
    if (/^# /.test(line)) { if (inList) { out.push('</ul>'); inList = false; } out.push(`<h2>${b(line.slice(2))}</h2>`); }
    else if (/^## /.test(line)) { if (inList) { out.push('</ul>'); inList = false; } out.push(`<h3>${b(line.slice(3))}</h3>`); }
    else if (/^- /.test(line)) { if (!inList) { out.push('<ul>'); inList = true; } out.push(`<li>${b(line.slice(2))}</li>`); }
    else if (/^\s+/.test(line) && inList && line.trim()) { out[out.length - 1] = out[out.length - 1].replace(/<\/li>$/, ' ' + b(line.trim()) + '</li>'); }
    else if (!line.trim()) { if (inList) { out.push('</ul>'); inList = false; } }
    else out.push(`<p>${b(line)}</p>`);
  }
  if (inList) out.push('</ul>');
  return out.join('\n');
}

// ---- verify every generated pattern actually evaluates --------------------
const all = [
  ...progressions.flatMap((p) => TEXTURES.map((t) => [`${p.name}/${t.id}`, `stack(${p.exprs[t.id]}, ${p.bass})`])),
  ...progressions.map((p) => [`${p.name}/chords`, p.exprs.chords]),
  ...progressions.filter((p) => p.exprs.own).map((p) => [`${p.name}/own`, p.exprs.own]),
  ...progressions.map((p) => [`${p.name}/ownmel`, p.exprs.ownmel]),
  ...progressions.map((p) => [`${p.name}/mix`, p.exprs.mix]),
  ...progressions.flatMap((p) => Object.entries(p.solo).map(([id, x]) => [`${p.name}/solo:${id}`, x])),
  ...progressions.filter((p) => p.exprs.ownmel2).map((p) => [`${p.name}/ownmel2`, p.exprs.ownmel2]),
  ...progressions.filter((p) => p.src).map((p) => [`${p.name}/src`, p.src]),
  ...figures.flatMap((f) => Object.entries(f.exprs).map(([c, x]) => [`${f.name}/${c}`, x])),
  ...development.map((d) => [d.name, d.expr]),
];
const sample = FULL ? all : all.filter((_, i) => i % Math.ceil(all.length / 24) === 0);
let checked = 0;
for (const [id, expr] of sample) {
  const code = `setcpm(110/4)\np: ${expr}`;
  const ev = await evaluateSong(code);
  const h = hapsByLabel(ev, 0, 8).get('p');
  if (!h || h.error || !h.haps.length) throw new Error(`${id} produced no haps: ${h?.error ?? 'empty'}`);
  checked++;
}

const DATA = {
  progressions, figures, development,
  textures: [
    { id: 'own', label: 'own pattern', fig: 'the song’s own interval deployment' },
    { id: 'ownmel', label: 'own + melody', fig: 'the D35 pipeline: a generated toby-fox melody over the own pattern — its rhythmic density is derived at generation time from the accompaniment (the hands must not compete)' },
    { id: 'mix', label: 'full mix', fig: 'the arrangement (D43): piano accompaniment + lead + the instruments the arranger cast for this song. Hover the card to see who plays what and why; use the solo row to hear each contribution alone.' },
    { id: 'ownmel2', label: 'melody T2', fig: 'tier 2 (D38): a melody AUTHORED by the model through the guard — 6 flagship songs; elsewhere falls back to the generated line' },
    { id: 'chords', label: 'true chords', fig: 'raw progression, real durations' },
  ].concat(TEXTURES.map(({ id, label, fig }) => ({ id, label, fig }))),
  contexts: CONTEXTS.map(({ id, label }) => ({ id, label })),
  classes: [...new Set(figures.map((f) => f.cls))].sort(),
  sections: {
    progressions: Object.fromEntries([...new Set(progressions.map((p) => p.section))].sort().map((id) => [id, ATLAS_SECTIONS.progressions[id].label])),
    figures: Object.fromEntries([...new Set(figures.map((f) => f.section))].sort().map((id) => [id, ATLAS_SECTIONS.figures[id].label])),
  },
  melodyHtml: mdToHtml(melodyMd),
  piano: PIANO,
};

const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'undertale.html'), html);

console.log(`wrote audition/undertale.html`);
console.log(`  progressions ${progressions.length} (${progressions.filter((p) => p.needsEar).length} flagged NEEDS EAR)`);
console.log(`  figures      ${figures.length} (${figures.filter((f) => f.needsEar).length} flagged) — textures: ${TEXTURES.map((t) => t.fig).join(', ')}`);
console.log(`  development  ${development.length} moves`);
{
  const layered = progressions.filter((p) => p.plan.layers.length).length;
  const counts = {};
  for (const p of progressions) for (const l of p.plan.layers) counts[l.instrument] = (counts[l.instrument] ?? 0) + 1;
  console.log(`  arrangement  ${layered}/${progressions.length} cards have layers; instruments: ${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([i, n]) => `${i.replace('gm_', '')}×${n}`).join(', ')}`);
  if (ARRANGE_WARNINGS.length) {
    console.log(`  ${ARRANGE_WARNINGS.length} arrangement warnings (voicing substitutions):`);
    for (const w of [...new Set(ARRANGE_WARNINGS.map((w) => w.replace(/^[^:]+: /, '')))].slice(0, 5)) console.log(`    ${w}`);
  }
}
console.log(`  ${checked}${FULL ? '' : ' sampled'} of ${all.length} patterns evaluated green${FULL ? '' : ' (--full checks all)'}; page script parses (${(inline.length / 1024).toFixed(0)} KB)`);

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>undertale — audition</title>
<style>
  :root { color-scheme: dark; --bg:#12141a; --panel:#191c24; --line:#292d3a; --fg:#e8e8ee; --dim:#9a9ab0; --accent:#e0503c; --keep:#37b24d; --kill:#e03131; --warn:#e8a33d; }
  * { box-sizing:border-box; }
  body { font:13.5px/1.5 -apple-system, system-ui, sans-serif; margin:0; background:var(--bg); color:var(--fg); }
  header { position:sticky; top:0; z-index:5; background:var(--bg); border-bottom:1px solid var(--line); padding:10px 18px 8px; }
  .row { display:flex; flex-wrap:wrap; gap:10px 18px; align-items:center; }
  h1 { font-size:15px; margin:0 8px 0 0; }
  .dim { color:var(--dim); font-size:12.5px; }
  label.ctl { display:inline-flex; align-items:center; gap:6px; color:var(--dim); }
  select, input[type=search] { background:#1e212b; color:var(--fg); border:1px solid #3a3f52; border-radius:6px; padding:4px 8px; font:inherit; max-width:220px; }
  input[type=range] { accent-color:var(--accent); width:100px; vertical-align:middle; }
  input[type=checkbox] { accent-color:var(--accent); }
  button { font:inherit; border-radius:6px; border:1px solid #3a3f52; background:#1e212b; color:#cfcfe0; cursor:pointer; padding:4px 10px; }
  button:hover { border-color:#5a5f76; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; font-weight:600; }
  .tabs button { padding:5px 14px; }
  .now { font-variant-numeric:tabular-nums; color:var(--accent); font-weight:600; }
  main { padding:14px 18px 60px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(248px,1fr)); gap:9px; }
  .card { background:var(--panel); border:1px solid var(--line); border-radius:9px; padding:9px 11px 8px; cursor:pointer; position:relative; }
  .card:hover { border-color:#4a5066; }
  .card.sel { border-color:var(--accent); }
  .card.playing { background:#2b1a17; border-color:var(--accent); }
  .card.keep { border-left:3px solid var(--keep); }
  .card.kill { border-left:3px solid var(--kill); opacity:.5; }
  .num { font-family:ui-monospace, Menlo, monospace; font-size:12px; color:var(--dim); word-break:break-all; }
  .sym { font-weight:650; font-size:13.5px; margin:2px 0 4px; }
  .fig { font-family:ui-monospace, Menlo, monospace; font-size:12.5px; color:#ffd7ae; margin:2px 0 4px; word-break:break-all; }
  .tags { font-size:11.5px; color:var(--dim); min-height:15px; }
  .sec { color:#7ea0d6; font-size:10.5px; }
  .flag { display:inline-block; font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:#1a1208; background:var(--warn); border-radius:3px; padding:0 5px; margin-right:5px; font-weight:700; }
  .flag.t2 { background:#4c8dff; color:#04102a; }
  .badge { position:absolute; top:8px; right:10px; font-size:10px; text-transform:uppercase; letter-spacing:.07em; color:#6b7086; }
  /* the form strip (D47): the arrangement's shape over time, drawn */
  .form { display:flex; gap:3px; width:100%; margin-top:8px; }
  .formsec { flex:1; border-radius:5px; padding:5px 7px; display:flex; flex-direction:column; gap:1px;
             font-size:10.5px; line-height:1.35; border:1px solid var(--line); min-width:0; }
  .formsec b { font-size:11.5px; letter-spacing:.02em; }
  .formsec span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .formsec.e1 { background:#171a22; color:#767c92; }
  .formsec.e2 { background:#1b2130; color:#8e97b3; }
  .formsec.e3 { background:#1f2a3f; color:#a8b4d4; }
  .formsec.e4 { background:#25344f; color:#c2cbe6; }
  .formsec.e5 { background:#2d4062; color:#e2e8f7; }
  .formsec.muted { opacity:.45; }
  .formcap { font-size:10.5px; margin-top:4px; }
  .acts { display:flex; gap:5px; margin-top:7px; flex-wrap:wrap; }
  .acts button { padding:2px 8px; font-size:11.5px; }
  .acts button.k.on { background:var(--keep); border-color:var(--keep); color:#fff; }
  .acts button.x.on { background:var(--kill); border-color:var(--kill); color:#fff; }
  footer { position:fixed; bottom:0; left:0; right:0; background:var(--panel); border-top:1px solid var(--line); padding:7px 18px; display:flex; gap:16px; align-items:center; font-size:12.5px; }
  kbd { background:#232734; border:1px solid #3a3f52; border-radius:4px; padding:0 5px; font:11.5px ui-monospace,monospace; }
  .note { background:#191c24; border:1px solid var(--line); border-left:3px solid var(--accent); border-radius:0 8px 8px 0; padding:9px 13px; margin-bottom:12px; font-size:12.5px; color:#c9c9dc; }
  .prose { max-width:820px; }
  .prose h2 { font-size:18px; margin:6px 0 10px; }
  .prose h3 { font-size:14.5px; margin:18px 0 6px; color:var(--accent); }
  .prose li { margin:6px 0; }
  .prose code { background:#232734; border-radius:4px; padding:0 4px; font-size:12px; }
</style>
</head>
<body>
<header>
  <div class="row">
    <h1>undertale — audition</h1>
    <div class="tabs" id="tabs"></div>
    <span class="dim" id="count"></span>
    <span class="now" id="now">— click a card to play —</span>
    <button id="stop">■ stop</button>
    <span class="dim" id="rtstatus">click any card to start audio</span>
  </div>
  <div class="row" style="margin-top:7px" id="controls"></div>
  <div class="row" style="margin-top:6px" id="solo"></div>
</header>
<main>
  <div class="note" id="blurb"></div>
  <div class="grid" id="grid"></div>
  <div class="prose" id="prose" style="display:none"></div>
</main>
<footer>
  <span id="tally"></span>
  <span style="flex:1"></span>
  <span class="dim"><kbd>&larr;&rarr;&uarr;&darr;</kbd> move <kbd>space</kbd> play <kbd>a</kbd> source MIDI <kbd>k</kbd> keep <kbd>x</kbd> kill <kbd>esc</kbd> stop</span>
  <button id="export">copy verdicts JSON</button>
</footer>
<script src="${WEB_BUNDLE}"></script>
<script>
${RUNTIME_JS}
const DATA = ${JSON.stringify(DATA)};
const LS = 'motif-engine:undertale-verdicts';
let verdicts = {}; try { verdicts = JSON.parse(localStorage.getItem(LS) || '{}'); } catch {}
// UI settings survive a reload — tab, texture, filters, tempo, checkboxes.
// Losing your place on every refresh makes a 165-card ear pass unusable.
const PREFS = 'motif-engine:undertale-prefs';
let prefs = { tab: 'progressions', texture: 'own', context: 'own', ctl: {} };
try { prefs = Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS) || '{}')); } catch {}
const savePrefs = () => { try { localStorage.setItem(PREFS, JSON.stringify(prefs)); } catch {} };
const CTL_IDS = ['fam', 'sec', 'cls', 'ear', 't2', 'bass', 'srcbpm', 'bpm', 'q'];
function captureCtl() {
  for (const id of CTL_IDS) {
    const el = $(id);
    if (el) prefs.ctl[id] = el.type === 'checkbox' ? el.checked : el.value;
  }
  savePrefs();
}
function applyCtl() {
  for (const id of CTL_IDS) {
    const el = $(id);
    if (!el || !(id in prefs.ctl)) continue;
    if (el.type === 'checkbox') el.checked = !!prefs.ctl[id];
    else el.value = prefs.ctl[id];
  }
  if ($('bpm') && $('bpmv')) $('bpmv').textContent = $('bpm').value;
}
let tab = prefs.tab, texture = prefs.texture, context = prefs.context, soloId = null, playing = null, sel = 0, visible = [];
const $ = (id) => document.getElementById(id);
const save = () => localStorage.setItem(LS, JSON.stringify(verdicts));

const BLURB = {
  progressions: 'Chord loops these songs actually cycle, played IN THE SOLVED KEY at the source tempo. Default texture \\u201cown pattern\\u201d = the song\\u2019s OWN interval deployment (its arpeggio order/spacing/register) bound to its chords — the harmony as the song plays it. \\u201cown + melody\\u201d = a GENERATED toby-fox-profile melody over it (the D35 pipeline: chord-scale note supply, anchors snapped, approach tones — nothing here is quoted from any song). \\u201ctrue chords\\u201d = block voicings at real durations; the rest re-voice through other songs\\u2019 figures. Press a (or ▶ src) for the VERBATIM source MIDI — the ground truth. Cards are GROUPED BY ATLAS SECTION (the blue line; similar patterns sit together, hover for neighbors + song context). NEEDS EAR marks thin evidence.',
  figures: 'The left hand with the chord factored out — R=root, 3/5/7/9 the sounding chord\\u2019s members, ~n a literal colour, + an octave, a.b together. \\u201cown song\\u201d (default) plays it over the loop extracted from its source song; switch progressions to hear the SAME movement re-voice itself over different harmony — that portability is what is being auditioned.',
  development: 'Observed A\\u2192B moves between figures: 4 bars of A, then 4 bars of B, over i VI III VII. The relation tag says what changes (repitch keeps the rhythm and moves the pitches; blockify fuses an arp into chords; …). This is how the corpus develops an accompaniment without abandoning it.',
  melody: 'Notes only — no entries were extracted from the melodies, by design (see the bottom of the page).',
};

function bpmFor(e) {
  const srcOn = $('srcbpm') && $('srcbpm').checked;
  if (srcOn && e && e.bpm) return e.bpm;
  return Number($('bpm') && $('bpm').value) || 110;
}
function codeFor(e, useSrc) {
  let body, factor = 1, beats = 4;
  // belt and braces: an entry from another tab can still be referenced by a
  // stale 'playing' reference after a switch. Return null rather than composing
  // "p: undefined" and surfacing it as a JS/eval error.
  const belongs = tab === 'progressions' ? !!(e.exprs && e.symbols)
    : tab === 'figures' ? !!(e.exprs && e.labels)
      : tab === 'development' ? !!e.expr : false;
  if (!belongs) return null;
  if (tab === 'progressions') {
    beats = e.beats || 4;
    if (useSrc && e.src) body = e.src;
    else if (texture === 'ownmel') body = e.exprs.ownmel;
    else if (texture === 'mix') body = (soloId && e.solo[soloId]) ? e.solo[soloId] : e.exprs.mix;
    else if (texture === 'ownmel2') body = e.exprs.ownmel2 || e.exprs.ownmel;
    else if (texture === 'own' && !e.exprs.own) { body = e.exprs.chords; factor = 2; } // no own pattern extracted: fall back to true chords
    else if (texture === 'chords') { body = e.exprs.chords; factor = 2; }
    else if (texture === 'own') body = e.exprs.own;
    else body = ($('bass') && $('bass').checked) ? 'stack(' + e.exprs[texture] + ', ' + e.bass + ')' : e.exprs[texture];

  }
  else if (tab === 'figures') body = e.exprs[context] || e.exprs.axis;
  else body = e.expr;
  return 'setcpm(' + (bpmFor(e) * factor) + '/' + beats + ')\\np: ' + body;
}
async function play(e, useSrc) {
  const code = codeFor(e, useSrc);
  if (!code) { stop(); return; }
  $('now').textContent = RT.ready ? '…' : 'starting audio (first play loads the piano)…';
  const ok = await rtPlay(code);
  if (!ok) { playing = null; render(); return; }
  playing = e.name;
  $('now').textContent = '▶ ' + (useSrc ? '[SOURCE MIDI] ' : '') + labelOf(e);
  render();
}
function stop() { rtStop(); playing = null; $('now').textContent = '— stopped —'; render(); }
function labelOf(e) {
  if (tab === 'progressions') return (e.song || '?') + '  —  ' + e.numerals;
  if (tab === 'figures') return e.name + '  over  ' + (e.labels[context] || context);
  return e.from + ' → ' + e.to;
}

function items() {
  if (tab === 'progressions') return DATA.progressions;
  if (tab === 'figures') return DATA.figures;
  if (tab === 'development') return DATA.development;
  return [];
}
function matches(e) {
  const q = ($('q') ? $('q').value : '').trim().toLowerCase();
  if (q && !JSON.stringify([e.name, e.song || '', e.numerals || '', (e.songs || []).join(' '), e.cls || '', e.from || '', e.to || '']).toLowerCase().includes(q)) return false;
  if (tab === 'progressions') {
    if ($('fam').value && e.family !== $('fam').value) return false;
    if ($('sec') && $('sec').value && e.section !== $('sec').value) return false;
    if ($('ear').checked && !e.needsEar) return false;
    if ($('t2') && $('t2').checked && !e.hasT2) return false;
  }
  if (tab === 'figures') {
    if ($('cls').value && e.cls !== $('cls').value) return false;
    if ($('sec') && $('sec').value && e.section !== $('sec').value) return false;
    if ($('ear').checked && !e.needsEar) return false;
  }
  return true;
}
function sectionOpts(kind) {
  return '<option value="">all</option>' + Object.entries(DATA.sections[kind]).map(([id, label]) =>
    '<option value="' + id + '">' + label + '</option>').join('');
}

function controls() {
  const c = $('controls');
  if (tab === 'progressions') {
    c.innerHTML = '<label class="ctl">texture <span id="tex"></span></label>' +
      '<label class="ctl"><input type="checkbox" id="bass"> bass</label>' +

      '<label class="ctl"><input type="checkbox" id="srcbpm" checked> source bpm</label>' +
      '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="180" value="110"><span id="bpmv">110</span></label>' +
      '<label class="ctl">mode <select id="fam"><option value="">all</option><option>major</option><option>minor</option></select></label>' +
      '<label class="ctl">section <select id="sec">' + sectionOpts('progressions') + '</select></label>' +
      '<label class="ctl"><input type="checkbox" id="ear"> only NEEDS EAR</label>' +
      '<label class="ctl"><input type="checkbox" id="t2"> only TIER 2</label>' +
      '<input type="search" id="q" placeholder="search song / numerals">';
    const tw = $('tex');
    DATA.textures.forEach((t) => {
      const b = document.createElement('button');
      b.textContent = t.label; b.title = t.fig; b.className = t.id === texture ? 'on' : '';
      b.onclick = () => { texture = t.id; prefs.texture = t.id; soloId = null; savePrefs(); controls(); render(); if (playing) { const e = DATA.progressions.find((x) => x.name === playing); if (e) play(e); } };
      tw.appendChild(b);
    });

  } else if (tab === 'figures') {
    c.innerHTML = '<label class="ctl">progression <span id="ctxb"></span></label>' +
      '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="180" value="110"><span id="bpmv">110</span></label>' +
      '<label class="ctl">class <select id="cls"><option value="">all</option>' + DATA.classes.map((x) => '<option>' + x + '</option>').join('') + '</select></label>' +
      '<label class="ctl">section <select id="sec">' + sectionOpts('figures') + '</select></label>' +
      '<label class="ctl"><input type="checkbox" id="ear"> only NEEDS EAR</label>' +
      '<input type="search" id="q" placeholder="search figure / song">';
    const cw = $('ctxb');
    DATA.contexts.forEach((x) => {
      const b = document.createElement('button');
      b.textContent = x.label; b.className = x.id === context ? 'on' : '';
      b.onclick = () => { context = x.id; prefs.context = x.id; savePrefs(); controls(); render(); if (playing) { const e = DATA.figures.find((f) => f.name === playing); if (e) play(e); } };
      cw.appendChild(b);
    });
  } else if (tab === 'development') {
    c.innerHTML = '<label class="ctl">bpm <input type="range" id="bpm" min="60" max="180" value="110"><span id="bpmv">110</span></label>' +
      '<input type="search" id="q" placeholder="search move">';
  } else {
    c.innerHTML = '';
  }
  if ($('bpm')) $('bpm').oninput = () => { $('bpmv').textContent = $('bpm').value; if ($('srcbpm')) $('srcbpm').checked = false; captureCtl(); if (playing) { const e = items().find((x) => x.name === playing); if (e) play(e); } };
  if ($('srcbpm')) $('srcbpm').oninput = () => { captureCtl(); if (playing) { const e = items().find((x) => x.name === playing); if (e) play(e); } };
  applyCtl();
  for (const id of ['fam', 'ear', 'q', 'cls', 'sec', 't2']) if ($(id)) $(id).oninput = () => { captureCtl(); render(); };
  for (const id of ['bass']) if ($(id)) $(id).oninput = () => { captureCtl(); render(); if (playing) { const e = items().find((x) => x.name === playing); if (e) play(e); } };
  $('blurb').textContent = BLURB[tab];
}

function soloRow() {
  const row = $('solo');
  if (!row) return;
  const e = visible[sel];
  if (tab !== 'progressions' || texture !== 'mix' || !e) { row.innerHTML = ''; row.style.display = 'none'; return; }
  row.style.display = '';
  row.innerHTML = '<span class="dim">hear alone:</span> ';
  const opts = [['', 'full mix'], ['_base', 'piano acc'], ['_lead', 'piano lead']]
    .concat(e.plan.layers.map(function (l) {
      return [l.id, l.instrument.replace('gm_', '') + ' (' + l.part.replace('_', ' ') + ' @' + l.octave + ')'];
    }));
  for (const [id, label] of opts) {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = (soloId || '') === id ? 'on' : '';
    b.onclick = () => { soloId = id || null; soloRow(); if (playing === e.name) play(e); else play(e); };
    row.appendChild(b);
  }
  // The FORM, drawn (D47). Each section is a block wide in proportion to its
  // bars, labelled with its archetype, who has the tune, and who is playing.
  // The whole point of the feature is that the arrangement changes over time,
  // so the page has to show the shape as well as sound it.
  if (!e.form) return;
  const strip = document.createElement('div');
  strip.className = 'form';
  const secs = e.form.sections;
  for (const s of secs) {
    const cell = document.createElement('div');
    cell.className = 'formsec e' + s.energy + (soloId ? ' muted' : '');
    const who = s.lead === 'none' ? 'no melody'
      : s.lead === 'piano' ? 'piano leads' : (s.lead.replace('gm_', '') + ' takes over');
    cell.innerHTML = '<b>' + s.archetype + '</b>'
      + '<span>' + who + '</span>'
      + '<span class="dim">' + (s.active.length ? s.active.join(', ') : 'piano only') + '</span>';
    cell.title = 'bars ' + s.startBar + '-' + (s.startBar + s.bars - 1)
      + ' · energy ' + s.energy + '/5 · mass ' + s.mass + '\\n' + s.why;
    strip.appendChild(cell);
  }
  const cap = document.createElement('div');
  cap.className = 'dim formcap';
  cap.textContent = 'form: ' + secs.length + ' sections × ' + e.form.sectionBars + ' bars = '
    + e.form.totalBars + ' bars, then it loops';
  row.appendChild(strip);
  row.appendChild(cap);
}

function render() {
  const prose = tab === 'melody';
  $('grid').style.display = prose ? 'none' : '';
  $('prose').style.display = prose ? '' : 'none';
  if (prose) { $('prose').innerHTML = DATA.melodyHtml; $('count').textContent = ''; return; }
  visible = items().filter(matches);
  // atlas grouping: similar patterns sit together (D35 sections)
  if (tab === 'progressions' || tab === 'figures') {
    visible = visible.slice().sort((a, b) => (a.section < b.section ? -1 : a.section > b.section ? 1 : 0));
  }
  if (sel >= visible.length) sel = Math.max(0, visible.length - 1);
  const grid = $('grid'); grid.innerHTML = '';
  visible.forEach((e, i) => {
    const card = document.createElement('div');
    card.className = 'card' + (i === sel ? ' sel' : '') + (playing === e.name ? ' playing' : '') + (verdicts[e.name] ? ' ' + verdicts[e.name] : '');
    let head = '', body = '', tags = '', badge = '';
    const ctxBits = e.context ? [e.context.role, e.context.character, (e.context.motifs || []).join('/')].filter(Boolean).join(' · ') : '';
    const atlasTip = (e.sectionLabel ? '\\nsection: ' + e.sectionLabel : '') +
      (e.similar && e.similar.length ? '\\nsimilar: ' + e.similar.join(', ') : '') +
      (e.context && e.context.notes ? '\\n' + e.context.notes : '');
    if (tab === 'progressions') {
      badge = e.meter + (e.bpm ? ' · ' + e.bpm : '');
      head = (e.needsEar ? '<span class="flag">needs ear</span>' : '') + (e.hasT2 ? '<span class="flag t2">tier 2</span>' : '');
      body = '<div class="num">' + e.numerals + '</div><div class="sym">' + e.symbols.join(' ') + '</div>';
      tags = e.song + ' · ' + e.loopBars + '-bar loop ×' + e.reps + ' · cov ' + e.coverage +
        (ctxBits ? '<br>' + ctxBits : '') + '<br><span class="sec">' + e.sectionLabel + '</span>';
      card.title = e.name + '\\nsolved key ' + e.sourceKey + ' (margin ' + e.keyMargin + ')\\nbars per chord: ' + e.barsPerChord.join(', ') + '\\nfound at bar ' + e.atBar
        + '\\nmelody ' + e.melCell + ': ' + e.melDensity + ' onsets/bar (target ' + e.melTarget + ', interlock ' + e.melInterlock + ', repeat ' + e.melRepeat + ')'
        + '\\n\\nARRANGEMENT — budget ' + e.plan.budget + '/bar, piano spends ' + e.plan.spent + ', headroom ' + e.plan.headroom
        + ', mass ' + e.plan.massAtOnce + ' sounding at once'
        + (e.plan.layers.length ? e.plan.layers.map(function (l) {
          return '\\n• ' + l.instrument + ' — ' + l.part
            + ' (oct ' + l.octave + ' of ' + (l.range ? l.range.join('-') : '?') + (l.clamped ? ', clamped from lane ' + l.lane : '')
            + ', gain ' + l.gain + ' at level ' + l.level + (l.shares ? ', SHARES an octave with the piano' : '') + ')'
            + '\\n    plays in sections ' + (l.sections && l.sections.length ? l.sections.join(', ') : '(lead only)') + ' — mask <' + l.mask + '>'
            + '\\n    ' + l.contributes + '\\n    ' + l.character + '\\n    why: ' + l.why;
        }).join('') : '\\n• no layers: ' + e.plan.notes.join('; '))
        + (e.form ? '\\n\\nFORM — ' + e.form.sections.length + ' sections × ' + e.form.sectionBars + ' bars ('
          + e.form.totalBars + ' bars, then it loops)'
          + e.form.sections.map(function (s) {
            return '\\n' + s.i + '. ' + s.archetype + ' @bar ' + s.startBar + ' — energy ' + s.energy + '/5, '
              + (s.lead === 'none' ? 'NO melody' : s.lead === 'piano' ? 'piano leads' : s.lead + ' takes the tune')
              + (s.active.length ? ', with ' + s.active.join(' + ') : ', piano alone')
              + '\\n     ' + s.why;
          }).join('')
          + '\\nform notes: ' + e.form.notes.join('\\n  ') : '')
        + '\\n\\nplan notes: ' + e.plan.notes.join('\\n  ')
        + atlasTip;
      if (texture === 'mix') {
        const line = e.plan.layers.length
          ? e.plan.layers.map(function (l) { return l.instrument.replace('gm_', '') + '·' + l.part.replace('_', ' ') + '@' + l.octave; }).join(' + ')
          : 'piano only (no headroom)';
        const takes = e.form ? e.form.sections.filter(function (s) { return s.lead !== 'piano' && s.lead !== 'none'; }) : [];
        tags += ' · ' + line
          + (e.form ? '<br><span class="sec">' + e.form.sections.map(function (s) { return s.archetype; }).join(' → ')
            + (takes.length ? ' · ' + takes[0].lead.replace('gm_', '') + ' takes the tune' : '') + '</span>' : '');
      }
    } else if (tab === 'figures') {
      badge = e.cls + ' · ' + e.meter;
      head = e.needsEar ? '<span class="flag">needs ear</span>' : '';
      body = '<div class="fig">' + e.figure.join(' ') + '</div>';
      tags = e.seen + ' bars · ' + e.songs.slice(0, 2).join(', ') + (e.micro ? ' · feel' : '') +
        '<br><span class="sec">' + e.sectionLabel + '</span>';
      card.title = e.name + '\\nrole ' + e.role + ' · octave ' + e.octave + (e.legato ? ' · legato' : '') + '\\nfit: ' + JSON.stringify(e.fit) + '\\nsongs: ' + e.songs.join(', ') + atlasTip;
    } else {
      badge = '×' + e.seen;
      body = '<div class="sym">' + e.from.replace(/^ut_/, '') + ' → ' + e.to.replace(/^ut_/, '') + '</div>' +
        '<div class="num">' + e.relation.join(' + ') + '</div>';
      tags = e.examples.join(' · ');
      card.title = e.name;
    }
    card.innerHTML = '<div class="badge">' + badge + '</div>' + head + body + '<div class="tags">' + tags + '</div>';
    const acts = document.createElement('div'); acts.className = 'acts';
    for (const [cls, verd] of [['k', 'keep'], ['x', 'kill']]) {
      const b = document.createElement('button');
      b.className = cls + (verdicts[e.name] === verd ? ' on' : ''); b.textContent = verd;
      b.onclick = (ev) => { ev.stopPropagation(); mark(e, verd); };
      acts.appendChild(b);
    }
    if (tab === 'progressions' && e.src) {
      const sb = document.createElement('button'); sb.textContent = '▶ src';
      sb.title = 'play the verbatim source MIDI of these bars';
      sb.onclick = (ev) => { ev.stopPropagation(); sel = i; play(e, true); };
      acts.appendChild(sb);
    }
    const cp = document.createElement('button'); cp.textContent = 'copy';
    cp.onclick = (ev) => { ev.stopPropagation(); copy(e, cp); };
    acts.appendChild(cp);
    card.appendChild(acts);
    card.onclick = () => { sel = i; play(e); };
    grid.appendChild(card);
  });
  $('count').textContent = visible.length + ' shown';
  const k = Object.values(verdicts).filter((v) => v === 'keep').length;
  const x = Object.values(verdicts).filter((v) => v === 'kill').length;
  $('tally').innerHTML = '<b style="color:var(--keep)">' + k + ' kept</b> · <b style="color:var(--kill)">' + x + ' killed</b>';
  soloRow();
}
function mark(e, verd) {
  if (verdicts[e.name] === verd) delete verdicts[e.name]; else verdicts[e.name] = verd;
  save(); render();
}
async function copy(e, btn) {
  const ok = await rtCopy(codeFor(e) || '');
  const t = btn.textContent; btn.textContent = ok ? '✓' : '✗'; setTimeout(() => { btn.textContent = t; }, 900);
}
const tw = $('tabs');
for (const t of ['progressions', 'figures', 'development', 'melody']) {
  const b = document.createElement('button');
  b.textContent = t; b.className = t === tab ? 'on' : '';
  // Switching tabs STOPS playback first. The old card belongs to the old tab,
  // and codeFor()/labelOf() read the CURRENT tab — re-playing it after a switch threw
  // (a progression has no .labels, a figure has no .exprs[texture]).
  b.onclick = () => {
    stop();
    tab = t; sel = 0; prefs.tab = t; savePrefs();
    [...tw.children].forEach((c) => { c.className = c.textContent === tab ? 'on' : ''; });
    controls(); render();
  };
  tw.appendChild(b);
}
$('stop').onclick = stop;
$('export').onclick = async () => {
  const ok = await rtCopy(JSON.stringify({ verdicts }, null, 2));
  $('export').textContent = ok ? 'copied ✓' : 'copy failed';
  setTimeout(() => { $('export').textContent = 'copy verdicts JSON'; }, 1200);
};
document.onkeydown = (ev) => {
  if (ev.target.tagName === 'INPUT' || ev.target.tagName === 'SELECT') return;
  if (tab === 'melody') return;
  const cols = Math.max(1, Math.floor($('grid').clientWidth / 257));
  const move = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }[ev.key];
  if (move) { sel = Math.max(0, Math.min(visible.length - 1, sel + move)); render(); document.querySelectorAll('.card')[sel]?.scrollIntoView({ block: 'nearest' }); ev.preventDefault(); return; }
  if (ev.key === ' ') { const e = visible[sel]; if (e) (playing === e.name ? stop() : play(e)); ev.preventDefault(); return; }
  if (ev.key === 'Escape') return stop();
  if (ev.key === 'k' && visible[sel]) return mark(visible[sel], 'keep');
  if (ev.key === 'x' && visible[sel]) return mark(visible[sel], 'kill');
  if (ev.key === 'a' && tab === 'progressions' && visible[sel] && visible[sel].src) return play(visible[sel], true);
};
controls(); render();
</script>
</body>
</html>`;
}
