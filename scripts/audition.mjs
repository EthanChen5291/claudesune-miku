#!/usr/bin/env node
// Builds spec.json files that audition every current library entry by ear
// (DECISIONS D21/D23.3: entries are unratified until Ethan's ear keeps them).
// One section per entry; sections don't overlap in time, so playing a
// generated listen.html straight through naturally solos each entry in turn.
// Run: node scripts/audition.mjs   (writes audition/<name>/spec.json)
// Then: node src/cli.js generate audition/<name>/spec.json --out audition/<name>
// for each <name> printed at the end.

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { VOICINGS } from '../src/lib/voicings.js';
import { TRANSITIONS } from '../src/lib/transitions.js';
import { INTERLOCKS } from '../src/lib/interlocks.js';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'audition');

function soundForRhythm(entry) {
  const tags = entry.tags ?? [];
  if (tags.includes('hat')) return 'hh';
  if (tags.includes('snare')) return 'sd';
  if (tags.includes('kick')) return 'bd';
  if (tags.includes('composite')) return 'cp';
  if (entry.band === 'low') return 'bd';
  if (entry.band === 'high') return 'hh';
  return 'rim';
}
const ROLE_SOUND = { kick: 'bd', bass: 'lt', snare: 'sd', melodic: 'rim', composite: 'cp', hat: 'hh' };

// ---------------------------------------------------------------------------
// Rhythms — grouped by meter (a spec has one global meter). Audition r1: the
// library exists for NOTES to fill in — so note-role entries are auditioned
// WITH notes (melodic: a line over a vamp; chords: comping via bindComp;
// bass: a low root-five line). Only percussion-role entries audition as drums.
// ---------------------------------------------------------------------------
const AUDITION_HARMONY = {
  '4/4': { harmony: ['Fm7', 'Db^7'], harmonicRhythm: 2 },
  '7/8': { harmony: ['Dm7', 'G7'], harmonicRhythm: 2 },
  '3/4': { harmony: ['C^7', 'Am7'], harmonicRhythm: 2 },
};

/** How each entry is rendered in audition — also shown in the checklist. */
export function auditionModeFor(entry) {
  if (entry.role === 'melodic' || entry.role === 'support') return 'notes';
  if (entry.role === 'chords') return 'comp';
  if (entry.role === 'bass') return 'bass line';
  return 'drums';
}

function rhythmLayer(name, entry, meter) {
  const mode = auditionModeFor(entry);
  if (mode === 'notes') {
    return { bind: { rhythm: name, contour: 'lib:zigzag_narrow', octave: 4, sound: 'triangle', fx: '.room(0.15)' } };
  }
  if (mode === 'comp') {
    return { bind: { rhythm: name, comp: true, dict: 'drop2', sound: 'square', fx: '.lpf(1500).room(0.2)' } };
  }
  if (mode === 'bass line') {
    return { bind: { rhythm: name, contour: 'lib:bass_root_five', octave: 2, sound: 'square', fx: '.lpf(600)' } };
  }
  return { bind: { rhythm: name, sound: soundForRhythm(entry) } };
}

function rhythmSpec({ title, meter, bpm, key, names, bars = 4 }) {
  const sections = {};
  for (const name of names) {
    const entry = RHYTHMS[name];
    const needsHarmony = auditionModeFor(entry) !== 'drums';
    sections[name] = {
      bars,
      ...(needsHarmony ? AUDITION_HARMONY[meter] : {}),
      layers: { hits: rhythmLayer(name, entry, meter) },
    };
  }
  return { title, meter, bpm, key, seed: 1, form: names.join(' '), sections };
}

const rhythmsByMeter = { '4/4': [], '7/8': [], '3/4': [] };
for (const [name, e] of Object.entries(RHYTHMS)) {
  const m = e.meter_class === 'any' ? '4/4' : e.meter_class;
  (rhythmsByMeter[m] ??= []).push(name);
}

const specs = {};
specs['rhythms-4-4'] = rhythmSpec({ title: 'rhythms-4-4', meter: '4/4', bpm: 118, key: 'F:minor', names: rhythmsByMeter['4/4'] });
specs['rhythms-7-8'] = rhythmSpec({ title: 'rhythms-7-8', meter: '7/8', bpm: 140, key: 'D:dorian', names: rhythmsByMeter['7/8'] });
specs['rhythms-3-4'] = rhythmSpec({ title: 'rhythms-3-4', meter: '3/4', bpm: 150, key: 'C:major', names: rhythmsByMeter['3/4'] });

// ---------------------------------------------------------------------------
// Contours — each contour gets an EXACT-FIT even rhythm (one onset per degree,
// all accents under the snap threshold) + one static chord, so the ear hears
// the contour data itself: no resampling, no chord-tone snapping, no rhythm
// story. (Audition r1: push_pull_16s smeared every non-6-degree contour.)
// ---------------------------------------------------------------------------
{
  const names = Object.keys(CONTOURS);
  const sections = {};
  for (const name of names) {
    const n = CONTOURS[name].degrees.length;
    const onsets = Array.from({ length: n }, (_, i) => `${i}/${n}`);
    const accents = Array.from({ length: n }, (_, i) => (i === 0 ? 0.68 : i % 2 ? 0.5 : 0.6));
    sections[name] = {
      bars: 2, harmony: ['Cm7'], harmonicRhythm: 2,
      layers: { lead: { bind: { rhythm: { name: `even_${n}`, onsets, accents }, contour: `lib:${name}`, octave: 5, sound: 'triangle', fx: '.room(0.15)' } } },
    };
  }
  specs['contours'] = { title: 'contours', meter: '4/4', bpm: 112, key: 'C:dorian', seed: 1, form: names.join(' '), sections };
}

// ---------------------------------------------------------------------------
// Voicing shapes — one static 4-chord vamp (i9 - VI^7 - iv7 - V7) covering
// m9/^7/m7/7 qualities, one section per shape so spacing/register differences
// are the only variable.
// ---------------------------------------------------------------------------
{
  const names = Object.keys(VOICINGS);
  const harmony = ['Cm9', 'Ab^7', 'Fm7', 'G7'];
  const sections = {};
  for (const name of names) {
    sections[name] = {
      bars: 4, harmony, harmonicRhythm: 1,
      layers: { pads: { pattern: `chords.dict('me_${name}').voicing().s("square").lpf(1400).room(0.4).gain(0.6)` } },
    };
  }
  specs['voicings'] = { title: 'voicings', meter: '4/4', bpm: 100, key: 'C:minor', seed: 1, form: names.join(' '), sections };
}

// ---------------------------------------------------------------------------
// Transitions — a constant backing bed so the transition itself is the only
// variable across each boundary. Breakdown-context entries get a thinned bed
// (no kick/bass) since that's the context they're designed for.
// ---------------------------------------------------------------------------
{
  const meter = '4/4', bpm = 122, key = 'F:minor', harmony = ['Fm9', 'C7'], harmonicRhythm = 2, bars = 4;
  const fullLayers = () => ({
    kick: { bind: { rhythm: 'four_floor', sound: 'bd', fx: '.bank("tr909")' } },
    hats: { bind: { rhythm: 'sixteenth_drive', sound: 'hh', fx: '.bank("tr909")' } },
    bass: { bind: { rhythm: 'anticipation_bass', contour: 'lib:bass_root_five', octave: 2, sound: 'square', fx: '.lpf(500)' } },
    pads: { pattern: `chords.dict('me_closed_stack').voicing().s("square").lpf(1200).room(0.3).gain(0.5)` },
  });
  const breakdownLayers = () => ({
    hats: { bind: { rhythm: 'swung_lofi_hats', sound: 'hh', gainRange: [0.15, 0.5] } },
    pads: { pattern: `chords.dict('me_closed_stack').voicing().s("square").lpf(700).room(0.5).gain(0.45)` },
  });
  const calmLayers = () => ({
    kick: { bind: { rhythm: 'four_floor', sound: 'bd' } },
    hats: { bind: { rhythm: 'swung_lofi_hats', sound: 'hh', gainRange: [0.2, 0.55] } },
  });
  const sections = {
    leadin_riser: { role: 'verse', bars, harmony, harmonicRhythm, layers: fullLayers() },
    chorus_riser: { role: 'chorus', bars, harmony, harmonicRhythm, layers: fullLayers() },
    leadin_noise: { role: 'breakdown', bars, harmony, harmonicRhythm, layers: breakdownLayers() },
    chorus_noise: { role: 'chorus', bars, harmony, harmonicRhythm, layers: fullLayers() },
    leadin_fill: { role: 'verse', bars, harmony, harmonicRhythm, layers: fullLayers() },
    chorus_fill: { role: 'chorus', bars, harmony, harmonicRhythm, layers: fullLayers() },
    leadin_tom: { role: 'verse', bars, harmony, harmonicRhythm, layers: fullLayers() },
    any_tom: { role: 'verse', bars, harmony, harmonicRhythm, layers: fullLayers() },
    leadin_impact: { role: 'verse', bars, harmony, harmonicRhythm, layers: fullLayers() },
    any_impact: { role: 'chorus', bars, harmony, harmonicRhythm, layers: fullLayers() },
    chorus_before_sweep: { role: 'chorus', bars, harmony, harmonicRhythm, layers: fullLayers() },
    after_sweep: { role: 'verse', bars, harmony, harmonicRhythm, layers: calmLayers() },
    leadin_drop: { role: 'breakdown', bars, harmony, harmonicRhythm, layers: breakdownLayers() },
    chorus_drop: { role: 'chorus', bars, harmony, harmonicRhythm, layers: fullLayers() },
  };
  const transitions = [
    { use: 'riser_hat_swell', into: 'chorus_riser', occurrence: 1 },
    { use: 'riser_noise_sweep', into: 'chorus_noise', occurrence: 1 },
    { use: 'fill_snare_roll', into: 'chorus_fill', occurrence: 1 },
    { use: 'fill_tom_run', into: 'any_tom', occurrence: 1 },
    { use: 'impact_boom', into: 'any_impact', occurrence: 1 },
    { use: 'sweep_downlifter', into: 'after_sweep', occurrence: 1 },
    { use: 'sub_drop', into: 'chorus_drop', occurrence: 1 },
  ];
  const missing = Object.keys(TRANSITIONS).filter((n) => !transitions.some((t) => t.use === n));
  if (missing.length) throw new Error(`transition audition is missing entries: ${missing.join(', ')}`);
  specs['transitions'] = { title: 'transitions', meter, bpm, key, seed: 1, form: Object.keys(sections).join(' '), sections, transitions };
}

// ---------------------------------------------------------------------------
// Interlocks — both rhythms of a declared pair, layered, grouped by meter.
// ---------------------------------------------------------------------------
function interlockSpec({ title, meter, bpm, key, entries }) {
  const sections = {};
  for (const e of entries) {
    sections[e.name] = {
      bars: 4,
      layers: {
        layer_a: { bind: { rhythm: e.rhythms.a, sound: ROLE_SOUND[e.roles.a] ?? 'bd' } },
        layer_b: { bind: { rhythm: e.rhythms.b, sound: ROLE_SOUND[e.roles.b] ?? 'rim' } },
      },
    };
  }
  return { title, meter, bpm, key, seed: 1, form: entries.map((e) => e.name).join(' '), sections };
}
const interlocksByMeter = { '4/4': [], '7/8': [] };
for (const e of INTERLOCKS) {
  const m = RHYTHMS[e.rhythms.a]?.meter_class ?? '4/4';
  (interlocksByMeter[m === 'any' ? '4/4' : m] ??= []).push(e);
}
specs['interlocks-4-4'] = interlockSpec({ title: 'interlocks-4-4', meter: '4/4', bpm: 118, key: 'F:minor', entries: interlocksByMeter['4/4'] });
if (interlocksByMeter['7/8'].length) {
  specs['interlocks-7-8'] = interlockSpec({ title: 'interlocks-7-8', meter: '7/8', bpm: 140, key: 'D:dorian', entries: interlocksByMeter['7/8'] });
}

// ---------------------------------------------------------------------------
// Write specs
// ---------------------------------------------------------------------------
for (const [name, spec] of Object.entries(specs)) {
  const dir = join(OUT, name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'spec.json'), JSON.stringify(spec, null, 2));
  console.log(`wrote audition/${name}/spec.json (${Object.keys(spec.sections).length} entries)`);
}

// ---------------------------------------------------------------------------
// Checklist — cycle-range map + character text per entry, in playback order,
// so keep/kill calls made by ear can be marked directly against the source.
// ---------------------------------------------------------------------------
function cycleRanges(spec) {
  const order = spec.form.split(/\s+/);
  const out = {}; let t = 0;
  for (const name of order) { const bars = spec.sections[name].bars; out[name] = [t, t + bars]; t += bars; }
  return out;
}
function checklistSection(dirName, spec, rows) {
  const ranges = cycleRanges(spec);
  const lines = [`## ${dirName}`, '', `\`audition/${dirName}/listen.html\` — ${spec.meter}, ${spec.bpm}bpm, key ${spec.key}`, ''];
  for (const r of rows) {
    const [s, e] = ranges[r.section] ?? [null, null];
    const where = s != null ? `cycles ${s}–${e}` : '';
    lines.push(`- [ ] **${r.name}**${r.extra ? ` (${r.extra})` : ''} — ${where}`);
    lines.push(`      ${r.character}`);
  }
  lines.push('');
  return lines.join('\n');
}

const md = [];
md.push('# Library audition checklist', '');
md.push('Every entry here is `ratified: false` (or equivalent — see DECISIONS D21/D23.3): hand-written by the building LLM, never auditioned. Mark each KEEP or KILL by ear; nothing is used again in a real song until this is done.', '');
md.push('Open each listen.html, hit play, and follow along — sections play back-to-back in the order below, one entry at a time (only one label/section is ever sounding at once, so no muting needed unless you want to skip ahead).', '');

const rhythmExtra = (name) => {
  const e = RHYTHMS[name];
  const mode = auditionModeFor(e);
  return mode === 'drums' ? `as drums, sound ${soundForRhythm(e)}` : `as ${mode}${e.bars > 1 ? `, ${e.bars} bars` : ''}`;
};
md.push(checklistSection('rhythms-4-4', specs['rhythms-4-4'],
  rhythmsByMeter['4/4'].map((name) => ({ name, section: name, extra: rhythmExtra(name), character: RHYTHMS[name].character }))));
md.push(checklistSection('rhythms-7-8', specs['rhythms-7-8'],
  rhythmsByMeter['7/8'].map((name) => ({ name, section: name, extra: rhythmExtra(name), character: RHYTHMS[name].character }))));
md.push(checklistSection('rhythms-3-4', specs['rhythms-3-4'],
  rhythmsByMeter['3/4'].map((name) => ({ name, section: name, extra: rhythmExtra(name), character: RHYTHMS[name].character }))));

md.push(checklistSection('contours', specs['contours'],
  Object.keys(CONTOURS).map((name) => ({ name, section: name, extra: `shape ${CONTOURS[name].shape}`, character: CONTOURS[name].character }))));

md.push(checklistSection('voicings', specs['voicings'],
  Object.keys(VOICINGS).map((name) => ({ name, section: name, character: VOICINGS[name].character }))));

{
  const spec = specs['transitions'];
  const ranges = cycleRanges(spec);
  const lines = [`## transitions`, '', `\`audition/transitions/listen.html\` — ${spec.meter}, ${spec.bpm}bpm, key ${spec.key}`, ''];
  for (const t of spec.transitions) {
    const entry = TRANSITIONS[t.use];
    const [s, e] = ranges[t.into];
    const where = entry.placement === 'before'
      ? `tail of the section before ${t.into} (cycles ${s - entry.bars}–${s})`
      : `head of ${t.into} (cycles ${s}–${Math.min(s + entry.bars, e)})`;
    lines.push(`- [ ] **${t.use}** (${entry.kind}, ${entry.from}→${entry.to}) — ${where}`);
    lines.push(`      ${entry.character}`);
  }
  lines.push('');
  md.push(lines.join('\n'));
}

md.push(checklistSection('interlocks-4-4', specs['interlocks-4-4'],
  interlocksByMeter['4/4'].map((e) => ({ name: e.name, section: e.name, extra: `${e.rhythms.a} + ${e.rhythms.b}`, character: e.character }))));
if (specs['interlocks-7-8']) {
  md.push(checklistSection('interlocks-7-8', specs['interlocks-7-8'],
    interlocksByMeter['7/8'].map((e) => ({ name: e.name, section: e.name, extra: `${e.rhythms.a} + ${e.rhythms.b}`, character: e.character }))));
}

writeFileSync(join(OUT, 'CHECKLIST.md'), md.join('\n'));
console.log(`wrote audition/CHECKLIST.md`);
