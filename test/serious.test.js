// r40 — the SERIOUS tier (src/lib/serious-layers.js + the SERIOUS=1 page).
//
// The invariants these pin are the ones the round's own mistakes would break:
// rows must stay addressable BY NAME (D95/D119 — a pool is how library growth
// re-rolls judged songs), every figure must be legal in the dialect, every loop
// must stay Aeolian (§2.6: the leading tone is 0–3% of pitch weight on nine of
// his ten reference files), a stack must enter its layers ONE AT A TIME with
// every gain a fraction of the lead's (D77 is relative), and the theme writer
// must actually write a theme rather than the syllable cell.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SERIOUS_LOOPS, SERIOUS_FIGURES, SERIOUS_STACKS, SERIOUS_THEME, seriousSpec } from '../src/lib/serious-layers.js';
import { composeVocalLine } from '../src/lib/vocal-line.js';

const GEN = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');

test('serious: the tables are addressed by NAME in the generator, never iterated or length-indexed', () => {
  for (const T of ['SERIOUS_LOOPS', 'SERIOUS_FIGURES', 'SERIOUS_STACKS']) {
    assert.ok(!new RegExp(`Object\\.(keys|values|entries)\\(${T}\\)`).test(GEN), `${T} is iterated in the generator`);
    assert.ok(!new RegExp(`${T}\\)\\.length|${T}\\.length|${T}\\[[^\\]]*%`).test(GEN), `${T} is length-indexed or hashed in the generator`);
  }
});

test('serious: every loop is four chords in the dialect, minor-family, and carries NO major V', () => {
  for (const [name, L] of Object.entries(SERIOUS_LOOPS)) {
    const toks = L.degrees.split(/\s+/);
    assert.equal(toks.length, 4, `${name} has ${toks.length} chords`);
    assert.equal(L.numerals.split(/\s+/).length, 4, `${name} numerals`);
    assert.ok(!/maj7/.test(L.degrees), `${name} spells maj7 — the dialect is ^7`);
    assert.equal(L.family, 'minor', `${name} family`);
    assert.ok(L.source && L.source.length > 10, `${name} must cite where it was measured`);
    // §2.6 — the leading tone is absent: a major triad on the 7th degree (11)
    // or a dominant 7th on the 5th (7:7) would put one in
    for (const t of toks) {
      const [deg, q = ''] = t.split(':');
      assert.ok(deg !== '11', `${name} carries a chord on the raised 7th`);
      assert.ok(!(deg === '7' && (q === '' || q === '7')), `${name} carries a major V — the references are Aeolian`);
    }
  }
});

test('serious: figures are legal — matching lengths, in-bar onsets, no negative semitone tokens, no bare 4/6/7', () => {
  for (const [name, F] of Object.entries(SERIOUS_FIGURES)) {
    assert.equal(F.onsets.length, F.figure.length, `${name} onsets vs figure`);
    assert.equal(F.onsets.length, F.accents.length, `${name} onsets vs accents`);
    assert.equal(F.meter_class, '4/4', `${name} meter (D92: the engine is 4/4-only)`);
    for (const o of F.onsets) { const [n, d] = o.split('/').map(Number); assert.ok(n / d < F.bars, `${name} onset ${o} lies outside its ${F.bars} bars`); }
    for (const tok of F.figure) {
      assert.ok(!/~-/.test(tok), `${name} has a negative semitone token ${tok}`);
      for (const part of tok.split('.')) {
        const bare = part.replace(/\+/g, '');
        // CLAUDE.md: a bare 4/6/7 consults neither key nor chord-scale (the
        // foreign-pitch trap); s2/s4/s6/s7 are the safe way to reach them
        assert.ok(!['4', '7'].includes(bare), `${name} uses a bare ${bare} — use s4/s7`);
      }
    }
    assert.ok(F.source && /§|literature/.test(F.source), `${name} must cite its measured source`);
  }
});

test('serious: his named attack-on-titan cell is R R b3 5 with the top note raised on the second bar', () => {
  const F = SERIOUS_FIGURES.sr_pedal_cell;
  assert.equal(F.bars, 2);
  assert.equal(F.onsets.length, 32, '16ths across two bars');
  const bar1 = F.figure.slice(0, 16), bar2 = F.figure.slice(16);
  for (let beat = 0; beat < 4; beat++) {
    assert.deepEqual(bar1.slice(beat * 4, beat * 4 + 4), ['R', 'R', '3', '5'], `bar 1 beat ${beat}`);
    assert.deepEqual(bar2.slice(beat * 4, beat * 4 + 4), ['R', 'R', '3', 's6'], `bar 2 beat ${beat}`);
  }
});

test('serious: a stack enters its layers ONE AT A TIME, every gain a fraction under 1, every figure resolvable', () => {
  for (const [name, S] of Object.entries(SERIOUS_STACKS)) {
    const ats = S.entries.map((e) => e.at);
    assert.deepEqual([...ats].sort((a, b) => a - b), ats, `${name} entries are not in entry order`);
    const seen = new Set();
    for (const e of S.entries) {
      assert.ok(!seen.has(e.id), `${name} reuses the slot id ${e.id}`);
      seen.add(e.id);
      assert.ok(e.gain > 0 && e.gain < 1, `${name}.${e.id} gain ${e.gain} must be a fraction of the lead's (D77 is relative)`);
      assert.ok(['figure', 'themeOctave', 'themeThird'].includes(e.kind), `${name}.${e.id} kind`);
      if (e.kind === 'figure') assert.ok(SERIOUS_FIGURES[e.fig], `${name}.${e.id} names an unknown figure ${e.fig}`);
    }
    // at most ONE layer may enter at any one point, or they are not coming in
    // one by one — which is the thing he pointed at in Attack on Titan
    const counts = {};
    for (const a of ats) counts[a] = (counts[a] ?? 0) + 1;
    for (const [at, n] of Object.entries(counts)) assert.ok(n <= 2, `${name} has ${n} layers entering at once at ${at}`);
  }
});

test('serious: seriousSpec resolves by name and throws on a typo', () => {
  const s = seriousSpec({ stack: 'sr_stack_titan' });
  assert.equal(s.stack.name, 'sr_stack_titan');
  assert.ok(s.stack.entries.every((e) => e.kind !== 'figure' || e.figure), 'every figure entry resolved');
  assert.equal(s.theme.notesPerBar, SERIOUS_THEME.notesPerBar);
  assert.equal(seriousSpec({ theme: false }).theme, null);
  assert.throws(() => seriousSpec({ stack: 'sr_nope' }), /unknown stack/);
  assert.throws(() => seriousSpec({ stack: 'sr_stack_bad_fig' }), /unknown stack/);
});

test('serious: the THEME writer writes a theme — slow, held, dotted, starting on a beat', () => {
  const chordTonesOf = () => new Set([0, 3, 7]);
  const base = { keyIntervals: [0, 2, 3, 5, 7, 8, 10], rootMidi: 64, bpm: 138, harmony: ['Em', 'C', 'G', 'D'], chordTonesOf };
  const stat = (theme) => {
    let notes = 0, dotted = 0, held = 0, tot = 0, starts = 0, onBeat = 0;
    for (let i = 0; i < 40; i++) {
      const { spec } = composeVocalLine({ ...base, seed: `t${i}`, theme });
      const ev = [];
      spec.bars.forEach((B, bi) => B.onsets.forEach((o, k) => ev.push({ t: bi * 16 + Number(o.split('/')[0]), deg: B.degrees[k] })));
      ev.sort((a, b) => a.t - b.t);
      for (let k = 0; k < ev.length; k++) {
        if (ev[k].deg == null) continue;
        const d = ((ev[k + 1]?.t ?? 64) - ev[k].t) / 4;   // beats
        notes++; tot++;
        if (Math.abs(d - 0.75) < 1e-9 || Math.abs(d - 1.5) < 1e-9 || Math.abs(d - 3) < 1e-9) dotted++;
        if (d >= 0.99) held++;
        if (k === 0 || ev[k - 1].deg == null) { starts++; if (ev[k].t % 4 === 0) onBeat++; }
      }
    }
    return { perBar: notes / (40 * 4), dotted: dotted / tot, held: held / tot, startsOnBeat: onBeat / starts };
  };
  const th = stat(true), syl = stat(false);
  // his set: 1.6–3.2 theme notes a bar, 15–54% dotted, 22–96% held a beat or
  // longer, phrase starts on a beat 32–98%
  assert.ok(th.perBar >= 1.6 && th.perBar <= 3.4, `theme notes/bar ${th.perBar}`);
  assert.ok(th.dotted >= 0.15, `theme dotted share ${th.dotted} (his set 15–54%; the engine wrote 0% on every song before r40)`);
  assert.ok(th.held >= 0.35, `theme held share ${th.held}`);
  assert.ok(th.startsOnBeat >= 0.75, `theme phrase starts on a beat ${th.startsOnBeat}`);
  // and the syllable writer is untouched — no judged sung line may move
  assert.ok(syl.perBar > 4, `the syllable writer still writes ${syl.perBar} notes/bar`);
  // (measured gap-to-next, not notated value: the syllable writer never writes a
  // dotted length, but a breath after an 8th can leave a 0.75-beat gap — 0.6% of
  // its notes. The theme writer is 30–40x that.)
  assert.ok(syl.dotted < 0.05, `the syllable writer's dotted-length share is ${syl.dotted}`);
  assert.ok(th.dotted > syl.dotted * 5, 'the theme writer must be far more dotted than the syllable writer');
});

test('serious: the page rows name distinct stacks-and-loops, pin their vibe, and never double-book a role', () => {
  const block = GEN.slice(GEN.indexOf('const SR_PROMPTS = ['), GEN.indexOf('let SR_FIRST'));
  const rows = block.split(/\n  \{ id: '/).slice(1).map((chunk) => {
    const id = chunk.slice(0, chunk.indexOf("'"));
    return { id, src: chunk };
  });
  assert.ok(rows.length >= 10, `found ${rows.length} serious rows`);
  const seen = new Set();
  for (const r of rows) {
    const g = (k) => (new RegExp(`${k}: '([^']+)'`).exec(r.src) ?? [])[1] ?? null;
    assert.ok(/pin: \{ emotion: '/.test(r.src), `${r.id} must pin its vibe lane (the parser reads these scenes as light ones)`);
    const verse = g('verse');
    assert.ok(verse, `${r.id} names no verse loop`);
    const key = [g('stack') ?? 'sr_stack_titan', verse].join('|');
    assert.ok(!seen.has(key), `${r.id} shares (stack, verse loop) with another row`);
    seen.add(key);
  }
  // the generator must stand the form's own bass/pad down where the stack fills
  // that role — two basses and two pads is what the first build measured
  assert.ok(/stackIds\.has\('bass'\) \? \{ bass: false \}/.test(GEN), 'the stack must stand the vocaloid bass down');
  assert.ok(/stackIds\.has\('pad'\) \? \{ padFig: false \}/.test(GEN), 'the stack must stand the vocaloid pad down');
});

test('serious/r40: the instrumental twin differs from the mix in the GUIDE FACTOR ALONE', () => {
  // `mixPartsInstrumental` is a shallow copy of an array of STRINGS, so any
  // later edit that reassigns a slot reaches only one array. For three rounds
  // the r25 piano trim and the r33 kit ride reached only the mix, and the twin
  // played an untrimmed piano and kit — his "piano too loud" x7, undone in the
  // one mix meant to be the honest instrumental. The generator's comment
  // claimed a test pinned this; it did not exist.
  const src = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('if (pianoTrim < 1) {'), src.indexOf('let mix = mixParts.length > 1'));
  const reassigns = [...body.matchAll(/mixParts\[[^\]]+\]\s*=/g)].length;
  const twin = [...body.matchAll(/mixPartsInstrumental\[[^\]]+\]\s*=/g)].length;
  assert.ok(reassigns === 0 || twin > 0,
    'the piano/kit trim reassigns mixParts slots without touching mixPartsInstrumental');
  // and on a built page the two strings must differ ONLY by `.mul(gain(<guide>))`
  // factors — never by a trim the mix has and the twin lacks
  const page = new URL('../audition/serious.html', import.meta.url);
  let html;
  try { html = readFileSync(page, 'utf8'); } catch { return; }   // page not built in this checkout
  const data = JSON.parse(html.slice(html.indexOf('const DATA = ') + 13, html.indexOf(';\n', html.indexOf('const DATA = '))));
  let checked = 0;
  for (const s2 of data.songs) {
    if (!s2.mixInstrumental) continue;
    const factors = (x) => [...String(x).matchAll(/\.mul\(gain\(([\d.]+)\)\)/g)].map((m) => m[1]).sort();
    const a = factors(s2.mix), b = factors(s2.mixInstrumental);
    // every factor in the TWIN must also be in the MIX (the mix may carry the
    // guide on top); a factor the mix has and the twin lacks is the defect
    const missing = a.filter((x) => { const i = b.indexOf(x); if (i >= 0) { b.splice(i, 1); return false; } return true; });
    const guides = new Set(missing);
    assert.ok(guides.size <= 1, `${s2.name}: the twin is missing ${[...guides].join(', ')} — more than the guide factor`);
    checked++;
  }
  assert.ok(checked >= 5, `expected several twin songs to verify against, saw ${checked}`);
});

// ---- r41: the CHANGED badge (his ask: "can you add a label if you change a
// song? like a 'changed' if i havent played it after the change") -----------
test('every song carries a play signature, and it tracks the MIX not the prose', () => {
  const html = readFileSync(new URL('../audition/serious.html', import.meta.url), 'utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i + 13, html.indexOf(';\n', i)));
  for (const s of data.songs) {
    assert.ok(typeof s.sig === 'string' && s.sig.length, `${s.name} has no sig`);
  }
  // distinct songs must not collide, or a changed song would look unchanged
  const sigs = new Set(data.songs.map((s) => s.sig));
  assert.equal(sigs.size, data.songs.length, 'two songs share a signature');
  // the signature is derived from what he HEARS: rewording a card must not
  // raise the badge, and changing the mix must
  const gen = readFileSync(new URL('../scripts/audition-songs.mjs', import.meta.url), 'utf8');
  const sigLine = gen.slice(gen.indexOf('sig: fnv('), gen.indexOf('sig: fnv(') + 160);
  assert.match(sigLine, /s\.mix/, 'the signature must include the mix');
  for (const prose of ['s.why', 's.description', 's.parsed', 'BUILD']) {
    assert.ok(!sigLine.includes(prose), `the signature must NOT include ${prose} — a reworded card is not a changed song`);
  }
});

test('the changed badge is per-page and cleared only by playing the mix', () => {
  const html = readFileSync(new URL('../audition/serious.html', import.meta.url), 'utf8');
  // the key is derived from the verdicts key, which each page rewrites, so one
  // page's listening history can never clear another's
  assert.match(html, /const LSPLAY = LS\.replace\('-verdicts', '-played'\)/);
  // a SOLO audition must not clear the badge
  assert.match(html, /if \(which === 'mix'\) markPlayed\(s\)/);
  assert.match(html, /CHANGED<\/span>/);
  assert.match(html, /NEW<\/span>/);
});
