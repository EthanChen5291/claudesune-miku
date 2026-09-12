// r35 — deep read of the Vocaloid set (37 transcriptions dropped 2026-09-12:
// Miku/Rin/GUMI songs by DECO*27, wowaka, ryo, kemu, MARETU, Neru, Kikuo,
// Giga … plus a few J-pop songs sung by humans in the same arrangement style).
//
// His ask: "analyze the new files i added. they're specifically vocaloid.
// learn from the songs as a whole just as you would from a normal sample
// analysis (including chord progressions, patterns, intervals, melodies,
// accompaniments, harmonies, layering, etc for the vibe. the vocaloid part is
// also piano but is its own instrument/section i believe. this section will
// be playing one note at a time for most of the songs. notice how some songs
// have harmony directly supporting the voice though, whether that's another
// voice or another instrument. … our voices are good and the melody is good
// but it's relatively uniform … learn from vocaloid patterns and agreements
// with harmony and ranges and speeds that can be done (and the choruses to
// support)".
//
// ANALYSIS ONLY (D95): nothing here is counted into src/lib. Output is
// audios/vocaloid-r35/_analysis.json (gitignored, like every corpus read-out)
// + research/vocaloid-r35.md; whatever survives is authored BY HAND into lab
// cards / engine opts in a later step.
//
// Every file is the same three-track shape: NOTE (the accompaniment's right
// hand — chords, counter-figures, the instrumental hooks), VOCAL (the sung
// line, one note at a time), BASS (the left hand), and in two files a
// VOCAL 2 (a harmony voice). Roles are assigned by NAME where the track is
// named, and otherwise by BEHAVIOUR (the most monophonic mid-register part is
// the voice, the lowest part is the bass), never by GM program — most files
// declare none.
//
// The questions are the ones the vocal tier asks (D134/D135/D138):
//   VOICE    range / tessitura / speed (syllables per second, the 16th share)
//            / intervals / phrase shape / breath / repetition (the hook)
//   HARMONY  agreement of the voice with the chord under it, BY BEAT STRENGTH,
//            non-chord-tone resolution, out-of-key use
//   SUPPORT  what plays WITH the voice: a second voice (interval, where), the
//            accompaniment doubling or shadowing it, the acc top voice's
//            relation, homorhythm, the fill in the voice's rests
//   FORM     verse vs chorus contrast (register lift, density, acc thickness,
//            bass register, chord rate), intro / interlude / outro, dynamics
//   CHORDS   loops (repaired extractor), harmonic rhythm, colour, borrowed
//            chords, cadence, bass behaviour
//
// Run: node scripts/analyze-vocaloid-r35.mjs [dir]   (default audios/vocaloid-r35)

import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chordLoops } from '../src/ingest/corpus.js';
import { chordAt, chordTimeline, solveKeyKS } from '../src/ingest/piano.js';
import { readCorpusMidi, extractParts, PC_NAMES } from './corpus-midi.mjs';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIR = process.argv[2] ? join(ROOT, process.argv[2]) : join(ROOT, 'audios', 'vocaloid-r35');
const mod12 = (x) => ((x % 12) + 12) % 12;
const median = (a) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const pct = (a, p) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); return b[Math.min(b.length - 1, Math.floor(p * b.length))]; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const r3 = (x) => (x == null || Number.isNaN(x) ? null : Math.round(x * 1000) / 1000);
const share = (n, d) => (d ? r3(n / d) : null);
const hist = (arr, keyOf) => { const m = {}; for (const x of arr) { const k = keyOf ? keyOf(x) : x; m[k] = (m[k] ?? 0) + 1; } return m; };

// --------------------------------------------------------------- labels
// Inferred from the TITLE (producer / genre / the song's known character), the
// way the r34 pack was labelled. Energy is MEASURED later (bpm × syllable rate)
// and the label here is the song's reputation, so the two can disagree.
const LABELS = [
  [/android girl/i,         'Android Girl',              'DECO*27',      'electro-rock',  'yearning',    'high'],
  [/binomi/i,               'Binomi',                    'Chinozo?',     'dance-pop',     'playful',     'high'],
  [/darling dance/i,        'Darling Dance',             'Kairiki Bear', 'dance-rock',    'manic',       'high'],
  [/eh ah,? sou/i,          'Eh? Ah, Sou.',              'chouchou-P',   'rock',          'sardonic',    'high'],
  [/ghost rule/i,           'Ghost Rule',                'DECO*27',      'rock',          'tense',       'high'],
  [/gimme.gimme/i,          'Gimme×Gimme',               'Hachioji P × Giga', 'electro-dance', 'flirty',  'mid'],
  [/hated by life/i,        'Hated by Life Itself',      'Kanzaki Iori', 'rock ballad',   'desperate',   'high'],
  [/hatsune miku - senbonzakura/i, 'Senbonzakura (alt)', 'Kurousa-P',    'wa-rock',       'festive',     'high'],
  [/^senbonzakura/i,        'Senbonzakura',              'Kurousa-P',    'wa-rock',       'festive',     'high'],
  [/hibikase/i,             'Hibikase',                  'Giga',         'electro',       'cool',        'mid'],
  [/won.t let you through|toosenbo/i, 'Toosenbo',        'Kanaria?',     'pop',           'playful',     'mid'],
  [/ievan polkka/i,         'Ievan Polkka',              'trad. / Otomania', 'folk-polka', 'silly',       'mid'],
  [/iya iya yo/i,           'Iya Iya Yo',                '?',            'pop',           'sulky',       'mid'],
  [/jigsaw puzzle/i,        'Jigsaw Puzzle',             'MARETU',       'dark rock',     'angry',       'high'],
  [/looking for the moon/i, 'Looking for the Moon',      '?',            'pop-rock',      'wistful',     'mid'],
  [/love me,? love me/i,    'Love Me Love Me Love Me',   'Kikuo',        'dark waltz-pop','obsessive',   'low'],
  [/love is war/i,          'Love is War',               'ryo (supercell)', 'rock ballad', 'aching',      'mid'],
  [/^melt/i,                'Melt',                      'ryo (supercell)', 'pop-rock',   'in-love',     'high'],
  [/mind brand/i,           'Mind Brand',                'MARETU',       'dark electro',  'frantic',     'high'],
  [/monster/i,              'Monster (YOASOBI)',         'YOASOBI',      'j-pop (human)', 'driven',      'high'],
  [/mousou kanshou/i,       'Mousou Kanshou Daishou Renmei', 'DECO*27',  'pop-rock',      'bittersweet', 'mid'],
  [/new darling/i,          'New Darling',               'MARETU',       'dark pop',      'sinister',    'high'],
  [/new genesis/i,          'New Genesis (Ado)',         'Ado / Nakata', 'j-pop (human)', 'triumphant',  'high'],
  [/rebirth|uminaoshi/i,    'Uminaoshi',                 '?',            'pop',           'hopeful',     'mid'],
  [/^roki/i,                'Roki',                      'mikitoP',      'rock',          'defiant',     'high'],
  [/rolling girl/i,         'Rolling Girl',              'wowaka',       'rock',          'anxious',     'high'],
  [/six trillion/i,         'Six Trillion Years',        'kemu',         'speed rock',    'epic',        'high'],
  [/super superhero/i,      'Super Superhero',           '?',            'pop',           'cheerful',    'mid'],
  [/telecaster b-boy/i,     'Telecaster B-Boy',          'surii',        'rock',          'defiant',     'high'],
  [/telepathy/i,            'Telepathy',                 '?',            'pop',           'dreamy',      'mid'],
  [/lost one.s weeping/i,   "The Lost One's Weeping",    'Neru',         'rock',          'bitter',      'high'],
  [/tondemo wonders/i,      'Tondemo Wonders',           'sasakure.UK',  'hyper-pop',     'ecstatic',    'high'],
  [/two breaths walking/i,  'Two Breaths Walking',       'DECO*27',      'pop-rock',      'sweet',       'mid'],
  [/usseewa/i,              'Usseewa (Ado)',             'Ado / syudou', 'j-pop (human)', 'furious',     'high'],
  [/vampire/i,              'Vampire',                   'DECO*27',      'pop-rock',      'seductive',   'high'],
  [/^yellow/i,              'Yellow (Coldplay, control)','Coldplay',     'western pop (control)', 'tender', 'low'],
  [/yoru ni kakeru/i,       'Yoru ni Kakeru (YOASOBI)',  'YOASOBI',      'j-pop (human)', 'rushing',     'high'],
];
const EXCLUDE = /^get_proto-/i; // his own reel prototypes — not part of this set
function labelFor(file) {
  for (const [re, song, producer, lane, emotion, energy] of LABELS) if (re.test(file)) return { song, producer, lane, emotion, energy };
  return { song: file.replace(/\.mid$/i, ''), producer: '?', lane: 'unlabelled', emotion: '?', energy: '?' };
}

// --------------------------------------------------------------- harmony helpers (r34's)
const QUALITY_PCS = {
  '': [0, 4, 7], m: [0, 3, 7], 7: [0, 4, 7, 10], m7: [0, 3, 7, 10], '^7': [0, 4, 7, 11],
  m9: [0, 3, 7, 10, 14], madd9: [0, 3, 7, 14], 9: [0, 4, 7, 10, 14], sus: [0, 5, 7], '7sus': [0, 5, 7, 10],
  6: [0, 4, 7, 9], m6: [0, 3, 7, 9], o: [0, 3, 6], o7: [0, 3, 6, 9], m7b5: [0, 3, 6, 10],
  2: [0, 2, 7], 5: [0, 7], aug: [0, 4, 8],
};
const DIALECT_FOLD = { 2: 'sus', 5: '', aug: '' };
const dialectQuality = (q) => (q in DIALECT_FOLD ? DIALECT_FOLD[q] : (q in QUALITY_PCS ? q : ''));
const chordPcs = (rootPc, q) => new Set((QUALITY_PCS[q] ?? QUALITY_PCS['']).map((i) => mod12(rootPc + i)));
const isMinorQ = (q) => /^m(?!aj)/.test(q) || q === 'o' || q === 'o7' || q === 'm7b5';
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];
const DEGREE_NAMES = { 0: 'I', 1: 'bII', 2: 'II', 3: 'bIII', 4: 'III', 5: 'IV', 6: '#IV', 7: 'V', 8: 'bVI', 9: 'VI', 10: 'bVII', 11: 'VII' };
const DIATONIC = {
  major: { 0: '', 2: 'm', 4: 'm', 5: '', 7: '', 9: 'm', 11: 'o' },
  minor: { 0: 'm', 2: 'o', 3: '', 5: 'm', 7: 'm', 8: '', 10: '' },
};
function numeral(semis, quality) {
  const base = DEGREE_NAMES[mod12(semis)] ?? '?';
  const label = isMinorQ(quality) ? base.toLowerCase() : base;
  const suffix = quality === '' || quality === 'm' ? '' : quality.replace(/^m(?!aj|7b5)/, '');
  return `${label}${suffix}`;
}
function isDiatonic(semis, quality, mode) {
  const d = DIATONIC[mode][mod12(semis)];
  if (d == null) return false;
  if (d === '') return ['', '7', '^7', '6', 9, '9', 'sus', '7sus', '2', '5', 'madd9'].includes(quality) && !isMinorQ(quality);
  if (d === 'm') return ['m', 'm7', 'm9', 'madd9', 'm6', 'sus', '2', '5'].includes(quality);
  if (d === 'o') return ['o', 'o7', 'm7b5'].includes(quality);
  return false;
}
function borrowedTag(semis, quality, mode) {
  const s = mod12(semis);
  if (mode === 'major') {
    if (s === 10 && !isMinorQ(quality)) return 'bVII (mixolydian borrow)';
    if (s === 8 && !isMinorQ(quality)) return 'bVI (aeolian borrow)';
    if (s === 5 && isMinorQ(quality)) return 'iv (minor plagal)';
    if (s === 3 && !isMinorQ(quality)) return 'bIII (borrow)';
    if (s === 2 && !isMinorQ(quality)) return 'II / V of V (secondary dominant)';
    if (s === 4 && !isMinorQ(quality)) return 'III / V of vi (secondary dominant)';
    if (s === 9 && !isMinorQ(quality)) return 'VI / V of ii (secondary dominant)';
    if (s === 0 && isMinorQ(quality)) return 'i (parallel minor)';
    if (s === 1) return 'bII (neapolitan)';
    if (s === 6) return '#IV (lydian / passing dim)';
  } else {
    if (s === 7 && !isMinorQ(quality)) return 'V (harmonic-minor dominant)';
    if (s === 0 && !isMinorQ(quality)) return 'I (picardy / parallel major)';
    if (s === 5 && !isMinorQ(quality)) return 'IV (dorian)';
    if (s === 9 && !isMinorQ(quality)) return 'VI natural? (dorian vi)';
    if (s === 2 && !isMinorQ(quality)) return 'II (lydian-ish)';
    if (s === 1) return 'bII (neapolitan)';
    if (s === 11) return 'vii° (leading-tone)';
    if (s === 4) return 'III# (chromatic)';
  }
  return 'other chromatic';
}
function collapsePeriod(chords) {
  const n = chords.length;
  for (let p = 1; p < n; p++) {
    if (n % p) continue;
    let ok = true;
    for (let i = 0; i < n && ok; i++) { const a = chords[i], b = chords[i % p]; if (a.rootPc !== b.rootPc || a.quality !== b.quality || a.half !== b.half) ok = false; }
    if (ok) return { chords: chords.slice(0, p), folds: n / p };
  }
  return { chords, folds: 1 };
}
function cadenceClass(lastSemis, firstSemis) {
  const l = mod12(lastSemis), f = mod12(firstSemis);
  const tonicFirst = f === 0;
  if (l === 7 && tonicFirst) return 'authentic V-I';
  if (l === 5 && tonicFirst) return 'plagal IV-I';
  if (l === 10 && tonicFirst) return 'bVII-I (mixolydian)';
  if (l === 8 && tonicFirst) return 'bVI-I';
  if (l === 9 && tonicFirst) return 'vi-I';
  if (l === 2 && tonicFirst) return 'ii-I';
  if (l === 7 && f === 9) return 'deceptive V-vi';
  if (l === 7) return 'V-x (half-cadence turnaround)';
  if (l === 5 && f === 7) return 'IV-V (open)';
  if (l === 0) return 'loop ends on tonic';
  return `${DEGREE_NAMES[l]}-${DEGREE_NAMES[f]}`;
}

// --------------------------------------------------------------- part helpers
function monophony(notes) {
  // share of onsets where no OTHER note of this part is sounding at the onset
  const s = [...notes].sort((a, b) => a.tick - b.tick);
  let mono = 0;
  for (let i = 0; i < s.length; i++) {
    const n = s[i];
    let overlap = false;
    for (let j = i - 1; j >= 0 && s[j].tick + 48 >= n.tick - 2000; j--) { // cheap window
      if (s[j].tick === n.tick || (s[j].tick < n.tick && s[j].tick + s[j].dur > n.tick + 2)) { overlap = true; break; }
    }
    if (!overlap) mono++;
  }
  return s.length ? mono / s.length : 0;
}
const isVoiceName = (n) => /vocal|voice|miku|rin\b|len\b|gumi|luka|sing|vox|melody|mel\b|lead/i.test(n ?? '');
const isBassName = (n) => /bass/i.test(n ?? '');

/** assign voice / voice2 / acc / bass from names first, behaviour second */
function assignRoles(parts) {
  const p = parts.filter((x) => !x.isDrum && x.notes.length >= 20).map((x) => ({
    part: x, name: x.name ?? '', n: x.notes.length, med: median(x.notes.map((n) => n.midi)), mono: monophony(x.notes),
  }));
  const out = { voice: null, voice2: null, acc: [], bass: null, method: 'name' };
  const named = p.filter((x) => isVoiceName(x.name));
  if (named.length) {
    named.sort((a, b) => b.n - a.n);
    out.voice = named[0]; if (named[1]) out.voice2 = named[1];
  }
  const bassNamed = p.filter((x) => isBassName(x.name));
  if (bassNamed.length) out.bass = bassNamed.sort((a, b) => a.med - b.med)[0];
  const rest = p.filter((x) => x !== out.voice && x !== out.voice2 && x !== out.bass);
  if (!out.bass && rest.length >= 2) { rest.sort((a, b) => a.med - b.med); out.bass = rest.shift(); out.method = 'behaviour'; }
  if (!out.voice && rest.length) {
    // the most monophonic part with a singable median (52-84), largest count on ties
    const cands = rest.filter((x) => x.med >= 52 && x.med <= 84).sort((a, b) => (b.mono - a.mono) || (b.n - a.n));
    if (cands.length && cands[0].mono >= 0.85) { out.voice = cands[0]; rest.splice(rest.indexOf(cands[0]), 1); out.method = 'behaviour'; }
  }
  out.acc = rest;
  return out;
}

// --------------------------------------------------------------- per-song analysis
function analyze(file) {
  const mid = readCorpusMidi(join(DIR, file));
  const parts = extractParts(mid);
  const label = labelFor(file);
  const [num, den] = mid.timeSig;
  const barTicks = mid.ppq * 4 * (num / den);
  const beatTicks = mid.ppq;
  const totalBars = Math.max(1, Math.ceil(mid.endTick / barTicks));
  const bpm = mid.bpm;
  const secPerBeat = 60 / bpm;
  // GRID OFFSET: some transcriptions (Monster, Tondemo Wonders, Mind Brand …)
  // were laid down from audio with the bar line off by a 16th or more — every
  // onset then reads as an odd 16th and every beat-strength metric is wrong.
  // Measured: the 16th-slot rotation that puts the most bass+acc onsets on the
  // 8th grid; the file is shifted by that many 16ths (0 for a clean file).
  const grid16 = barTicks / 16;
  const nonVoice = parts.filter((p) => !isVoiceName(p.name)).flatMap((p) => p.notes);
  let bestRot = 0, bestScore = -1;
  for (let rot = 0; rot < 16; rot++) {
    let onGrid = 0;
    for (const n of nonVoice) { const slot = Math.round((n.tick - rot * grid16) / grid16); if (((slot % 2) + 2) % 2 === 0) onGrid++; }
    if (onGrid > bestScore) { bestScore = onGrid; bestRot = rot; }
  }
  // prefer the smallest |shift| among near-ties (a clean file scores 0 best)
  if (bestRot !== 0) { let z = 0; for (const n of nonVoice) { const slot = Math.round(n.tick / grid16); if (slot % 2 === 0) z++; } if (z >= bestScore * 0.97) bestRot = 0; }
  const gridShift = bestRot >= 8 ? bestRot - 16 : bestRot;
  if (gridShift) for (const p of parts) { for (const n of p.notes) n.tick -= gridShift * grid16; p.notes = p.notes.filter((n) => n.tick >= 0); }
  const roles = assignRoles(parts);
  if (!roles.voice) return { file, label, skipped: 'no voice track identified', parts: parts.map((p) => ({ name: p.name, n: p.notes.length })) };
  let voice = [...roles.voice.part.notes].sort((a, b) => a.tick - b.tick || a.midi - b.midi);
  // VOICE-ONLY GRID: in a few transcriptions the vocal track alone sits a 16th
  // off the accompaniment's grid (Senbonzakura: 92% of voice onsets on odd
  // 16ths after the file-level correction, none on beat 1 — the transcriber
  // wrote every vocal onset a 16th early). When more than 80% of voice onsets
  // are odd 16ths the voice is moved by one 16th in the direction that puts
  // the most onsets on the 8th grid, and the file is flagged.
  let voiceShift = 0;
  {
    const odd = voice.filter((n) => Math.round(n.tick / grid16) % 2 !== 0).length / Math.max(1, voice.length);
    if (odd > 0.8) {
      const score = (d) => voice.filter((n) => Math.round((n.tick + d * grid16) / grid16) % 2 === 0).length;
      voiceShift = score(1) >= score(-1) ? 1 : -1;
      voice = voice.map((n) => ({ ...n, tick: n.tick + voiceShift * grid16 })).filter((n) => n.tick >= 0);
    }
  }
  const voice2 = roles.voice2 ? [...roles.voice2.part.notes].sort((a, b) => a.tick - b.tick) : [];
  const acc = roles.acc.flatMap((x) => x.part.notes).sort((a, b) => a.tick - b.tick);
  const bass = roles.bass ? [...roles.bass.part.notes].sort((a, b) => a.tick - b.tick) : [];
  const allNotes = mid.notes.filter((n) => n.channel !== 9 && n.tick >= 0);

  // key + chord timeline from the ACCOMPANIMENT + BASS (the voice is dressing)
  const key = solveKeyKS(allNotes);
  const mode = key.mode;
  const tonicPc = key.tonicPc;
  const harmNotes = acc.concat(bass);
  const timeline = chordTimeline(harmNotes.length ? harmNotes : allNotes, barTicks, totalBars, { key });
  const scalePcs = new Set((mode === 'minor' ? MINOR_SCALE : MAJOR_SCALE).map((s) => mod12(tonicPc + s)));
  const scalePcsHarm = new Set([...scalePcs, mod12(tonicPc + 11)]); // minor's raised 7th admitted
  const chordAtTick = (t) => chordAt(timeline, Math.floor(t / (barTicks / 2)));

  // ---- harmony summary
  const segs = timeline.filter((s) => s.coverage > 0);
  const qualityHist = hist(segs, (s) => dialectQuality(s.quality));
  const colorSegs = segs.filter((s) => !['', 'm', '5', 'sus', '2'].includes(s.quality)).length;
  const diatonicSegs = segs.filter((s) => isDiatonic(mod12(s.rootPc - tonicPc), s.quality, mode)).length;
  const borrowedHist = {};
  for (const s of segs) if (!isDiatonic(mod12(s.rootPc - tonicPc), s.quality, mode)) { const t = borrowedTag(mod12(s.rootPc - tonicPc), s.quality, mode); borrowedHist[t] = (borrowedHist[t] ?? 0) + 1; }
  const borrowed = Object.fromEntries(Object.entries(borrowedHist).filter(([, n]) => n >= 2));
  // harmonic rhythm: root changes per bar
  let changes = 0;
  for (let b = 0; b < totalBars; b++) { const a = chordAt(timeline, 2 * b), c = chordAt(timeline, 2 * b + 1); if (a && c && a.rootPc !== c.rootPc) changes++; }
  const chordsPerBar = r3(1 + changes / totalBars);
  // loops
  const song = { totalBars, timeline };
  let loops = [];
  try { loops = chordLoops(song, { max: 3 }); } catch { loops = []; }
  const loopsOut = loops.slice(0, 3).map((L) => {
    const chords = (L.chords ?? L.loop ?? []).map((c) => ({ rootPc: c.rootPc, quality: dialectQuality(c.quality ?? ''), half: c.half ?? c.halves ?? c.len ?? 2 }));
    const { chords: cc, folds } = collapsePeriod(chords);
    const numerals = cc.map((c) => numeral(mod12(c.rootPc - tonicPc), c.quality)).join(' ');
    const degrees = cc.map((c) => `${mod12(c.rootPc - tonicPc)}${c.quality ? ':' + c.quality : ''}`).join(' ');
    return { bars: L.loopBars, reps: L.reps, atBar: L.atBar, coverage: r3(L.coverage ?? 0), numerals, degrees, folds, cadence: cc.length ? cadenceClass(mod12(cc[cc.length - 1].rootPc - tonicPc), mod12(cc[0].rootPc - tonicPc)) : null, startsOnTonic: cc.length ? mod12(cc[0].rootPc - tonicPc) === 0 : null };
  });

  // ---- voice metrics
  const vMidi = voice.map((n) => n.midi);
  const onsets = []; // dedupe simultaneous (rare) — keep the top note
  for (const n of voice) { const last = onsets[onsets.length - 1]; if (last && Math.abs(last.tick - n.tick) <= 2) { if (n.midi > last.midi) onsets[onsets.length - 1] = n; } else onsets.push(n); }
  const mono = share(onsets.length, voice.length);
  const iois = []; for (let i = 1; i < onsets.length; i++) iois.push((onsets[i].tick - onsets[i - 1].tick) / beatTicks);
  const ioiClass = (x) => (x <= 0.3 ? '16th' : x <= 0.6 ? '8th' : x <= 0.8 ? 'dot8th' : x <= 1.2 ? 'quarter' : x <= 2.2 ? 'half' : 'long');
  const ioiHist = hist(iois.filter((x) => x <= 4), ioiClass);
  const ioiN = iois.filter((x) => x <= 4).length;
  const ioiShare = Object.fromEntries(Object.entries(ioiHist).map(([k, v]) => [k, share(v, ioiN)]));
  // longest run of consecutive 16th IOIs
  let run = 0, maxRun = 0; for (const x of iois) { if (x <= 0.3) { run++; maxRun = Math.max(maxRun, run); } else run = 0; }
  // phrases: a rest of at least an 8th (0.5 beat) between note end and the
  // next onset — the transcriptions are 85% legato, so a breath is short; the
  // 1-beat threshold is kept as the LINE level (`lines`) and the gap
  // distribution is reported so the threshold can be judged
  const gapsAll = [];
  for (let i = 1; i < onsets.length; i++) { const prev = onsets[i - 1]; gapsAll.push((onsets[i].tick - (prev.tick + prev.dur)) / beatTicks); }
  const gapHist = hist(gapsAll.filter((g) => g > 0.05), (g) => (g < 0.3 ? '<16th' : g < 0.6 ? '16th-8th' : g < 1.1 ? '8th-quarter' : g < 2.1 ? '1-2 beats' : g < 4.1 ? '2-4 beats' : '>1 bar'));
  const splitPhrases = (thr) => { const out = []; let cur = [onsets[0]]; for (let i = 1; i < onsets.length; i++) { if (gapsAll[i - 1] >= thr) { out.push(cur); cur = [onsets[i]]; } else cur.push(onsets[i]); } out.push(cur); return out; };
  const phrases = splitPhrases(0.5);
  const lines = splitPhrases(1);
  const phraseBeats = phrases.map((p) => (p[p.length - 1].tick + p[p.length - 1].dur - p[0].tick) / beatTicks);
  const phraseNotes = phrases.map((p) => p.length);
  const breaths = []; for (let i = 1; i < phrases.length; i++) { const a = phrases[i - 1], b = phrases[i]; breaths.push((b[0].tick - (a[a.length - 1].tick + a[a.length - 1].dur)) / beatTicks); }
  const slotOf = (t) => Math.round(((t % barTicks) / barTicks) * 16) % 16;
  const startPos = hist(phrases, (p) => { const s = slotOf(p[0].tick); return s === 0 ? 'downbeat' : s >= 12 ? 'pickup(beat4)' : s === 8 ? 'beat3' : s % 4 === 0 ? 'beat2/other' : s % 2 === 0 ? 'off8th' : 'off16th'; });
  const startShare = Object.fromEntries(Object.entries(startPos).map(([k, v]) => [k, share(v, phrases.length)]));
  const finalDurBeats = phrases.map((p) => p[p.length - 1].dur / beatTicks);
  const contour = hist(phrases.filter((p) => p.length >= 4), (p) => { const m = p.map((n) => n.midi); const peak = m.indexOf(Math.max(...m)); const f = m[0], l = m[m.length - 1]; const rel = peak / (m.length - 1); if (rel > 0.25 && rel < 0.75) return 'arch'; if (l - f >= 3) return 'ascend'; if (f - l >= 3) return 'descend'; return 'flat'; });
  // intervals
  const ivs = []; for (let i = 1; i < onsets.length; i++) ivs.push(onsets[i].midi - onsets[i - 1].midi);
  const ivsIn = []; for (const p of phrases) for (let i = 1; i < p.length; i++) ivsIn.push(p[i].midi - p[i - 1].midi);
  const ivClass = (d) => { const a = Math.abs(d); return a === 0 ? 'repeat' : a <= 2 ? 'step' : a <= 4 ? 'third' : a <= 7 ? 'leap4-5' : a <= 12 ? 'leap6-8ve' : 'wide'; };
  const ivHist = hist(ivsIn, ivClass);
  const ivShare = Object.fromEntries(Object.entries(ivHist).map(([k, v]) => [k, share(v, ivsIn.length)]));
  const absHist = hist(ivsIn.map((d) => Math.min(13, Math.abs(d))));
  let leapRecover = 0, leaps = 0;
  for (let i = 1; i < ivsIn.length; i++) if (Math.abs(ivsIn[i - 1]) >= 5) { leaps++; if (Math.sign(ivsIn[i]) === -Math.sign(ivsIn[i - 1]) && Math.abs(ivsIn[i]) <= 2) leapRecover++; }
  // harmony agreement by beat strength
  const strength = (t) => { const s = slotOf(t); return s === 0 ? 'beat1' : s === 8 ? 'beat3' : s % 4 === 0 ? 'beat2/4' : s % 2 === 0 ? 'off8th' : 'off16th'; };
  const agree = {}; const agreeN = {};
  let nct = 0, nctRes = 0, nctApp = 0, nctTotal = 0, ctDur = 0, totDur = 0, outKey = 0, outKeyHarm = 0;
  const nctDeg = {};
  for (let i = 0; i < onsets.length; i++) {
    const n = onsets[i]; const seg = chordAtTick(n.tick);
    const st = strength(n.tick);
    agreeN[st] = (agreeN[st] ?? 0) + 1;
    const pcs = seg && seg.coverage > 0 ? chordPcs(seg.rootPc, seg.quality) : null;
    const isCt = pcs ? pcs.has(mod12(n.midi)) : true;
    if (isCt) agree[st] = (agree[st] ?? 0) + 1;
    totDur += n.dur; if (isCt) ctDur += n.dur;
    if (!scalePcs.has(mod12(n.midi))) outKey++;
    if (!scalePcsHarm.has(mod12(n.midi))) outKeyHarm++;
    if (pcs && !isCt) {
      nctTotal++;
      const d = mod12(n.midi - seg.rootPc); nctDeg[d] = (nctDeg[d] ?? 0) + 1;
      const nx = onsets[i + 1], pv = onsets[i - 1];
      if (nx && Math.abs(nx.midi - n.midi) <= 2 && Math.abs(nx.midi - n.midi) > 0) nctRes++;
      if (pv && Math.abs(pv.midi - n.midi) <= 2 && Math.abs(pv.midi - n.midi) > 0) nctApp++;
    }
  }
  const agreeShare = Object.fromEntries(Object.keys(agreeN).map((k) => [k, share(agree[k] ?? 0, agreeN[k])]));
  // phrase-final landing
  const landing = hist(phrases, (p) => { const n = p[p.length - 1]; const seg = chordAtTick(n.tick); if (!seg || !seg.coverage) return '?'; const d = mod12(n.midi - seg.rootPc); return d === 0 ? 'root' : (d === 3 || d === 4) ? '3rd' : d === 7 ? '5th' : (d === 10 || d === 11) ? '7th' : d === 2 ? '9th' : 'other'; });
  const landingShare = Object.fromEntries(Object.entries(landing).map(([k, v]) => [k, share(v, phrases.length)]));
  const landingTonic = share(phrases.filter((p) => mod12(p[p.length - 1].midi - tonicPc) === 0).length, phrases.length);
  // repetition: 2-bar cell signature (rhythm slots + intervals)
  const bars = new Map();
  for (const n of onsets) { const b = Math.floor(n.tick / barTicks); if (!bars.has(b)) bars.set(b, []); bars.get(b).push(n); }
  const sungBars = [...bars.keys()].sort((a, b) => a - b);
  const cellSig = (b, len, withPitch) => { const ns = []; for (let k = 0; k < len; k++) ns.push(...(bars.get(b + k) ?? []).map((n) => ({ ...n, rel: n.tick - b * barTicks }))); if (ns.length < 2) return null; const rh = ns.map((n) => Math.round((n.rel / barTicks) * 16)).join(','); const iv = ns.slice(1).map((n, i) => n.midi - ns[i].midi).join(','); return withPitch ? `${rh}|${ns.map((n) => n.midi).join(',')}` : `${rh}|${iv}`; };
  const cellStats = (len) => { const seen = new Map(); let total = 0, rep = 0, repExact = 0; const seenExact = new Map(); for (let b = 0; b < totalBars; b += len) { const s = cellSig(b, len, false); if (!s) continue; total++; if (seen.has(s)) rep++; seen.set(s, (seen.get(s) ?? 0) + 1); const e = cellSig(b, len, true); if (seenExact.has(e)) repExact++; seenExact.set(e, 1); } return { cells: total, repeatShare: share(rep, total), exactShare: share(repExact, total), distinct: seen.size }; };
  const rep1 = cellStats(1), rep2 = cellStats(2);
  // rhythm-only repetition (the same rhythm, different pitches)
  const rhythmOnly = (() => { const seen = new Set(); let total = 0, rep = 0; for (let b = 0; b < totalBars; b += 2) { const ns = []; for (let k = 0; k < 2; k++) ns.push(...(bars.get(b + k) ?? []).map((n) => n.tick - b * barTicks)); if (ns.length < 2) continue; total++; const s = ns.map((t) => Math.round((t / barTicks) * 16)).join(','); if (seen.has(s)) rep++; seen.add(s); } return share(rep, total); })();
  // slots
  const slotHist = Array(16).fill(0); for (const n of onsets) slotHist[slotOf(n.tick)]++;
  const odd16 = share(slotHist.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0), onsets.length);
  const anticip = share(slotHist[14] + slotHist[15] + slotHist[6] + slotHist[7], onsets.length);
  const shortLastSlot = share(onsets.filter((n) => slotOf(n.tick) === 15 && n.dur <= beatTicks / 4).length, onsets.length);
  // durations
  const durBeats = onsets.map((n) => n.dur / beatTicks);
  const longNotes = share(durBeats.filter((d) => d >= 2).length, durBeats.length);
  const legato = share(onsets.filter((n, i) => i + 1 < onsets.length && n.tick + n.dur >= onsets[i + 1].tick - 2).length, onsets.length - 1);
  // velocity
  const vel = onsets.map((n) => n.velocity ?? 100);
  // pentatonic share (relative to key: major pent 0 2 4 7 9 / minor pent 0 3 5 7 10)
  const pent = new Set((mode === 'minor' ? [0, 3, 5, 7, 10] : [0, 2, 4, 7, 9]).map((s) => mod12(tonicPc + s)));
  const pentShare = share(onsets.filter((n) => pent.has(mod12(n.midi))).length, onsets.length);

  const sungBarSet = new Set(sungBars);
  // ---- sections: 4-bar windows over the whole song
  const W = 4;
  const nWin = Math.ceil(totalBars / W);
  const winOf = (arr, t) => { const m = new Map(); for (const n of arr) { const w = Math.floor(n.tick / (barTicks * W)); if (!m.has(w)) m.set(w, []); m.get(w).push(n); } return m; };
  const vW = winOf(onsets, 0), aW = winOf(acc, 0), bW = winOf(bass, 0), v2W = winOf(voice2, 0);
  const clusterSizes = (ns) => { const m = new Map(); for (const n of ns) { const k = Math.round(n.tick / 6); m.set(k, (m.get(k) ?? 0) + 1); } return { onsets: m.size, meanSize: mean([...m.values()]) }; };
  const windows = [];
  for (let w = 0; w < nWin; w++) {
    const v = vW.get(w) ?? [], a = aW.get(w) ?? [], b = bW.get(w) ?? [];
    const barsHere = Math.min(W, totalBars - w * W);
    const ac = clusterSizes(a), bc = clusterSizes(b);
    let ch = 0; for (let k = 0; k < barsHere; k++) { const bar = w * W + k; const s1 = chordAt(timeline, 2 * bar), s2 = chordAt(timeline, 2 * bar + 1); if (s1 && s2 && s1.rootPc !== s2.rootPc) ch++; }
    const dbl = v.length ? v.filter((n) => acc.some((a) => Math.abs(a.tick - n.tick) <= 3 && mod12(a.midi) === mod12(n.midi))).length / v.length : null;
    windows.push({
      w, bar: w * W, sung: v.length > 0, accDoubles: r3(dbl), vNotesPerBar: r3(v.length / barsHere), vMed: v.length ? median(v.map((n) => n.midi)) : null, vHi: v.length ? Math.max(...v.map((n) => n.midi)) : null, vLo: v.length ? Math.min(...v.map((n) => n.midi)) : null,
      vVel: v.length ? r3(mean(v.map((n) => n.velocity ?? 100))) : null,
      aOnsetsPerBar: r3(ac.onsets / barsHere), aMeanSize: r3(ac.meanSize), aMed: a.length ? median(a.map((n) => n.midi)) : null, aTop: a.length ? pct(a.map((n) => n.midi), 0.9) : null,
      bOnsetsPerBar: r3(bc.onsets / barsHere), bMed: b.length ? median(b.map((n) => n.midi)) : null,
      chordChangesPerBar: r3(1 + ch / barsHere), v2: (v2W.get(w) ?? []).length,
    });
  }
  const sungW = windows.filter((x) => x.sung && x.vNotesPerBar >= 2);
  // chorus vs verse: rank sung windows by a composite (voice register + voice density + acc density + acc thickness)
  const z = (arr, k) => { const vals = arr.map((x) => x[k] ?? 0); const m = mean(vals), sd = Math.sqrt(mean(vals.map((v) => (v - m) ** 2))) || 1; return arr.map((x) => ((x[k] ?? 0) - m) / sd); };
  let verse = [], chorus = [];
  if (sungW.length >= 4) {
    const zm = z(sungW, 'vMed'), zh = z(sungW, 'vHi'), za = z(sungW, 'aOnsetsPerBar'), zs = z(sungW, 'aMeanSize'), zb = z(sungW, 'bOnsetsPerBar');
    const score = sungW.map((x, i) => 1.0 * zm[i] + 1.0 * zh[i] + 0.6 * za[i] + 0.6 * zs[i] + 0.4 * zb[i]);
    const order = sungW.map((x, i) => i).sort((i, j) => score[i] - score[j]);
    const k = Math.max(1, Math.floor(sungW.length / 3));
    verse = order.slice(0, k).map((i) => sungW[i]); chorus = order.slice(-k).map((i) => sungW[i]);
  }
  const avg = (arr, k) => (arr.length ? r3(mean(arr.map((x) => x[k]).filter((v) => v != null))) : null);
  const contrast = verse.length ? {
    verseWindows: verse.map((x) => x.bar), chorusWindows: chorus.map((x) => x.bar),
    vMed: [avg(verse, 'vMed'), avg(chorus, 'vMed')], vHi: [avg(verse, 'vHi'), avg(chorus, 'vHi')], vLo: [avg(verse, 'vLo'), avg(chorus, 'vLo')],
    vNotesPerBar: [avg(verse, 'vNotesPerBar'), avg(chorus, 'vNotesPerBar')], vVel: [avg(verse, 'vVel'), avg(chorus, 'vVel')],
    aOnsetsPerBar: [avg(verse, 'aOnsetsPerBar'), avg(chorus, 'aOnsetsPerBar')], aMeanSize: [avg(verse, 'aMeanSize'), avg(chorus, 'aMeanSize')], aTop: [avg(verse, 'aTop'), avg(chorus, 'aTop')],
    bOnsetsPerBar: [avg(verse, 'bOnsetsPerBar'), avg(chorus, 'bOnsetsPerBar')], bMed: [avg(verse, 'bMed'), avg(chorus, 'bMed')],
    chordChangesPerBar: [avg(verse, 'chordChangesPerBar'), avg(chorus, 'chordChangesPerBar')],
    v2InChorus: chorus.some((x) => x.v2 > 0), v2InVerse: verse.some((x) => x.v2 > 0),
  } : null;
  // instrumental spans (no voice) — intro / interludes / outro, in bars
  const firstSung = sungBars[0] ?? 0, lastSung = sungBars[sungBars.length - 1] ?? totalBars - 1;
  const gaps = []; let g = 0;
  for (let b = firstSung; b <= lastSung; b++) { if (sungBarSet.has(b)) { if (g >= 2) gaps.push(g); g = 0; } else g++; }
  const introBars = firstSung, outroBars = totalBars - 1 - lastSung;
  // chorus range vs verse range as "lift"; the singer's ceiling per section
  // ---- support of the voice
  const tol = 3;
  const accAt = (t) => acc.filter((n) => Math.abs(n.tick - t) <= tol);
  const accSounding = (t) => acc.filter((n) => n.tick <= t + tol && n.tick + n.dur > t + tol);
  let dblSame = 0, dblOct = 0, dblUp = 0, dblDown = 0, dblIsTop = 0, dblWithChord = 0, homo = 0, accTopAbove = 0, accTopIvs = [], accUnderIvs = [];
  let sndAgree = 0, sndN = 0, sndAgreeStrong = 0, sndNStrong = 0;
  for (const n of onsets) {
    const at = accAt(n.tick);
    if (at.length) homo++;
    if (at.some((a) => a.midi === n.midi)) dblSame++;
    else if (at.some((a) => mod12(a.midi) === mod12(n.midi))) {
      dblOct++;
      const d = at.filter((a) => mod12(a.midi) === mod12(n.midi));
      if (d.some((a) => a.midi > n.midi)) dblUp++; else dblDown++;
      const top = Math.max(...at.map((a) => a.midi));
      if (d.some((a) => a.midi === top)) dblIsTop++;
      if (at.length >= 2) dblWithChord++;
    }
    const snd = accSounding(n.tick);
    // like-for-like with the engine probe: does the accompaniment, apart from
    // any note doubling the voice's own pitch class, SOUND the voice's pc while
    // the voice strikes? (pcs of NOTE+BASS sounding at the onset)
    // HELD agreement: the pcs of acc+bass notes that started BEFORE this onset
    // and are still sounding (the chord the voice lands on), population =
    // onsets with >= 2 such pcs. The engine probe computes the same thing
    // from the mix haps, so this is the like-for-like number.
    // (r35 verify: a HELD-only set was too strict for an accompaniment that
    // strikes with the voice 77% of the time — population fell to 41 onsets a
    // song; the set is everything sounding at the onset, minus the notes that
    // DOUBLE the voice's own pc at that onset)
    const heldPcs = new Set(snd.concat(bass.filter((b) => b.tick <= n.tick + tol && b.tick + b.dur > n.tick + tol)).filter((a) => !(Math.abs(a.tick - n.tick) <= tol && mod12(a.midi) === mod12(n.midi))).map((a) => mod12(a.midi)));
    if (heldPcs.size >= 2) { sndN++; if (heldPcs.has(mod12(n.midi))) sndAgree++; const st = strength(n.tick); if (st === 'beat1' || st === 'beat3') { sndNStrong++; if (heldPcs.has(mod12(n.midi))) sndAgreeStrong++; } }
    if (snd.length) { const top = Math.max(...snd.map((a) => a.midi)); accTopIvs.push(top - n.midi); if (top > n.midi) accTopAbove++; const under = snd.map((a) => a.midi).filter((m) => m < n.midi); if (under.length) accUnderIvs.push(n.midi - Math.max(...under)); }
  }
  const accUnderClass = hist(accUnderIvs, (d) => (d <= 2 ? '2nd' : d <= 4 ? '3rd' : d <= 5 ? '4th' : d <= 7 ? '5th' : d <= 9 ? '6th' : d <= 11 ? '7th' : d === 12 ? '8ve' : '>8ve'));
  const accUnderShare = Object.fromEntries(Object.entries(accUnderClass).map(([k, v]) => [k, share(v, accUnderIvs.length)]));
  // acc in sung vs silent bars
  const accBarCount = new Map(); for (const n of acc) { const b = Math.floor(n.tick / barTicks); accBarCount.set(b, (accBarCount.get(b) ?? 0) + 1); }
  const accSung = [], accSilent = [];
  for (let b = firstSung; b <= lastSung; b++) (sungBarSet.has(b) ? accSung : accSilent).push(accBarCount.get(b) ?? 0);
  // acc onsets on the 8th grid; mean cluster size overall
  const accCl = clusterSizes(acc);
  const accOnGrid8 = share(acc.filter((n) => Math.round(((n.tick % barTicks) / barTicks) * 16) % 2 === 0).length, acc.length);
  // voice2 relation
  let v2 = null;
  if (voice2.length) {
    const vAt = new Map(); for (const n of onsets) vAt.set(Math.round(n.tick / 6), n);
    const ivs2 = []; let co = 0;
    for (const n of voice2) { const m = vAt.get(Math.round(n.tick / 6)); if (m) { co++; ivs2.push(n.midi - m.midi); } }
    const cls = hist(ivs2, (d) => { const a = Math.abs(d); const dir = d < 0 ? 'below' : d > 0 ? 'above' : ''; const k = a === 0 ? 'unison' : a <= 2 ? '2nd' : a <= 4 ? '3rd' : a === 5 ? '4th' : a <= 7 ? '5th' : a <= 9 ? '6th' : a <= 11 ? '7th' : a === 12 ? '8ve' : '>8ve'; return k === 'unison' ? k : `${k} ${dir}`; });
    const v2bars = new Set(voice2.map((n) => Math.floor(n.tick / barTicks)));
    // does the second voice SOUND WITH the first (stacked harmony) or in its
    // rests (a trade / answer)? overlap = a voice-1 note sounding at the
    // voice-2 onset; sameBar = voice 1 sings somewhere in that bar
    let overlap = 0, sameBar = 0;
    for (const n of voice2) { if (onsets.some((m) => m.tick <= n.tick + tol && m.tick + m.dur > n.tick + tol)) overlap++; if (sungBarSet.has(Math.floor(n.tick / barTicks))) sameBar++; }
    v2 = { overlapShare: share(overlap, voice2.length), sameBarShare: share(sameBar, voice2.length), notes: voice2.length, coincidentShare: share(co, voice2.length), intervals: Object.fromEntries(Object.entries(cls).map(([k, n]) => [k, share(n, ivs2.length)])), bars: v2bars.size, barShare: share(v2bars.size, sungBars.length), firstBar: Math.min(...v2bars), inChorus: contrast?.v2InChorus ?? null, inVerse: contrast?.v2InVerse ?? null, med: median(voice2.map((n) => n.midi)) };
  }
  // bass behaviour
  let bassRoot = 0, bassN = 0; const bassOnsetsPerBar = share(bass.length, totalBars);
  for (const n of bass) { const seg = chordAtTick(n.tick); if (seg && seg.coverage) { bassN++; if (mod12(n.midi) === seg.rootPc) bassRoot++; } }
  const bassDyads = (() => { const m = new Map(); for (const n of bass) { const k = Math.round(n.tick / 6); if (!m.has(k)) m.set(k, []); m.get(k).push(n.midi); } const pairs = [...m.values()].filter((x) => x.length >= 2); return { clusterShare: share(pairs.length, m.size), octaveShare: share(pairs.filter((x) => Math.max(...x) - Math.min(...x) === 12).length, pairs.length) }; })();

  return {
    file, label, method: roles.method, gridShift16ths: gridShift, voiceShift16ths: voiceShift,
    tracks: { voice: roles.voice.name, voice2: roles.voice2?.name ?? null, acc: roles.acc.map((x) => x.name), bass: roles.bass?.name ?? null },
    bpm: Math.round(bpm), meter: `${num}/${den}`, totalBars, key: `${PC_NAMES[tonicPc]} ${mode}`, keyR: r3(key.r ?? key.corr ?? 0),
    harmony: { segments: segs.length, chordsPerBar, qualityHist, colorShare: share(colorSegs, segs.length), diatonicShare: share(diatonicSegs, segs.length), borrowed, loops: loopsOut },
    voice: {
      notes: voice.length, onsets: onsets.length, monophony: mono,
      lo: Math.min(...vMidi), hi: Math.max(...vMidi), median: median(vMidi), p10: pct(vMidi, 0.1), p90: pct(vMidi, 0.9), rangeSemis: Math.max(...vMidi) - Math.min(...vMidi),
      sungBars: sungBars.length, sungShare: share(sungBars.length, totalBars), notesPerSungBar: share(onsets.length, sungBars.length),
      syllablesPerSec: r3(onsets.length / (sungBars.length * 4 * secPerBeat)), ioiShare, ioiMedianBeats: r3(median(iois)), max16thRun: maxRun,
      intervals: ivShare, absIntervalHist: absHist, leapRecoverShare: share(leapRecover, leaps), meanAbsInterval: r3(mean(ivsIn.map(Math.abs))),
      gapHist, lines: lines.length, lineBeatsMedian: r3(median(lines.map((p) => (p[p.length - 1].tick + p[p.length - 1].dur - p[0].tick) / beatTicks))),
      phrases: phrases.length, phraseBeatsMedian: r3(median(phraseBeats)), phraseBeatsP90: r3(pct(phraseBeats, 0.9)), phraseNotesMedian: median(phraseNotes), breathBeatsMedian: r3(median(breaths)), breathBeatsP10: r3(pct(breaths, 0.1)),
      phraseStart: startShare, phraseFinalDurBeats: r3(median(finalDurBeats)), contour: Object.fromEntries(Object.entries(contour).map(([k, v]) => [k, share(v, phrases.filter((p) => p.length >= 4).length)])),
      chordToneByStrength: agreeShare, chordToneDurShare: share(ctDur, totDur), nctShare: share(nctTotal, onsets.length), nctResolved: share(nctRes, nctTotal), nctApproached: share(nctApp, nctTotal), nctDegrees: nctDeg,
      outOfKey: share(outKey, onsets.length), outOfKeyHarmMinor: share(outKeyHarm, onsets.length), pentatonicShare: pentShare,
      landing: landingShare, landingOnTonic: landingTonic,
      rep1, rep2, rhythmRepeat2: rhythmOnly, odd16, anticipation: anticip, shortLastSlot, longNotes, legato, durMedianBeats: r3(median(durBeats)), durP90: r3(pct(durBeats, 0.9)),
      velMean: r3(mean(vel)), velDistinct: new Set(vel).size, velP10: pct(vel, 0.1), velP90: pct(vel, 0.9),
    },
    form: { introBars, outroBars, interludes: gaps, windows: windows.length, contrast, windowTable: windows },
    support: {
      homorhythmShare: share(homo, onsets.length), accDoublesVoice: share(dblSame, onsets.length), accDoublesVoiceOctave: share(dblOct, onsets.length),
      doublingAbove: share(dblUp, dblOct), doublingIsAccTop: share(dblIsTop, dblOct), doublingInsideChord: share(dblWithChord, dblOct),
      soundingAgreeHeld: share(sndAgree, sndN), soundingAgreeStrong: share(sndAgreeStrong, sndNStrong), soundingN: sndN,
      accTopAboveVoice: share(accTopAbove, accTopIvs.length), accTopIvMedian: median(accTopIvs), accUnderInterval: accUnderShare, accUnderMedian: median(accUnderIvs),
      accOnsetsPerBar: share(acc.length, totalBars), accClusterMean: r3(accCl.meanSize), accOnGrid8, accSungBarMean: r3(mean(accSung)), accSilentBarMean: r3(mean(accSilent)),
      voice2: v2,
      bass: { onsetsPerBar: bassOnsetsPerBar, rootLock: share(bassRoot, bassN), median: bass.length ? median(bass.map((n) => n.midi)) : null, ...bassDyads },
    },
  };
}

// --------------------------------------------------------------- main
const files = readdirSync(DIR).filter((f) => /\.mid$/i.test(f) && !EXCLUDE.test(f)).sort();
const out = [];
for (const f of files) {
  try { out.push(analyze(f)); }
  catch (e) { out.push({ file: f, label: labelFor(f), skipped: e.message }); console.error(`FAIL ${f}: ${e.stack?.split('\n').slice(0, 2).join(' | ')}`); }
}
writeFileSync(join(DIR, '_analysis.json'), JSON.stringify(out, null, 1));
const ok = out.filter((s) => !s.skipped);
console.log(`analyzed ${ok.length} / ${out.length} files -> ${join(DIR, '_analysis.json')}`);
for (const s of out) if (s.skipped) console.log(`  skipped ${s.file}: ${s.skipped}`);
for (const s of ok) console.log(`  ${s.label.song.padEnd(32)} ${String(s.bpm).padStart(3)}bpm ${s.key.padEnd(9)} voice ${s.tracks.voice}${s.tracks.voice2 ? '+' + s.tracks.voice2 : ''} [${s.method}] ${s.voice.lo}-${s.voice.hi} med ${s.voice.median} ${s.voice.syllablesPerSec} syl/s`);
