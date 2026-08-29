#!/usr/bin/env node
// Ingests the VGMusic corpus (D52): harmony to the progression pool, melody to a
// measured PROFILE. Run scripts/fetch-corpus.mjs first.
//
// Usage: node scripts/import-vgmusic.mjs [--check] [--report]
//
// TWO OUTPUTS, TWO DISCIPLINES.
//
// HARMONY -> src/lib/progressions-vgmusic.js. Chord loops, in the D28 `degrees`
// grammar, the same abstraction the other three packs use. Gated hard, because
// D51 measured that the strongest predictor of Ethan rejecting a card was
// `coverage` — how well the labels explain what sounds — and this corpus is
// amateur transcription of wildly varying quality. Every threshold here is
// stricter than the Undertale import's.
//
// MELODY -> src/lib/melody-profiles-vgmusic.js, a MEASURED PROFILE, not tunes.
// D30 ruled that "extracting the melody of X would be copying a tune, not
// abstracting a habit", and that ruling stands. What comes out is a
// distribution — step vs leap, leap recovery, range, onsets per bar, which
// rhythm cells recur — which is exactly the artifact melody-profiles.js already
// carries for toby-fox (measured from 37,464 Undertale intervals). A habit is
// not anybody's melody.

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadSong, chordLoops, melodyProfile, looksLikeArpeggio, mean, LOOP_PROFILES } from '../src/ingest/corpus.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, 'src/ingest/vgmusic-manifest.json');
const OUT_PROG = join(ROOT, 'src/lib/progressions-vgmusic.js');
const OUT_MEL = join(ROOT, 'src/lib/melody-profiles-vgmusic.js');
const CHECK = process.argv.includes('--check');
const REPORT = process.argv.includes('--report');

// --- gates. Every one is stricter than the Undertale import's, on purpose ----
const MIN_COVERAGE = 0.9;   // undertale keeps down to ~0.48; D51 says that was a mistake
const MIN_KEY_MARGIN = 0.06;
const MIN_REPS = 2;
const MAX_CHORDS = 8;
const MIN_CHORDS = 3;       // a 2-chord fragment is an oscillation, not a progression
const PER_SONG = 1;         // one loop KEPT per song: breadth of songs beats depth of one
const LOOKAT = 3;           // ...but consider this many before giving up on a song
const MAX_ENTRIES = 260;

const PC_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
const MAJ = ['I', 'bII', 'II', 'bIII', 'III', 'IV', 'bV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
const MIN = ['i', 'bII', 'ii', 'III', '#III', 'iv', 'bv', 'v', 'VI', '#VI', 'VII', 'vii'];
const mod12 = (x) => ((x % 12) + 12) % 12;
const round2 = (x) => Math.round(x * 100) / 100;
const round3 = (x) => Math.round(x * 1000) / 1000;
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

function numeralOf(semis, quality, family) {
  const base = (family === 'minor' ? MIN : MAJ)[semis];
  const minorish = /^(m(?!aj)|o)/.test(quality);
  const n = minorish ? base.toLowerCase() : base.toUpperCase().replace(/^([B#])/, (m) => m.toLowerCase());
  return n + quality;
}

if (!existsSync(MANIFEST)) {
  console.error('no manifest — run: node scripts/fetch-corpus.mjs');
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));

// --- analyse ---------------------------------------------------------------

// FROZEN-PACK EXCLUSIONS (D96). This pack is committed, its clicked entries
// feed retrieval, and its counts feed build-harmony-model.mjs — which ranks the
// variation ops. So a file that becomes readable FOR THE FIRST TIME is a
// library-growth event, not a free bug fix. Calling_From_Heaven3.mid declares a
// 0/1 time signature; until the D96 guard in src/ingest/midi.js that made
// barTicks 0 and the file was skipped, so the committed pack never contained it.
// Admitting it re-counts the model and moves four songs — vs_somber_aftermath,
// which is KEPT, among them. It stays out until Ethan ratifies it by ear.
// Delete the entry to admit it, then byte-check all 43 songs.
const FROZEN_EXCLUSIONS = new Set(['audios/vgmusic/genesis/Calling_From_Heaven3.mid']);

const songs = [];
const skipped = [];
for (const f of manifest.files) {
  const path = join(ROOT, f.path);
  if (FROZEN_EXCLUSIONS.has(f.path)) { skipped.push(`${f.path} — frozen-pack exclusion (D96)`); continue; }
  if (!existsSync(path)) { skipped.push(`${f.path} — not downloaded`); continue; }
  let song;
  try { song = loadSong(path, { titleOf: () => `${f.game} — ${f.title}` }); } catch (e) {
    skipped.push(`${f.path} — ${e.message}`); continue;
  }
  if (song.skipped) { skipped.push(song.skipped); continue; }
  // A file with no usable meter or a wild bar count is a sequencing artifact
  if (song.totalBars < 8 || song.totalBars > 600) { skipped.push(`${f.path} — ${song.totalBars} bars`); continue; }
  songs.push({ ...song, meta: f });
}

// --- harmony ---------------------------------------------------------------

const candidates = [];
for (const song of songs) {
  if (song.key.margin < MIN_KEY_MARGIN) continue;
  // Look at several loops and keep the best-covered one that passes. Taking
  // only the longest-repeating span and rejecting the song when that span was
  // poorly covered threw away 92% of the corpus.
  // LOOP_PROFILES.legacy, explicitly: this pack is COMMITTED and its entries
  // feed retrieval, so the D96 extractor repair must not silently re-roll it.
  // See LOOP_PROFILES in src/ingest/corpus.js for what flipping it costs.
  const loops = chordLoops(song, { max: LOOKAT, ...LOOP_PROFILES.legacy })
    .filter((l) => l.coverage >= MIN_COVERAGE && l.reps >= MIN_REPS
      && l.chords.length >= MIN_CHORDS && l.chords.length <= MAX_CHORDS)
    .sort((a, b) => b.coverage - a.coverage)
    .slice(0, PER_SONG);
  for (const loop of loops) {
    const family = song.key.mode;
    const degrees = loop.chords.map((c) => `${mod12(c.rootPc - song.key.tonicPc)}${c.quality ? `:${c.quality}` : ''}`).join(' ');
    const numerals = loop.chords.map((c) => numeralOf(mod12(c.rootPc - song.key.tonicPc), c.quality, family)).join('-');
    candidates.push({
      name: `vg_${slugify(`${song.meta.system}_${song.meta.game}`).slice(0, 34)}_${slugify(song.meta.title).slice(0, 14)}`,
      family,
      system: song.meta.system,
      game: song.meta.game,
      title: song.meta.title,
      sequencer: song.meta.sequencer,
      path: song.meta.path,
      numerals,
      degrees,
      barsPerChord: loop.chords.map((c) => c.half / 2),
      loopBars: loop.loopBars,
      reps: loop.reps,
      atBar: loop.atBar,
      meter: song.meter,
      bpm: song.bpm,
      sourceKey: `${PC_NAMES[song.key.tonicPc]}:${family}`,
      keyMargin: round3(song.key.margin),
      coverage: round2(loop.coverage),
      nChords: loop.chords.length,
    });
  }
}

// De-duplicate by degrees: this corpus repeats the vernacular constantly, and a
// pool with forty copies of i-bVII-bVI-bVII teaches the counted model that one
// loop is the whole of game music. Keep the best-covered instance of each.
const byDegrees = new Map();
for (const c of candidates.sort((a, b) => b.coverage - a.coverage || a.name.localeCompare(b.name))) {
  if (!byDegrees.has(c.degrees)) byDegrees.set(c.degrees, { ...c, dupes: 0 });
  else byDegrees.get(c.degrees).dupes++;
}
const uniq = [...byDegrees.values()];
// Also drop names that collide (two tracks from one game hashing to one slug)
const usedNames = new Set();
const entries = [];
for (const c of uniq.sort((a, b) => b.dupes - a.dupes || b.coverage - a.coverage || a.name.localeCompare(b.name))) {
  let n = c.name, i = 2;
  while (usedNames.has(n)) n = `${c.name}_${i++}`;
  usedNames.add(n);
  entries.push({ ...c, name: n });
  if (entries.length >= MAX_ENTRIES) break;
}

// --- melody ----------------------------------------------------------------
// Only songs whose melody stream is actually separable contribute. `splitHands`
// falls back to a pitch split when a file has one track, and that fallback
// cannot be trusted to have found a tune.
// ...and only songs whose melody stream is a TUNE. A third of this corpus puts
// a fast broken-chord channel above the melody, and splitHands() hands that back
// as "the melody" — measuring it produced a profile with 9 onsets a bar and 90%
// bar-rhythm repetition, which is an ostinato's fingerprint, not a tune's.
const separable = songs.filter((s) => /^tracks\(/.test(s.method) && s.mel.length >= 32);
const melodySongs = separable.filter((s) => !looksLikeArpeggio(s));
const { profile, evidence } = melodyProfile(melodySongs);

// --- emit ------------------------------------------------------------------

const L = [];
L.push('// Chord progressions extracted from the VGMusic corpus (D52).');
L.push('//');
L.push('// GENERATED by scripts/import-vgmusic.mjs — do not hand-edit; re-run the');
L.push('// importer. The .mid files are NOT in the repo (audios/vgmusic/ is');
L.push('// gitignored); scripts/fetch-corpus.mjs reproduces them from the manifest at');
L.push('// src/ingest/vgmusic-manifest.json, which credits every sequencer.');
L.push('//');
L.push('// A CANDIDATE POOL, not a library (A6.1): every entry is ratified:false /');
L.push('// character:null / needsEar:true. Nothing here has been heard.');
L.push('//');
L.push(`// GATED HARDER THAN THE OTHER PACKS. D51 measured that the strongest predictor`);
L.push(`// of a card being rejected was label \`coverage\`, i.e. transcription quality —`);
L.push(`// so this pack requires coverage >= ${MIN_COVERAGE} (the Undertale pack keeps entries down`);
L.push(`// to 0.48), keyMargin >= ${MIN_KEY_MARGIN}, at least ${MIN_REPS} repetitions, ${MIN_CHORDS}-${MAX_CHORDS} chords,`);
L.push(`// and ${PER_SONG} loop per song. \`dupes\` counts how many OTHER songs in the corpus cycle`);
L.push('// the identical degree sequence — a direct measure of how vernacular a');
L.push('// progression is, which no other pack carries.');
L.push('');
L.push('export const PROGRESSIONS_VGMUSIC = {');
for (const e of entries) {
  L.push(`  ${e.name}: {`);
  L.push(`    family: '${e.family}', pack: 'vgmusic', role: 'harmony', style: '${e.system}',`);
  L.push(`    provenance: 'transcribed', source: '${e.path}', ratified: false,`);
  L.push(`    song: ${JSON.stringify(`${e.game} — ${e.title}`)}, sequencer: ${JSON.stringify(e.sequencer)},`);
  L.push(`    numerals: '${e.numerals}',`);
  L.push(`    degrees: '${e.degrees}',`);
  L.push(`    moods: [],`);
  L.push(`    barsPerChord: [${e.barsPerChord.join(', ')}], loopBars: ${e.loopBars}, reps: ${e.reps}, atBar: ${e.atBar},`);
  L.push(`    meter: '${e.meter}', bpm: ${e.bpm},`);
  L.push(`    sourceKey: '${e.sourceKey}', keyMargin: ${e.keyMargin}, coverage: ${e.coverage}, dupes: ${e.dupes},`);
  L.push(`    needsEar: true,`);
  L.push(`    ownFigure: null,`);
  L.push(`    character: null,`);
  L.push(`  },`);
}
L.push('};');
L.push('');
const progOut = L.join('\n');

const M = [];
M.push('// Melodic habits measured from the VGMusic corpus (D52).');
M.push('//');
M.push('// GENERATED by scripts/import-vgmusic.mjs — do not hand-edit.');
M.push('//');
M.push('// NOT TUNES. D30 ruled that "extracting the melody of X would be copying a');
M.push('// tune, not abstracting a habit", and that ruling stands: nothing in this file');
M.push('// is a sequence of notes. What is here is a DISTRIBUTION — how often the line');
M.push('// steps or leaps, whether leaps reverse, how wide it ranges, how many onsets a');
M.push('// bar carries, which rhythm cells recur. It is the same artifact');
M.push('// melody-profiles.js already carries for toby-fox, whose numbers came from');
M.push('// 37,464 measured intervals of the Undertale import.');
M.push('//');
M.push('// TWO FILTERS decide what contributes. Only songs whose melody was separable');
M.push('// by TRACK (splitHands() falls back to a pitch split on single-track files, and');
M.push('// that fallback cannot be trusted to have found a tune) — and then only those');
M.push('// whose melody stream is not an ARPEGGIO CHANNEL. Game MIDI routinely puts a');
M.push('// fast broken-chord part above the melody; measuring it unfiltered gave 9');
M.push('// onsets a bar and 90% bar-rhythm repetition, an ostinato\'s fingerprint.');
M.push(`// ${separable.length} songs separable, ${melodySongs.length} of them a tune.`);
M.push('//');
M.push('// NOT ALL FIELDS ARE COMPARABLE to the toby-fox profile. The interval shares,');
M.push('// upBias, leapRecovery and stepInertia are measured the same way and do line');
M.push('// up closely (step .32 vs .34, octave .061 vs .066) — two corpora measured');
M.push('// independently agreeing is the reason to believe either. But');
M.push('// `cellRepetitionFloor` here counts any bar whose rhythm signature occurs more');
M.push('// than once in the song, which saturates its 0.9 cap on almost anything');
M.push('// repetitive; toby-fox\'s 0.5 was a hand-set audition default, not that');
M.push('// measurement. Do not read the two side by side.');
M.push('');
M.push('export const MELODY_PROFILE_VGMUSIC = {');
M.push(`  'game-midi': {`);
for (const [k, v] of Object.entries(profile)) {
  M.push(`    ${k}: ${typeof v === 'object' ? `{ ${Object.entries(v).map(([a, b]) => `${a}: ${b}`).join(', ')} }` : v},`);
}
M.push('    // carried from the toby-fox profile: these are not measurable from');
M.push('    // interval statistics and stay audition-tunable defaults (D37).');
M.push(`    approachProb: 0.15, chromaticApproach: 0.25, tensions: 'triadic',`);
M.push('  },');
M.push('};');
M.push('');
M.push('/** what the profile above was measured from */');
M.push(`export const MELODY_EVIDENCE_VGMUSIC = ${JSON.stringify(evidence, null, 2)};`);
M.push('');
const melOut = M.join('\n');

if (CHECK) {
  for (const [path, want] of [[OUT_PROG, progOut], [OUT_MEL, melOut]]) {
    if (!existsSync(path) || readFileSync(path, 'utf8') !== want) {
      console.error(`${path} is stale — re-run: node scripts/import-vgmusic.mjs`);
      process.exit(1);
    }
  }
  console.log(`vgmusic pack up to date (${entries.length} progressions)`);
} else {
  writeFileSync(OUT_PROG, progOut);
  writeFileSync(OUT_MEL, melOut);
  console.log(`analysed ${songs.length} files (${skipped.length} skipped)`);
  console.log(`wrote ${OUT_PROG}: ${entries.length} progressions`);
  console.log(`  ${candidates.length} loops passed the gates -> ${uniq.length} distinct degree sequences`);
  console.log(`  families: ${['major', 'minor'].map((f) => `${f} ${entries.filter((e) => e.family === f).length}`).join(', ')}`);
  console.log(`  mean coverage ${mean(entries.map((e) => e.coverage)).toFixed(3)}`);
  console.log(`wrote ${OUT_MEL}: melody profile from ${evidence.songs} songs, ${evidence.intervals} intervals`);
  console.log(`  ${separable.length} had a track-separated melody; ${separable.length - melodySongs.length} were arpeggio channels, dropped`);
}

if (REPORT) {
  console.log('\n--- most vernacular progressions (dupes = other songs cycling the same degrees) ---');
  for (const e of entries.slice(0, 15)) {
    console.log(`  ${String(e.dupes).padStart(3)}x  ${e.degrees.padEnd(30)} ${e.numerals.slice(0, 34).padEnd(34)} ${e.game}`);
  }
  console.log('\n--- melody profile ---');
  console.log(JSON.stringify(profile, null, 2));
  console.log('\n--- evidence ---');
  console.log(JSON.stringify(evidence, null, 2));
}
