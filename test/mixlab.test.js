// r43 — THE COMBINATION LAB (audition/mixlab.html) and the grid law his second
// pattern export wrote.
//
// His two notes, and they are the same defect stated twice:
//   cl_cell_neighbor  "I feel like it's not 4/4 - the next chord is always
//                      coming in like an eight note too soon"
//   cl_riff_motor16   "should be aligned by measure - the next chord shouldn't
//                      come in like a half step early"
//
// Both were real. One was a TRIPLET figure written on a sixteenth grid; the
// other was the lower voice of a two-voice texture, shipped without the voice
// that fills its holes. What these tests pin is the pair of properties that
// would have caught each one before he had to.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SERIOUS_FIGURES, SERIOUS_STACKS } from '../src/lib/serious-layers.js';

const frac = (o) => { const [n, d] = String(o).split('/').map(Number); return d ? n / d : Number(o); };
const load = () => {
  const h = readFileSync(new URL('../audition/mixlab.html', import.meta.url), 'utf8');
  const i = h.indexOf('const DATA = ');
  const m = /;\s*\nconst LS = /.exec(h.slice(i));
  return { html: h, data: JSON.parse(h.slice(i + 13, i + m.index)) };
};

test('r43 grid law: every figure onset lands exactly on the grid the row declares', () => {
  // `sr_motor16_dyad` declared grid 16 and the source plays triplet eighths, so
  // five of its eight onsets were written a third of a sixteenth from where the
  // file puts them. Self-consistency cannot catch a wrong grid — but it does
  // catch the next person writing 5.33/16 to paper over one.
  for (const [name, F] of Object.entries(SERIOUS_FIGURES)) {
    const G = F.grid ?? 8;
    for (const o of F.onsets) {
      const k = frac(o) * G;
      assert.ok(Math.abs(k - Math.round(k)) < 1e-9, `${name}: onset ${o} is not a multiple of 1/${G}`);
    }
  }
});

test('r43 rest-anchor law: a quarter-bar rest inside an ostinato is followed by a BEAT, or the row says what fills it', () => {
  // What "not 4/4" measured to: sr_cell_neighbor rests across slots 5-8 and
  // resumes on slot 9 — a sixteenth past beat 3. With nothing filling the hole
  // the ear has no anchor for the second half of the bar.
  //
  // SCOPED TO CLASS `arp`, which is the continuous running ostinato — the layer
  // whose job is to state the grid, and the register where nothing else is
  // filling in. A `pulse` or `block` figure is an ACCENT pattern and holes are
  // what it is made of; scoping this any wider flagged the 3+3+2 tresillo, which
  // is the most legible syncopation in the literature and not a defect. A BASS
  // is exempt for the same reason plus the kit under it.
  for (const [name, F] of Object.entries(SERIOUS_FIGURES)) {
    if (F.class !== 'arp' || F.role === 'bass' || F.legato) continue;
    const ons = F.onsets.map(frac).sort((a, b) => a - b);
    for (let i = 0; i < ons.length; i++) {
      const cur = ons[i];
      const next = i + 1 < ons.length ? ons[i + 1] : F.bars; // the bar turning over
      if (next - cur < 0.25) continue;
      const land = next % 1;
      const onBeat = Math.abs(land * 4 - Math.round(land * 4)) < 1e-9;
      assert.ok(onBeat || F.partial,
        `${name}: rests ${(next - cur).toFixed(3)} of a bar and resumes at ${next} — not a beat, and the row declares no partner (set \`partial\`)`);
    }
  }
  for (const [name, F] of Object.entries(SERIOUS_FIGURES)) {
    if (F.partial) assert.equal(typeof F.partial, 'string', `${name}.partial must name what fills it`);
  }
  // and one row the law does not reach but the measurement does: the inner
  // pedal rests over beat 3, and in its source file another voice strikes there
  // (The Lost One's Weeping, the same bars, the band above). Declared, so the
  // lab labels it as a layer that wants company rather than shipping the hole.
  assert.ok(SERIOUS_FIGURES.sr_ost_inner_pedal.partial, 'sr_ost_inner_pedal rests over beat 3 and must say so');
});

test('r43 the library now has a triplet grid, and the corrected motor is on it', () => {
  const tri = Object.entries(SERIOUS_FIGURES).filter(([, F]) => (F.grid ?? 8) === 12);
  assert.ok(tri.length >= 3, `only ${tri.length} triplet-grid figures — the r43 mine found 84 such cells in the corpora`);
  const T = SERIOUS_FIGURES.sr_motor16_triplet;
  assert.equal(T.grid, 12);
  assert.deepEqual(T.onsets.map(frac).map((x) => Math.round(x * 12)), [0, 3, 4, 5, 6, 8, 10, 11],
    'the measured triplet-eighth positions of The Raising Fighting Spirit bar 8+');
  // and it is NOT expressible on sixteenths — which is the whole finding
  assert.ok(T.onsets.map(frac).some((x) => Math.abs(x * 16 - Math.round(x * 16)) > 1e-9),
    'a triplet figure that happens to fit the sixteenth grid would not have been the bug');
  // the straight row it corrects is still here, so the lab can A/B them
  assert.ok(SERIOUS_FIGURES.sr_motor16_dyad, 'the judged straight version stays until his ear replaces it');
});

test('r43 the complete AoT texture fills every sixteenth its half-voice leaves open', () => {
  const half = SERIOUS_FIGURES.sr_cell_neighbor, full = SERIOUS_FIGURES.sr_cell_neighbor_full;
  assert.equal(full.fills, 'sr_cell_neighbor');
  assert.equal(half.partial, 'sr_cell_neighbor_full');
  assert.equal(full.bars, half.bars);
  const slots = new Set(full.onsets.map((o) => Math.round(frac(o) * 16)));
  for (let i = 0; i < 16 * full.bars; i++) assert.ok(slots.has(i), `the full texture leaves slot ${i} empty`);
  // and the half's onsets are a SUBSET of it — the r42 transcription was exact
  for (const o of half.onsets) assert.ok(slots.has(Math.round(frac(o) * 16)), `the half voice sounds at ${o} and the full one does not`);
});

test('r43 the combination lab: nine beds, one layer set, and every bed plays the loop it names', () => {
  const { data } = load();
  assert.equal(data.beds.length, 9, 'nine beds — "an extensive list with a diversity of serious ones"');
  // THE BUG THIS EXISTS FOR: basePin resolved through a lookup that did not know
  // SERIOUS_LOOPS, so a page could declare a progression and play a hash-picked
  // pop exemplar — silently, with the build green.
  for (const b of data.beds) {
    assert.equal(b.numerals, b.numeralsLine, `${b.name} declares ${b.numeralsLine} and plays ${b.numerals}`);
  }
  const sets = new Set(data.beds.map((b) => b.layers.map((l) => l.id).join(',')));
  assert.equal(sets.size, 1, 'every bed must carry the same layer inventory, or a combination is not comparable across beds');
  // diversity is the point: nine distinct progressions and nine distinct tempos
  assert.equal(new Set(data.beds.map((b) => b.numerals)).size, 9, 'two beds share a progression');
  assert.equal(new Set(data.beds.map((b) => b.bpm)).size, 9, 'two beds share a tempo');
  assert.ok(Math.min(...data.beds.map((b) => b.bpm)) <= 90, 'no serious CALM bed — "energetic" is not the only serious');
});

test('r43 within a group ONE voice, across groups different voices — so a swap is a pattern test', () => {
  const { data } = load();
  const snd = (e) => [...new Set([...e.matchAll(/\.s\("([a-z0-9_]+)"\)/g)].map((m) => m[1]))].join(',');
  for (const b of data.beds) {
    const byGroup = new Map();
    for (const l of b.layers) {
      if (!l.expr.includes('.s(')) continue; // the kit names its sounds per onset
      if (!byGroup.has(l.group)) byGroup.set(l.group, new Set());
      byGroup.get(l.group).add(snd(l.expr));
    }
    for (const [g, voices] of byGroup) {
      // `acc` is the deliberate exception — it IS the voice test (his note, six
      // cards over two rounds) — and `theme` is the tune plus its two doubles,
      // which must differ from it by construction (D145).
      if (g === 'acc' || g === 'theme') { assert.ok(voices.size > 1, `${g} is the voice comparison and must carry more than one voice`); continue; }
      assert.equal(voices.size, 1, `${b.name} group ${g} spans ${voices.size} voices (${[...voices].join(', ')}) — swapping two of its layers would be a timbre test, not a pattern test`);
    }
    // and no two GROUPS share a voice, or a combination is not legible (D102:
    // register and timbre separate a layer, rhythm does not)
    const groupVoice = new Map();
    for (const [g, voices] of byGroup) { if (g === 'acc' || g === 'theme') continue; groupVoice.set(g, [...voices][0]); }
    assert.equal(new Set(groupVoice.values()).size, groupVoice.size, `two groups share a voice: ${JSON.stringify([...groupVoice])}`);
  }
});

test('r43 every layer is separately playable, distinct, and the preset is a real subset', () => {
  const { data } = load();
  for (const b of data.beds) {
    const exprs = new Set();
    for (const l of b.layers) {
      assert.ok(l.expr && l.expr.length > 20, `${b.name}.${l.id} has no expression`);
      assert.ok(l.label && l.what, `${b.name}.${l.id} is unlabelled — a checkbox he cannot read is not a choice`);
      assert.ok(!exprs.has(l.expr), `${b.name}.${l.id} is bit-for-bit another layer`);
      exprs.add(l.expr);
    }
    const ids = new Set(b.layers.map((l) => l.id));
    assert.ok(b.preset.length >= 5, `${b.name} preset is only ${b.preset.length} layers`);
    for (const p of b.preset) assert.ok(ids.has(p), `${b.name} preset names ${p}, which is not a layer`);
  }
  // the stack's ids and the page's layers agree — a layer that fails to cast
  // would silently shrink the inventory rather than error
  const stackIds = SERIOUS_STACKS.sr_stack_mixlab.entries.map((e) => e.id);
  const pageIds = new Set(data.beds[0].layers.map((l) => l.id));
  for (const id of stackIds) assert.ok(pageIds.has(id), `stack slot ${id} never reached the page — it did not cast`);
});

test('r43 the combination lab keeps its three note targets and records the selection', () => {
  const { html } = load();
  // his ask: "leave a note either individually for that song or for the group,
  // and i can do this multiple times"
  for (const s of ['note on THIS COMBINATION', 'note on this GROUP', 'data-lnote']) {
    assert.ok(html.includes(s), `the page lost its ${s} control`);
  }
  // a note that does not record what was playing is unreadable a round later
  assert.ok(/function stamp\(\)/.test(html) && /sel: stamp\(\)/.test(html), 'notes must record the selection');
  // and they accumulate rather than overwrite
  assert.ok(/store\.combo\.push\(rec\)/.test(html) && /bag\[key\]\.push\(rec\)/.test(html), 'a note must never overwrite the previous one');
  // he listens with HQ on, so the page must be explicit about which tier it is
  // — and, since r43, about which voices are on the renderer's own samples
  assert.ok(html.includes('no HQ button here'), 'the page must say why there is no HQ button');
  assert.ok(/renderer’s own samples/.test(html), 'the page must say the strings are the renderer\'s samples');
});

test('r43 the browser tier plays the RENDERER\'s strings, and those names can reach nothing else', async () => {
  // HIS ASK: "can you allow HQ on for all of them because otherwise the strings
  // dont sound good". A combination lab cannot have HQ renders — 64 togglable
  // layers is more mixes than can be pre-rendered — so the browser tier gets the
  // renderer's own VSCO samples instead, de-swelled by the same measurement
  // (src/ingest/swell.js) sfizz uses.
  const { INSTRUMENTS } = await import('../src/lib/instruments.js');
  const { HQ_INSTRUMENTS } = await import('../src/lib/hq-instruments.js');
  const { SAMPLE_PACK } = await import('../src/lib/sample-pack-def.js');
  // r43 SECOND PASS: the four sustains plus the eight STRUCK banks. His note
  // "is it just HQ? ... it's still the same amount of wet" was the HQ tier, and
  // the mechanism was this mapping — every string name rendered through
  // strings-sections.sfz, which declares ampeg_release=0.7, so a 0.107 s
  // sixteenth rang for 0.8 s.
  const STRINGS_SUS = ['vsco_cello', 'vsco_viola', 'vsco_violin', 'vsco_bass'];
  const STRINGS_SHORT = ['vsco_cello_spic', 'vsco_viola_spic', 'vsco_violin_spic', 'vsco_bass_spic',
    'vsco_cello_pizz', 'vsco_viola_pizz', 'vsco_violin_pizz', 'vsco_bass_pizz'];
  const STRINGS = [...STRINGS_SUS, ...STRINGS_SHORT];
  for (const n of STRINGS) {
    assert.ok(SAMPLE_PACK[n], `${n} is not in the sample pack`);
    assert.equal(SAMPLE_PACK[n].kind, 'vsco', `${n} must build from the VSCO folder with a measured de-swell`);
    // THE THING THAT MUST NOT HAPPEN: these are page-scoped. Named gm_cello /
    // gm_viola they would re-timbre every judged song on every page that loads
    // the pack — D91 arriving through the sample tier.
    assert.ok(INSTRUMENTS[n], `${n} has no INSTRUMENTS entry`);
    assert.deepEqual(INSTRUMENTS[n].envOnly, [], `${n} must be envOnly: [] so the planner can never cast it`);
    assert.deepEqual(INSTRUMENTS[n].parts, [], `${n} must claim no planner parts`);
    // ...and they must render through the SAME patch, or the two tiers disagree
    // exactly where this change was trying to make them agree.
    assert.ok(HQ_INSTRUMENTS[n], `${n} has no HQ entry — an unmapped sound falls through to fluidsynth`);
  }
  // ...and the patch each one renders through must MATCH ITS ARTICULATION. This
  // pins the property rather than the filename: a struck bank whose HQ patch
  // holds the note for most of a second is the exact defect he heard, and it
  // would pass a filename check the day someone repoints the mapping.
  const releaseOf = (sfz) => {
    const txt = readFileSync(new URL('../' + sfz, import.meta.url), 'utf8');
    const m = /ampeg_release=([0-9.]+)/.exec(txt);
    assert.ok(m, `${sfz} declares no ampeg_release`);
    return Number(m[1]);
  };
  for (const n of STRINGS_SHORT) {
    const r = releaseOf(HQ_INSTRUMENTS[n].sfz);
    assert.ok(r <= 0.3, `${n} renders through ${HQ_INSTRUMENTS[n].sfz} at ampeg_release=${r} — a struck articulation must not ring (his "it's still the same amount of wet")`);
    assert.equal(SAMPLE_PACK[n].noSwell, true, `${n} must skip the de-swell: it seeks to 80% of peak, which on a struck sample is the attack`);
  }
  // the contrabass leaves the section patch, which has no contrabass regions
  for (const n of ['vsco_bass', 'vsco_bass_spic', 'vsco_bass_pizz']) {
    assert.match(HQ_INSTRUMENTS[n].sfz, /contrabass/, `${n} must render through a contrabass patch, not a stretched cello`);
  }
  // the generator must not be able to name them anywhere but the combination lab
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  // r43 SECOND PASS: TWO lab regions now name these voices — the combination
  // lab's sound map and the cells page's `serious.sounds`, which took the struck
  // banks when his "with HQ off it sounds bad" put the browser tier and the
  // renderer on the same samples. Anywhere else is the D91-through-the-sample-
  // tier mistake this test exists to prevent.
  const block = gen.slice(gen.indexOf('const ML_SOUNDS'), gen.indexOf('const ML_BEDS'))
    + gen.slice(gen.indexOf('if (CELLS_PAGE) {'), gen.indexOf('// r43 — THE COMBINATION LAB'));
  // count ASSIGNMENTS (the quoted sound value), not prose: the page's group
  // blurbs name these voices in their explanatory text, which assigns nothing.
  for (const n of STRINGS) {
    const q = new RegExp(`'${n}'`, 'g');
    const all = (gen.match(q) ?? []).length;
    const inLab = (block.match(q) ?? []).length;
    assert.equal(all, inLab, `${n} is assigned ${all - inLab} time(s) outside the two lab blocks`);
  }
  // the labs must actually REACH the struck banks — the containment check above
  // is satisfied by a name nothing uses
  for (const n of ['vsco_cello_spic', 'vsco_violin_spic', 'vsco_bass_spic']) {
    assert.ok((gen.match(new RegExp(`'${n}'`, 'g')) ?? []).length > 0, `${n} is never assigned — the labs are back on the sustains`);
  }
  // ...and the SUSTAINS stay reachable, because he found a use for them: "this
  // level of reverb sounds good for really ambiant vibes actually and moody days
  // - it does fit a genre". They are reached from the page's articulation
  // switch rather than from a generator assignment, so that is what is pinned.
  const pageJs = readFileSync(new URL('../scripts/audition-mixlab-page.js', import.meta.url), 'utf8');
  assert.match(pageJs, /var ARTICS = /, 'the articulation switch is gone');
  for (const a of ['spic', 'pizz', 'sus']) {
    assert.ok(pageJs.includes(`'${a}'`), `the articulation switch cannot reach ${a}`);
  }
  assert.match(pageJs, /vsco_\(cello\|viola\|violin\|bass\)/, 'the articulation switch does not cover all four string banks');
  assert.match(pageJs, /ambient \/ moody/, 'the wet setting he found a genre for is no longer offered');
});

test('r43 the violin doubles the cello an octave up, on every cell, switchable', () => {
  // HIS ASK: "along with cello there should also be a repeat on violin like an
  // octave up or something because its all strings."
  const { data } = load();
  for (const b of data.beds) {
    const cells = b.layers.filter((l) => l.group === 'cell').map((l) => l.id);
    const vlns = b.layers.filter((l) => l.group === 'vln').map((l) => l.id);
    assert.ok(vlns.length >= 13, `${b.name} has only ${vlns.length} violin doubles`);
    for (const v of vlns) {
      assert.ok(cells.includes(`cell_${v.slice(4)}`), `${v} doubles no cell`);
      // it is its OWN checkbox: a rider whose interval cannot be switched off is
      // not something his ear can rule on
      assert.ok(!b.preset.includes(v), `${v} is on by default — the doubling must be a choice`);
    }
  }
  // the stack declares them an octave above the cells, and quieter (D77)
  const cell = SERIOUS_STACKS.sr_stack_mixlab.entries.find((e) => e.id === 'cell_orig');
  const vln = SERIOUS_STACKS.sr_stack_mixlab.entries.find((e) => e.id === 'vln_orig');
  assert.equal(vln.fig, cell.fig, 'the double must play the same figure');
  assert.equal(vln.octave, cell.octave + 1, 'one octave up');
  assert.ok(vln.gain < cell.gain, 'the doubling must be quieter than the line it doubles');
});

test('r43 no damper pedal: every lab layer stops when written, and the room is off the wash', () => {
  // HIS NOTE: "i feel like there's a damper petal or something because all of
  // them have a lot of reverb and duration."
  //
  // Measured cause: 43 of the 64 layers carried `.room(0.2)` and NO clip, so
  // each note played its sample to the end. With the r43 VSCO banks that sample
  // is a 3-SECOND sustain and a sixteenth at 140bpm is 0.107 s — ~28x too long,
  // ~45 copies of the cell sounding at once.
  const { data } = load();
  for (const b of data.beds) {
    for (const l of b.layers) {
      if (!l.expr.includes('.s(')) continue;           // the kit names sounds per onset
      assert.match(l.expr, /\.clip\(/, `${b.name}.${l.id} has no clip — its sample rings past the note`);
      // r43, his follow-up: "when i hit stop it reverberates for like a few more
      // secs before stopping" — that is the reverb BUS, which hush does not
      // cut. The page ships with no send at all and offers one as a button.
      assert.ok(!/\.room\(/.test(l.expr), `${b.name}.${l.id} carries a reverb send; the lab ships dry`);
      assert.match(l.expr, /\.release\(|\.clip\("/, `${b.name}.${l.id} has no explicit release — note-off is left to the sample's own decay`);
    }
  }
});

test('r43 the written accents survive into the mix', async () => {
  // HIS NOTE: "control dynamics - they're all pretty med-soft dynamics".
  // bindFigure maps an accent linearly into its band, so a band of [0.78g, g]
  // squashed rows written 0.55..1.0 into 0.88g..1.0g — a ratio of 1.14, about
  // 1 dB. Measured before the fix: every cello layer 0.190-0.208.
  const { evaluateSong, hapsByLabel } = await import('../src/harness/evaluate.js');
  const { data } = load();
  const b = data.beds[0];
  for (const id of ['cell_orig', 'bass_push', 'vln_orig', 'riff_gallop']) {
    const l = b.layers.find((x) => x.id === id);
    const ev = await evaluateSong(`setcpm(${b.bpm}/${b.beats})\np: stack(${l.expr})`);
    const gs = hapsByLabel(ev, 0, b.totalBars).get('p').haps.map((h) => h.value.gain ?? 1);
    const lo = Math.min(...gs), hi = Math.max(...gs);
    assert.ok(hi / lo >= 1.3, `${id} realizes ${lo.toFixed(3)}-${hi.toFixed(3)} = ${(hi / lo).toFixed(2)}x — the accent is compressed away`);
    // ...and the CEILING must not have moved: widening the band downward is a
    // dynamics fix, raising it would be a D77 breach wearing a dynamics hat
    assert.ok(hi <= 0.42, `${id} peaks at ${hi.toFixed(3)} — the band's top should not have risen`);
  }
});

test('r43 the stack is balanced by how many layers are ticked', () => {
  // HIS NOTE: "as i combine them it balances so i can actually hear the
  // combinations." Every layer's level is a fixed fraction of the lead, which
  // is right for one arrangement and wrong when the layer count is a checkbox.
  const { html } = load();
  assert.ok(/function balFactor\(n\)/.test(html), 'the page must normalise by the ticked count');
  assert.ok(/Math\.sqrt\(BAL_REF \/ n\)/.test(html), 'equal-power (1/sqrt n), not linear');
  // `.gain()` REPLACES every per-note accent underneath it (r33) — the one
  // thing this must not do is undo the fix in the test above.
  assert.ok(/\.mul\(gain\(/.test(html), 'the balance must multiply, never set, the gain');
  assert.ok(!/\)\.gain\(/.test(html.slice(html.indexOf('function codeNow'), html.indexOf('async function play'))), 'codeNow must not call .gain() on the stack');
  assert.ok(/id="balance"/.test(html), 'he must be able to switch the balance off and hear the raw levels');
  // and the two things he described are knobs, not my guess: the fix had to be
  // made without a browser to hear it in
  assert.ok(/id="room"/.test(html) && /id="notelen"/.test(html), 'reverb and note length must be controls on the page');
});

// r43 SECOND PASS — THE TEST THAT WAS MISSING, and the reason this file needed one.
//
// The suite was GREEN with 20 of 88 notes in the shipped sample pack encoded to
// DIGITAL SILENCE — every one of vsco_violin among them. Everything here pinned
// DECLARATIONS (a name exists, a field says 'vsco', a patch is mapped) and
// nothing ever decoded a byte, so a broken encoder was invisible: `enc()` faded
// on the source timeline while `-ss` seeked the output, and any bank whose
// de-swell offset reached `trimS - fade` faded out before its first surviving
// sample. No error, no warning, and the silence then measured as "this bank
// never decays", which became the round's headline finding until an adversarial
// pass decoded the pack. D85, inside the verification tier itself.
//
// The pack is a gitignored local build artefact, so this skips when it is absent
// rather than failing a fresh clone — stated, not silent.
test('r43 every string bank in the sample pack actually contains audio', () => {
  const packPath = new URL('../audition/sample-pack.js', import.meta.url);
  if (!existsSync(packPath)) { console.log('    (sample-pack.js absent — run scripts/build-sample-pack.mjs; skipped)'); return; }
  const src = readFileSync(packPath, 'utf8');
  const banks = ['vsco_cello', 'vsco_viola', 'vsco_violin', 'vsco_bass',
    'vsco_cello_spic', 'vsco_viola_spic', 'vsco_violin_spic', 'vsco_bass_spic',
    'vsco_cello_pizz', 'vsco_viola_pizz', 'vsco_violin_pizz', 'vsco_bass_pizz'];
  const tmp = join(tmpdir(), 'motif-packtest.mp3');
  let checked = 0;
  for (const name of banks) {
    const k = new RegExp(`"${name}":\\s*\\{`).exec(src);
    assert.ok(k, `${name} is not in the pack`);
    let i = k.index + k[0].length - 1, depth = 0, end = i;
    for (; i < src.length; i++) { if (src[i] === '{') depth++; else if (src[i] === '}') { depth--; if (!depth) { end = i + 1; break; } } }
    const bank = JSON.parse(src.slice(k.index + k[0].length - 1, end));
    const notes = Object.keys(bank);
    assert.ok(notes.length >= 10, `${name} has only ${notes.length} keycentres`);
    // EVERY note, not a sample of them: the silence hit whole banks and parts of
    // others (5 of 13 on the cello), so one spot check would have missed it.
    for (const note of notes) {
      const uri = Array.isArray(bank[note]) ? bank[note][0] : bank[note];
      writeFileSync(tmp, Buffer.from(uri.slice(uri.indexOf(',') + 1), 'base64'));
      const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', tmp, '-ac', '1', '-ar', '22050', '-f', 'f32le', '-'], { maxBuffer: 1 << 26 });
      const a = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
      assert.ok(a.length > 2205, `${name} ${note} decodes to ${(a.length / 22050).toFixed(2)}s`);
      let peak = 0;
      for (const x of a) peak = Math.max(peak, Math.abs(x));
      assert.ok(peak > 1e-3, `${name} ${note} is DIGITALLY SILENT (peak ${peak.toExponential(2)}) — check the fade/seek timeline in enc()`);
      // ...and the audio must start at the ATTACK, not after it: a fade computed
      // on the wrong timeline also shows up as a note that begins already quiet.
      let head = 0;
      for (let j = 0; j < Math.min(a.length, 2205); j++) head = Math.max(head, Math.abs(a[j]));
      assert.ok(head > peak * 0.05, `${name} ${note} is near-silent for its first 100 ms (head ${(head / peak).toFixed(3)} of peak) — the trim is cutting the attack`);
      checked++;
    }
  }
  assert.ok(checked >= 140, `only ${checked} notes checked`);
});
