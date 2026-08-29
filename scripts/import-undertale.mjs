#!/usr/bin/env node
// Extract library material from audios/Undertale MIDI (D30) — the HARMONY/BASS
// side of Toby Fox's writing, per Ethan's ask: chord patterns, the left hand's
// rhythm, and the "movement of the fingers" (figuration) abstracted so the same
// pattern can be re-applied to any progression. Melody is only OBSERVED (stats
// feeding undertale-melody.md), never extracted as entries — melody extraction
// is a different pipeline with different rules.
//
// Unlike the Unison packs (D29) these files carry NO labels, so everything is
// solved from the notes (src/ingest/piano.js) and every solve records its
// evidence: chord `coverage`, key `margin`, figure `fit`. Low confidence is
// FLAGGED (needsEar), not dropped and not silently trusted (A6.1).
//
//   progressions  chord loops actually cycled by each song, in the D28 `degrees`
//                 grammar (semitones above the solved tonic + ireal quality)
//   figurations   recurring one-bar accompaniment figures as CHORD-RELATIVE
//                 tokens ('R 5 R+ 5'), deduped across the corpus — the same
//                 figure found in ten songs is one entry with a tally
//   rhythms       the onset/accent skeletons of the top figures, playable by
//                 the existing bind()/bindComp() paths
//   development   how songs move between figures (octave lift, densify,
//                 repitch-same-rhythm …) — observed transitions with counts
//
// Run: node scripts/import-undertale.mjs [--report]

import { writeFileSync, readdirSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitHands, chordTimeline, solveKeyKS, barFigures, pickGrid, chordAt } from '../src/ingest/piano.js';
import { loadSong, chordLoops, mean, median, slug, LOOP_PROFILES } from '../src/ingest/corpus.js';
import { qualityPcs } from '../src/ingest/numerals.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIR = join(ROOT, 'audios', 'Undertale MIDI');
const REPORT = process.argv.includes('--report');

const PC_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const mod12 = (x) => ((x % 12) + 12) % 12;
const round2 = (x) => Math.round(x * 100) / 100;
const round3 = (x) => Math.round(x * 1000) / 1000;
// entry names stay readable: cut at word boundaries past 22 chars
const shortSlug = (s) => slug(s).split('_').reduce((a, w) => (a.length + w.length + 1 <= 22 ? (a ? a + '_' + w : w) : a), '');
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function frac(n, d) { const g = gcd(Math.abs(n), Math.abs(d)) || 1; return `${n / g}/${d / g}`; }

// ---------------------------------------------------------------------------
// Numeral display (provenance only — the degrees grammar is the data)
// ---------------------------------------------------------------------------
const MAJ = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
const MIN = ['i', 'bII', 'ii', 'III', '#III', 'iv', 'bv', 'v', 'VI', '#VI', 'VII', 'vii'];
function numeralOf(semis, quality, family) {
  const base = (family === 'minor' ? MIN : MAJ)[semis];
  const minorish = /^m(?!aj)/.test(quality) || quality.startsWith('o');
  const name = minorish ? base.toLowerCase() : base.toUpperCase().replace(/B/g, 'b');
  return name + quality;
}

// ---------------------------------------------------------------------------
// Per-song analysis
// ---------------------------------------------------------------------------
const files = readdirSync(DIR).filter((f) => f.endsWith('.mid')).sort();
const songs = [];
const skipped = [];

for (const f of files) {
  const song = loadSong(join(DIR, f), { titleOf: (n) => basename(n, '.mid').replace(/^Undertale - /, '').trim() });
  if (song.skipped) { skipped.push(song.skipped); continue; }
  songs.push(song);
}

// ---------------------------------------------------------------------------
// Progressions: the chord loops each song actually cycles
// ---------------------------------------------------------------------------
/** The song's OWN accompaniment pattern over one loop period, as a multi-bar
 *  figuration — "take those intervals and make them the thing along with the
 *  chords" (Ethan, audition round 3). The harmony of these songs IS its
 *  deployment: arpeggio order, spacing, register — not block voicings. */
function buildOwnFigure(song, loop) {
  const bars = loop.loopBars;
  if (!song.figsLocked.length || !song.grid) return null;
  const figs = [];
  for (let k = 0; k < bars; k++) figs.push(song.figsLocked[loop.atBar + k] ?? null);
  const present = figs.filter(Boolean);
  if (present.length < Math.ceil(bars / 2)) return null;
  let maxVel = 0;
  for (const f of present) for (const v of f.vels) maxVel = Math.max(maxVel, v);
  const onsets = [], figure = [], accents = [], micro = [];
  let legN = 0, legSum = 0;
  const G = song.grid;
  for (let k = 0; k < bars; k++) {
    const f = figs[k];
    if (!f) continue;
    for (let i = 0; i < f.steps.length; i++) {
      onsets.push(frac(f.steps[i] + k * G, G));
      figure.push(f.tokens[i]);
      accents.push(round2(f.vels[i] / maxVel));
      micro.push(song.tri.timingUsable ? Math.round(f.residuals[i] * 96) : 0);
      const gap = ((i + 1 < f.steps.length ? f.steps[i + 1] : G) - f.steps[i]) / G;
      legSum += Math.min(1, f.durs[i] / gap); legN++;
    }
  }
  if (onsets.length < 2) return null;
  const hasMicro = micro.some((r) => r !== 0);
  return {
    bars, onsets, figure, accents,
    ...(hasMicro ? { microtiming: micro.map((r) => (r === 0 ? '0' : frac(r, 96))) } : {}),
    legato: legN ? legSum / legN >= 0.8 : false,
    octave: Math.max(1, Math.min(4, Math.floor((present[0].rootRef ?? 48) / 12) - 1)),
  };
}

const progressions = [];
for (const song of songs) {
  // LOOP_PROFILES.legacy, explicitly — see the note in import-vgmusic.mjs
  const loops = chordLoops(song, { ...LOOP_PROFILES.legacy });
  loops.forEach((loop, i) => {
    const family = song.key.mode;
    const tonic = song.key.tonicPc;
    const degrees = loop.chords.map((c) => {
      const semis = mod12(c.rootPc - tonic);
      return `${semis}${c.quality ? `:${c.quality}` : ''}`;
    }).join(' ');
    const numerals = loop.chords.map((c) => numeralOf(mod12(c.rootPc - tonic), c.quality, family)).join('-');
    progressions.push({
      name: `ut_${song.slug}_p${i + 1}`,
      song: song.title, family, degrees, numerals,
      barsPerChord: loop.chords.map((c) => c.half / 2),
      loopBars: loop.loopBars, reps: loop.reps, atBar: loop.atBar,
      sourceKey: `${PC_NAMES[tonic]}:${family}`, keyMargin: round3(song.key.margin),
      coverage: round2(loop.coverage),
      meter: song.meter, bpm: song.bpm,
      needsEar: loop.coverage < 0.62 || song.key.margin < 0.05,
      sourceFile: relative(ROOT, join(DIR, song.file)),
      ownFigure: buildOwnFigure(song, loop),
    });
  });
}

// ---------------------------------------------------------------------------
// Figurations: recurring bar figures, deduped across the corpus
// ---------------------------------------------------------------------------
const figMap = new Map(); // key -> { occurrences }
for (const song of songs) {
  for (const fig of song.figs) {
    if (!fig) continue;
    const key = `${song.meter}|${fig.sig}`;
    if (!figMap.has(key)) figMap.set(key, { meter: song.meter, sig: fig.sig, occ: [] });
    figMap.get(key).occ.push({ song, fig });
  }
}

const TOKEN_ORDER = { R: 0, 9: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 10 };
function tokenPitch(tok) {
  const m = /^(~?\d+|[R34567])(\+*)$/.exec(tok);
  if (!m) return 0;
  const base = m[1].startsWith('~') ? Number(m[1].slice(1)) : (TOKEN_ORDER[m[1]] ?? 0);
  return base + 12 * m[2].length;
}
function classify(steps, tokens, chordness, meanMidi) {
  const single = tokens.every((t) => !t.includes('.'));
  if (single && tokens.every((t) => /^R\+*$/.test(t))) return 'ostinato';
  if (chordness >= 0.6) return 'block';
  if (single) {
    const p = tokens.map(tokenPitch);
    let up = 0, down = 0;
    for (let i = 1; i < p.length; i++) { if (p[i] > p[i - 1]) up++; else if (p[i] < p[i - 1]) down++; }
    if (p.length >= 3 && up >= p.length - 2 && down === 0) return 'arp_up';
    if (p.length >= 3 && down >= p.length - 2 && up === 0) return 'arp_down';
    if (meanMidi < 48) return 'bass';
    if (up + down >= 2) return 'arp';
  }
  // low single notes alternating with '.'-chords or octave-up tokens = oom-pah
  const lows = tokens.filter((t) => !t.includes('.') && !t.includes('+'));
  if (lows.length && lows.length < tokens.length && tokens.some((t) => t.includes('.') || t.includes('+'))) return 'oompah';
  return 'figure';
}

function makeCandidate(v) {
  const bySong = new Map();
  for (const { song } of v.occ) bySong.set(song.title, (bySong.get(song.title) ?? 0) + 1);
  const seen = v.occ.length;
  const nSongs = bySong.size;
  const [grid, stepsStr, toksStr] = v.sig.split('|');
  const steps = stepsStr.split(',').map(Number);
  const tokens = toksStr.split(' ');
  if (steps.length < 2) return null; // a single strike per bar is an anchor, not a figure
  const topSong = [...bySong.entries()].sort((a, b) => b[1] - a[1])[0][0];
  const occ = v.occ;
  // accents from files whose velocities carry information (A6.2)
  const accOcc = occ.filter((o) => o.song.tri.accentsUsable);
  const accents = accOcc.length
    ? steps.map((_, i) => {
      const vals = accOcc.map(({ fig }) => fig.vels[i] / Math.max(...fig.vels));
      return round2(median(vals));
    })
    : null;
  const timOcc = occ.filter((o) => o.song.tri.timingUsable);
  const residual = steps.map((_, i) => Math.round(mean(timOcc.map(({ fig }) => fig.residuals[i])) * 96));
  const microtiming = timOcc.length && residual.some((r) => r !== 0) ? residual.map((r) => (r === 0 ? '0' : frac(r, 96))) : null;
  const durs = steps.map((_, i) => mean(occ.map(({ fig }) => fig.durs[i])));
  const G = Number(grid);
  const gaps = steps.map((s, i) => ((i + 1 < steps.length ? steps[i + 1] : G) - s) / G);
  const legato = mean(durs.map((d, i) => Math.min(1, d / gaps[i]))) >= 0.8;
  const meanMidi = mean(occ.map(({ fig }) => fig.meanMidi));
  const chordness = mean(occ.map(({ fig }) => fig.chordness));
  const rootRef = mean(occ.map(({ fig }) => fig.rootRef ?? fig.meanMidi));
  const nonChordRatio = occ.reduce((a, { fig }) => a + fig.nonChord, 0) / Math.max(1, occ.reduce((a, { fig }) => a + fig.count, 0));
  const cls = classify(steps, tokens, chordness, meanMidi);
  return {
    meter: v.meter, grid: G, steps, tokens, accents, microtiming, legato,
    seen, nSongs, bySong, topSong, meanMidi, rootRef, chordness, nonChordRatio, cls,
    sig: v.sig,
  };
}
const candByKey = new Map();
for (const [key, v] of figMap) {
  const c = makeCandidate(v);
  if (c) candByKey.set(key, c);
}
// recurrence threshold: a figure earns emission by being USED — many bars, or
// several songs
const figCandidates = [...candByKey.values()].filter((c) => c.seen >= 4 || (c.nSongs >= 2 && c.seen >= 3));
// order: most widely used first; cap the pool (A6.6 caps the LIBRARY at 30-60,
// the candidate pool may be larger but not unbounded)
figCandidates.sort((a, b) => b.nSongs - a.nSongs || b.seen - a.seen || a.sig.localeCompare(b.sig));
const FIG_CAP = 72;
const figEntries = figCandidates.slice(0, FIG_CAP);

// ---------------------------------------------------------------------------
// Development: how songs move between figures. Runs BEFORE naming: a move's
// endpoint figures earn emission by being part of a development pair even when
// neither cleared the recurrence threshold on its own — the PAIR is the datum.
// ---------------------------------------------------------------------------
const moveMap = new Map();
const relTally = new Map();
for (const song of songs) {
  // RLE spans of figure signatures over the song's bars
  const spans = [];
  for (let b = 0; b < song.figs.length; b++) {
    const fig = song.figs[b];
    const sig = fig ? `${song.meter}|${fig.sig}` : null;
    const last = spans[spans.length - 1];
    if (last && last.sig === sig) { last.len++; continue; }
    spans.push({ sig, start: b, len: 1, fig });
  }
  const real = spans.filter((s) => s.sig != null);
  for (let i = 1; i < real.length; i++) {
    const A = real[i - 1], B = real[i];
    if (A.len < 2 || B.len < 2) continue;
    if (B.start - (A.start + A.len) > 1) continue; // not adjacent (a break intervenes)
    const rel = [];
    const dens = B.fig.steps.length / A.fig.steps.length;
    if (dens >= 1.5) rel.push('densify'); else if (dens <= 1 / 1.5) rel.push('sparsify');
    const reg = B.fig.meanMidi - A.fig.meanMidi;
    if (reg >= 7) rel.push('octave_lift'); else if (reg <= -7) rel.push('octave_drop');
    if (B.fig.chordness - A.fig.chordness >= 0.34) rel.push('blockify');
    else if (A.fig.chordness - B.fig.chordness >= 0.34) rel.push('arpeggiate');
    if (A.fig.steps.join() === B.fig.steps.join() && A.fig.tokens.join() !== B.fig.tokens.join()) rel.push('repitch_same_rhythm');
    if (!rel.length) rel.push('pattern_swap');
    for (const r of rel) relTally.set(r, (relTally.get(r) ?? 0) + 1);
    const key = `${A.sig} >> ${B.sig}`;
    if (!moveMap.has(key)) moveMap.set(key, { from: A.sig, to: B.sig, rel, seen: 0, examples: [] });
    const m = moveMap.get(key);
    m.seen++;
    if (m.examples.length < 3) m.examples.push(`${song.title} @bar ${B.start + 1}`);
  }
}
// inject move endpoints into the figure pool (bounded), most-seen moves first
const movesAll = [...moveMap.values()].sort((a, b) => b.seen - a.seen || a.from.localeCompare(b.from));
const inPool = new Set(figEntries.map((f) => `${f.meter}|${f.sig}`));
const EXTRA_CAP = 24;
let extra = 0;
const movesKept = [];
for (const m of movesAll) {
  const need = [m.from, m.to].filter((k) => !inPool.has(k));
  if (need.some((k) => !candByKey.has(k))) continue;
  if (need.length > 0 && extra + need.length > EXTRA_CAP) continue;
  for (const k of need) { figEntries.push(candByKey.get(k)); inPool.add(k); extra++; }
  movesKept.push(m);
}

// name the pool (recurrence entries + move endpoints)
const nameCount = new Map();
const figNameBySig = new Map();
for (const fig of figEntries) {
  const base = `ut_${fig.cls}_${shortSlug(fig.topSong)}`;
  const n = (nameCount.get(base) ?? 0) + 1;
  nameCount.set(base, n);
  fig.name = n === 1 ? base : `${base}_${n}`;
  fig.role = fig.cls === 'bass' ? 'bass' : fig.chordness >= 0.5 ? 'chords' : 'accompaniment';
  // octave for the ROOT REFERENCE = where the source actually anchored its root
  // (barFigures' per-bar rootRef), not a mean-pitch estimate — the estimate sat
  // some figures an octave low. floor, not round: bindFigure places the root
  // pc AT OR ABOVE C<octave>, so floor(rootRef/12) reproduces the source note
  fig.octave = Math.max(1, Math.min(4, Math.floor(fig.rootRef / 12) - 1));
  fig.onsets = fig.steps.map((s) => frac(s, fig.grid));
  fig.needsEar = fig.nonChordRatio > 0.2 || !fig.accents;
  figNameBySig.set(`${fig.meter}|${fig.sig}`, fig.name);
}

const moves = movesKept
  .map((m) => ({ ...m, fromFig: figNameBySig.get(m.from), toFig: figNameBySig.get(m.to) }))
  .sort((a, b) => b.seen - a.seen || a.fromFig.localeCompare(b.fromFig));

// ---------------------------------------------------------------------------
// Melodic RHYTHM cells (D40). Melody audition round 5: with articulation fixed
// the melodies breathe, and what is left is rhythmic sameness — measured at 15
// distinct patterns over 116 authored bars, density 3.54/bar (stdev 1.22)
// against the corpus's 8.25 (stdev 5.08). The cure is in the corpus: mine the
// melody streams for their RHYTHM — onsets, relative accents, articulation —
// and nothing else.
//
// This stays inside the D30 melody ruling. Pitch content, phrases and contours
// are still deliberately not taken; a rhythm cell is a habit, exactly like the
// accompaniment skeletons already mined. Entries carry no pitch of any kind.
//
// Selection is STRATIFIED BY DENSITY, not by raw frequency: ranking purely by
// recurrence would return the sparse cells (the most common bars) and rebuild
// the very uniformity this pool exists to break. Each density band contributes
// its own most-recurrent cells, so the pool spans one-note-a-bar to sixteenth
// runs the way the source does.
// ---------------------------------------------------------------------------
const melRhythmMap = new Map();
for (const song of songs) {
  const mel = [...song.mel].sort((a, b) => a.tick - b.tick);
  if (mel.length < 8) continue;
  const beats = song.midi.timeSig[0];
  const G = (beats % 3 === 0) ? 12 : 16; // triple/compound get a 12-grid
  const meter = song.meter;
  const byBar = new Map();
  for (const n of mel) {
    const b = Math.floor(n.tick / song.barTicks);
    if (!byBar.has(b)) byBar.set(b, []);
    byBar.get(b).push(n);
  }
  for (const [b, raw] of byBar) {
    // one onset per grid step (a chord in the melody line counts once, highest note)
    const slots = new Map();
    for (const n of raw) {
      const step = Math.round(((n.tick - b * song.barTicks) / song.barTicks) * G);
      if (step < 0 || step >= G) continue;
      const cur = slots.get(step);
      if (!cur || n.midi > cur.midi) slots.set(step, n);
    }
    const steps = [...slots.keys()].sort((x, y) => x - y);
    if (steps.length < 2 || steps.length > G) continue;
    const notes = steps.map((s) => slots.get(s));
    const maxVel = Math.max(...notes.map((n) => n.velocity)) || 1;
    const accents = notes.map((n) => n.velocity / maxVel);
    const artic = steps.map((s, i) => {
      const nextTick = i + 1 < steps.length
        ? b * song.barTicks + (steps[i + 1] / G) * song.barTicks
        : (b + 1) * song.barTicks;
      const ioi = nextTick - notes[i].tick;
      return ioi > 0 ? Math.max(0.15, Math.min(1, notes[i].dur / ioi)) : 1;
    });
    const key = `${meter}|${G}|${steps.join(',')}`;
    if (!melRhythmMap.has(key)) {
      melRhythmMap.set(key, { meter, G, steps, seen: 0, songs: new Map(), accs: [], artics: [] });
    }
    const cell = melRhythmMap.get(key);
    cell.seen++;
    cell.songs.set(song.title, (cell.songs.get(song.title) ?? 0) + 1);
    cell.accs.push(accents);
    cell.artics.push(artic);
  }
}
const MEL_BANDS = [[2, 3], [4, 5], [6, 8], [9, 12], [13, 99]];
const MEL_PER_BAND = 8;
const melRhythms = [];
for (const [lo, hi] of MEL_BANDS) {
  const inBand = [...melRhythmMap.values()]
    .filter((c) => c.steps.length >= lo && c.steps.length <= hi)
    .filter((c) => c.seen >= 4 || (c.songs.size >= 2 && c.seen >= 3))
    .sort((a, b) => b.seen - a.seen || b.songs.size - a.songs.size)
    .slice(0, MEL_PER_BAND);
  for (const c of inBand) {
    const col = (rows, i) => median(rows.map((r) => r[i]));
    const topSong = [...c.songs.entries()].sort((a, b) => b[1] - a[1])[0][0];
    melRhythms.push({
      name: `utm_${shortSlug(topSong)}_${c.steps.length}on`,
      meter: c.meter, grid: c.G, steps: c.steps,
      onsets: c.steps.map((s) => frac(s, c.G)),
      accents: c.steps.map((_, i) => Math.round(col(c.accs, i) * 100) / 100),
      artic: c.steps.map((_, i) => Math.round(col(c.artics, i) * 100) / 100),
      density: c.steps.length,
      seen: c.seen, songs: [...c.songs.keys()].sort().slice(0, 4),
    });
  }
}
{ // unique names
  const used = new Map();
  for (const r of melRhythms) {
    const n = (used.get(r.name) ?? 0) + 1;
    used.set(r.name, n);
    if (n > 1) r.name = `${r.name}_${n}`;
  }
}

// ---------------------------------------------------------------------------
// Melody observations (stats only — they feed undertale-melody.md, no entries)
// ---------------------------------------------------------------------------
const melStats = {
  intervals: new Map(), leaps: 0, leapReversed: 0, phrases: 0,
  onBeat: 0, offBeat: 0, chordToneOnBeat: 0, beatOnsets: 0,
  rhythmCells: new Map(), barRepeat: 0, barTotal: 0, ranges: [],
  onsetsPerBar: [],
};
for (const song of songs) {
  const mel = [...song.mel].sort((a, b) => a.tick - b.tick);
  if (mel.length < 8) continue;
  const beat = song.barTicks / song.midi.timeSig[0];
  melStats.ranges.push(Math.max(...mel.map((n) => n.midi)) - Math.min(...mel.map((n) => n.midi)));
  for (let i = 1; i < mel.length; i++) {
    const gap = mel[i].tick - (mel[i - 1].tick + mel[i - 1].dur);
    if (gap > beat) { melStats.phrases++; continue; }
    const iv = mel[i].midi - mel[i - 1].midi;
    if (Math.abs(iv) <= 24) melStats.intervals.set(iv, (melStats.intervals.get(iv) ?? 0) + 1);
    if (Math.abs(iv) >= 5) {
      melStats.leaps++;
      if (i + 1 < mel.length) {
        const nxt = mel[i + 1].midi - mel[i].midi;
        if (nxt !== 0 && Math.sign(nxt) !== Math.sign(iv)) melStats.leapReversed++;
      }
    }
  }
  const cells = new Map();
  const ivBars = new Map();
  for (const n of mel) {
    const b = Math.floor(n.tick / song.barTicks);
    const step = Math.round(((n.tick % song.barTicks) / song.barTicks) * 16);
    if (!cells.has(b)) cells.set(b, []);
    cells.get(b).push(step);
    const onBeat = (n.tick % beat) < song.midi.ppq / 8 || (beat - (n.tick % beat)) < song.midi.ppq / 8;
    if (onBeat) {
      melStats.onBeat++;
      const seg = chordAt(song.timeline, Math.floor((n.tick / song.barTicks) * 2));
      if (seg) {
        melStats.beatOnsets++;
        const rel = mod12(n.midi - seg.rootPc);
        if ((qualityPcs().get(seg.quality) ?? new Set()).has(rel)) melStats.chordToneOnBeat++;
      }
    } else melStats.offBeat++;
  }
  for (const [b, steps] of cells) {
    melStats.onsetsPerBar.push(steps.length);
    const cell = steps.join(',');
    melStats.rhythmCells.set(cell, (melStats.rhythmCells.get(cell) ?? 0) + 1);
    const notes = mel.filter((n) => Math.floor(n.tick / song.barTicks) === b);
    const ivs = notes.slice(1).map((n, i) => n.midi - notes[i].midi).join(',');
    melStats.barTotal++;
    if (ivBars.has(ivs)) melStats.barRepeat++;
    ivBars.set(ivs, true);
  }
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------
const HDR = (what) => [
  `// ${what} extracted from audios/Undertale MIDI (D30).`,
  `//`,
  `// GENERATED by scripts/import-undertale.mjs — do not hand-edit; re-run the importer.`,
  `// Every entry is \`ratified: false\` with \`character: null\`: an extracted corpus is`,
  `// a CANDIDATE POOL, not a library (A6.1). A character line is written when an ear`,
  `// ratifies the entry, never at import. Audition: audition/undertale.html.`,
].join('\n');

function lit(v) {
  if (v === null || v === undefined) return 'null';
  if (Array.isArray(v)) return `[${v.map(lit).join(', ')}]`;
  if (typeof v === 'string') return `'${v.replace(/'/g, "\\'")}'`;
  return String(v);
}

// --- progressions ---
{
  const L = [HDR('Chord progressions'), '//',
    '// No labels exist in these files: the key is solved from the notes (Krumhansl-',
    '// Schmuckler; `keyMargin` is the gap to the runner-up key) and each entry is a',
    '// chord LOOP the song actually cycles (found by repetition, `reps` times from',
    '// bar `atBar`). `coverage` is how much of the sounding material the chord',
    '// labels explain; low coverage or a thin key margin => needsEar.',
    '// `degrees` is the D28 grammar: semitones above the tonic + ireal quality.',
    '// `barsPerChord` may carry 0.5s — these songs change chords mid-bar.', '',
    'export const PROGRESSIONS_UNDERTALE = {'];
  for (const p of progressions.sort((a, b) => a.name.localeCompare(b.name))) {
    L.push(`  ${p.name}: {`);
    L.push(`    family: ${lit(p.family)}, pack: 'undertale', role: 'harmony', style: 'toby-fox',`);
    L.push(`    provenance: 'transcribed', source: ${lit(p.sourceFile)}, ratified: false,`);
    L.push(`    song: ${lit(p.song)},`);
    L.push(`    numerals: ${lit(p.numerals)},`);
    L.push(`    degrees: ${lit(p.degrees)},`);
    L.push(`    moods: [],`);
    L.push(`    barsPerChord: ${lit(p.barsPerChord)}, loopBars: ${p.loopBars}, reps: ${p.reps}, atBar: ${p.atBar},`);
    L.push(`    meter: ${lit(p.meter)}, bpm: ${lit(p.bpm)},`);
    L.push(`    sourceKey: ${lit(p.sourceKey)}, keyMargin: ${p.keyMargin}, coverage: ${p.coverage},`);
    L.push(`    needsEar: ${lit(p.needsEar)},`);
    // the song's own interval deployment over this loop (bindFigure-ready) —
    // the harmony as the song actually plays it, not as block voicings
    L.push(`    ownFigure: ${p.ownFigure ? JSON.stringify(p.ownFigure) : 'null'},`);
    L.push(`    character: null,`);
    L.push(`  },`);
  }
  L.push('}', '');
  writeFileSync(join(ROOT, 'src/lib/progressions-undertale.js'), L.join('\n'));
}

// --- figurations + development ---
{
  const L = [HDR('Accompaniment figurations'), '//',
    '// A figuration is the LEFT HAND with the chord factored out: per onset, a',
    "// CHORD-RELATIVE token. 'R' root, '3' the chord's third (whatever quality),",
    "// '5' the fifth (even when diminished), '7' the seventh, '9'/'4'/'6' colours;",
    "// '~<n>' a literal n semitones above the root (a colour the sounding chord",
    "// does not contain); '+' = an octave up; 'a.b' = struck together. Render",
    '// against ANY progression with bindFigure() (src/binder/bind.js).',
    '// Deduped across the corpus: `seen` bars over `songs` songs; accents are the',
    '// per-onset median of the source velocities (triage-gated, A6.2); microtiming',
    '// is the mean residual off the grid in 96ths of a bar.', '',
    'export const FIGURATIONS_UNDERTALE = {'];
  for (const f of [...figEntries].sort((a, b) => a.name.localeCompare(b.name))) {
    const songsList = [...f.bySong.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([s, n]) => `${s} (${n})`);
    L.push(`  ${f.name}: {`);
    L.push(`    role: ${lit(f.role)}, pack: 'undertale', style: 'toby-fox', class: ${lit(f.cls)},`);
    L.push(`    provenance: 'transcribed', ratified: false,`);
    L.push(`    bars: 1, grid: ${f.grid}, meter_class: ${lit(f.meter)},`);
    L.push(`    onsets: ${lit(f.onsets)},`);
    L.push(`    figure: ${lit(f.tokens)},`);
    L.push(`    accents: ${lit(f.accents)},`);
    if (f.microtiming) L.push(`    microtiming: ${lit(f.microtiming)},`);
    L.push(`    legato: ${lit(f.legato)}, octave: ${f.octave},`);
    L.push(`    seen: ${f.seen}, songs: ${lit(songsList)},`);
    L.push(`    fit: { nonChord: ${round2(f.nonChordRatio)}, chordness: ${round2(f.chordness)}, meanMidi: ${Math.round(f.meanMidi)} },`);
    L.push(`    needsEar: ${lit(!!f.needsEar)},`);
    L.push(`    character: null,`);
    L.push(`  },`);
  }
  L.push('}', '');
  L.push('// How the songs MOVE between figures: adjacent spans (each held >= 2 bars) of');
  L.push('// different figures, classified by what changes. These are observations of');
  L.push("// Toby Fox's development moves, with counts — the corpus-level answer to");
  L.push('// "what does he do next with a pattern".');
  L.push('export const DEVELOPMENT_UNDERTALE = [');
  for (const m of moves) {
    L.push(`  { from: ${lit(m.fromFig)}, to: ${lit(m.toFig)}, relation: ${lit(m.rel)}, seen: ${m.seen},`);
    L.push(`    examples: ${lit(m.examples)} },`);
  }
  L.push(']', '');
  L.push('// Corpus-wide tally of development-move kinds (including moves between');
  L.push('// figures that did not clear the emission threshold).');
  L.push(`export const DEVELOPMENT_STATS = ${JSON.stringify(Object.fromEntries([...relTally.entries()].sort((a, b) => b[1] - a[1])))}`);
  L.push('');
  writeFileSync(join(ROOT, 'src/lib/figurations-undertale.js'), L.join('\n'));
}

// --- rhythms (onset/accent skeletons of the top figures) ---
{
  const L = [HDR('Accompaniment rhythms'), '//',
    '// The onset/accent skeletons of the figuration entries, playable by the',
    "// existing bind()/bindComp() paths. `voices` marks a figuration's low single",
    "// notes as 'bounce' (bindComp: light low root) and everything else 'main'.",
    '// Deduped: several figures share one skeleton; `figures` lists the donors.', '',
    'export const RHYTHMS_UNDERTALE = {'];
  const rhythmMap = new Map();
  for (const f of figEntries) {
    if (!f.accents) continue;
    const voices = f.tokens.map((t) => (!t.includes('.') && !t.includes('+') && (t === 'R' || t === '5') && f.cls === 'oompah' ? 'bounce' : 'main'));
    const key = `${f.meter}|${f.grid}|${f.steps.join(',')}`;
    if (!rhythmMap.has(key)) {
      rhythmMap.set(key, {
        name: `utr_${shortSlug(f.topSong)}_${f.steps.length}on`,
        meter: f.meter, onsets: f.onsets, accents: f.accents, microtiming: f.microtiming,
        voices, role: f.role === 'bass' ? 'bass' : 'chords', figures: [], seen: 0,
      });
    }
    const r = rhythmMap.get(key);
    r.figures.push(f.name);
    r.seen += f.seen;
  }
  const named = new Map();
  const rhythms = [...rhythmMap.values()].sort((a, b) => b.seen - a.seen);
  for (const r of rhythms) {
    const n = (named.get(r.name) ?? 0) + 1;
    named.set(r.name, n);
    if (n > 1) r.name = `${r.name}_${n}`;
  }
  for (const r of rhythms.sort((a, b) => a.name.localeCompare(b.name))) {
    L.push(`  ${r.name}: {`);
    L.push(`    role: ${lit(r.role)}, band: 'mid', style: 'toby-fox', provenance: 'transcribed', ratified: false,`);
    L.push(`    pack: 'undertale',`);
    L.push(`    onsets: ${lit(r.onsets)},`);
    L.push(`    accents: ${lit(r.accents)},`);
    if (r.microtiming) L.push(`    microtiming: ${lit(r.microtiming)},`);
    if (r.voices.includes('bounce')) L.push(`    voices: ${lit(r.voices)},`);
    L.push(`    meter_class: ${lit(r.meter)}, tags: ['undertale', 'comp'],`);
    L.push(`    figures: ${lit(r.figures)}, seen: ${r.seen},`);
    L.push(`    character: null,`);
    L.push(`  },`);
  }
  L.push('}', '');

  // --- melodic rhythm cells (D40) — rhythm ONLY, no pitch ---
  L.push('');
  L.push('// MELODIC rhythm cells mined from the melody streams (D40). Rhythm, relative');
  L.push('// accents and articulation only — no pitch content, no phrases, no contours:');
  L.push('// the D30 melody ruling stands (habits, not tunes). `artic` is the median');
  L.push('// duration/IOI per onset, which is what makes a line phrase rather than drone.');
  L.push('// Selection is stratified by DENSITY so the pool spans sparse to busy — the');
  L.push('// authored melodies were uniform at ~3.5 notes/bar where the corpus varies');
  L.push('// 2..16, and ranking by raw recurrence would have re-created that flatness.');
  L.push('export const MELODY_RHYTHMS_UNDERTALE = {');
  for (const r of [...melRhythms].sort((a, b) => a.name.localeCompare(b.name))) {
    L.push(`  ${r.name}: {`);
    L.push(`    role: 'melodic', band: 'high', style: 'toby-fox', provenance: 'transcribed', ratified: false,`);
    L.push(`    pack: 'undertale',`);
    L.push(`    onsets: ${lit(r.onsets)},`);
    L.push(`    accents: ${lit(r.accents)},`);
    L.push(`    artic: ${lit(r.artic)},`);
    L.push(`    meter_class: ${lit(r.meter)}, grid: ${r.grid}, density: ${r.density},`);
    L.push(`    tags: ['undertale', 'melodic'],`);
    L.push(`    songs: ${lit(r.songs)}, seen: ${r.seen},`);
    L.push(`    needsEar: true, character: null,`);
    L.push(`  },`);
  }
  L.push('}', '');
  writeFileSync(join(ROOT, 'src/lib/rhythms-undertale.js'), L.join('\n'));
}

console.log(`wrote src/lib/progressions-undertale.js  ${progressions.length} entries (${progressions.filter((p) => p.needsEar).length} needsEar)`);
console.log(`wrote src/lib/figurations-undertale.js   ${figEntries.length} figures (of ${figCandidates.length} candidates) + ${moves.length} development moves`);
console.log(`wrote src/lib/rhythms-undertale.js`);

// ---------------------------------------------------------------------------
if (REPORT) {
  console.log(`\nfiles: ${files.length}, analyzed ${songs.length}, skipped ${skipped.length}`);
  for (const s of skipped) console.log(`  SKIP ${s}`);
  const t = (xs) => xs.reduce((a, x) => ({ ...a, [x]: (a[x] ?? 0) + 1 }), {});
  console.log(`triage: ${JSON.stringify(t(songs.map((s) => s.tri.verdict)))}`);
  console.log(`split methods: ${JSON.stringify(t(songs.map((s) => s.method.replace(/\(.*/, ''))))}`);
  console.log(`meters: ${JSON.stringify(t(songs.map((s) => s.meter)))}`);
  console.log(`keys: ${songs.filter((s) => s.key.margin < 0.05).length}/${songs.length} ambiguous (margin < .05)`);
  console.log(`\nprogressions: ${progressions.length} loops from ${new Set(progressions.map((p) => p.song)).size} songs`);
  console.log(`figure signatures: ${figMap.size} distinct; ${figCandidates.length} candidates past threshold; emitted ${figEntries.length}`);
  console.log(`\ntop figures:`);
  for (const f of figEntries.slice(0, 24)) {
    console.log(`  ${String(f.seen).padStart(4)}x/${String(f.nSongs).padStart(2)}s ${f.name.padEnd(44)} ${f.meter} 1/${f.grid} [${f.tokens.join(' ')}]`);
  }
  console.log(`\ndevelopment relations: ${JSON.stringify(Object.fromEntries([...relTally.entries()].sort((a, b) => b[1] - a[1])))}`);
  console.log(`moves emitted: ${moves.length}`);
  for (const m of moves.slice(0, 12)) console.log(`  ${String(m.seen).padStart(3)}x ${m.fromFig} -> ${m.toFig} [${m.rel.join(',')}]`);

  // melody
  const ivs = [...melStats.intervals.entries()].sort((a, b) => b[1] - a[1]);
  const tot = ivs.reduce((a, [, n]) => a + n, 0);
  const pct = (n) => (100 * n / tot).toFixed(1) + '%';
  const abs = new Map();
  for (const [iv, n] of ivs) abs.set(Math.abs(iv), (abs.get(Math.abs(iv)) ?? 0) + n);
  console.log(`\nmelody: ${tot} intervals`);
  console.log(`  by |semitones|: ${[...abs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([iv, n]) => `${iv}:${pct(n)}`).join(' ')}`);
  const steps = (abs.get(1) ?? 0) + (abs.get(2) ?? 0);
  console.log(`  repeat ${pct(abs.get(0) ?? 0)}, step(1-2) ${pct(steps)}, leap(>=5) ${pct([...abs.entries()].filter(([iv]) => iv >= 5).reduce((a, [, n]) => a + n, 0))}`);
  console.log(`  up vs down: ${pct(ivs.filter(([iv]) => iv > 0).reduce((a, [, n]) => a + n, 0))} up, ${pct(ivs.filter(([iv]) => iv < 0).reduce((a, [, n]) => a + n, 0))} down`);
  console.log(`  leaps reversed after: ${(100 * melStats.leapReversed / Math.max(1, melStats.leaps)).toFixed(0)}%`);
  console.log(`  on-beat onsets: ${(100 * melStats.onBeat / Math.max(1, melStats.onBeat + melStats.offBeat)).toFixed(0)}%; chord-tone when on-beat: ${(100 * melStats.chordToneOnBeat / Math.max(1, melStats.beatOnsets)).toFixed(0)}%`);
  console.log(`  onsets/bar: mean ${mean(melStats.onsetsPerBar).toFixed(1)}, median ${median(melStats.onsetsPerBar)}`);
  console.log(`  bar-level interval patterns repeated within song: ${(100 * melStats.barRepeat / Math.max(1, melStats.barTotal)).toFixed(0)}% of bars`);
  console.log(`  melody range/song: mean ${mean(melStats.ranges).toFixed(0)} semitones`);
  console.log(`  top melodic rhythm cells (16ths): ${[...melStats.rhythmCells.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([c, n]) => `[${c}]x${n}`).join(' ')}`);
}
