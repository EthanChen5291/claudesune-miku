// D49: the progression generator. These tests do two jobs — they check the
// mechanical contract (deterministic, renders, respects the declared filters)
// and they check the CALIBRATION, i.e. that generated harmony resembles the
// corpus on the statistics the design claims to reproduce. A generator that
// runs but drifts off the corpus is the failure mode worth catching.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateProgression, canonicalCycle, corpusFingerprints, thirdClass, explainProgression } from '../src/lib/harmony-gen.js';
import { HARMONY_MODEL } from '../src/lib/harmony-model.js';
import { renderProgression } from '../src/binder/harmony.js';
import { ALL_PROGRESSIONS, parseDegrees, playableWith } from '../src/lib/progressions.js';
import { VOICINGS } from '../src/lib/voicings.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/** roots of a degrees string */
const rootsOf = (degrees) => parseDegrees(degrees).map((t) => t.semis);
/** many draws, for the statistical checks */
const sample = (n, opts) => Array.from({ length: n }, (_, i) => generateProgression({ ...opts, seed: `t${i}` }));

test('D49: the counted model is not stale', () => {
  execFileSync('node', ['scripts/build-harmony-model.mjs', '--check'], { cwd: ROOT });
});

test('D49: generated entries are ordinary library entries and render into a key', () => {
  for (const [family, key] of [['major', 'C:major'], ['minor', 'A:minor'], ['modal', 'D:dorian']]) {
    for (let i = 0; i < 40; i++) {
      const e = generateProgression({ family, length: 4, seed: `r${i}` });
      const symbols = renderProgression(e, key);
      assert.equal(symbols.length, 4, `${e.degrees} should render 4 symbols`);
      for (const s of symbols) assert.match(s, /^[A-G][#b]?/, `"${s}" is not a chord symbol`);
      // A6.1 applies to machine output too: nothing generated is ratified.
      assert.equal(e.ratified, false);
      assert.equal(e.needsEar, true);
      assert.equal(e.character, null);
      assert.equal(e.provenance, 'generated');
    }
  }
});

test('D49: generation is deterministic — same request, same progression', () => {
  const req = { family: 'minor', length: 8, style: 'undertale', colour: 0.6, seed: 'fixed' };
  const a = generateProgression(req);
  const b = generateProgression(req);
  assert.equal(a.degrees, b.degrees);
  assert.equal(a.numerals, b.numerals);
  // and a different seed really does move
  const c = generateProgression({ ...req, seed: 'other' });
  assert.notEqual(a.degrees, c.degrees);
});

test('D49: every request field changes the output (no ignored knobs)', () => {
  const base = { family: 'major', length: 4, seed: 'k' };
  const differs = (over) => {
    const set = new Set();
    for (let i = 0; i < 30; i++) set.add(generateProgression({ ...base, ...over, seed: `k${i}` }).degrees);
    return set;
  };
  const plain = differs({});
  for (const over of [{ family: 'minor' }, { length: 6 }, { style: 'undertale' }, { colour: 0.95 }, { home: 2 }]) {
    const moved = differs(over);
    const overlap = [...moved].filter((d) => plain.has(d)).length;
    assert.ok(overlap < moved.size, `${JSON.stringify(over)} produced the same 30 progressions as the default`);
  }
});

test('D49: the home degree is the tonic and its third IS the family', () => {
  for (const [family, want] of [['major', 'maj'], ['minor', 'min']]) {
    for (const e of sample(60, { family, length: 4 })) {
      const first = parseDegrees(e.degrees)[0];
      assert.equal(first.semis, 0, `${e.degrees} does not start on home`);
      assert.equal(thirdClass(first.quality), want, `${e.degrees} is labelled ${family} but its tonic is not`);
    }
  }
  // home is movable, and moving it moves the tonic
  for (const e of sample(10, { family: 'minor', length: 4, home: 5 })) {
    assert.equal(parseDegrees(e.degrees)[0].semis, 5);
  }
});

test('D49: a degree keeps its third inside a cycle unless mixture is asked for', () => {
  for (const family of ['major', 'minor', 'modal']) {
    for (const e of sample(80, { family, length: 8 })) {
      const seen = new Map();
      for (const t of parseDegrees(e.degrees)) {
        const c = thirdClass(t.quality);
        if (c === 'none') continue;
        if (seen.has(t.semis)) {
          assert.equal(c, seen.get(t.semis), `${e.degrees} flips the third on degree ${t.semis}`);
        } else seen.set(t.semis, c);
      }
    }
  }
  // and mixture: true actually unlocks it, at least sometimes
  let flips = 0;
  for (const e of sample(120, { family: 'major', length: 8, mixture: true })) {
    const seen = new Map();
    for (const t of parseDegrees(e.degrees)) {
      const c = thirdClass(t.quality);
      if (c === 'none') continue;
      if (seen.has(t.semis) && c !== seen.get(t.semis)) flips++;
      else if (!seen.has(t.semis)) seen.set(t.semis, c);
    }
  }
  assert.ok(flips > 0, 'mixture: true never produced a borrowed third');
});

test('D49: mixture never touches the tonic — a cycle establishes its mode first', () => {
  for (const e of sample(120, { family: 'minor', length: 8, mixture: true })) {
    assert.equal(thirdClass(parseDegrees(e.degrees)[0].quality), 'min', e.degrees);
  }
});

test('D49: a requested voicing shape is a HARD filter, checked at generation', () => {
  for (const shape of Object.keys(VOICINGS)) {
    for (const e of sample(25, { family: 'minor', length: 6, shape })) {
      assert.ok(playableWith(e, shape), `${e.degrees} is not playable with ${shape}`);
    }
  }
  // without a shape the generator is free to use qualities me_* cannot voice —
  // that is correct (the audition path uses the full ireal dictionary), and the
  // caller opts into the restriction.
  const free = sample(60, { family: 'major', length: 6 });
  assert.ok(free.some((e) => !playableWith(e, 'shell_37')), 'the unrestricted generator never left the me_* subset');
});

test('D49: a requested cadence lands on the declared function class', () => {
  const D = new Set([6, 7, 11]);
  const S = new Set([1, 2, 5, 8, 9, 10]);
  for (const e of sample(40, { family: 'minor', length: 4, cadence: 'authentic' })) {
    assert.ok(D.has(rootsOf(e.degrees).at(-1)), `authentic cadence ended on ${e.degrees}`);
  }
  for (const e of sample(40, { family: 'minor', length: 4, cadence: 'plagal' })) {
    assert.ok(S.has(rootsOf(e.degrees).at(-1)), `plagal cadence ended on ${e.degrees}`);
  }
  assert.throws(() => generateProgression({ cadence: 'nonsense' }), /unknown cadence/);
});

test('D49: with no cadence asked for, the wrap prior still cadences home most of the time', () => {
  // The claim the `wrap` table exists to support: a generated loop returns to
  // its tonic by an idiomatic motion far more often than chance (1/12).
  const last = new Map();
  const draws = sample(300, { family: 'minor', length: 4 });
  for (const e of draws) {
    const d = rootsOf(e.degrees).at(-1);
    last.set(d, (last.get(d) ?? 0) + 1);
  }
  // V, iv, bVI and bVII are the four motions the corpus's minor wrap table ranks
  // top; they should dominate the final slot.
  const idiomatic = [7, 5, 8, 10].reduce((a, d) => a + (last.get(d) ?? 0), 0) / draws.length;
  assert.ok(idiomatic > 0.6, `only ${(100 * idiomatic).toFixed(0)}% of loops cadence by an idiomatic motion`);
});

test('D49: colour moves the quality mix, and only the quality mix', () => {
  const share = (colour) => {
    let ext = 0, all = 0;
    for (const e of sample(120, { family: 'major', length: 4, colour })) {
      for (const t of parseDegrees(e.degrees)) { all++; if (!['', 'm', 'sus', '2', '5', 'o', 'aug'].includes(t.quality)) ext++; }
    }
    return ext / all;
  };
  const plain = share(0);
  const rich = share(1);
  assert.ok(rich > plain + 0.2, `colour 0 -> ${plain.toFixed(2)}, colour 1 -> ${rich.toFixed(2)} is not a real difference`);
  // roots are untouched: the same seeds give the same root cycle at any colour
  for (let i = 0; i < 20; i++) {
    const a = generateProgression({ family: 'major', length: 4, colour: 0, seed: `c${i}` });
    const b = generateProgression({ family: 'major', length: 4, colour: 1, seed: `c${i}` });
    assert.deepEqual(rootsOf(a.degrees), rootsOf(b.degrees), 'colour changed the roots');
  }
});

test('D49: long cycles are periodic, like the corpus', () => {
  // 68% of the corpus's length-8 entries have halves differing in <=2 of 4.
  let related = 0;
  const draws = sample(200, { family: 'minor', length: 8 });
  for (const e of draws) {
    const r = rootsOf(e.degrees);
    const diff = r.slice(0, 4).filter((x, i) => x !== r[i + 4]).length;
    if (diff <= 2) related++;
  }
  assert.ok(related / draws.length > 0.6, `only ${(100 * related / draws.length).toFixed(0)}% of length-8 cycles are periodic`);
});

test('D49: repetition tracks the corpus rather than collapsing onto one chord', () => {
  // Corpus distinct-degree ratio: 0.878 at length 4, 0.574 at length 8. The
  // generator sits a little below both (it is slightly more repetitive than the
  // corpus); what must NOT happen is a collapse.
  for (const [length, floor] of [[4, 0.72], [8, 0.42]]) {
    const draws = sample(300, { family: 'minor', length });
    const ratio = draws.reduce((a, e) => a + new Set(rootsOf(e.degrees)).size, 0) / draws.length / length;
    assert.ok(ratio > floor, `length ${length}: distinct-degree ratio ${ratio.toFixed(3)} collapsed below ${floor}`);
    assert.ok(ratio < 1.0, `length ${length}: ratio ${ratio.toFixed(3)} — nothing ever repeats, which the corpus does`);
  }
});

test('D49: the generator composes, it does not retrieve', () => {
  // `novel` reports whether the root cycle already exists in the corpus up to
  // rotation. Colliding on a 4-chord loop is EXPECTED (I-V-vi-IV is the
  // vernacular) — what must be true is that the field is accurate and that a
  // meaningful share of output is not in the corpus at all.
  const draws = sample(300, { family: 'major', length: 4 });
  for (const e of draws) {
    const fp = canonicalCycle(rootsOf(e.degrees));
    assert.equal(e.novel, !corpusFingerprints().has(fp), `novel is wrong for ${e.degrees}`);
    for (const m of e.matches) {
      assert.equal(canonicalCycle(rootsOf(ALL_PROGRESSIONS[m].degrees)), fp, `${m} is not really the same cycle`);
    }
  }
  const novel = draws.filter((e) => e.novel).length / draws.length;
  assert.ok(novel > 0.25, `only ${(100 * novel).toFixed(0)}% of 4-chord output is a cycle the corpus lacks`);
  // At length 8 the space is much larger and near-everything should be new.
  const long = sample(120, { family: 'minor', length: 8 });
  assert.ok(long.filter((e) => e.novel).length / long.length > 0.9, 'length-8 output is mostly copied from the corpus');
});

test('D49: canonicalCycle is rotation-invariant, which is the point of it', () => {
  assert.equal(canonicalCycle([0, 7, 9, 5]), canonicalCycle([9, 5, 0, 7]));
  assert.equal(canonicalCycle([0, 7, 9, 5]), canonicalCycle([5, 0, 7, 9]));
  assert.notEqual(canonicalCycle([0, 7, 9, 5]), canonicalCycle([0, 5, 9, 7]));
});

test('D49: the derivation explains every slot that was chosen', () => {
  const e = generateProgression({ family: 'minor', length: 8, style: 'undertale', seed: 'd' });
  const n = rootsOf(e.degrees).length;
  const roots = e.derivation.filter((d) => d.kind !== 'quality' && d.chosen !== null);
  const quals = e.derivation.filter((d) => d.kind === 'quality');
  assert.equal(quals.length, n, 'not every chord has a quality decision');
  assert.equal(roots.length, n, 'not every chord has a root decision');
  for (const d of e.derivation) assert.ok(d.why && d.why.length > 0, `slot ${d.slot} has no reason`);
  assert.equal(explainProgression(e).length, e.derivation.length);
  // the request is carried so a later edit can re-generate under a changed brief
  assert.equal(e.request.style, 'undertale');
  assert.equal(e.request.seed, 'd');
});

test('D49: bad requests fail loudly', () => {
  assert.throws(() => generateProgression({ length: 1 }), /length must be/);
  assert.throws(() => generateProgression({ home: 12 }), /home must be/);
  assert.throws(() => generateProgression({ shape: 'no_such_shape' }), /unknown voicing shape/);
});

test('D49: the evidence gate keeps unsupported labels out of the model', () => {
  // Rocket Man's every chord came out `-#5` over a filename reading I-IV-I-IV
  // (match.agree === 0). It must not be counted, and no counted table may carry
  // a quality that appears ONLY in an excluded entry.
  assert.equal(HARMONY_MODEL.built.excluded, 6);
  for (const fam of Object.values(HARMONY_MODEL.families)) {
    for (const row of Object.values(fam.qual)) {
      assert.ok(!('-#5' in row), 'the -#5 label survived the evidence gate');
    }
  }
  assert.ok(HARMONY_MODEL.built.entries < Object.keys(ALL_PROGRESSIONS).length);
});

// --- D52: the VGMusic corpus -----------------------------------------------

test('D52: the vgmusic pack is not stale, and is gated harder than the others', async () => {
  execFileSync('node', ['scripts/import-vgmusic.mjs', '--check'], { cwd: ROOT });
  const { PROGRESSIONS_VGMUSIC } = await import('../src/lib/progressions-vgmusic.js');
  const es = Object.values(PROGRESSIONS_VGMUSIC);
  assert.ok(es.length >= 40, `only ${es.length} vgmusic entries`);
  for (const [name, e] of Object.entries(PROGRESSIONS_VGMUSIC)) {
    // D51 said transcription quality is what an ear rejects, so this pack is
    // gated on it far harder than the Undertale pack (which keeps down to 0.48)
    assert.ok(e.coverage >= 0.9, `${name}: coverage ${e.coverage}`);
    assert.ok(e.keyMargin >= 0.06, `${name}: keyMargin ${e.keyMargin}`);
    assert.ok(e.reps >= 2, `${name}: ${e.reps} reps`);
    const n = parseDegrees(e.degrees).length;
    assert.ok(n >= 3 && n <= 8, `${name}: ${n} chords`);
    // A6.1: an import is a candidate pool, never a library
    assert.equal(e.ratified, false);
    assert.equal(e.needsEar, true);
    assert.equal(e.character, null);
    assert.equal(e.pack, 'vgmusic');
    // provenance: every entry must credit the file and the human who sequenced it
    assert.match(e.source, /^audios\/vgmusic\//);
    assert.ok(e.sequencer && e.sequencer.length);
    // and render in a key
    assert.equal(renderProgression(e, e.family === 'minor' ? 'C:minor' : 'C:major').length, n);
  }
  // one loop per song: no two entries may come from the same file
  const srcs = es.map((e) => e.source);
  assert.equal(new Set(srcs).size, srcs.length, 'two entries share a source file');
});

test('D52: the corpus manifest credits every file it fetched', async () => {
  const { readFileSync } = await import('node:fs');
  const m = JSON.parse(readFileSync(join(ROOT, 'src/ingest/vgmusic-manifest.json'), 'utf8'));
  assert.equal(m.count, m.files.length);
  assert.ok(m.count >= 100, `only ${m.count} files in the manifest`);
  assert.ok(/vgmusic\.com/.test(m.source));
  for (const f of m.files) {
    assert.ok(f.game && f.title && f.sequencer && f.path);
    assert.ok(f.bytes >= m.filters.minBytes && f.bytes <= m.filters.maxBytes);
  }
  // breadth over depth: the point of the per-game cap
  const games = new Set(m.files.map((f) => f.game));
  assert.ok(games.size > m.count * 0.6, `${games.size} games for ${m.count} files — too concentrated`);
});

test('D52: percussion never reaches the harmonic or melodic analysis', async () => {
  const { loadSong } = await import('../src/ingest/corpus.js');
  const { readMidi } = await import('../src/ingest/midi.js');
  const { readFileSync, existsSync } = await import('node:fs');
  const m = JSON.parse(readFileSync(join(ROOT, 'src/ingest/vgmusic-manifest.json'), 'utf8'));
  // find a file that actually HAS drums, or the test proves nothing
  let checked = 0;
  for (const f of m.files.slice(0, 60)) {
    const p = join(ROOT, f.path);
    if (!existsSync(p)) continue;
    const raw = readMidi(p);
    if (!raw.notes.some((n) => n.channel === 9)) continue;
    const song = loadSong(p);
    if (song.skipped) continue;
    assert.ok(!song.midi.notes.some((n) => n.channel === 9), `${f.path}: channel 10 survived`);
    assert.ok(!song.mel.some((n) => n.channel === 9), `${f.path}: a drum reached the melody stream`);
    assert.ok(!song.acc.some((n) => n.channel === 9), `${f.path}: a drum reached the accompaniment`);
    checked++;
    if (checked >= 5) break;
  }
  assert.ok(checked >= 3, `only ${checked} files with percussion exercised`);
});

test('D52: the melody profile is habits, never a tune', async () => {
  const { MELODY_PROFILE_VGMUSIC, MELODY_EVIDENCE_VGMUSIC } = await import('../src/lib/melody-profiles-vgmusic.js');
  const p = MELODY_PROFILE_VGMUSIC['game-midi'];
  // D30: nothing here may be a sequence of notes. Every value is a scalar or a
  // distribution over move TYPES — no pitches, no note lists.
  const flat = JSON.stringify(MELODY_PROFILE_VGMUSIC);
  assert.ok(!/"degrees"|"notes"|"midi"|"pitch"/.test(flat), 'the profile leaked note data');
  const sum = Object.values(p.moves).reduce((a, b) => a + b, 0);
  assert.ok(sum > 0.5 && sum <= 1.02, `move shares sum to ${sum.toFixed(3)}`);
  for (const k of ['upBias', 'leapRecovery', 'stepInertia', 'onBeatShare', 'legatoShare']) {
    assert.ok(p[k] >= 0 && p[k] <= 1, `${k} = ${p[k]} is not a share`);
  }
  // the evidence has to be substantial enough to mean anything
  assert.ok(MELODY_EVIDENCE_VGMUSIC.intervals > 10_000);
  assert.ok(MELODY_EVIDENCE_VGMUSIC.songs > 50);
  // a melody with 9 onsets a bar was the percussion bug; a real one is far sparser
  assert.ok(p.onsetsPerBar <= 8, `${p.onsetsPerBar} onsets/bar — is percussion leaking again?`);
});

// ── D96: the repaired loop extractor ──────────────────────────────────────
// 377 of 1786 corpus files extracted NO loop despite hundreds of melody notes.
// Cause was here, not in the labeller: one-bar loops were never searched, and
// a single differing half-bar vetoed an entire repeat. These pin BOTH halves
// of the fix — that it recovers real loops, and that the frozen packs cannot
// silently inherit it (which would re-roll judged songs, the D95 lesson).

test('D96: the legacy profile is what the committed packs pin', async () => {
  const { LOOP_PROFILES } = await import('../src/ingest/corpus.js');
  assert.deepEqual(LOOP_PROFILES.legacy, { tolerance: 1, lengths: [16, 12, 8, 6, 4], consensus: false });
  // Both importers must pass it EXPLICITLY. Inheriting the default would make
  // a corpus-side bug fix silently re-count the harmony model.
  const { readFileSync } = await import('node:fs');
  for (const s of ['scripts/import-vgmusic.mjs', 'scripts/import-undertale.mjs']) {
    const src = readFileSync(join(ROOT, s), 'utf8');
    assert.match(src, /chordLoops\([^)]*LOOP_PROFILES\.legacy/s, `${s} does not pin the legacy loop profile`);
  }
});

test('D96: tolerant matching recovers loops that exact matching missed', async () => {
  const { loadSong, chordLoops, LOOP_PROFILES } = await import('../src/ingest/corpus.js');
  const { existsSync } = await import('node:fs');
  // A file measured to hold a real repeating vamp that exact matching rejected
  // (its repeat differs in one half-bar). If the corpus isn't downloaded the
  // assertion below still guards the invariant on whatever IS present.
  const probe = join(ROOT, 'audios/vgmusic-corpus/gameboy/PKMN_-_ChampionBattle.mid');
  if (existsSync(probe)) {
    const song = loadSong(probe);
    assert.ok(!song.skipped, 'probe file did not load');
    assert.equal(chordLoops(song, LOOP_PROFILES.legacy).length, 0, 'probe no longer demonstrates the failure');
    assert.ok(chordLoops(song).length > 0, 'the repaired profile must recover it');
  }
  // and the repaired profile never LOSES a loop the legacy one found
  const { readFileSync: rf } = await import('node:fs');
  const m = JSON.parse(rf(join(ROOT, 'src/ingest/vgmusic-manifest.json'), 'utf8'));
  let checked = 0, regressions = 0;
  for (const f of m.files.slice(0, 40)) {
    const p = join(ROOT, f.path);
    if (!existsSync(p)) continue;
    const song = loadSong(p);
    if (song.skipped) continue;
    const old = chordLoops(song, LOOP_PROFILES.legacy);
    if (!old.length) continue;
    if (!chordLoops(song).length) regressions++;
    checked++;
  }
  if (checked >= 5) assert.equal(regressions, 0, `${regressions}/${checked} files lost their loop under the repair`);
});

test('D96: a degenerate time signature is ignored, not obeyed', async () => {
  const { readMidi } = await import('../src/ingest/midi.js');
  const { existsSync } = await import('node:fs');
  // A 0/1 time signature makes barTicks 0, every bar index Infinity, and used
  // to crash the whole ingest run rather than skip one file.
  const p = join(ROOT, 'audios/vgmusic/genesis/Calling_From_Heaven3.mid');
  if (!existsSync(p)) return;
  const m = readMidi(p);
  assert.ok(m.timeSig[0] > 0 && m.timeSig[1] > 0, `degenerate meter survived: ${m.timeSig.join('/')}`);
  assert.ok(Number.isFinite(m.ppq * 4 * (m.timeSig[0] / m.timeSig[1])), 'bar length is not finite');
});
