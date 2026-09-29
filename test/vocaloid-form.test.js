// r38 — the Vocaloid form tables (src/lib/vocaloid-form.js) and the page that
// uses them. The properties pinned here are the ones that keep the module free
// of D95/D119 blast radius and keep the loops in the engine's chord dialect.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VOCALOID_LOOPS, VOCALOID_FIGURES, VOCALOID_FORMS, vocaloidFormSpec } from '../src/lib/vocaloid-form.js';
import { parseDegrees } from '../src/lib/progressions.js';

test('vocaloid-form: rows are addressed by NAME in the generator, never iterated or length-indexed', () => {
  const src = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  for (const T of ['VOCALOID_LOOPS', 'VOCALOID_FIGURES', 'VOCALOID_FORMS']) {
    assert.ok(!new RegExp(`Object\\.(keys|values|entries)\\(${T}\\)`).test(src), `${T} is iterated in the generator`);
    assert.ok(!new RegExp(`${T}\\)\\.length|${T}\\.length|${T}\\[[^\\]]*%`).test(src), `${T} is length-indexed in the generator`);
  }
});

test('vocaloid-form: every loop is four chords in the dialect (no maj7 spelling, no 9ths/13ths, family declared)', () => {
  for (const [name, L] of Object.entries(VOCALOID_LOOPS)) {
    const toks = L.degrees.split(/\s+/);
    assert.equal(toks.length, 4, `${name} has ${toks.length} chords`);
    assert.ok(!/maj7/.test(L.degrees), `${name} spells maj7 (use ^7)`);
    assert.ok(!/:(9|13|m9|\^9|11)\b/.test(L.degrees), `${name} carries a 9th/13th — the corpus vocabulary is triad/sus/m7/^7/6`);
    assert.ok(['major', 'minor'].includes(L.family), `${name} family`);
    assert.ok(['verse', 'chorus'].includes(L.role), `${name} role`);
    const parsed = parseDegrees(L.degrees);
    assert.equal(parsed.length, 4, `${name} parses to ${parsed.length}`);
    assert.deepEqual(L.chordUnits, [1, 1, 1, 1]);
  }
});

test('vocaloid-form: figures carry onsets/figure/accents of equal length, bar-relative onsets, no negative semitone tokens', () => {
  for (const [name, F] of Object.entries(VOCALOID_FIGURES)) {
    assert.equal(F.onsets.length, F.figure.length, `${name} onsets vs figure`);
    assert.equal(F.accents.length, F.figure.length, `${name} accents`);
    for (const o of F.onsets) { const [n, d] = o.split('/').map(Number); assert.ok(n / d < F.bars, `${name} onset ${o} outside ${F.bars} bars`); }
    for (const t of F.figure) assert.ok(!/~-/.test(t), `${name} negative semitone token ${t}`);
  }
});

test('vocaloid-form: forms are 8-bar-grid, name a silent verse inside their tune sections, and resolve by name (unknown names throw)', () => {
  for (const [name, F] of Object.entries(VOCALOID_FORMS)) {
    assert.ok(F.intro % 4 === 0, `${name} intro ${F.intro}`);
    assert.ok(F.sections.every((L) => /^[ABC]$/.test(L)), `${name} letters`);
    // r43: vf_form_flat has no B on purpose. A B section binds the CHORUS loop
    // (the one place a vocaloid form's loops reach the harmony), and the
    // combination lab needs ONE progression per bed — that is the axis his notes
    // asked to test ("also depends on the chord progression"). Named, so a form
    // cannot lose its chorus by accident.
    if (name !== 'vf_form_flat') assert.ok(F.sections.includes('B'), `${name} has no chorus`);
    else assert.ok(new Set(F.sections).size === 1 && F.intro === 0, 'vf_form_flat must be one letter with no intro');
    // r42: `silentVerse: null` is "this form has none" — the generator already
    // reads it that way (`vf.form.silentVerse != null`), and the pattern lab's
    // form wants it, because thinning one section under one card and not
    // another is a second variable on a page whose point is one figure.
    if (F.silentVerse == null) continue;
    assert.ok(F.silentVerse < F.sections.length && F.sections[F.silentVerse] === 'A', `${name} silentVerse must point at an A section`);
  }
  const spec = vocaloidFormSpec({ verse: 'vf_min_verse_i_v_bVI_bVII', chorus: 'vf_min_chorus_bIII_bVI_i_v' });
  assert.equal(spec.form.name, 'vf_form_standard');
  assert.equal(spec.verseFig.name, 'vf_verse_line');
  assert.throws(() => vocaloidFormSpec({ verse: 'vf_nope' }), /unknown verse loop/);
});

// r39 — the intro is the row's (figure, voice, loop) and the energy tier picks
// the synth figure; every row on the vocarock page names a DISTINCT intro
// (his "the exact same beginning progression used for all the songs???")
test('vocaloid-form r39: intro fields and energy tiers resolve by name; the page rows name distinct intros', () => {
  const hi = vocaloidFormSpec({ energy: 'high', introFig: 'vf_intro_octaves', introSound: 'gm_electric_guitar_muted', introLoop: 'chorus' });
  assert.equal(hi.synthFig.name, 'vf_syn_hook');
  assert.equal(hi.introLoop, 'chorus');
  assert.equal(hi.introSound, 'gm_electric_guitar_muted');
  assert.equal(hi.padFig.name, 'vf_pad_move');
  const lo = vocaloidFormSpec({ energy: 'low' });
  assert.equal(lo.synthFig, null);
  assert.equal(lo.introLoop, 'verse');
  const mid = vocaloidFormSpec({});
  assert.equal(mid.energy, 'mid');
  assert.equal(mid.synthFig.name, 'vf_syn_hook_lite');
  assert.equal(vocaloidFormSpec({ synthFig: false, padFig: false }).synthFig, null);
  assert.throws(() => vocaloidFormSpec({ introFig: 'vf_nope' }), /unknown intro figure/);
  assert.equal(VOCALOID_FIGURES.vf_intro_none.class, 'silent');
  // the page rows: no two share (intro figure, intro voice, intro loop, verse loop)
  const src = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  const block = src.slice(src.indexOf('const VK_PROMPTS = ['), src.indexOf('let VK_FIRST'));
  const rows = block.split(/\n  \{ id: '/).slice(1).map((chunk) => {
    const id = chunk.slice(0, chunk.indexOf("'"));
    const a = chunk.indexOf('vf: {');
    return [null, id, chunk.slice(a, chunk.indexOf('}', a))];
  });
  assert.ok(rows.length >= 10, `found ${rows.length} rows`);
  const seen = new Set();
  for (const [, id, vf] of rows) {
    const g = (k) => (new RegExp(`${k}: '([^']+)'`).exec(vf) ?? [])[1] ?? null;
    const key = [g('introFig') ?? 'vf_intro_riff', g('introSound') ?? '-', g('introLoop') ?? 'verse', g('verse')].join('|');
    assert.ok(!seen.has(key), `${id} shares its intro (${key}) with another row`);
    seen.add(key);
  }
});
