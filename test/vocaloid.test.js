// r35 — the Vocaloid read-out's engine side: the vocal writer
// (src/lib/vocal-line.js), the spec binder's rests, and the two pages built
// from it (audition/vocaloid.html — description prompts; audition/vocalab.html
// — one-variable A/B cards). research/vocaloid-r35.md holds the numbers.

import test from 'node:test';
import assert from 'node:assert';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { composeVocalLine, vocalDensity } from '../src/lib/vocal-line.js';
import { bindMelodySpec } from '../src/binder/bind.js';
import { chordCoreTones } from '../src/binder/theory.js';

const ctones = (sym) => new Set([...chordCoreTones(sym)].map((x) => ((x % 12) + 12) % 12));
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const params = (over = {}) => ({ seed: 'test-song', keyIntervals: MINOR, rootMidi: 64, bpm: 168, harmony: ['Em', 'C', 'G', 'D'], chordTonesOf: ctones, ...over });

test('r35 vocal writer: the syllable law — notes per bar fall as the tempo rises, ~3.9 syllables/s', () => {
  const at = (bpm) => vocalDensity(bpm).notesPerBar;
  assert.ok(at(120) > at(168) && at(168) > at(200), `${at(120)} > ${at(168)} > ${at(200)}`);
  // (the per-bar count is clamped to 8 — under ~117 bpm the rate falls below
  // 3.9 by design, the corpus's <100 band sings 2.2/s; test inside the clamp)
  for (const bpm of [130, 150, 176]) {
    const perSec = at(bpm) / (240 / bpm);
    assert.ok(Math.abs(perSec - 3.9) < 0.05, `${bpm} bpm: ${perSec} syllables/s`);
  }
  assert.ok(vocalDensity(120).sixteenths > vocalDensity(180).sixteenths, '16ths belong to the slower band');
});

test('r35 vocal writer: deterministic per seed, a 4-bar spec with real rests, degrees only (no chromatic tokens)', () => {
  const a = composeVocalLine(params());
  const b = composeVocalLine(params());
  assert.deepEqual(a, b, 'same seed, same line');
  const c = composeVocalLine(params({ seed: 'other-song' }));
  assert.notDeepEqual(a.spec, c.spec, 'a different seed writes a different line');
  assert.equal(a.spec.bars.length, 4);
  let rests = 0, notes = 0;
  for (const bar of a.spec.bars) {
    assert.equal(bar.onsets.length, bar.degrees.length);
    assert.equal(bar.onsets.length, bar.accents.length);
    for (const d of bar.degrees) { if (d == null) rests++; else { notes++; assert.ok(Number.isInteger(d), `degree ${d} must be an integer scale degree`); } }
  }
  assert.ok(rests >= 2, `breaths are explicit rests (${rests})`);
  assert.ok(notes >= 16 && notes <= 44, `${notes} notes over 4 bars at 168`);
});

test('r35 vocal writer: the walk is steps and repeats, the chorus lifts, the hook returns', () => {
  const v = composeVocalLine(params({ role: 'verse' }));
  const ch = composeVocalLine(params({ role: 'chorus' }));
  assert.ok(v.meta.steps + v.meta.repeats >= 45, `steps+repeats ${v.meta.steps + v.meta.repeats}% (corpus 73%)`);
  assert.equal(ch.meta.lift, 5);
  assert.ok(ch.meta.targetMidi > v.meta.targetMidi, 'the chorus sits above the verse');
  // statement 1 restates; the answer re-rolls from statement 2 (r24: restate, then depart)
  const s0 = composeVocalLine(params({ stmt: 0 })), s1 = composeVocalLine(params({ stmt: 1 })), s2 = composeVocalLine(params({ stmt: 2 }));
  assert.deepEqual(s0.spec, s1.spec, 'the second statement is the first');
  assert.deepEqual(s0.spec.bars.slice(0, 2), s2.spec.bars.slice(0, 2), 'the hook (bars 0-1) returns at pitch');
  assert.notDeepEqual(s0.spec.bars.slice(2), s2.spec.bars.slice(2), 'the answer (bars 2-3) re-rolls from the third statement');
  const frozen = composeVocalLine(params({ stmt: 2, hookVary: 'none' }));
  assert.deepEqual(frozen.spec, s0.spec, "hookVary 'none' never re-rolls");
});

test('r35 spec binder: a null degree is an explicit rest and the line stays in key', () => {
  const { spec } = composeVocalLine(params());
  const bound = bindMelodySpec(spec, { harmony: ['Em', 'C', 'G', 'D'], barsPerChord: 1, key: 'E:minor' }, '4/4', { octave: 4, sound: 'piano' });
  assert.ok(/~/.test(bound.expr), 'the expression carries rests');
  assert.equal(bound.warnings.length, 0, `guard warnings: ${bound.warnings.slice(0, 2).join(' | ')}`);
  const pcs = new Set(bound.boundMeta.notes.map((n) => ((n.midi % 12) + 12) % 12));
  const scale = new Set(MINOR.map((s) => (s + 4) % 12));
  for (const pc of pcs) assert.ok(scale.has(pc), `pitch class ${pc} is outside E minor`);
});

test('r35: the writer never touches a song that did not ask for it (D95 / judged pages)', () => {
  // the generator gates the writer on `opts.vocalWriter && ruleFresh(35)`;
  // nothing in the engine imports the analysis corpus or its scripts
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  assert.ok(/const vocalWriterOn = !!opts\.vocalWriter && ruleFresh\(35\)/.test(gen), 'the writer is opt-in and r35-gated');
  for (const dir of ['src/lib', 'src/binder', 'src/harness']) {
    for (const f of readdirSync(new URL(`../${dir}`, import.meta.url))) {
      if (!/\.(js|mjs)$/.test(f)) continue;
      const src = readFileSync(new URL(`../${dir}/${f}`, import.meta.url), 'utf8');
      assert.ok(!/audios\/vocaloid-r35|_analysis\.json|analyze-vocaloid/.test(src), `${dir}/${f} reaches the analysis corpus`);
    }
  }
});

test('r35: the Vocaloid suite and the vocal lab pages are built from description prompts and one-variable cards', () => {
  const load = (p) => { const h = readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'); const i = h.indexOf('const DATA = '); return { html: h, data: JSON.parse(h.slice(i + 13, h.indexOf(';\n', i))) }; };
  const vo = load('audition/vocaloid.html');
  assert.ok(vo.html.includes("page: 'r35-vocaloid'"));
  assert.ok(vo.data.songs.length >= 12, `${vo.data.songs.length} suite songs`);
  for (const s of vo.data.songs) {
    assert.ok(/^vo_/.test(s.name), s.name);
    assert.ok(s.description && s.description.length > 40, `${s.name}: a description prompt, not two words`);
    assert.ok(s.solos && s.solos._lead_mix, `${s.name}: the sung line exists`);
    assert.ok((s.cast ?? []).some((c) => /^vocal writer \(r35\)/.test(c)), `${s.name}: the writer fired`);
  }
  const vl = load('audition/vocalab.html');
  assert.ok(vl.html.includes("page: 'r35-vocalab'"));
  const cards = new Map();
  for (const s of vl.data.songs) { assert.ok(/^vl_/.test(s.name)); cards.set(s.labCard, (cards.get(s.labCard) ?? 0) + 1); }
  assert.ok(cards.size >= 8, `${cards.size} cards`);
  for (const [c, n] of cards) assert.ok(n >= 2, `card ${c} has ${n} variant`);
  // a card's variants share the key (built under ONE name — D120)
  const byCard = {};
  for (const s of vl.data.songs) (byCard[s.labCard] ??= new Set()).add(s.key);
  for (const [c, keys] of Object.entries(byCard)) assert.equal(keys.size, 1, `card ${c} spans keys ${[...keys].join(',')}`);
  // and every card's variants realize a DIFFERENT sung line (no fake A/B)
  for (const c of cards.keys()) {
    const lines = new Set(vl.data.songs.filter((s) => s.labCard === c).map((s) => s.mix + '|' + s.solos._lead_mix + '|' + (s.solos._chorus_double ?? '') + '|' + (s.solos._companion ?? '') + '|' + (s.solos._vocal_harmony ?? '') + '|' + s.bpm));
    assert.equal(lines.size, cards.get(c), `card ${c}: variants collapse to ${lines.size} distinct mixes`);
  }
});

// ---- r36 — his first export on the Vocaloid page (D140) ---------------------
import { assignLyrics, copyLyricsFrom } from '../src/lib/lyrics-ja.js';

test('r36 melisma law: every sung note takes its own mora at melismaUnder 0; the r34 rule still exists', () => {
  // a 16th pair at 128 bpm (0.117 s) — the exact shape of his four "Indian fluctuation" cards
  const mk = () => ({ name: 'vo_test', notes: Array.from({ length: 16 }, (_, i) => ({ start: i * 0.117, dur: 0.117, midi: 64 + (i % 3), phrase: Math.floor(i / 8) })) });
  const a = mk(); assignLyrics(a, { seed: 'x', melismaUnder: 0 });
  assert.equal(a.notes.filter((n) => n.melisma).length, 0, 'no vowel continues onto a new pitch');
  const b = mk(); assignLyrics(b, { seed: 'x', melismaUnder: 0.14 });
  assert.ok(b.notes.filter((n) => n.melisma).length > 0, 'the r34 rule is still reachable');
});

test('r36 the harmony voice sings the lead\'s words at shared onsets (copyLyricsFrom)', () => {
  const lead = { name: 'lead', notes: Array.from({ length: 8 }, (_, i) => ({ start: i * 0.25, dur: 0.25, midi: 64 + i, phrase: 0 })) };
  assignLyrics(lead, { seed: 'lead', melismaUnder: 0 });
  // the harmony strikes with the lead on even onsets and rests on the odd ones, plus one onset the lead never strikes
  const harm = { name: 'harm', notes: [0, 2, 4, 6].map((i) => ({ start: i * 0.25, dur: 0.5, midi: 60 + i, phrase: 0 })).concat([{ start: 1.62, dur: 0.1, midi: 60, phrase: 0 }]) };
  assignLyrics(harm, { seed: 'harm', melismaUnder: 0 });
  const matched = copyLyricsFrom(harm, lead);
  assert.equal(matched, 4);
  for (const i of [0, 1, 2, 3]) assert.equal(harm.notes[i].syl, lead.notes[i * 2].syl, `onset ${i * 2}`);
  assert.equal(harm.notes[4].syl, lead.notes[6].syl, 'an unshared onset carries the lead\'s current syllable');
  assert.ok(harm.notes.every((n) => !n.melisma));
  assert.equal(harm.lyrics.length, 1);
});

test('r36 the Vocaloid page: the chorus double sits on a keyboard on every fresh song; his three keeps are pinned', () => {
  const h = readFileSync(new URL('../audition/vocaloid.html', import.meta.url), 'utf8');
  const i = h.indexOf('const DATA = '); const data = JSON.parse(h.slice(i + 13, h.indexOf(';\n', i)));
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  const KEEPS = ['vo_reflection', 'vo_lullaby', 'vo_march'];
  for (const k of KEEPS) assert.ok(new RegExp(`id: '${k.slice(3)}',[^\\n]*keepFresh: true, pinFrom: 'r36'`).test(gen), `${k} carries keepFresh + pinFrom r36`);
  for (const s of data.songs) {
    const dbl = (s.cast ?? []).find((c) => /^chorus double/.test(c));
    if (!dbl || KEEPS.includes(s.name)) continue;
    const snd = /: (\S+) plays/.exec(dbl)?.[1];
    assert.ok(/^(piano|gm_epiano1|gm_vibraphone|gm_marimba|gm_celesta|gm_music_box)$/.test(snd), `${s.name}: double on ${snd} — a wind or a lead reads "off key" against the voice`);
  }
  // the pins on the page: vocalStyle only where a row asks; vocalDb numeric
  for (const s of data.songs) { assert.equal(typeof s.vocalDb, 'number'); if (s.vocalStyle) assert.equal(s.vocalStyle, 'layer'); }
});
