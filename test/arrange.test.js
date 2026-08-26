// D43/D44: the arranger — which instruments join a song, what each plays, and
// whether the plan carries enough about every choice to be edited later.

import test from 'node:test';
import assert from 'node:assert/strict';
import { planArrangement, renderArrangement, planForm, renderForm, maskFor, PARTS } from '../src/binder/arrange.js';
import { INSTRUMENTS } from '../src/lib/instruments.js';
import { bindMelody, melodyReport } from '../src/binder/bind.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';

const CTX = { harmony: ['Am', 'Bb', 'Am', 'Bb'], barsPerChord: 1, key: 'D:minor' };
const RHYTHM = { name: 'lead', onsets: ['0', '1/4', '1/2', '3/4'], accents: [1, 0.6, 0.85, 0.6], artic: [1, 0.7, 0.9, 0.7] };
const SITUATION = {
  name: 'test_song', song: 'Test', family: 'minor', role: 'cutscene',
  bpm: 112, meter: '4/4', loopBars: 4,
  accDensity: 5, accOctave: 3, leadDensity: 4, palette: INSTRUMENTS,
};
const renderCtx = {
  harmonyContext: CTX, meter: '4/4', style: 'toby-fox',
  leadRhythm: RHYTHM, leadSeed: 42,
  counterRhythmFor: () => ({ name: 'counter', onsets: ['0', '1/2'], accents: [0.8, 0.6] }),
  figureFor: () => ({ name: 'fig', bars: 1, onsets: ['0', '1/2'], figure: ['R', '5'], accents: [0.8, 0.6], octave: 3, legato: false }),
};

test('D43: planning is deterministic — same song, same plan, forever', () => {
  const a = planArrangement(SITUATION);
  const b = planArrangement(SITUATION);
  assert.deepEqual(a, b);
});

test('D43: every layer records what it is and what it contributes (edit-ready)', () => {
  const plan = planArrangement(SITUATION);
  assert.ok(plan.layers.length > 0, 'this situation should cast at least one layer');
  for (const l of plan.layers) {
    for (const field of ['id', 'part', 'instrument', 'instrumentCharacter', 'contributes',
      'lane', 'octave', 'gain', 'derives', 'addsDensity', 'mass', 'seed', 'why']) {
      assert.ok(l[field] != null && l[field] !== '', `layer is missing ${field} — a later edit pass could not reason about it`);
    }
    assert.ok(INSTRUMENTS[l.instrument], `${l.instrument} is not in the palette`);
    assert.ok(PARTS[l.part], `${l.part} is not a declared part`);
    assert.ok(INSTRUMENTS[l.instrument].parts.includes(l.part), `${l.instrument} does not play ${l.part}`);
  }
  assert.ok(plan.notes.length > 0, 'the plan must explain its own reasoning');
});

test('D43/D46: layers never double up on an instrument or a register', () => {
  // The register a layer occupies is its OCTAVE, not the name of the lane that
  // proposed it: an instrument's range can clamp two different lanes onto the
  // same octave, and two lanes can survive as different octaves.
  for (const role of ['boss', 'cutscene', 'town', 'joke', null]) {
    for (const bpm of [70, 112, 175]) {
      const plan = planArrangement({ ...SITUATION, role, bpm, name: `s_${role}_${bpm}` });
      const instruments = plan.layers.map((l) => l.instrument);
      const octaves = plan.layers.map((l) => l.octave);
      assert.equal(new Set(instruments).size, instruments.length, 'an instrument was cast twice');
      assert.equal(new Set(octaves).size, octaves.length, 'two layers claim the same octave');
      for (const l of plan.layers) {
        assert.ok(l.octave !== 5 || plan.base.lead.silenced || l.derives === 'lead',
          `${l.instrument} plays its own line in the piano lead's octave`);
      }
    }
  }
});

test('D46: every layer plays in a register its instrument actually has', () => {
  for (const role of ['boss', 'cutscene', 'town', 'joke', 'character', 'overworld', null]) {
    for (const bpm of [70, 112, 175]) {
      for (const accOctave of [2, 3, 4]) {
        const plan = planArrangement({ ...SITUATION, role, bpm, accOctave, name: `r_${role}_${bpm}_${accOctave}` });
        for (const l of plan.layers) {
          const [lo, hi] = INSTRUMENTS[l.instrument].range;
          assert.ok(l.octave >= lo && l.octave <= hi,
            `${l.instrument} was put at octave ${l.octave}, outside its ${lo}-${hi} range`);
          assert.equal(l.range.join('-'), `${lo}-${hi}`, 'the plan must record the range it clamped to');
          assert.ok(l.gain > 0 && l.gain <= 0.9, `${l.id} gain ${l.gain} is out of bounds`);
        }
      }
    }
  }
  // the specific ear complaint: a music box may never be handed the top octave
  const boxes = [];
  for (let i = 0; i < 400; i++) {
    const plan = planArrangement({ ...SITUATION, role: 'cutscene', name: `box_${i}` });
    for (const l of plan.layers) if (l.instrument === 'gm_music_box') boxes.push(l.octave);
  }
  assert.ok(boxes.length > 0, 'the music box should be cast somewhere in 400 cutscenes');
  assert.ok(Math.max(...boxes) <= 5, `a music box was placed at octave ${Math.max(...boxes)} — that is the high-pitched ring`);
});

test('D46: a role does not arrange every one of its songs identically', () => {
  // one fixed slate per role made harmony_support 54% of the whole corpus; the
  // slate is picked from the song's own name, so a role spreads across its
  // options without anything being sampled at random
  const seen = new Set();
  for (let i = 0; i < 60; i++) {
    const plan = planArrangement({ ...SITUATION, role: 'cutscene', name: `v_${i}` });
    seen.add(plan.layers.map((l) => l.part).join('+'));
  }
  assert.ok(seen.size >= 3, `60 cutscenes produced only ${seen.size} distinct part combinations`);
  // and it is still the same plan every time for the same song
  assert.deepEqual(planArrangement({ ...SITUATION, role: 'cutscene', name: 'v_7' }),
    planArrangement({ ...SITUATION, role: 'cutscene', name: 'v_7' }));
});

test('D43: a lane may only be shared with the piano when the touch contrasts', () => {
  for (const bpm of [70, 112, 175]) {
    for (const accOctave of [2, 3, 4]) {
      const plan = planArrangement({ ...SITUATION, bpm, accOctave, name: `sh_${bpm}_${accOctave}` });
      for (const l of plan.layers.filter((x) => x.sharesLaneWithPiano)) {
        assert.ok(l.attack === 'slow' || l.sustain === 'long',
          `${l.instrument} shares the piano's lane with a ${l.attack} attack and ${l.sustain} sustain — that is mud`);
      }
    }
  }
});

test('D43: a full bar buys sustain and doubling, never a new busy line', () => {
  // piano already spending everything: parts that introduce new onsets must not
  // be cast, but zero-onset parts still may be
  const crowded = planArrangement({ ...SITUATION, accDensity: 10, leadDensity: 9, name: 'crowded' });
  for (const l of crowded.layers) {
    assert.equal(l.addsDensity, 0, `${l.part} adds ${l.addsDensity} onsets/bar into a full bar`);
  }
  // and a sparse one is allowed the busier parts
  const sparse = planArrangement({ ...SITUATION, accDensity: 1, leadDensity: 3, name: 'sparse' });
  assert.ok(sparse.headroomStart > crowded.headroomStart);
});

test('D43: the whole arrangement renders green through the harness', async () => {
  for (const role of ['boss', 'cutscene', 'town']) {
    const plan = planArrangement({ ...SITUATION, role, name: `r_${role}` });
    const { layers, warnings } = renderArrangement(plan, renderCtx);
    assert.deepEqual(warnings.filter((w) => /failed to render/.test(w)), []);
    assert.equal(layers.length, plan.layers.length);
    for (const l of layers) {
      const ev = await evaluateSong(`setcpm(110/4)\np: ${l.expr}`);
      const h = hapsByLabel(ev, 0, 8).get('p');
      assert.ok(h && !h.error && h.haps.length > 0, `${l.id} produced no haps`);
      assert.ok(l.expr.includes(`.s("${l.instrument}")`), `${l.id} did not reach its instrument`);
    }
  }
});

test('D43: a sustained pad never invents a third the chord does not have', async () => {
  // sus chords have no third; a pad that supplied one would contradict the piano
  const plan = planArrangement({ ...SITUATION, role: 'credits', name: 'sus_test' });
  const pad = plan.layers.find((l) => l.derives === 'chords');
  if (!pad) return;
  const { warnings } = renderArrangement(plan, {
    ...renderCtx, harmonyContext: { harmony: ['C2', 'Csus'], barsPerChord: 1, key: 'C:major' },
  });
  assert.deepEqual(warnings.filter((w) => /carries no 3/.test(w)), [],
    'the pad asked a thirdless chord for a third');
});

test('D44: repeat policy — a restatement may repeat exactly, vary, or fall silent', () => {
  const bars = (bm) => Array.from({ length: bm.period }, (_, c) =>
    bm.notes.filter((n) => n.cycle === c).map((n) => n.note).join(' '));

  const vary = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'vary' }).boundMeta;
  const exact = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'exact' }).boundMeta;
  const rest = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'rest' }).boundMeta;

  const [vb, eb, rb] = [bars(vary), bars(exact), bars(rest)];
  // exact: the restatement is the statement, bar for bar — EXCEPT the final
  // cadence, which still resolves (an antecedent asks, the last consequent
  // answers; that is D37's phrase rule and it outranks the repeat policy)
  assert.deepEqual(eb.slice(4, 7), eb.slice(0, 3));
  assert.notEqual(eb[7], eb[3], 'the last cadence should close where the first stayed open');
  // vary: the answer bar is what changes on restatement
  assert.notEqual(vb[5], vb[1]);
  assert.equal(vb[4], vb[0], 'motif bars restate exactly even under vary');
  // rest: the repeated answer bar is genuinely silent
  assert.equal(rb[5], '');
  assert.ok(rb[4].length > 0 && rb[6].length > 0, 'only the answer bar rests');
  assert.equal(melodyReport(rest).offKeyUnforced, 0);
});

test('D44: the repeat policy is derived deterministically and reported', () => {
  const a = bindMelody(RHYTHM, CTX, '4/4', { seed: 21 });
  const b = bindMelody(RHYTHM, CTX, '4/4', { seed: 21 });
  assert.equal(a.expr, b.expr);
  assert.ok(['vary', 'exact', 'rest'].includes(a.boundMeta.phrase.repeat));
  // a two-bar phrase is a riff: it must never mutate
  const short = bindMelody(RHYTHM, { harmony: ['Am', 'Bb'], barsPerChord: 1, key: 'D:minor' }, '4/4', { seed: 5 });
  assert.equal(short.boundMeta.phrase.repeat, 'exact');
});

test('D44: a silent bar still evaluates and still holds the guard', async () => {
  const { expr, boundMeta } = bindMelody(RHYTHM, CTX, '4/4', { seed: 7, repeat: 'rest', sound: 'piano' });
  assert.equal(melodyReport(boundMeta).anchorViolations, 0);
  const ev = await evaluateSong(`setcpm(110/4)\np: ${expr}`);
  const h = hapsByLabel(ev, 0, boundMeta.period).get('p');
  assert.ok(h && !h.error && h.haps.length > 0);
});

// ---------------------------------------------------------------------------
// D47: the form — who is playing WHEN.
// ---------------------------------------------------------------------------

const ROLES = ['boss', 'battle', 'cutscene', 'character', 'town', 'overworld',
  'credits', 'ending', 'shop', 'joke', 'menu', 'diegetic', 'chase', null];

/** every (role × bpm × density) plan+form this suite reasons about */
function everyForm() {
  const out = [];
  for (const role of ROLES) {
    for (const bpm of [70, 112, 175]) {
      for (const [accDensity, leadDensity] of [[1, 3], [5, 4], [10, 9]]) {
        const name = `f_${role}_${bpm}_${accDensity}`;
        const plan = planArrangement({ ...SITUATION, role, bpm, accDensity, leadDensity, name, leadPeriod: 8 });
        out.push({ plan, form: planForm(plan) });
      }
    }
  }
  return out;
}

test('D47: once the tune has arrived, something is always carrying it', () => {
  // Ethan's round-10 note: "sometimes the lead melody just stops". A takeover
  // is a HANDOFF at a section boundary; there is no such thing as a section
  // where the melody has been and then simply is not.
  for (const { form } of everyForm()) {
    let arrived = false;
    for (const s of form.sections) {
      if (s.lead !== 'none') { arrived = true; continue; }
      const isTail = s.index === form.sections.length - 1;
      assert.ok(!arrived || (isTail && s.archetype === 'tag'),
        `section ${s.index} (${s.archetype}) has no lead after the tune had already arrived`);
    }
    assert.ok(form.sections.some((s) => s.lead !== 'none'), 'a form with no melody in it at all');
  }
});

test('D47: a voice cast to take the tune is given the tune, not stacked on the piano', () => {
  for (const { plan, form } of everyForm()) {
    for (const l of plan.layers.filter((x) => x.canLead)) {
      const leads = form.sections.filter((s) => s.leadLayerId === l.id);
      assert.ok(leads.length > 0, `${l.instrument} was cast as a takeover and never took over`);
      // and where it is sounding, it IS the lead — otherwise it is doubling the
      // piano's own line in unison, which is a different part entirely
      for (const s of form.sections) {
        if (!s.active.includes(l.id)) continue;
        assert.equal(s.leadLayerId, l.id,
          `${l.instrument} sounds in section ${s.index} without holding the tune — that is a doubling, not a takeover`);
      }
      // the piano must be leading somewhere too: a handoff needs a hand-off-er
      assert.ok(form.sections.some((s) => s.pianoLead),
        `${l.instrument} takes over a song the piano never led — that is a swap, not a handoff`);
    }
  }
});

test('D47: no section sounds the same as the one before it', () => {
  const state = (s) => `${[...s.active].sort().join(',')}|${s.lead}`;
  let dupes = 0, total = 0;
  for (const { form } of everyForm()) {
    for (let i = 1; i < form.sections.length; i++) {
      total++;
      if (state(form.sections[i]) === state(form.sections[i - 1])) dupes++;
    }
  }
  // not zero — a roster of one has only so many states to offer — but a form
  // whose sections mostly repeat is not a form
  assert.ok(dupes / total < 0.12, `${dupes}/${total} section transitions change nothing`);
});

test('D47: no section exceeds what the song can sound at once', () => {
  for (const { plan, form } of everyForm()) {
    for (const s of form.sections) {
      // the peak is allowed past the standing ceiling, and only the peak
      const ceiling = plan.massAtOnce * (/^full/.test(s.archetype) ? 1.35 : 1) + 1e-9;
      const mass = s.active
        .map((id) => plan.layers.find((l) => l.id === id))
        .filter((l) => l && !l.canLead)
        .reduce((a, l) => a + l.mass, 0);
      assert.ok(mass <= ceiling,
        `section ${s.index} (${s.archetype}) sounds ${mass.toFixed(2)} of mass against a ${ceiling.toFixed(2)} ceiling`);
    }
  }
});

test('D47: every voice on the roster is heard somewhere', () => {
  for (const { plan, form } of everyForm()) {
    const heard = new Set(form.sections.flatMap((s) => s.active));
    for (const l of plan.layers) {
      assert.ok(heard.has(l.id), `${l.instrument} was cast and never plays — dead weight in the plan`);
    }
  }
});

test('D47: the form is deterministic and its sections tile the song exactly', () => {
  const plan = planArrangement({ ...SITUATION, leadPeriod: 8, name: 'tile' });
  assert.deepEqual(planForm(plan), planForm(plan));
  const f = planForm(plan);
  let bar = 0;
  for (const s of f.sections) {
    assert.equal(s.startBar, bar, `section ${s.index} does not start where the previous one ended`);
    bar += s.bars;
  }
  assert.equal(bar, f.totalBars);
  // a section holds whole phrases of everything inside it, or a masked layer
  // would be cut off mid-phrase when the section ends
  assert.equal(f.sectionBars % plan.loopBars, 0);
  assert.equal(f.sectionBars % plan.leadPeriod, 0);
});

test('D47: masks gate the right bars, and a full-time layer carries no mask', async () => {
  const plan = planArrangement({ ...SITUATION, leadPeriod: 8, name: 'mask_test' });
  const form = planForm(plan);
  const { layers, warnings } = renderArrangement(plan, renderCtx);
  assert.deepEqual(warnings.filter((w) => /failed to render/.test(w)), []);
  const shaped = renderForm(layers, 'note("c5").s("piano")', form);
  for (const l of shaped.layers) {
    const onBars = form.sections.filter((s) => s.active.includes(l.id)).length * form.sectionBars;
    if (onBars === form.totalBars) {
      assert.ok(!/\.mask\(/.test(l.formExpr), `${l.instrument} plays throughout and should carry no mask`);
      continue;
    }
    assert.match(l.formExpr, /\.mask\("<[01@ \d]+>"\)/, `${l.instrument} needs a mask and has none`);
    // and it really is silent where the form says so
    const ev = await evaluateSong(`setcpm(110/4)\np: ${l.formExpr}`);
    const h = hapsByLabel(ev, 0, form.totalBars).get('p');
    assert.ok(h && !h.error, `${l.id}: ${h && h.error}`);
    for (const s of form.sections) {
      const inSec = h.haps.filter((x) => x.whole.begin >= s.startBar && x.whole.begin < s.startBar + s.bars);
      if (s.active.includes(l.id)) assert.ok(inSec.length > 0, `${l.instrument} is silent in section ${s.index} but the form says it plays`);
      else assert.equal(inSec.length, 0, `${l.instrument} sounds in section ${s.index} but the form says it does not`);
    }
  }
});

test('D47: the piano lead is masked to the sections the piano actually leads', async () => {
  // find a plan whose form really does hand the tune over, and prove the two
  // leads interlock: exactly one voice has the melody in every section
  const cases = everyForm().filter(({ form }) => form.sections.some((s) => s.leadLayerId));
  assert.ok(cases.length > 0, 'no situation in the grid ever hands the melody over');
  const { plan, form } = cases[0];
  const { layers } = renderArrangement(plan, renderCtx);
  const shaped = renderForm(layers, 'note("c5").s("piano").gain(0.85)', form);
  assert.match(shaped.lead, /\.mask\(/, 'the piano lead should stand down where a layer takes over');
  const ev = await evaluateSong(`setcpm(110/4)\np: ${shaped.lead}`);
  const h = hapsByLabel(ev, 0, form.totalBars).get('p');
  for (const s of form.sections) {
    const inSec = h.haps.filter((x) => x.whole.begin >= s.startBar && x.whole.begin < s.startBar + s.bars);
    assert.equal(inSec.length > 0, s.pianoLead, `piano lead disagrees with the form in section ${s.index}`);
  }
});

test('D47: the arrangement rises — a form is a contour, not a plateau', () => {
  // measured as: the peak section sounds strictly more than the first one
  let rose = 0, flat = 0;
  for (const { plan, form } of everyForm()) {
    if (plan.layers.length < 2) continue;
    const counts = form.sections.map((s) => s.active.length);
    if (Math.max(...counts) > counts[0]) rose++; else flat++;
  }
  assert.ok(rose > flat * 6, `${flat} of ${rose + flat} forms never grow past their opening section`);
});

// ---------------------------------------------------------------------------
// D59: dialogue (call & response as lead-lane turn-taking) and the letter form
// (which MELODY is playing when), plus the placed harmony-variation flag.
// ---------------------------------------------------------------------------

import { planMelodyForm, renderLetterLead, maskBarsFor, pianoLeadBars, LETTER_SCHEMES } from '../src/binder/arrange.js';

/** the probe grid, widened until it produces at least one dialogue section */
function dialogueCases() {
  const out = [];
  for (const role of ['town', 'cutscene', 'character', 'shop', 'diegetic', 'overworld']) {
    for (let i = 0; i < 12; i++) {
      const plan = planArrangement({ ...SITUATION, role, name: `d_${role}_${i}` });
      const form = planForm(plan);
      const sec = form.sections.find((s) => s.dialogue);
      if (sec) out.push({ plan, form, sec });
    }
  }
  return out;
}

test('D59: a dialogue is turn-taking — the two voices NEVER sound the lead together', () => {
  // The video-corpus doctrine (D57, video 10): call & response is between
  // instruments, accordion asks two bars, whistle answers two — they take
  // turns owning the lead lane. Simultaneity would be a doubling, not a
  // dialogue.
  const cases = dialogueCases();
  assert.ok(cases.length > 0, 'no probe situation ever produced a dialogue section');
  for (const { form, sec } of cases) {
    const piano = pianoLeadBars(form);
    const answer = maskBarsFor(sec.dialogue.answerId, form);
    for (let b = sec.startBar; b < sec.startBar + sec.bars; b++) {
      assert.ok(!(piano[b] && answer[b]), `bar ${b}: both voices hold the lead at once`);
      assert.ok(piano[b] || answer[b], `bar ${b}: nobody holds the lead in a dialogue section`);
    }
    // the alternation actually alternates: both voices get bars
    const secPiano = piano.slice(sec.startBar, sec.startBar + sec.bars);
    const secAnswer = answer.slice(sec.startBar, sec.startBar + sec.bars);
    assert.ok(secPiano.some(Boolean) && secAnswer.some(Boolean), 'a dialogue where one voice never speaks');
    // and the piano CALLS first — the answer is an answer
    assert.equal(secPiano[0], 1, 'the piano asks first');
  }
});

test('D59: dialogue degrades to answer when nobody can answer or the section is too short', () => {
  // planForm degrades shapes with no canLead layer; simulate by checking that
  // every dialogue section that exists has a real answering layer
  for (const { plan, form } of everyForm()) {
    for (const s of form.sections) {
      if (!s.dialogue) continue;
      const layer = plan.layers.find((l) => l.id === s.dialogue.answerId);
      assert.ok(layer && layer.canLead, 'a dialogue with an answerer that cannot lead');
      assert.ok(s.bars >= 2 * s.dialogue.phraseBars, 'a dialogue too short to hold one call and one answer');
    }
  }
});

test('D59: letters name melodies — tune sections lettered, reprises flagged, deterministic', () => {
  for (const { form } of everyForm()) {
    const a = planMelodyForm(form, { name: 'x' });
    const b = planMelodyForm(form, { name: 'x' });
    assert.deepEqual(a, b, 'the letter form must be deterministic');
    const seen = new Set();
    for (const s of a.sections) {
      const sec = form.sections.find((x) => x.index === s.index);
      assert.equal(s.letter != null, sec.lead !== 'none', 'letters exactly on the tune sections');
      if (s.letter == null) continue;
      assert.equal(s.reprise, seen.has(s.letter), 'reprise = this letter has been heard before');
      seen.add(s.letter);
    }
  }
});

test('D59: the harmony varies at the LAST REPRISE, and never in a no-reprise scheme', () => {
  const form = everyForm().find(({ form: f }) => f.sections.filter((s) => s.lead !== 'none').length >= 4).form;
  const abab = planMelodyForm(form, { name: 'x', scheme: 'ABAB' });
  const lastTune = abab.sections.filter((s) => s.letter != null).at(-1);
  assert.equal(abab.varySection, lastTune.index, 'ABAB: the final B restates — it takes the treat');
  assert.ok(abab.sections.find((s) => s.index === abab.varySection).varyHarmony);
  const abcd = planMelodyForm(form, { name: 'x', scheme: 'ABCD' });
  assert.equal(abcd.varySection, null, 'ABCD restates nothing, so nothing is varied');
  assert.ok(abcd.sections.every((s) => !s.varyHarmony));
});

test('D59: renderLetterLead partitions the piano-lead bars between the letters', async () => {
  const { form } = everyForm().find(({ form: f }) => f.sections.filter((s) => s.lead !== 'none').length >= 4);
  const mf = planMelodyForm(form, { name: 'x', scheme: 'ABAB' });
  const calls = [];
  const r = renderLetterLead(form, mf, (L) => {
    calls.push(L);
    return `note("${L === 'A' ? 'c5' : 'e5'}").s("piano")`;
  });
  assert.deepEqual([...new Set(calls)].sort(), ['A', 'B'], 'one bind per letter, not per section — the same letter recurs as the SAME melody');
  assert.ok(r.lead && r.lead.includes('stack('), 'two letters stack');
  // every piano-owned bar belongs to exactly one letter
  const piano = pianoLeadBars(form);
  const ev = await evaluateSong(`setcpm(110/4)\np: ${r.lead}`);
  const h = hapsByLabel(ev, 0, form.totalBars).get('p');
  assert.ok(!h.error, h.error);
  for (let b = 0; b < piano.length; b++) {
    const sounding = h.haps.filter((x) => x.whole.begin >= b && x.whole.begin < b + 1);
    assert.equal(sounding.length > 0, Boolean(piano[b]), `bar ${b}: letter lead vs piano-lead bars disagree`);
    assert.ok(new Set(sounding.map((x) => x.value.note ?? x.value.n)).size <= 1, `bar ${b}: two letters sound at once`);
  }
});

test('D59: every letter scheme table entry is well-formed', () => {
  for (const [k, pool] of Object.entries(LETTER_SCHEMES)) {
    for (const scheme of pool) {
      assert.ok(scheme.length === Number(k), `${scheme} is not length ${k}`);
      assert.ok(/^[A-Z]+$/.test(scheme));
      assert.ok(scheme[0] === 'A', `${scheme}: the first melody stated is A by convention`);
    }
  }
});
