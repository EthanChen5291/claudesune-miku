// Vocal tier (r34): the score exporter lifts a song's TUNE as a singable line.
// Pins the invariants a singer needs — monophony, no overlaps, whole-octave
// register placement, and "sing only where the mix plays the tune" — and that
// the export is deterministic. Stages 1-2 (DiffSinger + RVC) need the local
// vendor/vocal env and are exercised by scripts/render-vocal.mjs, not here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const SONG = 'vs_calm_water';
const dir = mkdtempSync(join(tmpdir(), 'vocal-'));
const exportScore = (out, extra = []) => {
  execFileSync('node', ['scripts/export-vocal.mjs', SONG, '--out', out, '--quiet', ...extra], { stdio: 'pipe' });
  return JSON.parse(readFileSync(out, 'utf8'));
};

test('vocal score: monophonic, non-overlapping, bar-quantised silence, in range', () => {
  const sc = exportScore(join(dir, 'a.json'));
  assert.ok(sc.notes.length > 50, `too few notes: ${sc.notes.length}`);
  for (let i = 0; i < sc.notes.length; i++) {
    const n = sc.notes[i];
    assert.ok(n.dur > 0, `note ${i} has no duration`);
    if (i) assert.ok(sc.notes[i - 1].start + sc.notes[i - 1].dur <= n.start + 1e-6, `notes ${i - 1}/${i} overlap`);
  }
  // register: the median of the sung line sits in the target band, placed by whole octaves
  assert.equal(Math.abs(sc.shift) % 12, 0);
  const mids = sc.notes.map((n) => n.midi).sort((a, b) => a - b);
  const median = mids[mids.length >> 1];
  assert.ok(median >= sc.range[0] && median <= sc.range[1], `median ${median} outside ${sc.range}`);
  // the intro carries no tune in the mix: the first sung note is not in bar 0
  assert.ok(sc.notes[0].bar > 0, 'intro bars should be silent');
  assert.ok(sc.stats.barsSounding <= sc.stats.barsWithTune);
  assert.ok(sc.room >= 0 && sc.leadGain > 0);
});

test('vocal score: deterministic', () => {
  const a = exportScore(join(dir, 'b.json'));
  const b = exportScore(join(dir, 'c.json'));
  assert.equal(JSON.stringify(a.notes), JSON.stringify(b.notes));
});

// r34 — the Japanese mora lyrics (src/lib/lyrics-ja.js)
const TIGER_PHONEMES = new Set('AP SP a aa ae ah ao aw ax ay b ch d dh dx dz ee eh er ey f fp g hh iy jh k kx l m n ng nn oo ow oy p px q rj s sh t th ts tx ux uw v w y z zh'.split(' '));
test('lyrics-ja: every mora spells into the voicebank phoneme set, one mora per note, hooks repeat', async () => {
  const { assignLyrics, moraPhonemes } = await import('../src/lib/lyrics-ja.js');
  for (const m of ['a', 'ka', 'shi', 'tsu', 'fu', 'kya', 'n', 'ryo', 'ji', 'wa'])
    for (const p of moraPhonemes(m)) assert.ok(TIGER_PHONEMES.has(p), `${m} -> ${p} not a Tiger phoneme`);
  assert.throws(() => moraPhonemes('xq'));
  const sc = exportScore(join(dir, 'l.json'), ['--lyrics', 'none']);
  const lines = assignLyrics(sc, { seed: 'test' });
  assert.ok(lines.length >= 4);
  for (const n of sc.notes) {
    assert.ok(Array.isArray(n.ph) && n.ph.length >= 1, 'every note carries phonemes');
    for (const p of n.ph) assert.ok(TIGER_PHONEMES.has(p), `${p} not a Tiger phoneme`);
    if (!n.melisma) assert.ok(n.syl !== '-');
  }
  // a phrase's mora count equals its non-melisma notes
  for (const l of lines) {
    const ph = sc.notes.filter((n) => n.start >= l.start).slice(0, l.notes);
    assert.equal(l.text.split(' ').length, ph.filter((n) => !n.melisma).length);
  }
  // the returning letter sings the same words: calm_water is ABAC, so the A line appears twice
  const texts = lines.map((l) => l.text);
  assert.ok(new Set(texts).size < texts.length, 'identical melodic phrases should share a line');
  // deterministic
  const sc2 = exportScore(join(dir, 'm.json'), ['--lyrics', 'none']);
  const lines2 = assignLyrics(sc2, { seed: 'test' });
  assert.deepEqual(lines2.map((l) => l.text), texts);
  // and the seed changes the words
  const sc3 = exportScore(join(dir, 'n.json'), ['--lyrics', 'none']);
  assert.notDeepEqual(assignLyrics(sc3, { seed: 'other' }).map((l) => l.text), texts);
});

test('vocal score: --octave pins the register', () => {
  const auto = exportScore(join(dir, 'd.json'));
  const pinned = exportScore(join(dir, 'e.json'), ['--octave', '0']);
  assert.equal(pinned.shift, 0);
  assert.equal(pinned.notes.length, auto.notes.length);
  // the global shift is pinned; per-phrase octave placement (r34) may still
  // move a phrase by whole octaves, so every note differs by a multiple of 12
  for (let i = 0; i < auto.notes.length; i++) assert.equal(Math.abs(pinned.notes[i].midi - auto.notes[i].midi) % 12, 0);
  assert.equal(auto.phraseBars, 2);
  assert.ok(auto.phraseCount >= 8, 'two-bar phrasing should split a 30-bar tune into many phrases');
});

// r35 (D138): the singer's ceiling is G#5 and it is duration-aware — both of
// his "sounds like screaming" notes were A5 (81) held 0.70-0.74 s; the A#5/B5
// passes under 0.45 s and the G#5 held 1.2 s he did not flag stay where they are.
test('vocal score r35: no note over G#5 is held half a second or longer', () => {
  const out = join(dir, 'boss.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vx_triumphant_boss', '--page', 'audition/vocal.html', '--out', out, '--quiet'], { stdio: 'pipe' });
  const sc = JSON.parse(readFileSync(out, 'utf8'));
  const held = sc.notes.filter((n) => n.midi > 80 && n.dur >= 0.5);
  assert.equal(held.length, 0, `held notes over G#5: ${held.map((n) => `${n.midi}@${n.dur}`).join(' ')}`);
  // the fold is by a whole octave, so the folded note is still the same pitch class as the tune
  const eighth = sc.notes[7];
  assert.equal(eighth.midi, 69, `the judged score's 8th note was A5 (81) held 0.74 s; expected it folded to 69, got ${eighth.midi}`);
  assert.ok(sc.notes.some((n) => n.midi > 80), 'short passes above G#5 are still allowed');
});
