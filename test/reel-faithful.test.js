// r32 — "it should be hardcoded more faithfully to the reel"
//
// His whole note, on the r31 reels page:
//   "i feel like the combination wasn't that good. it should be hardcoded more
//    faithfully to the reel in terms of combinations and such (or maybe other
//    added instruments are just affecting it idk)"
//
// The second clause was right and the number was worse than "affecting it":
// 37 of 203 sounding layers on that page came from the reel library (18.2%).
// These tests pin the four mechanisms that answer it, and the one property that
// makes them safe — that none of it can reach judged material.

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bindFigure, bindMelody } from '../src/binder/bind.js';
import { REEL_PROGRESSIONS, LAYER_PATTERNS } from '../src/lib/layer-patterns.js';
import { parseDegrees } from '../src/lib/progressions.js';
import { chordCoreTones } from '../src/binder/theory.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { FIGURATIONS_FOUNDATION as FOUNDATIONS } from '../src/lib/figurations-foundation.js';

const SRC = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
const FIG = {
  name: 'probe', bars: 1, grid: 16,
  onsets: ['0', '1/4', '2/4', '3/4'], figure: ['R', 'R', 'R', 'R'],
  accents: [0.6, 0.5, 0.5, 0.5], legato: false,
};
const bindOpts = { octave: 3, sound: 'piano', gainRange: [0.4, 0.6] };
const rootsPerBar = (r) => {
  const m = new Map();
  for (const n of r.boundMeta.notes) {
    if (!m.has(n.cycle)) m.set(n.cycle, new Set());
    m.get(n.cycle).add(n.note.replace(/\d+$/, ''));
  }
  return [...m.values()].map((s) => s.size);
};

test('r32: chordBeats gives a figure a SUB-BAR harmonic rhythm', () => {
  const harmony = ['Gb', 'Go', 'Abm', 'Db'];
  const flat = bindFigure(FIG, { harmony, barsPerChord: 1, key: 'Gb:major' }, '4/4', bindOpts);
  const sub = bindFigure(FIG, { harmony, chordBeats: [1, 1, 1, 1], key: 'Gb:major' }, '4/4', bindOpts);
  // the legacy path: one chord per bar, so one root sounds in each of four bars
  assert.deepEqual(rootsPerBar(flat), [1, 1, 1, 1]);
  // r32: all four chords inside ONE bar — this is reel 7 as it was actually played
  assert.deepEqual(rootsPerBar(sub), [4]);
});

test('r32: the legacy path is untouched — no chordBeats, identical output', () => {
  // The refactor lifted the chord resolution out of the cycle loop so it could
  // run per onset. If that changed the ORDER in which prevRoot/anchorRoot are
  // mutated, the D76 root walk would move and every judged binding with it.
  const ctx = { harmony: ['Dm9', 'Fmaj7', 'Esus', 'E7'], barsPerChord: 1, key: 'A:minor' };
  const a = bindFigure(FIG, ctx, '4/4', { ...bindOpts, loopRoots: true });
  assert.equal(a.expr, bindFigure(FIG, ctx, '4/4', { ...bindOpts, loopRoots: true }).expr);
  // and a barsPerChord > 1 context still spreads over bars
  const slow = bindFigure(FIG, { ...ctx, barsPerChord: 2 }, '4/4', bindOpts);
  assert.equal(rootsPerBar(slow).length, 8, 'barsPerChord 2 over 4 chords must be 8 bars');
});

test('r32: a sub-bar context COLLAPSES for the melody binders', () => {
  // bindFigure resolves per onset; every other binder reasons in whole bars —
  // phrase logic, cadence landing, masks and section alignment are all
  // bar-quantised. Handing bindMelody reel 4's SEVENTEEN symbols with no
  // collapse would give it a 17-bar harmonic period against a 4-bar grid.
  const p = REEL_PROGRESSIONS.rp_r4_dorian_major_iv;
  const cell = {
    name: 'mel', bars: 1, grid: 16, onsets: ['0', '1/4', '1/2', '3/4'],
    accents: [0.8, 0.6, 0.7, 0.6], density: 4,
  };
  const r = bindMelody(cell, { harmony: p.symbols, chordBeats: p.chordBeats, key: 'B:minor' }, '4/4',
    { style: 'toby-fox', seed: 7, octave: 4, sound: 'piano' });
  const bars = r.boundMeta.period;
  assert.ok(bars % 4 === 0 || 4 % bars === 0,
    `melody period ${bars} does not align with the 4-bar grid — the collapse is not happening`);
  assert.ok(bars <= 8, `melody period ${bars}: it is reading 17 symbols as 17 bars`);
});

test('r32: every reel progression is internally consistent and every symbol RESOLVES', () => {
  const seen = new Set();
  for (const [name, p] of Object.entries(REEL_PROGRESSIONS)) {
    const n = parseDegrees(p.degrees).length;
    assert.equal(n, p.symbols.length, `${name}: degrees(${n}) vs symbols(${p.symbols.length})`);
    assert.equal(n, p.chordBeats.length, `${name}: chordBeats length`);
    assert.ok(p.chordBeats.every((b) => b > 0), `${name}: a chord with no duration`);
    const total = p.chordBeats.reduce((a, b) => a + b, 0);
    assert.equal(total % 4, 0, `${name}: ${total} beats is not a whole number of 4/4 bars`);
    // THE SILENT-FALLBACK TRAP (CLAUDE.md): `Emaj7` does not throw, it renders
    // R-3-5 and the major 7th disappears. r31's rows carried Emaj7, Fmaj7 and
    // Cmaj7 and all three were plain triads on the card that claimed a maj7.
    for (const sym of p.symbols) {
      let tones = [];
      try { tones = [...chordCoreTones(sym)]; } catch { tones = []; }
      assert.ok(tones.length >= 3, `${name}: "${sym}" resolves to ${tones.length} tones — unknown symbol`);
      assert.ok(!/maj7/.test(sym), `${name}: "${sym}" uses the maj7 spelling; the dialect is ^7`);
    }
    assert.ok(!seen.has(p.reel), `two progressions claim reel ${p.reel}`);
    seen.add(p.reel);
  }
  assert.equal(seen.size, 8, 'one progression per reel');
});

test('r32: the reels that change chord sub-bar actually do', () => {
  // The measurement that justifies the whole mechanism. r31 served every one of
  // these as four chords of one bar each.
  const WANT = { 2: 1.5, 3: 2.5, 4: 2.5, 5: 2, 7: 4, 8: 2.5 };
  for (const [, p] of Object.entries(REEL_PROGRESSIONS)) {
    const want = WANT[p.reel];
    if (!want) continue;
    const key = `${String(p.key).split(':')[0]}:${p.family === 'modal' ? 'minor' : p.family}`;
    const r = bindFigure(FIG, { harmony: p.symbols, chordBeats: p.chordBeats, key }, '4/4', bindOpts);
    const per = rootsPerBar(r);
    const avg = per.reduce((a, b) => a + b, 0) / per.length;
    assert.ok(avg >= want, `reel ${p.reel}: ${avg.toFixed(2)} distinct roots per bar, expected >= ${want}`);
    assert.equal(per.length, p.chordBeats.reduce((a, b) => a + b, 0) / 4,
      `reel ${p.reel}: loop length is not the transcribed one`);
  }
});

test('r32: THE ODD-METER DRUM ROW — his "literally just off beat"', () => {
  // `seven_hats_223` is a 7/8 pattern (onsets at sevenths of the bar) and it was
  // selected for 4/4 songs, so its hats lined up with nothing. Its own row says
  // meter_class 7/8; the foundation pool has filtered on meter_class forever and
  // the drum pool never did. D92 makes the engine 4/4-only, so an odd-meter drum
  // row can never be right.
  const odd = Object.entries(RHYTHMS).filter(([, r]) => r.meter_class && r.meter_class !== '4/4');
  assert.ok(odd.length >= 4, 'the odd-meter rows are gone — this test no longer proves anything');
  assert.match(SRC, /const patsMeter = patsRaw\.filter\(\(p\) => \{/,
    'the drum meter filter is gone');
  assert.match(SRC, /return !mc \|\| mc === v\.meter;/,
    'the drum meter filter no longer compares against the song meter');
  // and the pages must carry no odd-grid drum row
  for (const page of ['songs', 'reels']) {
    let html;
    try { html = readFileSync(new URL(`../audition/${page}.html`, import.meta.url), 'utf8'); } catch { continue; }
    const i = html.indexOf('const DATA = ');
    const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
    for (const s of data.songs) {
      for (const m of String(s.solos?._drums ?? '').matchAll(/s\("([^"]+)"\)/g)) {
        const n = m[1].trim().split(/\s+/).length;
        assert.ok(n % 7 !== 0 && n !== 3 && n !== 6,
          `${page}: ${s.name} carries a ${n}-slot drum row in 4/4`);
      }
    }
  }
});

test('r32: the industrial stick pool is no longer a pool of ONE', () => {
  // His card: "also the same 3 stick is just used every construction or what?"
  // — the D119 shape, a third time. `industrial_metal` was the library's only
  // stick row and the generator named it literally.
  const stick = Object.entries(RHYTHMS)
    .filter(([, r]) => (r.sounds ?? []).some((s) => /stick|metal/.test(String(s))));
  assert.ok(stick.length >= 3, `only ${stick.length} stick rows — the pool is still tiny`);
  // r33: his FIFTH stick complaint, and the r32 rotation was measured a hash
  // no-op on the exact card he judged (fnv % 3 = 0 = industrial_metal again).
  // The old row leaves the default rotation on fresh songs; the pool must
  // still rotate over >= 2 designed siblings.
  assert.match(SRC, /const INDUSTRIAL = r33\(\)\s*\n\s*\? \['industrial_stick_backbeat', 'industrial_rivet_tresillo'\]\s*\n\s*: \['industrial_metal', 'industrial_stick_backbeat', 'industrial_rivet_tresillo'\]/,
    'the industrial rotation list is gone or lost its r33 form');
  assert.match(SRC, /INDUSTRIAL\[fnv\(`\$\{name\}\|industrial`\) % INDUSTRIAL\.length\]/,
    'the industrial pick is no longer hash-rotated');
  // and each one must be a legal 4/4 pattern with real accents
  for (const [n, r] of stick) {
    assert.equal(r.meter_class, '4/4', `${n}: not 4/4`);
    assert.equal(r.accents.length, r.onsets.length, `${n}: accent profile length`);
    assert.equal(r.sounds.length, r.onsets.length, `${n}: sounds length`);
    assert.ok(new Set(r.accents).size > 1, `${n}: uniform velocity is a bug (§3.4)`);
  }
});

test('r32: opts.reelFaithful stands the engine cast down, and the gates hold', () => {
  // ONE flag, not twelve — D101's "six flags, seven next round".
  assert.match(SRC, /if \(opts\.reelFaithful\) \{/, 'the reelFaithful normalisation is gone');
  for (const off of ['sparkle: false', 'descant: false', 'counterline: false', 'marcato: false',
    'companion: false', 'funkBass: false', 'breakdown: false', 'textureOff: true',
    'octaveDouble: false', 'voiceCap: 0', 'accVary: false', 'accTravel: false',
    'subBass: false', 'accUnderLead: true']) {
    assert.ok(SRC.includes(off), `reelFaithful no longer sets ${off}`);
  }
  // …and every r32 rule goes through the niche gate, not a bare ruleFresh
  assert.match(SRC, /const r32 = \(round = 32\) => ruleFresh\(round\) && !nicheLane;/,
    'the r32 gate must combine freshness AND his niche-lane exclusion');
  assert.doesNotMatch(SRC, /ruleFresh\(32\)/,
    'an r32 rule uses a bare ruleFresh(32) and would fire on desert/jungle/horror');
  for (const rule of [
    /const subBarOn = r32\(\) && Array\.isArray\(opts\.chordBeats\)/,
    /const bdRoll = !r32\(\) \|\| \(fnv\(`\$\{name\}\|breakdown`\) % 3 === 0\)/,
    /bdGainStr = r32\(\) \? maskString\(bdGain\) : null;/,
    /if \(drums && r32\(\)\) \{/,
  ]) assert.match(SRC, rule, `an r32 rule stopped going through the niche gate: ${rule}`);
});

test('r32: the breakdown FADES and is a minority — six cards, one device', () => {
  //   "when the piano disappears it sounds abrupt because it such a core part"
  //   "the e piano randomly disappearing is abrupt just like the previous songs"
  //   "there doesn't have to be a beat drop in every song ffs"
  // It fired on 12 of 16 songs and cut the whole base mix to silence with a
  // 0/1 mask between one bar and the next.
  assert.match(SRC, /if \(bdBars\[i \+ 1\] === 0\) return 0\.45;/, 'the decay into the drop is gone');
  assert.match(SRC, /if \(bdBars\[i - 1\] === 0\) return 0\.4;/, 'the swell out of the drop is gone');
  assert.match(SRC, /bdGainStr \? `\(\$\{baseMix\}\)\.mul\(gain\("<\$\{bdGainStr\}>"\)\)`/,
    'the mix no longer takes the gain envelope');
  const html = readFileSync(new URL('../audition/reels.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  const withBd = data.songs.filter((s) => Object.keys(s.solos ?? {}).includes('_breakdown_floor'));
  assert.ok(withBd.length / data.songs.length < 0.4,
    `${withBd.length}/${data.songs.length} songs carry a breakdown — still "every song"`);
});

test('r32: the drum kit is capped RELATIVE to the lead, never by a number', () => {
  // "also the drums a bit too loud" / "stick hit also too loud". PRESENCE_GAIN
  // is absolute and never consults the tune — the same defect r29/D119 found in
  // the texture band and in gainFor.
  // r33: the cap is still relative — now to the lead's REALIZED mean (its
  // accent envelope's mean x nominal), with the section curve's own maximum
  // divided out, because both defeated the r32 form (metal at 0.93x the lead
  // with the trim FIRING). The pinned shape is the strengthened one.
  assert.match(SRC, /const cap = Math\.round\(\(0\.72 \* leadRealized\) \/ \(r33\(\) \? secMax : 1\) \* 1000\) \/ 1000;/,
    'the drum cap is no longer relative to the lead');
  const html = readFileSync(new URL('../audition/reels.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  let checked = 0;
  for (const s of data.songs) {
    const d = s.solos?._drums;
    if (!d) continue;
    const peak = Math.max(...[...d.matchAll(/gain\("([^"]+)"\)/g)]
      .flatMap((m) => m[1].split(/\s+/).map(Number)).filter(Number.isFinite), 0);
    const mul = Number((/\.mul\(gain\(([\d.]+)\)\)/.exec(d) ?? [])[1] ?? 1);
    assert.ok(peak * mul <= 0.86, `${s.name}: kit peaks at ${(peak * mul).toFixed(2)}`);
    checked += 1;
  }
  assert.ok(checked >= 4, `only ${checked} drum songs checked`);
});

test('r32: a faithful card plays the REEL\'S instruments, not synth substitutes', () => {
  // r31 set `fullSynth: true` on every card, and the adapter reads
  // `lp.synthSound` when it is on — so the accordion became a square lead, the
  // pizzicato strings a sawtooth and BOTH tubular-bell rows a music box. That
  // last substitution is most of his "the vibraphone is a bit overused in
  // general": gm_music_box was on 15 of 16 songs and no reel row names it.
  const html = readFileSync(new URL('../audition/reels.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  const reelCards = data.songs.filter((s) => s.block === 'FAITHFUL' || s.block === 'CROSSED');
  assert.ok(reelCards.length >= 12, `only ${reelCards.length} reel cards`);
  let boxes = 0;
  for (const s of reelCards) {
    for (const [k, expr] of Object.entries(s.solos ?? {})) {
      if (!k.startsWith('_lp_')) continue;
      if (/gm_music_box/.test(expr)) boxes += 1;
    }
  }
  assert.equal(boxes, 0, `${boxes} reel layers are still on gm_music_box`);
  // and the declared acoustic sounds must be reachable
  const acoustic = Object.values(LAYER_PATTERNS).map((l) => l.sound);
  for (const want of ['gm_accordion', 'gm_pizzicato_strings', 'gm_tubular_bells', 'gm_contrabass']) {
    assert.ok(acoustic.includes(want), `${want} is no longer any row's declared instrument`);
  }
});

test('r32: opts.keyScale — a modal reel is not built in the parallel major', () => {
  // His card on the reel-8 song: "the melody in the glockenspiel doesn't sound
  // on key". Reel 8 is D DORIAN and `family: 'modal'` fell through to 'major',
  // so the song was built in D major: F# and C# against Dm9, Em7 and C^7.
  assert.match(SRC, /const key = `\$\{v\.keyHint\}:\$\{opts\.keyScale \?\? desertScale/,
    'opts.keyScale is gone from the key construction');
  assert.equal(REEL_PROGRESSIONS.rp_r8_dorian_chromatic.key, 'D:dorian');
  const html = readFileSync(new URL('../audition/reels.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  const r8 = data.songs.find((s) => s.sourceReel === 8);
  assert.ok(r8, 'the reel-8 card is gone');
  assert.equal(r8.key, 'D:dorian', `reel 8 built in ${r8.key}`);
});

test('r32: no two cards on the reels page claim the same prompt', () => {
  // "why so many duplicate names? surely you have more scenarios." — 5 of 16
  // songs were happy/menu and 3 were mysterious/space.
  const html = readFileSync(new URL('../audition/reels.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  const seen = new Map();
  for (const s of data.songs) {
    const k = `${s.prompt.emotion}/${s.prompt.environment}`;
    assert.ok(!seen.has(k), `${s.name} and ${seen.get(k)} both claim "${k}"`);
    seen.set(k, s.name);
  }
});

test('r32: FOUND, NOT FIXED — a single-letter form silences its own cast layers', () => {
  // Measured this round while chasing something else: 24 songs across four pages
  // carry a layer that is in the cast list, in the solos AND in the mix string,
  // and is masked off for EVERY bar — `.mask("<0@24>")`. It never sounds.
  //
  // Every single one has `letters: ["A"]`. The layers that vanish are the ones
  // whose coverage is letter-scoped — `alternate_melody`, `melody_backup`,
  // `melody_takeover` (the handoff family, which by law plays on NON-A letters)
  // plus `_octave`, `_companion` and `_reregister` on a few. On a one-letter
  // form their coverage is the empty set, and nothing downstream notices.
  //
  // songs.html has ZERO instances because all 47 of its songs carry a multi-letter
  // form; this only bites the single-section pages.
  //
  // NOT FIXED HERE, deliberately. The audible-no-op fix (drop the part) would
  // rewrite the mix string on 24 songs including keeps for no change in sound,
  // and the INTERESTING fix — give these layers coverage on a one-letter form —
  // changes the music on all 24 and belongs to its own round. It is also the
  // more valuable one: his most-repeated ask is "more layers with their own
  // melody", and here the engine cast exactly that and then silenced it.
  //
  // This test pins the count so the defect cannot grow while it waits.
  const ZERO_MASK = /\.mask\("<(?:0(?:@\d+)?\s*)+>"\)/g;
  const EXPECT = { 'songs.html': 0, 'vanriver.html': 16, 'layerstack.html': 2, 'reels.html': 2 };
  for (const [page, want] of Object.entries(EXPECT)) {
    let html;
    try { html = readFileSync(new URL(`../audition/${page}`, import.meta.url), 'utf8'); } catch { continue; }
    const i = html.indexOf('const DATA = ');
    const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
    const hit = data.songs.filter((s) => ZERO_MASK.test(String(s.mix)) && (ZERO_MASK.lastIndex = 0) === 0);
    assert.ok(hit.length <= want,
      `${page}: ${hit.length} songs advertise a layer that never sounds, was ${want} — `
      + `${hit.map((s) => s.name).join(', ')}`);
    // and they must all be single-letter forms; if a MULTI-letter song ever
    // develops one, the cause is something else and this note is misleading
    for (const s of hit) {
      assert.deepEqual(s.letters, ['A'],
        `${page}/${s.name}: an all-zero mask on a multi-letter form — a different bug`);
    }
  }
});

test('r32: EIGHT foundation classes are pools of ONE — the answer to his "why?"', () => {
  // "boogie again for tense construction — it doesn't fit. why?"
  // Because `construction` declares figClasses ['pulse', 'riff'] and `riff` has
  // exactly one ratified member: fnd_boogie_shuffle IS the riff class. That is
  // D119's pool-of-one at LIBRARY scale, and riff is not alone — this pins the
  // count so the situation is visible rather than rediscovered a fourth time.
  const byClass = {};
  for (const [k, f] of Object.entries(FOUNDATIONS)) {
    if (!f.ratified || f.meter_class !== '4/4') continue;
    (byClass[f.class] ??= []).push(k);
  }
  const singletons = Object.entries(byClass).filter(([, v]) => v.length === 1).map(([c]) => c).sort();
  assert.deepEqual(singletons,
    ['block', 'comp', 'fingerpick', 'guajeo', 'offbeat', 'riff', 'sustain', 'walk'],
    'the singleton foundation classes changed — if one grew, say so in DECISIONS.md; '
    + 'if one SHRANK, a hash rotation somewhere just became a no-op');
  assert.deepEqual(byClass.riff, ['fnd_boogie_shuffle'],
    'riff is no longer a pool of one — re-check every tense lane that declares it');
  // and the swung-figure gate stays UNBUILT on purpose: only one entry carries
  // microtiming, so gating on it would be a name blacklist in a property costume
  const swung = Object.entries(FOUNDATIONS).filter(([, f]) => f.ratified && f.meter_class === '4/4'
    && (f.microtiming ?? []).some((x) => Number(String(x).split('/')[0]) !== 0)).map(([k]) => k);
  assert.deepEqual(swung, ['fnd_boogie_shuffle']);
});

test('r32: the reel adapter must not shadow the song key with the row name', () => {
  // Latent since r31 and only surfaced when a frozen row first used a scale
  // token: `const key = typeof want === 'string' ? want : want.name` shadowed
  // the song's key string, so the frozen-layer harmony context was built as
  // `{ harmony: [...], barsPerChord: 1, key }` with the ROW NAME as its key.
  // Every frozen reel layer was spelling its accidentals against
  // "lp_r7_frozen_bell_tune" instead of "Gb:major" — `keyUsesFlats` tolerates
  // nonsense — and the build threw outright the moment `parseKey` was reached:
  //   Error: unparseable key "lp_r3_catchy_pluck"
  assert.match(SRC, /const lpName = typeof want === 'string' \? want : want\.name;/,
    'the reel adapter is shadowing `key` again');
  assert.doesNotMatch(SRC, /const key = typeof want === 'string' \? want : want\.name;/,
    'the shadowing declaration is back');
  // and a frozen row carrying a scale token must actually build
  const frozen = Object.entries(LAYER_PATTERNS)
    .filter(([, l]) => l.frozen && l.intervals.some((t) => /s[2467]/.test(String(t))));
  assert.ok(frozen.length >= 1,
    'no frozen row uses a scale token any more — this test no longer proves anything');
});
