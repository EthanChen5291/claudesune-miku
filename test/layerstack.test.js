// r28 — the layer-stack rules, pinned.
//
// His ask: "make a song suite learning and applying patterns and layering and
// everything from the synth guy from earlier ... i feel like not enough of his
// techniques were applied fully."
//
// These tests pin the three things that would silently undo the round: the niche
// gate (his standing r27 ruling), the `noteBlind` fix for the keep-transition
// law (which is what stopped this round's own verdict import from rewriting 15
// judged songs), and the downward register allocation (D77).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const SRC = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
const BIND = readFileSync(new URL('../src/binder/bind.js', import.meta.url), 'utf8');

test('r28: THE NICHE GATE — every new rule goes through it', () => {
  // His r27 ruling: "note that engine changes as a result of this should not
  // affect the niche genres". research/reel-layers-r22.md §5.2 says the same of
  // its own evidence: all 9 reels are minor, so nothing transfers to desert,
  // jungle or a horror lane on its own authority.
  assert.match(SRC, /const r28 = \(round = 28\) => ruleFresh\(round\) && !nicheLane;/,
    'the r28 gate must combine freshness AND the niche exclusion');
  assert.doesNotMatch(SRC, /ruleFresh\(28\)/,
    'an r28 rule is using a bare ruleFresh(28) and would fire on desert/jungle/horror');
  for (const rule of [
    /if \(opts\.reregister === true && r28\(\)\)/,
    /if \(opts\.holdMove === true && r28\(\)\)/,
    /if \(opts\.motorFall === true && r28\(\)\)/,
    /if \(opts\.finalBarBreak === true && r28\(\) && extraSolos\._reregister\)/,
    // r33: noJitter became the DEFAULT for fresh songs (his "some seemingly
    // really short notes and offbeats"; the D118 final-slot shape measured
    // still live on songs.html at 32.3% vs 2.6-7.5% in every reference). Both
    // arms still route through niche-gated round functions.
    /const noJitter = \(opts\.noJitter === true && r28\(\)\) \|\| \(opts\.noJitter !== false && r33\(\)\);/,
  ]) assert.match(SRC, rule, `an r28 rule stopped going through the niche gate: ${rule}`);
  // and the allocator itself is only seeded when the gate is open
  assert.match(SRC, /const r28Claimed = new Set\(\);\n  if \(r28\(\)\) \{/,
    'the register allocator must not claim bands on a niche lane');
});

test('r28: `noteBlind` — the keep-transition law, and it is ONE flag', () => {
  // MEASURED this round: importing his 23 vanriver notes moved 15 of the 23
  // songs on their own page with nothing else changed, because six gates read
  // `!CARD_NOTES?.[name]` and flip the moment a note exists. `colorFresh` is the
  // worst — it governs harmony, and 14 songs' degrees changed.
  // r35 (D138): `keepFresh` is the ONE escape on the verdict half — a keep
  // CLICKED on a noteBlind page is that song's first judgement too, and
  // without it the click retracts every fresh rule the song was judged with
  // (vx_nostalgic_snow). It is a separate flag, declared per row, never implied
  // by noteBlind.
  assert.match(SRC, /const historyLess = \(\) => \(opts\.keepFresh === true \|\| !DERIVED_VERDICTS\?\.\[name\]\)\s*\n\s*&& \(opts\.noteBlind === true \|\| !CARD_NOTES\?\.\[name\]\);/,
    'the historyLess helper is gone or has changed shape');
  assert.match(SRC, /const priorKeep = judged\?\.verdict === 'keep' && opts\.keepFresh !== true;/,
    'keepFresh must suspend priorKeep for the rule gates (the keep-transition law on a noteBlind page)');
  assert.strictEqual((SRC.match(/keepFresh: true/g) ?? []).length, 1,
    'keepFresh is a per-row pin for a clicked keep on a noteBlind page — exactly one row carries it (vx_nostalgic_snow)');
  // every history-less gate must route through it — a raw one would re-open the bug
  assert.doesNotMatch(SRC, /!DERIVED_VERDICTS\?\.\[name\] && !CARD_NOTES\?\.\[name\]/,
    'a gate is testing CARD_NOTES directly again instead of going through historyLess()');
  assert.ok((SRC.match(/historyLess\(\)/g) ?? []).length >= 8,
    'historyLess() is no longer used by the gates it was written for');
  // a real VERDICT must still gate everything it gated before — noteBlind only
  // suspends the "he has written about this" half
  assert.match(SRC, /opts\.noteBlind === true \|\| !CARD_NOTES/,
    'noteBlind must not be able to bypass DERIVED_VERDICTS');
  // and the pages whose own notes have landed must declare it
  assert.ok((SRC.match(/^      noteBlind: true,$/gm) ?? []).length >= 2,
    'the vanriver and citypop build loops must both declare noteBlind');
});

test('r28: the register allocator searches DOWNWARD and is hard-capped', () => {
  // D77: support stays under the lead. The first cut searched symmetrically and
  // put the hold/move layer at midi 94-101 against a lead at 66 on 12 of 14
  // songs — the frozen slot's own r23 defect, reproduced.
  assert.match(SRC, /const r28Band = \(want, range, ceil = null, spread = 4\) =>/,
    'r28Band lost its ceiling parameter');
  const body = SRC.slice(SRC.indexOf('const r28Band ='), SRC.indexOf('R1 · A NEW LAYER'));
  const down = body.indexOf('w - d');
  const up = body.indexOf('w + d');
  assert.ok(down > 0 && up > 0 && down < up,
    'the allocator must try lower octaves BEFORE higher ones');
  assert.match(body, /const hi = Math\.min\(range \? range\[1\] : 7, ceil \?\? 9\);/,
    'the ceiling must clamp the top of the search, not merely bias it');
  // every r28 layer passes a ceiling derived from the lead
  for (const call of [
    /r28Band\(rrWant, rrRange, Math\.max\(2, leadOctave - 1\)\)/,
    /r28Band\(hmWant, hmRange, Math\.max\(2, leadOctave - 2\)\)/,
    /r28Band\(cfg\.octave \?\? \(leadOctave - 2\), mfRange, Math\.max\(2, leadOctave - 1\)\)/,
  ]) assert.match(SRC, call, `an r28 layer is claiming a band with no ceiling: ${call}`);
});

test('r28: minNoteLast is OPT-IN — 47 judged songs depend on it', () => {
  // bindMelody is called by the lead, the octave partner, the companion and the
  // echo on every judged song. A default-on change rewrites judged material.
  assert.match(BIND, /minNoteLast = false,/,
    'minNoteLast must default to false or every judged melody moves');
  assert.match(BIND, /if \(i === lastIx && !dropLast\) return true;/,
    'the last-note exemption must still apply when the flag is off');
  // r29: and the `>= 2` guard must FALL BACK to keeping the last note, not to
  // abandoning the filter. Measured: with minNoteLast on, the guard fired more
  // often, and each firing left the bar at FULL density — one cast layer went
  // from 3 onsets a bar to 8, which is the opposite of what the flag is for.
  assert.match(BIND, /const thin = \(dropLast\) => notes\.filter/,
    'the thinning pass must be reusable so the guard can fall back');
  assert.match(BIND, /else if \(minNoteLast\) \{\n\s*const softer = thin\(false\);/,
    'a bar that cannot lose its last note must still thin its interior');
  // and the generator threads it through the WHOLE melody family, not just the
  // lead — 81.9% of the offending notes were derived copies
  assert.ok((SRC.match(/minNoteLast: noJitter/g) ?? []).length >= 7,
    'noJitter must reach every melody-family bind, or the copies keep playing the gesture');
});

test('r28: R1 takes its notes from the bind, so it cannot introduce a pitch', () => {
  // The claim on the card is "it carries no pitch the tune does not". That is
  // true BY CONSTRUCTION only because the skeleton is read off the same
  // bindMelody result the lead's own letter uses. Three earlier cuts derived it
  // some other way and each was wrong; this pins the mechanism, not the number.
  assert.match(SRC, /const rrSkeleton = \(res\) => \{/, 'the skeleton builder is gone');
  assert.match(SRC, /for \(const n of res\.boundMeta\?\.notes \?\? \[\]\) \{/,
    'the skeleton must be built from boundMeta, not re-derived');
  assert.match(SRC, /if \(first\.has\(n\.cycle\)\) continue;/,
    'the skeleton must take the FIRST qualifying note of each cycle');
  // and D102: a voice that HOLDS must be diatonic. Measured, the floor ran 12.9%
  // out-of-key — above the lead's own 9.5% — because it keeps whatever note
  // opens the bar, so a chromatic the tune passes through in an eighth became
  // the floor's whole bar. With the filter it is 0.0% out-of-key on all 14
  // songs, at a cost of 6 notes out of 319.
  assert.match(SRC, /if \(pc != null && !rrKeyPcs\.has\(pc\)\) continue;/,
    'the held floor may not sustain an out-of-key pitch (D102: a line that holds must be diatonic)');
  assert.match(SRC, /const rrKeyPcs = \(\(\) => \{/, 'the key scale is no longer computed for the floor');
  assert.doesNotMatch(SRC, /rrRaw\}\)\.segment\(1\)/,
    'segment(1) samples the downbeat and goes silent on a melody that breathes there');
  // and R1's transposition is the rule's own range
  assert.match(SRC, /const rrShift = Math\.max\(-24, Math\.min\(-12, \(rrOct - leadOctave\) \* 12\)\);/,
    'R1 transposes by ±12/±24 — an unclamped shift measured -43 semitones');
});

test('r29: the four fixes from his r28 notes, pinned', () => {
  // (1) THE TEXTURE MONOCULTURE. His words: "the offbeat strum synth thing (the
  // one that does like one every other beat) has been used in every song so
  // far". Measured: fnd_offbeat_chords / gm_kalimba was 14 of 14 on the r28
  // page, 3 of 3 on the r27 page and 13 of 22 on the judged suite — 30 of 39.
  // The cause was a FIXED class whose pool has exactly one entry, so the hash
  // rotation used everywhere else in the file was a no-op.
  assert.match(SRC, /const TEX_CLASSES = \['offbeat', 'comp', 'block', 'broken_octave'\];/,
    'the texture class rotation is gone — it is back to a single fixed class');
  assert.match(SRC, /texVary \? TEX_CLASSES\[fnv\(`\$\{name\}\|texclass`\) % TEX_CLASSES\.length\] : 'offbeat'/,
    'the class must be hash-rotated, not fixed');
  assert.match(SRC, /const texPick = texVary/, 'the texture VOICE must rotate too — ti % length gave index 0 every time');
  // and D102's metronome test must reach the newly-reachable options, per
  // D100's "after fixing any list-based rule, immediately measure what the newly
  // reachable options are" — broken_octave brought a 16-onsets-per-bar figure in
  assert.match(SRC, /r29: THE METRONOME TEST REACHES THE TEXTURE TOO/,
    'opening the class rotation without the metronome test lets a gear-change figure in');

  // (2) D77 IS RELATIVE. Measured on the r28 page: the texture was 0.481 mean on
  // ALL 14 songs and LOUDER than the lead on 11; all four of his "too loud"
  // cards are in that 11 and the three where it sat under drew none.
  assert.match(SRC, /const texCap = \(r29\(\) && opts\.supportUnderLead === true\)/,
    'the texture gain cap is gone');
  assert.match(SRC, /Math\.min\(0\.52, Math\.round\(0\.75 \* leadGain \* 100\) \/ 100\)/,
    'the cap must be RELATIVE to the lead, not another absolute number');
  // ...and the same law over the cast, where arrange.js caps at 0.9 ABSOLUTE
  assert.match(SRC, /const castCap = \(l\) => \{/, 'the cast gain cap is gone');
  assert.match(SRC, /if \(!castCapOn \|\| !\(l\.gain > leadGain\)\) return null;/,
    'a cast layer may reach the lead but not exceed it');

  // (3) noteBlind must now be on ALL THREE unjudged-page loops. Importing his
  // r28 notes moved 2 of the 14 songs before any engine change — both by
  // deleting the marcato, the layer his own note praises on one of them.
  assert.ok((SRC.match(/^      noteBlind: true,$/gm) ?? []).length >= 3,
    'the layerstack loop must declare noteBlind too — its notes deleted its own marcato');

  // (4) the no-jitter law must reach the ARRANGER's lead-derived layers
  const ARR = readFileSync(new URL('../src/binder/arrange.js', import.meta.url), 'utf8');
  assert.match(ARR, /\.\.\.\(ctx\.leadOpts\.minNoteLast \? \{ minNoteLast: true \} : \{\}\),/,
    'minNoteLast must reach derived layers, or the lead drops its final 16th and its copies keep it');
});
