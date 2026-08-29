// r20/D101 — the technique library defends the same thing the video pack does:
// the HONESTY of the record. These rows are the place extracted craft lives, so
// a row that cannot say where it came from is worse than no row at all.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TECHNIQUES, technique, wiredTechniques, pendingTechniques } from '../src/lib/techniques.js';

const ROLES = new Set(['harmony', 'voicing', 'acc', 'melody', 'layering', 'timbre', 'form']);

test('D101: every technique states an intent, a role and its evidence', () => {
  assert.ok(TECHNIQUES.length >= 10, `only ${TECHNIQUES.length} techniques`);
  const seen = new Set();
  for (const t of TECHNIQUES) {
    assert.ok(t.id && !seen.has(t.id), `duplicate or missing id: ${t.id}`);
    seen.add(t.id);
    assert.ok(ROLES.has(t.role), `${t.id}: unknown role "${t.role}"`);
    // the INTENT is the whole point — a note edit is not an intent
    assert.ok(typeof t.intent === 'string' && t.intent.length > 30, `${t.id}: no real intent`);
    assert.ok(typeof t.shape === 'string' && t.shape.length > 20, `${t.id}: no shape`);
    assert.ok(t.applies && typeof t.applies === 'object', `${t.id}: no applicability conditions`);
    // evidence must name a source that can be re-checked
    const KINDS = new Set(['reel', 'ear', 'midi-set']);
    assert.ok(t.evidence && KINDS.has(t.evidence.kind),
      `${t.id}: evidence must be a reel, his ear, or a named MIDI set`);
    if (t.evidence.kind === 'midi-set') {
      // r22: he hand-imports MIDI and asks for it to be analysed. That is a
      // re-checkable source like a reel is — but only if the row names WHICH
      // files and WHAT WINDOW inside them, because a whole-file average over a
      // medley measures the format instead of the music.
      assert.ok(t.evidence.set, `${t.id}: a midi-set row must name the set (a path)`);
      assert.ok(t.evidence.scope, `${t.id}: a midi-set row must state the analysis window — whole files hide medleys and intros`);
      assert.ok(t.evidence.read && t.evidence.read.length > 40, `${t.id}: a midi-set row must say what was actually measured, with numbers`);
      assert.match(String(t.evidence.read), /\d/, `${t.id}: a midi-set row's read must carry the measurement`);
    } else if (t.evidence.kind === 'reel') {
      assert.ok(t.evidence.poster, `${t.id}: a reel row must name who posted it — that is how he finds it in his DMs`);
      assert.match(String(t.evidence.file ?? ''), /\.(mp4|MP4|mov|MOV)$/, `${t.id}: reel row without a file`);
      assert.match(String(t.evidence.at ?? ''), /^\d+(-\d+)?s$/, `${t.id}: reel row without a timestamp`);
      assert.ok(t.evidence.read || t.evidence.onScreen, `${t.id}: a reel row must say what was actually READ off the frame`);
    } else {
      assert.ok(t.evidence.song, `${t.id}: an ear row must name the song`);
      assert.ok(t.evidence.hisComment, `${t.id}: an ear row exists because he said something — quote it`);
    }
  }
});

test('D101: status is honest — wired points at code, recorded says what blocks it', () => {
  for (const t of TECHNIQUES) {
    assert.ok(t.status === 'wired' || t.status === 'recorded', `${t.id}: bad status "${t.status}"`);
    if (t.status === 'wired') {
      assert.ok(t.impl, `${t.id}: claims to be wired but names no implementation`);
    } else {
      // the backlog is only useful if each row says what it is waiting on
      assert.ok(t.blocked && t.blocked.length > 15, `${t.id}: recorded without saying what blocks it`);
      assert.ok(!t.impl, `${t.id}: recorded but names an impl — pick one`);
    }
  }
  assert.ok(wiredTechniques().length >= 4, 'nothing is wired');
  assert.ok(pendingTechniques().length >= 4, 'nothing is pending — the backlog cannot be empty while asks are open');
  for (const p of pendingTechniques()) assert.ok(p.blocked, `${p.id}: pending row lost its blocker`);
});

test('D101: a wired technique names an implementation that exists', () => {
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  const bind = readFileSync(new URL('../src/binder/bind.js', import.meta.url), 'utf8');
  const prog = readFileSync(new URL('../src/lib/progressions-videos.js', import.meta.url), 'utf8');
  const hay = gen + bind + prog;
  for (const t of wiredTechniques()) {
    // pull the identifier-ish tokens out of the impl string and require that at
    // least one of them actually appears in the source it points at
    const toks = String(t.impl).match(/[A-Za-z_][A-Za-z0-9_]{3,}/g) ?? [];
    const hit = toks.some((tok) => hay.includes(tok));
    assert.ok(hit, `${t.id}: impl "${t.impl}" names nothing that exists in the engine`);
  }
});

test('D101: rows are addressed by NAME, never indexed — adding one cannot re-roll a song', () => {
  // The D95 law: anything a song retrieves by `fnv % pool.length` moves every
  // unpinned song when the pool grows. This library must never be that pool, so
  // the generator may look rows up by id but must not iterate or length-index it.
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  assert.ok(!/TECHNIQUES\s*\[/.test(gen), 'the generator indexes TECHNIQUES — that is a retrieval re-roll vector');
  assert.ok(!/TECHNIQUES\.length/.test(gen), 'the generator reads TECHNIQUES.length — that is a retrieval re-roll vector');
  assert.equal(technique('nope'), null);
  assert.ok(technique('walk_into_next_root'), 'lookup by id must work');
});

test('D101: his words are quoted, never paraphrased into existence', () => {
  // every row that claims a verdict or a comment must carry it as a string;
  // an empty quote is worse than none because it reads as endorsement
  for (const t of TECHNIQUES) {
    for (const k of ['verdict', 'relatedAsk']) {
      if (t[k] !== undefined) assert.ok(typeof t[k] === 'string' && t[k].length > 10, `${t.id}: empty ${k}`);
    }
    if (t.evidence.hisComment !== undefined && t.evidence.hisComment !== null) {
      assert.ok(typeof t.evidence.hisComment === 'string' && t.evidence.hisComment.length > 2,
        `${t.id}: hisComment must be his words or explicitly null`);
    }
  }
});
