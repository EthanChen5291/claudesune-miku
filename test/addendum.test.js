// Tests for the design-addendum amendments (A1.2, A2, A1.3, A5.2/A5.4,
// interval-grammar §3/§4).

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { compile } from '../src/compiler/compile.js';
import { makeBindFn } from '../src/binder/adapter.js';
import { bind } from '../src/binder/bind.js';
import { checkEdit, verifySong } from '../src/harness/index.js';
import { parseConstraint } from '../src/harness/assertions.js';
import { RHYTHMS } from '../src/lib/rhythms.js';

const spec = JSON.parse(readFileSync(new URL('./fixtures/toy.spec.json', import.meta.url), 'utf8'));
const HARMONY = { harmony: ['Fm9', 'Bbm9', 'Db^7', 'C7'], barsPerChord: 1, key: 'F:minor' };

test('A1.2: spec change to one section leaves other sections byte-identical', () => {
  const v0 = compile(spec).source;
  const s2 = structuredClone(spec);
  s2.sections.B.layers.hats.pattern = 's("hh*8").gain(".5 .3 .6 .3 .5 .3 .6 .4")';
  const v1 = compile(s2).source;
  const changedLines = v1.split('\n').filter((l) => !v0.split('\n').includes(l));
  // only the B hats material line may differ
  assert.equal(changedLines.length, 1, JSON.stringify(changedLines));
  assert.match(changedLines[0], /^let hats_B = /);
});

test('A2: "*" wildcard + per-label aspect contracts (key change: pitch everywhere, timing nowhere)', async () => {
  const v0 = compile(spec).source;
  const s2 = structuredClone(spec);
  s2.key = 'G:minor';
  s2.sections.A.harmony = ['Gm9', 'Cm9', 'Eb^7', 'D7'];
  s2.sections.B.harmony = ['Eb^7', 'F7', 'Gm9', 'D7'];
  s2.sections.B.layers.lead.pattern = s2.sections.B.layers.lead.pattern.replace('F4:minor', 'G4:minor');
  const v1 = compile(s2).source;
  const ok = await checkEdit(v0, v1, { allowLabels: ['*'], allowAspects: ['pitch'], meta: compile(spec).meta });
  assert.equal(ok.ok, true, JSON.stringify(ok.containment?.leaks));
  // and a timing change under the same contract is rejected
  const s3 = structuredClone(s2);
  s3.sections.A.layers.kick.pattern = 's("bd*8").gain("1 .8 .9 .8 1 .8 .9 .8")';
  const bad = await checkEdit(v0, compile(s3).source, { allowLabels: ['*'], allowAspects: ['pitch'], meta: compile(spec).meta });
  assert.equal(bad.ok, false);
  assert.match(bad.reason, /forbidden aspect/);
  // per-label object contract: lead may move pitch, everything else only gain
  const perLabel = await checkEdit(v0, v1, {
    allowLabels: ['*'], allowAspects: { lead: ['pitch'], bass: ['pitch'], pads: ['pitch'], '*': ['gain'] },
    meta: compile(spec).meta,
  });
  assert.equal(perLabel.ok, true, JSON.stringify(perLabel.containment?.leaks));
});

test('A1.3: arrangement metrics available to musts (gw_density, active_layers)', () => {
  assert.equal(parseConstraint('gw_density', '> 1.2x A').metric, 'gw_density');
  assert.equal(parseConstraint('active_layers', '> 1x A').metric, 'active_layers');
});

test('A5.2: every rhythm entry carries role, band, style, provenance', () => {
  for (const [name, r] of Object.entries(RHYTHMS)) {
    assert.ok(['percussion', 'harmony', 'support', 'bass', 'melodic'].includes(r.role), `${name}: role`);
    assert.ok(['sub', 'low', 'mid', 'high'].includes(r.band), `${name}: band`);
    assert.ok(typeof r.style === 'string' && r.style.length, `${name}: style`);
    assert.equal(r.provenance, 'hand-written', `${name}: provenance (unratified seeds — Ethan's audition pending, A6.1)`);
  }
});

test('interval-grammar §3: derived bass archetypes need no pitch material', async () => {
  // pulse: root repeated, tracks the chord per cycle
  const pulse = bind(RHYTHMS.anticipation_bass, null, HARMONY, '4/4', { archetype: 'pulse', octave: 2, sound: 'sawtooth' });
  const notes = pulse.boundMeta.notes;
  assert.ok(notes.every((n) => n.cycle !== 0 || n.note === 'F2'));   // Fm9 root
  assert.ok(notes.filter((n) => n.cycle === 3).every((n) => n.note === 'C3' || n.note === 'C2')); // C7 root
  // alternating: beat 1 root (non-negotiable), odd onsets fifth
  const alt = bind(RHYTHMS.anticipation_bass, null, HARMONY, '4/4', { archetype: 'alternating', octave: 2 });
  const c0 = alt.boundMeta.notes.filter((n) => n.cycle === 0);
  assert.equal(c0[0].note, 'F2');
  assert.equal(c0[1].midi - c0[0].midi, 7);
  // pedal: one pitch across all changes
  const ped = bind(RHYTHMS.sparse_pedal, null, HARMONY, '4/4', { archetype: 'pedal', octave: 2 });
  assert.equal(new Set(ped.boundMeta.notes.map((n) => n.note)).size, 1);
  // anchor: derives its own onsets — one strike per chord change, rest cycles silent
  const anc = bind(null, null, { ...HARMONY, barsPerChord: 2 }, '4/4', { archetype: 'anchor', octave: 2 });
  const cyclesWithNotes = new Set(anc.boundMeta.notes.map((n) => n.cycle));
  assert.deepEqual([...cyclesWithNotes].sort(), [0, 2, 4, 6]); // every 2 bars over an 8-cycle period
  // walking/riff are fused entries, not derived
  assert.throws(() => bind(RHYTHMS.sparse_pedal, null, HARMONY, '4/4', { archetype: 'walking' }), /fused library entries/);
});

test('A5.4: style containment — out-of-palette bind fails verify unless mix-declared', async () => {
  const s = {
    title: 'style-test', form: 'A', meter: '4/4', bpm: 120, key: 'C:minor', styles: ['house'],
    sections: {
      A: {
        role: 'verse', bars: 2, harmony: ['Cm7', 'G7'],
        layers: {
          kick: { bind: { rhythm: 'four_floor', sound: 'bd' } },           // universal: always fine
          hats: { bind: { rhythm: 'swung_lofi_hats', sound: 'hh' } },      // lofi-hiphop: OUT of palette
        },
      },
    },
  };
  const { source, meta } = compile(s, { bindFn: makeBindFn(s) });
  const res = await verifySong(source, { meta });
  const v = res.assertions.find((a) => a.family === 'style');
  assert.ok(v, 'style assertion missing');
  assert.equal(v.pass, false);
  assert.match(v.detail, /palette is \[house\]/);
  // declaring the mix makes it pass, and the report says what to listen for
  const s2 = structuredClone(s);
  s2.sections.A.layers.hats.bind.mix = 'surface';
  const r2 = await verifySong(compile(s2, { bindFn: makeBindFn(s2) }).source, { meta: compile(s2, { bindFn: makeBindFn(s2) }).meta });
  const v2 = r2.assertions.find((a) => a.family === 'style');
  assert.equal(v2.pass, true);
  assert.match(v2.detail, /mix:surface/);
});

test('interval-grammar §4: vertical interlock flags a planted m9 clash', async () => {
  const s = {
    title: 'b9-test', form: 'A', meter: '4/4', bpm: 120, key: 'C:major',
    sections: {
      A: {
        role: 'verse', bars: 2, harmony: ['C', 'C'],
        layers: {
          lo: { pattern: 'note("c3@4").gain(0.9)' },      // C3 held
          hi: { pattern: 'note("db4@4").gain(0.9)' },     // Db4 = m9 above, over a NON-dominant chord
        },
      },
    },
  };
  const { source, meta } = compile(s);
  const res = await verifySong(source, { meta });
  const b9 = res.assertions.find((a) => a.name === 'b9-rule');
  assert.ok(b9, 'b9 assertion missing');
  assert.equal(b9.pass, false);
  assert.match(b9.detail, /lo\/hi|hi\/lo/);
});
