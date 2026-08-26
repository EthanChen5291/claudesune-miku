// D57: the hand-transcribed video pack. These entries have NO MIDI behind them
// (transcribed by eye from igexport-*.mp4), so the tests defend the honesty of
// the record rather than agreement with a source that cannot be checked.

import test from 'node:test';
import assert from 'node:assert/strict';
import { PROGRESSIONS_VIDEOS } from '../src/lib/progressions-videos.js';
import { FIGURATIONS_VIDEOS } from '../src/lib/figurations-videos.js';
import { ALL_PROGRESSIONS, parseDegrees } from '../src/lib/progressions.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindFigure } from '../src/binder/bind.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import { readdirSync } from 'node:fs';

// the video files actually sitting in the repo root — an entry may only cite one
const videoFiles = new Set(readdirSync(new URL('../', import.meta.url))
  .filter((f) => /\.(mp4|MP4)$/.test(f)));

test('D57: every video entry is honest about what it is', () => {
  const entries = Object.entries(PROGRESSIONS_VIDEOS);
  assert.ok(entries.length >= 15, `only ${entries.length} entries`);
  for (const [name, e] of entries) {
    // no MIDI behind these -> the coverage claim must be null, never a number
    assert.equal(e.coverage, null, `${name} claims a coverage no labeller computed`);
    // two provenances live in the pack: eye-reads of the videos, and cells
    // Ethan carved out of them by ear (D60) — the latter must say so and must
    // not carry the sourceEndorsed flag (he proposed them; the videos did not)
    if (e.provenance === 'ear-derived') {
      assert.equal(e.earProposed, true, `${name}: ear-derived without earProposed`);
      assert.notEqual(e.sourceEndorsed, true, `${name}: an ear-derived cell is not what the video endorsed`);
    } else if (e.provenance === 'video+audio-transcribed') {
      // D64: read twice — labels by eye AND pitches out of the audio. The claim
      // that the two agreed is what earns the stronger provenance, so it must be
      // stated, and the measured voicings must be there chord-for-chord.
      assert.equal(e.audioConfirmed, true, `${name}: claims audio confirmation without the flag`);
      assert.ok(Array.isArray(e.observedVoicing)
        && e.observedVoicing.length === parseDegrees(e.degrees).length,
        `${name}: audio-confirmed but no measured voicing per chord`);
      for (const v of e.observedVoicing) {
        assert.ok(Array.isArray(v) && v.length >= 3, `${name}: a voicing of under 3 notes is not a chord`);
        for (const n of v) assert.match(n, /^[A-G][#b]?[0-8]$/, `${name}: "${n}" is not a pitch`);
      }
      // Ethan's blanket "i am a fan of how all the songs sound" was said about
      // the twelve igexport videos. This is a thirteenth source he added later;
      // he approved ADDING it, which is not the same as endorsing how it sounds.
      assert.notEqual(e.sourceEndorsed, true, `${name}: the standing endorsement does not reach a later source`);
    } else {
      assert.equal(e.provenance, 'video-transcribed', name);
      // Ethan endorsed the SOURCES; that must not leak into ratification (A6.1).
      // D68: the blanket was said about the ORIGINAL TWELVE igexport files —
      // batch-2 sources (added 2026-08-26) are not covered by it (the D64
      // rule: a standing endorsement does not reach a later source), so their
      // entries must NOT claim it.
      const BATCH1 = new Set([
        'igexport-DRIEseyk294.mp4', 'igexport-DXNX1y0k7-W.mp4', 'igexport-DYhxb2VTGbm.mp4',
        'igexport-DYsBsQ-z8cm.mp4', 'igexport-Da-2jFHBTYT.mp4', 'igexport-Da7g_WLKDhY.mp4',
        'igexport-Db04jWHop4_.mp4', 'igexport-DbbI6uyTKD3.mp4', 'igexport-Dbn9IrqTPAI.mp4',
        'igexport-DcPlz2QhN4M.mp4', 'igexport-DcRXC2RTLZB.mp4', 'igexport-DcbbGuNCfGv.mp4',
      ]);
      assert.equal(e.sourceEndorsed, BATCH1.has(e.source),
        `${name}: sourceEndorsed must be ${BATCH1.has(e.source)} — the blanket covers exactly the original twelve`);
    }
    // sourceEndorsed must not pre-ratify — but the D51 overlay DOES ratify
    // where Ethan's ear kept the card (the 2026-08-26 pass kept 12 of these)
    assert.equal(e.ratified, e.verdict === 'keep', `${name}: ratified without a keep verdict`);
    assert.equal(e.needsEar, e.verdict == null, name);
    // sections must say where they came from and how long they ran
    assert.ok(e.song && e.section && e.sectionBars > 0, `${name} has no section identity`);
    // every entry names the file it was read from; the pack is igexport-* plus
    // the D64 screen recording, so the check is that the file EXISTS in the repo
    // root, not that it matches one naming scheme
    assert.ok(e.source && videoFiles.has(e.source), `${name} does not name a video in the repo root`);
    // the display labels survive even where the grammar simplified them
    assert.ok(Array.isArray(e.voicedAs) && e.voicedAs.length === parseDegrees(e.degrees).length,
      `${name}: voicedAs does not match the degrees chord-for-chord`);
  }
});

test('D57: the pack is registered, parseable, and renders in both keys', () => {
  for (const [name, e] of Object.entries(PROGRESSIONS_VIDEOS)) {
    assert.ok(ALL_PROGRESSIONS[name], `${name} not in the registry`);
    assert.equal(ALL_PROGRESSIONS[name].pack, 'igvideo');
    const cyc = parseDegrees(e.degrees);
    assert.ok(cyc.length >= 3, `${name}: a section of ${cyc.length} chords is a pair, not a section`);
    for (const key of ['C:major', 'C:minor']) {
      const syms = renderProgression(e, key);
      assert.equal(syms.length, cyc.length);
      for (const s of syms) assert.match(s, /^[A-G][#b]?/);
    }
  }
});

test('D57: sections of one song are linked so they can be recombined', () => {
  // Ethan: "note that they can be mixed" — mixing needs the link
  const bySong = new Map();
  for (const [name, e] of Object.entries(PROGRESSIONS_VIDEOS)) {
    bySong.set(e.song, (bySong.get(e.song) ?? 0) + 1);
  }
  const multi = [...bySong.values()].filter((n) => n > 1).length;
  assert.ok(multi >= 4, `only ${multi} songs carry multiple sections — the section cutting was lost`);
});

test('D57: flourishes are placed events, and they play', async () => {
  for (const [name, e] of Object.entries(FIGURATIONS_VIDEOS)) {
    // a flourish without a stated placement is just another loop — the whole
    // point of the record is WHERE and WHY ("this shouldnt be included in the
    // chord progression but should be noted ... where they placed it")
    assert.equal(e.role, 'flourish', name);
    assert.ok(e.placement && e.function, `${name} does not say where it goes or what it is for`);
    assert.ok(e.seen > 0 && e.songs.length, name);
    const ctx = { harmony: ['Bbo7', 'Am7', 'F^7', 'G7'], barsPerChord: 1, key: 'C:major' };
    const r = bindFigure(e, ctx, '4/4', { sound: 'piano' });
    const ev = await evaluateSong(`setcpm(110/4)\np: ${r.expr}`);
    const haps = hapsByLabel(ev, 0, 4).get('p');
    assert.ok(haps && !haps.error && haps.haps.length > 0, `${name} does not play: ${haps?.error ?? 'empty'}`);
  }
});

test('D57: the dim run is all chord tones — fast but consonant, as observed', async () => {
  // The reason the run works at speed is that every note is a member of the o7.
  const e = FIGURATIONS_VIDEOS.vid_run_dim_ascent;
  for (const tok of e.figure) assert.match(tok, /^(R|3|5|7)\+*$/, `${tok} is not a chord member`);
  // ascending throughout, spanning > 1.5 octaves as seen in the video
  const ctx = { harmony: ['Bo7'], barsPerChord: 1, key: 'C:major' };
  const r = bindFigure(e, ctx, '4/4', { sound: 'piano' });
  const midis = r.boundMeta.notes.map((n) => n.midi);
  for (let i = 1; i < midis.length; i++) assert.ok(midis[i] > midis[i - 1], 'the run must ascend');
  assert.ok(midis.at(-1) - midis[0] >= 18, `span ${midis.at(-1) - midis[0]} semitones — the video shows over 1.5 octaves`);
});
