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

// r36 — REAL lyrics (src/lib/lyrics-ja-writer.js): grammatical lines bound to
// the melody. His "currently, our vocaloid produces random japanese
// syllables. it should actually produce real japanese lyrics, of course with
// parts bound to the melody".
test('lyrics writer r36: sentences from grammar, bound to segments, refrain by section, deterministic', async () => {
  const w = await import('../src/lib/lyrics-ja-writer.js');
  // tokeniser + conjugation are the grammar's floor
  assert.deepEqual(w.moras('arigato-'), ['a', 'ri', 'ga', 'to', 'ー']);
  assert.deepEqual(w.moras('matte'), ['ma', 'qte']);
  assert.deepEqual(w.moras("kon'ya"), ['ko', 'n', 'ya']);
  assert.equal(w.conjugate({ r: 'utau', cls: 'g' }, 'nai'), 'utawanai');
  assert.equal(w.conjugate({ r: 'iku', cls: 'g' }, 'te'), 'itte');
  assert.equal(w.conjugate({ r: 'miageru', cls: 'i' }, 'tai'), 'miagetai');
  assert.equal(w.conjugate({ r: 'au', cls: 'au' }, 'tai'), 'aitai');
  // every writer mora spells into the Tiger set (incl. っ as q, を as oo, ー as the held vowel)
  for (const m of ['qte', 'wo', 'ー', 'wa_', 'e_', 'kya', 'n', 'fa'])
    for (const p of w.moraPh(m, 'oo')) assert.ok(TIGER_PHONEMES.has(p), `${m} -> ${p}`);
  assert.equal(w.moraKana('wa_'), 'は');
  // a vocal-page song with sections: the exported score carries real lines
  const out = join(dir, 'w.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vo_villain', '--page', 'audition/vocaloid.html', '--out', out, '--quiet'], { stdio: 'pipe' });
  const sc = JSON.parse(readFileSync(out, 'utf8'));
  assert.equal(sc.lyricMode, 'ja');
  assert.ok(Array.isArray(sc.sections) && sc.sections.length, 'the vocaloid page exposes sections');
  assert.ok(sc.lyrics.length >= 8);
  const st = sc.lyricStats;
  assert.ok(st.fallbacks <= Math.ceil(st.phrases * 0.1), `too many vocalise fallbacks: ${st.fallbacks}/${st.phrases}`);
  for (const l of sc.lyrics) {
    // one mora per taker note; kana per mora; a romaji line of real words
    const ph = sc.notes.filter((n) => n.start >= l.start).slice(0, l.notes);
    assert.equal(l.text.split(' ').length, ph.filter((n) => !n.melisma).length);
    if (l.template !== 'vocalise') { assert.ok(/[a-z]/.test(l.romaji) && l.gloss.length > 0, `line without words: ${JSON.stringify(l)}`); assert.ok(l.kana.length >= 2); }
    // BOUND: no word straddles a rest — two notes of one word (same owner
    // chunk `w`) are never separated by a gap of 0.4 beat or more
    const beat = sc.secondsPerBar / sc.beats;
    for (let i = 1; i < ph.length; i++) {
      if (ph[i].w == null || ph[i].w < 0 || ph[i].w !== ph[i - 1].w) continue;
      const gap = ph[i].start - (ph[i - 1].start + ph[i - 1].dur);
      assert.ok(gap < 0.4 * beat, `word ${ph[i].w} crosses a rest of ${gap.toFixed(3)} s in ${l.romaji}`);
    }
  }
  // THE REFRAIN: a chorus ordinal returns with its words on every statement
  const chorus = sc.lyrics.filter((l) => l.role === 'chorus');
  const byKey = new Map();
  for (const l of chorus) { if (!byKey.has(l.key)) byKey.set(l.key, []); byKey.get(l.key).push(l); }
  const returning = [...byKey.values()].filter((ls) => ls.length > 1);
  assert.ok(returning.length >= 1, 'the chorus returns at least once');
  assert.ok(returning.some((ls) => ls.slice(1).some((l) => l.refrain)), 'a returning chorus line is re-bound with the same words');
  for (const ls of returning) for (const l of ls.slice(1)) if (l.refrain) assert.equal(l.romaji.replace(/ (yo|ne|sa|na)$/, ''), ls[0].romaji.replace(/ (yo|ne|sa|na)$/, ''));
  // verse statements differ (verse 2 has new words over verse 1's tune)
  const verses = sc.lyrics.filter((l) => l.role === 'verse');
  assert.ok(new Set(verses.map((l) => l.romaji)).size > 1);
  // deterministic
  const out2 = join(dir, 'w2.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vo_villain', '--page', 'audition/vocaloid.html', '--out', out2, '--quiet'], { stdio: 'pipe' });
  assert.deepEqual(JSON.parse(readFileSync(out2, 'utf8')).lyrics, sc.lyrics);
  // the r34 pool lines are still reachable for a judged line
  const out3 = join(dir, 'w3.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vo_villain', '--page', 'audition/vocaloid.html', '--out', out3, '--quiet', '--lyrics', 'pool'], { stdio: 'pipe' });
  const pool = JSON.parse(readFileSync(out3, 'utf8'));
  assert.equal(pool.lyricMode, 'pool');
  assert.notDeepEqual(pool.lyrics.map((l) => l.text), sc.lyrics.map((l) => l.text));
});

test('lyrics writer r36: the lexicon stores words, never lines (D137 on the text side)', async () => {
  const src = readFileSync('src/lib/lyrics-ja-writer.js', 'utf8');
  // every lexicon romaji is short: a word or an ordinary set phrase, never a lyric line
  const entries = [...src.matchAll(/\b(?:N|V|A|ADV)\('([^']+)'/g)].map((m) => m[1]);
  assert.ok(entries.length > 150);
  for (const e of entries) assert.ok(e.replace(/[-' ]/g, '').length <= 12 && e.split(' ').length <= 2, `lexicon entry too long to be a word: ${e}`);
  const sets = [...src.matchAll(/\{ r: '([^']+)', g:/g)].map((m) => m[1]);
  for (const e of sets) assert.ok(e.split(' ').length <= 2, `set phrase too long: ${e}`);
});

test('lyrics writer r36: the sections field is absent from every songs.html song', () => {
  const html = readFileSync('audition/songs.html', 'utf8');
  const di = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(di + 13, html.indexOf(';\n', di)));
  assert.ok(data.songs.every((s) => !('sections' in s)));
});

// r36 — his "it doesnt have to always be lyrics though. like sometimes it
// could be la la la or meow meow meow etc - depends on the genre and user
// wants": a vocalise is a MODE with a set, pinned or planned from the prompt.
test('lyrics writer r36: vocalise sets — pinned all / none / the planned mixed tag', async () => {
  const w = await import('../src/lib/lyrics-ja-writer.js');
  const sets = Object.keys(w.VOCALISE_SETS);
  for (const set of sets) {
    const S = w.VOCALISE_SETS[set];
    for (const m of [...(S.cell ?? []), ...(S.alt ?? []).flat()]) if (m !== 'ー') for (const p of w.moraPh(m, 'a')) assert.ok(TIGER_PHONEMES.has(p), `${set}:${m} -> ${p}`);
  }
  // the plan reads the description
  assert.equal(w.vocalisePlan({ emotion: 'goofy', description: 'a cat idol song, meow instead of words' }).mode, 'all');
  assert.equal(w.vocalisePlan({ emotion: 'goofy', description: 'a cat idol song, meow instead of words' }).set, 'meow');
  assert.equal(w.vocalisePlan({ emotion: 'sad', description: 'real lyrics, no la la' }).mode, 'off');
  assert.equal(w.vocalisePlan({ emotion: 'happy', description: 'summer' }).mode, 'mixed');
  assert.equal(w.vocalisePlan({}, 'nyan:mixed').set, 'nyan');
  // pinned ALL: every sung note is the set's cell or a held vowel
  const meow = join(dir, 'v1.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vo_kitchen', '--page', 'audition/vocaloid.html', '--out', meow, '--quiet', '--vocalise', 'meow'], { stdio: 'pipe' });
  const sc = JSON.parse(readFileSync(meow, 'utf8'));
  assert.equal(sc.vocalise.mode, 'all');
  for (const n of sc.notes) assert.ok(n.syl === 'meow' || n.syl === 'ー', `not a meow: ${n.syl}`);
  assert.ok(sc.lyrics.every((l) => l.vocalise === 'meow' && /ミャウ/.test(l.kana)));
  // pinned NONE: no wordless line at all
  const none = join(dir, 'v2.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vo_kitchen', '--page', 'audition/vocaloid.html', '--out', none, '--quiet', '--vocalise', 'none'], { stdio: 'pipe' });
  const sn = JSON.parse(readFileSync(none, 'utf8'));
  assert.equal(sn.vocalise.mode, 'off');
  assert.ok(sn.lyrics.every((l) => !String(l.template).startsWith('vocalise')));
  // THE ROW PIN, end to end: `lyrics: 'babble'` on the VO_PROMPTS row ->
  // `lyricStyle` in the page DATA -> mode ALL in the export. (This leg used to
  // test AUTO on vo_kitchen; pinning that row made the assertion unholdable —
  // a bare set name pins mode 'all'. The auto leg moved to an unpinned song
  // below, and the description->set mapping is asserted on `vocalisePlan`
  // above, where no page row can reach it.)
  const pageSong = (() => {
    const html = readFileSync('audition/vocaloid.html', 'utf8');
    const di = html.indexOf('const DATA = ');
    return JSON.parse(html.slice(di + 13, html.indexOf(';\n', di))).songs.find((x) => x.name === 'vo_kitchen');
  })();
  assert.equal(pageSong.lyricStyle, 'babble', 'the row pin reaches the page DATA');
  const auto = join(dir, 'v3.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vo_kitchen', '--page', 'audition/vocaloid.html', '--out', auto, '--quiet'], { stdio: 'pipe' });
  const sa = JSON.parse(readFileSync(auto, 'utf8'));
  assert.equal(sa.vocalise.mode, 'all');
  assert.equal(sa.vocalise.set, 'babble');
  assert.match(sa.vocalise.why, /pinned/);
  // AUTO on a song with no pin: the plan comes from the description/emotion
  const un = join(dir, 'v3b.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vo_goodbye', '--page', 'audition/vocaloid.html', '--out', un, '--quiet'], { stdio: 'pipe' });
  const su = JSON.parse(readFileSync(un, 'utf8'));
  assert.equal(su.vocalise.mode, 'mixed', 'an unpinned song plans its own vocalise');
  assert.ok(Object.keys(w.VOCALISE_SETS).includes(su.vocalise.set));
  assert.doesNotMatch(su.vocalise.why, /pinned/);
  // MIXED on a song whose hook fires: the tag sits on a chorus/bridge FINAL
  // line, returns with the refrain, and never takes more than a third of the
  // song (tagging every bridge line put 8 of 16 lines wordless — measured)
  const hook = join(dir, 'v4.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vg_excited_fight', '--page', 'audition/vocal.html', '--out', hook, '--quiet'], { stdio: 'pipe' });
  const sh = JSON.parse(readFileSync(hook, 'utf8'));
  assert.equal(sh.vocalise.mode, 'mixed');
  const tags = sh.lyrics.filter((l) => String(l.template).startsWith('vocalise'));
  assert.ok(tags.length >= 1, 'this song carries a wordless hook');
  assert.ok(tags.length <= Math.ceil(sh.lyrics.length / 3), `a hook took ${tags.length} of ${sh.lyrics.length} lines`);
  for (const t of tags) {
    assert.ok(t.role === 'chorus' || t.role === 'bridge', `tag on a ${t.role} line`);
    assert.equal(t.vocalise, sh.vocalise.set);
    for (const n of sh.notes.filter((n) => n.start >= t.start).slice(0, t.notes)) assert.ok(n.syl && n.syl !== '-');
  }
  assert.ok(sh.lyrics.some((l) => !String(l.template).startsWith('vocalise') && l.romaji), 'mixed keeps words');
  // and the plan is deterministic
  const hook2 = join(dir, 'v5.json');
  execFileSync('node', ['scripts/export-vocal.mjs', 'vg_excited_fight', '--page', 'audition/vocal.html', '--out', hook2, '--quiet'], { stdio: 'pipe' });
  assert.deepEqual(JSON.parse(readFileSync(hook2, 'utf8')).lyrics, sh.lyrics);
});
