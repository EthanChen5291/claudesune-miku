#!/usr/bin/env node
// Vocal tier, stage 0: lift a song's TUNE as a singable score.
//
//   node scripts/export-vocal.mjs <song> [--page audition/songs.html]
//        [--out score.json] [--octave auto|<int>] [--lo 57 --hi 76]
//
// The lead solo (`_lead`) is the whole tune, unmasked. The MIX is where the
// tune actually sounds: handoff letters carry it on another instrument at the
// same (time, midi), breakdown bars strip it. So the score keeps a lead-solo
// note only in bars where the mix plays that bar's tune on SOME instrument
// (>= half of the bar's solo notes matched). Measured, not assumed — see
// CLAUDE.md "measure in the mix, not the solos".
//
// Monophony: chordTop (D98) thickens the bar's longest note with a chord tone;
// a singer takes the TOP pitch at each onset. Abutting legato haps are
// truncated to the next onset so no two notes overlap.
//
// Register: the engine's leads sit wherever the instrument does (calm_water's
// piano lead runs C5-A6). A voice has a range: the line is shifted by whole
// octaves so its median lands nearest the centre of [lo, hi] (default A3-E5,
// the published comfortable range of the target voice). `--octave N` pins it.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { values, positionals } = parseArgs({
  args: process.argv.slice(2), allowPositionals: true,
  options: {
    page: { type: 'string', default: 'audition/songs.html' },
    out: { type: 'string' },
    octave: { type: 'string', default: 'auto' },
    lo: { type: 'string', default: '57' },
    hi: { type: 'string', default: '76' },
    // r34: 'ja' = generated Japanese mora lyrics (src/lib/lyrics-ja.js);
    // 'none' = leave syllables to the singer's --syllable default
    lyrics: { type: 'string', default: 'ja' },
    'phrase-bars': { type: 'string', default: '2' },
    quiet: { type: 'boolean', default: false },
  },
});
const NAME = positionals[0];
if (!NAME) { console.error('usage: export-vocal <song> [--page p] [--out f.json] [--octave auto|N]'); process.exit(1); }

const html = readFileSync(join(ROOT, values.page), 'utf8');
const di = html.indexOf('const DATA = ');
const data = JSON.parse(html.slice(di + 13, html.indexOf(';\n', di)));
const song = (data.songs ?? data.cards).find((s) => s.name === NAME);
if (!song) { console.error(`no song ${NAME} in ${values.page}`); process.exit(1); }
const lead = song.solos?._lead;
if (!lead) { console.error(`${NAME} has no _lead solo`); process.exit(1); }

const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const midiOf = (v) => {
  const n = v?.note ?? v?.n;
  if (typeof n === 'number') return n;
  const m = /^([a-gA-G])([#bsf]*)(-?\d+)$/.exec(String(n ?? ''));
  if (!m) return null;
  let pc = PC[m[1].toLowerCase()];
  for (const ch of m[2]) pc += (ch === '#' || ch === 's') ? 1 : -1;
  return pc + (Number(m[3]) + 1) * 12;
};
const T = (x) => Number(x?.valueOf?.() ?? x);
const beats = song.beats ?? 4;
const cpm = song.bpm / beats;             // one cycle = one bar
const secPerBar = 60 / cpm;
const bars = song.totalBars;

// r34: a vocal-lead song carries `_lead_mix` — the lead AS THE MIX PLAYS IT
// (masked, per letter and statement, handoffs applied). It is the tune by
// construction, so it is sung wherever it sounds and no mix-matching is
// needed. The unmasked `_lead` is a LOOP that diverges from the mix in later
// letters: measured on vx_tense_fight, matching the solo against the mix kept
// 42 of 96 notes and went silent for 18 of 32 bars. Songs without it (the
// judged page) keep the matching path.
const leadMix = song.solos?._lead_mix ?? null;
const soloEv = await evaluateSong(`setcpm(${song.bpm}/${beats})\np: ${leadMix ?? lead}`);
const soloHaps = hapsByLabel(soloEv, 0, bars).get('p').haps.filter((h) => h.whole && midiOf(h.value) != null);
const mixHaps = leadMix ? soloHaps : await (async () => {
  const mixEv = await evaluateSong(`setcpm(${song.bpm}/${beats})\np: stack(${song.mix})`);
  return hapsByLabel(mixEv, 0, bars).get('p').haps.filter((h) => h.whole && midiOf(h.value) != null);
})();

// top note per onset
const byOnset = new Map();
for (const h of soloHaps) {
  const b = T(h.whole.begin);
  const k = b.toFixed(5);
  const cur = byOnset.get(k);
  const m = midiOf(h.value);
  if (!cur || m > cur.midi) byOnset.set(k, { begin: b, end: T(h.whole.end), midi: m, gain: typeof h.value?.gain === 'number' ? h.value.gain : 0.8, room: typeof h.value?.room === 'number' ? h.value.room : 0 });
}
let notes = [...byOnset.values()].sort((a, b) => a.begin - b.begin);
for (let i = 0; i + 1 < notes.length; i++) if (notes[i].end > notes[i + 1].begin) notes[i].end = notes[i + 1].begin;

// bars where the mix plays the tune (any instrument, same time + pitch class/octave)
const mixKey = new Set(mixHaps.map((h) => `${T(h.whole.begin).toFixed(3)}|${midiOf(h.value)}`));
const perBar = new Map();
for (const n of notes) {
  const bar = Math.floor(n.begin + 1e-9);
  const hit = mixKey.has(`${n.begin.toFixed(3)}|${n.midi}`);
  const e = perBar.get(bar) ?? { total: 0, hit: 0 };
  e.total++; if (hit) e.hit++;
  perBar.set(bar, e);
}
const sounding = new Set([...perBar].filter(([, e]) => e.hit * 2 >= e.total).map(([b]) => b));
const kept = notes.filter((n) => sounding.has(Math.floor(n.begin + 1e-9)));

// octave placement
const lo = Number(values.lo), hi = Number(values.hi), centre = (lo + hi) / 2;
const sorted = kept.map((n) => n.midi).sort((a, b) => a - b);
const median = sorted.length ? sorted[Math.floor(sorted.length / 2)] : 66;
let shift;
if (values.octave === 'auto') {
  shift = 0;
  let best = Infinity;
  for (let k = -4; k <= 4; k++) { const d = Math.abs(median + 12 * k - centre); if (d < best) { best = d; shift = 12 * k; } }
} else shift = 12 * Number(values.octave);

// ---- phrasing (r34, from the suite's first scores) -------------------------
// A generated lead never rests (vx_tense_fight: one 46 s phrase, 60 moras),
// and a singer phrases in 2-4 bar lines with a breath between. So: a phrase
// closes at a rest >= 0.5 s OR after two bars, and the last note of a phrase
// that runs straight into the next gives back up to 150 ms (never more than
// 40% of itself) as the breath. A phrase is also placed by OCTAVE on its own:
// handoff letters sit an octave from the lead (tense_fight's sung range was
// 41-77 after the global shift, three octaves), so each phrase shifts by
// whole octaves until its median sits inside [lo, hi].
const phraseBars = Number(values['phrase-bars']);
const phrases = [];
{
  let cur = [];
  for (const n of kept) {
    const prev = cur[cur.length - 1];
    if (cur.length && ((n.begin - prev.end) * secPerBar >= 0.5 || n.begin >= Math.floor(cur[0].begin + 1e-9) + phraseBars)) { phrases.push(cur); cur = []; }
    cur.push(n);
  }
  if (cur.length) phrases.push(cur);
}
let folded = 0;
phrases.forEach((ph, pi) => {
  const ms = ph.map((n) => n.midi + shift).sort((a, b) => a - b);
  let med = ms[ms.length >> 1], k = 0;
  while (med + k < lo && k < 36) k += 12;
  while (med + k > hi && k > -36) k -= 12;
  if (k) folded++;
  for (const n of ph) {
    n.pshift = k; n.phrase = pi;
    // a lone outlier far outside the band (a leap the phrase median hides —
    // tense_fight had a note 13 semitones under A3) folds by one octave; it
    // is unsingable where it is, and one folded note costs less than a
    // whole phrase moved off the tune's register
    const m = n.midi + shift + k;
    // r35 — THE CEILING IS G5, AND IT IS DURATION-AWARE. His two "sounds like
    // screaming" notes (vx_triumphant_boss #8, vg_excited_space #5) were both
    // A5 (81) held 0.70-0.74 s; the notes he did NOT flag above the band were
    // A#5/B5 at 0.22-0.44 s (vx_romantic_rest, "very good") and G5 held 1.3-1.8 s.
    // So a note more than a minor third over the target top folds down an
    // octave when it is held half a second or longer; a short pass-through
    // stays. The old outlier rule (a fifth over the top) still folds anything.
    const durS = (n.end - n.begin) * secPerBar;
    if (m < lo - 7) n.pshift += 12;
    else if (m > hi + 6 || (m > hi + 3 && durS >= 0.5)) n.pshift -= 12;
  }
  const last = ph[ph.length - 1];
  const next = phrases[pi + 1]?.[0] ?? null;
  const gapS = next ? (next.begin - last.end) * secPerBar : 1;
  if (gapS < 0.1) {
    const durS = (last.end - last.begin) * secPerBar;
    last.end -= Math.min(0.15, durS * 0.4) / secPerBar;
  }
});

const score = {
  name: NAME, page: values.page, bpm: song.bpm, beats, totalBars: bars, key: song.key,
  source: leadMix ? '_lead_mix' : '_lead+mix-match',
  secondsPerBar: secPerBar, totalSeconds: bars * secPerBar,
  shift, range: [lo, hi], medianBefore: median,
  room: +(kept.length ? kept.reduce((a, n) => a + n.room, 0) / kept.length : 0).toFixed(3),
  leadGain: +(kept.length ? kept.reduce((a, n) => a + n.gain, 0) / kept.length : 0.8).toFixed(3),
  // start/end are rounded INDEPENDENTLY so a note truncated to the next onset
  // ends exactly where that onset starts (rounding start and dur separately
  // let abutting notes overlap by a few microseconds — the test caught it)
  notes: kept.map((n) => {
    const start = +(n.begin * secPerBar).toFixed(5);
    const end = +(n.end * secPerBar).toFixed(5);
    return { bar: Math.floor(n.begin + 1e-9), phrase: n.phrase, start, dur: +(end - start).toFixed(5), midi: n.midi + shift + (n.pshift ?? 0), gain: +n.gain.toFixed(3) };
  }),
  phraseBars, phrasesFolded: folded, phraseCount: phrases.length,
  stats: {
    soloNotes: notes.length, keptNotes: kept.length,
    barsSounding: sounding.size, barsWithTune: perBar.size,
    silentBars: [...perBar].filter(([b]) => !sounding.has(b)).map(([b]) => b),
  },
};
if (values.lyrics === 'ja') {
  const { assignLyrics } = await import('../src/lib/lyrics-ja.js');
  score.lyrics = assignLyrics(score, { seed: NAME });
  score.lyricMode = 'ja';
}
const out = values.out ?? join(ROOT, 'audition', 'hq', `${NAME}.vocal-score.json`);
writeFileSync(out, JSON.stringify(score, null, 1));
if (!values.quiet) {
  const mids = score.notes.map((n) => n.midi);
  console.log(`${NAME}: ${score.notes.length}/${notes.length} lead notes in ${sounding.size}/${perBar.size} tune bars (silent: ${score.stats.silentBars.join(',') || 'none'})`);
  console.log(`  register: median ${median} -> shift ${shift >= 0 ? '+' : ''}${shift}; ${phrases.length} phrases (${folded} re-octaved); sung range ${Math.min(...mids)}-${Math.max(...mids)} (target ${lo}-${hi})`);
  if (score.lyrics) {
    const distinct = new Set(score.lyrics.map((l) => l.text)).size;
    console.log(`  lyrics (ja): ${score.lyrics.length} phrases, ${distinct} distinct lines, ${score.notes.filter((n) => n.melisma).length} melisma notes`);
    for (const l of score.lyrics.slice(0, 4)) console.log(`    @${l.start.toFixed(1)}s  ${l.text}`);
  }
  console.log(`  wrote ${out}`);
}
