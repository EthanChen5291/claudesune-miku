#!/usr/bin/env node
// Builds audition/judge.html — a TRIAL-BASED judging instrument (D52, rebuilt D54).
//
// Run: node scripts/audition-judge.mjs   (then open audition/judge.html)
//
// WHY A TRIAL PAGE INSTEAD OF MORE KEEP/KILL. D51 measured the first ear pass and
// found the strongest thing it captured was label `coverage` — transcription
// quality — not taste. Keep/kill is one bit on a confounded stimulus: a card
// plays a full arrangement, so a "kill" cannot say whether the harmony, the
// melody, the instruments or the mix was the problem. Three fixes, one per
// trial type:
//
//   ab     Two candidates over the SAME pattern, tempo and key; pick one.
//          "A or B" is far easier to answer than "good or bad", is not
//          confounded by mood on the day, and yields a RANKING rather than a
//          binary. Every pair is a controlled contrast that answers a question
//          the engine actually has (see CONTRASTS below).
//   layer  One card, and the question is WHICH LAYER is wrong. This is the
//          direct fix for D51's confound.
//   open   One card, free text. Lowest volume, highest value per minute —
//          D41's five two-hand principles and D47's whole form model came from
//          Ethan describing one moment, and a principle generalizes where a
//          verdict applies to one card.
//
// -------------------------------------------------------------------------
// D54/D55: SIX TONES PER SIDE, EACH ONE A CHOICE YOU VOTE ON.
//
// The first build played every trial through one texture — block chords — which
// D53 established is not a neutral choice: "some of the chords i rejected sound
// worse only in the format they were delivered. there will also be different
// formats." A progression heard only stacked has been auditioned in one costume,
// and a preference collected that way is partly a preference about stacking.
//
// D55 (Ethan): "the tones shouldn't be a 'turn on' option, it should just be a
// choice ... pressing it highlights it and all the tones i highlight under both
// chords are the ones i like. I can also choose to dislike a tone from a chord
// with a thumbs down icon."
//
// So there is no global mode any more. Each SIDE lists all six tones as rows:
//
//     [ arpeggio        ] [ > ] [ thumbs down ]
//       ^ click = this tone works on this chord
//                          ^ play      ^ this tone does not work on this chord
//
// The like is per (HARMONY, TONE) — keyed by the progression's `degrees` string,
// not by the trial — because the same progression appears in several trials and
// an opinion about how it should be voiced does not depend on what it was being
// compared against. A tone liked on BOTH sides of a trial gets a `BOTH` badge:
// that is the stronger claim, since it held across two different harmonies.
//
// Three states, never two. An untouched tone means "haven't decided"; only the
// thumbs down is a rejection. Reading silence as rejection would invent negative
// evidence out of how far down the list you got — the same discipline as D53.
//
// These votes are the same kind of evidence audition/facets.html collects, so
// the importer merges them into the SAME facet bags rather than stranding them
// in judgments.js.
//
// Every answer still records `pattern` (the last tone sounding when you decided)
// and `heard` (every tone auditioned on that trial). A preference that flips
// between block and arpeggio is a finding about texture; one that holds across
// all six is a finding about harmony. Neither is visible from a page that only
// ever plays one.
//
// The four figuration patterns come from the corpus itself (D30), not invented
// here: they are how the source material actually distributes a chord in time.
//
// A NOTE BOX ON EVERY TRIAL. The first build only offered free text on `layer`
// and `open` trials. Every genuinely load-bearing thing Ethan has said this
// project — the two-hand principles, the whole form model, "Cm Bm is a pretty
// good transition" — arrived as an unsolicited aside, and three quarters of the
// trials had nowhere to put one.
//
// Trials are generated HERE, deterministically, and the page only plays and
// records. Nothing musical is invented in the browser.

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_PROGRESSIONS, parseDegrees, progressionQualities } from '../src/lib/progressions.js';
import { generateProgression } from '../src/lib/harmony-gen.js';
import { exemplarPool, variationsOf } from '../src/lib/harmony-vary.js';
import { renderProgression } from '../src/binder/harmony.js';
import { bindComp, bind, bindFigure } from '../src/binder/bind.js';
import { RHYTHMS } from '../src/lib/rhythms.js';
import { CONTOURS } from '../src/lib/contours.js';
import { VOICINGS, voicingRegistration } from '../src/lib/voicings.js';
import { FIGURATIONS_UNDERTALE } from '../src/lib/figurations-undertale.js';
import { resolveLoopWrap, loopIssues } from '../src/lib/loops.js';
import { evaluateSong, hapsByLabel } from '../src/harness/evaluate.js';
import * as acorn from 'acorn';
import { toDegrees } from '../src/lib/harmony-prior.js';
import { RUNTIME_JS } from './audition-runtime.js';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const OUT = join(ROOT, 'audition');
const WEB_BUNDLE = 'https://unpkg.com/@strudel/web@1.1.0/dist/index.js';

/** a pattern's figuration entry: a library name, or an inline hybrid */
const figOf = (p) => (typeof p.fig === 'string' ? FIGURATIONS_UNDERTALE[p.fig] : p.fig);

/**
 * WIDE OOM-PAH — the one tone on this page Ethan asked for rather than the
 * corpus supplying (t22): "wide pad is fine but I feel like this pattern isn't
 * meant to be jamming the full chord each time. maybe like oom-pah but keeping
 * the wide pad's notes of the actual chord progression."
 *
 * It is a HYBRID, not an invention: the rhythmic bones — onsets, accents,
 * microtiming, legato — are `ut_oompah_dogsong` verbatim (40 bars of Dogsong and
 * Reunited), and only the tokens change, to the intervals `me_spread_tenth`
 * voices: root, fifth, and the third an octave up (0 / 7 / 16). So the oom-pah
 * alternation is the corpus's and the spacing is the wide pad's, which is
 * exactly the request. Marked page-local: it is NOT a library entry and does not
 * claim to be transcribed from anything (A6.1).
 */
const WIDE_OOMPAH = {
  ...FIGURATIONS_UNDERTALE.ut_oompah_dogsong,
  figure: ['R', '5.3+', 'R', '5.3+'],
  octave: 2,
  provenance: 'page-local hybrid (D56): ut_oompah_dogsong rhythm × me_spread_tenth intervals',
  songs: [], seen: 0,
};

/**
 * THE BASS IS CHORD-RELATIVE NOW, and this was a real bug (D56).
 *
 * Ethan: "in the wide pad the lower left hand notes sounded kinda weird at times
 * - sounds like the left hand of 'block' playing through."
 *
 * It WAS the same layer, and it was wrong. The bass was bound from the CONTOUR
 * `bass_root_five`, whose degrees are read against the KEY, not against the
 * chord — and bind() only snaps ACCENTED contour notes onto chord tones. So under
 * the second bar of `C A Em F^7` the bass played B1 C2 A2 C2 while an A major
 * chord sounded above it: C natural against C#, a semitone clash in the lowest
 * register. Under the busy block texture it was masked; under the sparse pad it
 * was naked, which is exactly where he heard it.
 *
 * A figuration cannot make that mistake: `R 5 R 5` names CHORD MEMBERS, so it
 * re-points at every chord by construction. The contour bass stays available for
 * melodies, where a key-relative line is the point.
 */
const BASS_FIG = 'ut_bass_room_of_dog';

// The six ways to deploy the same chord in time, ordered from most stacked to
// most spread. `blurb` is shown on the button's tooltip, because the point of
// the switcher is lost if you cannot tell what you just switched to.
//
// The four figurations are corpus entries: `seen` is how many bars of Undertale
// MIDI each was extracted from, and the token string is the actual chord-member
// sequence (R = root, 3 = the chord's third whatever the quality, + = an octave
// up, a.b = struck together).
const PATTERNS = [
  {
    id: 'block', label: 'block', kind: 'comp', rhythm: 'pushed_comp_2bar', dict: 'shell_37',
    fx: '.room(0.25)', bass: true, blurb: 'all tones at once, pushed comp — the D52 original',
  },
  {
    id: 'pad', label: 'wide pad', kind: 'comp', rhythm: 'even_8ths', dict: 'spread_tenth',
    fx: '.room(0.45)', bass: true, blurb: 'sustained, spread across a tenth',
  },
  {
    id: 'arp', label: 'arpeggio', kind: 'figure', fig: 'ut_arp_tem_shop',
    fx: '.room(0.3)', bass: false, blurb: 'R+ 3+ 5 3+ — tones one at a time',
  },
  {
    id: 'arpwide', label: 'wide arp', kind: 'figure', fig: 'ut_arp_spooktune_spookwave',
    fx: '.room(0.35)', bass: false, blurb: '5 R+ 3+ 5+ 3+ R+ — spread over an octave and a half',
  },
  {
    id: 'oompah', label: 'oom-pah', kind: 'figure', fig: 'ut_oompah_dogsong',
    fx: '.room(0.2)', bass: false, blurb: 'R 3.5 R 3.5 — bass alternating with the upper tones',
  },
  {
    id: 'wideoompah', label: 'wide oom-pah', kind: 'figure', fig: WIDE_OOMPAH,
    fx: '.room(0.35)', bass: false,
    blurb: "R 5.3+ — the oom-pah motion with the wide pad's spacing (Ethan's t22 request)",
  },
  {
    id: 'ostinato', label: 'roots only', kind: 'figure', fig: 'ut_ostinato_core',
    fx: '.room(0.2)', bass: false, blurb: 'R R+ octaves — NO THIRDS AT ALL: does the progression survive?',
  },
];

const SOUND = 'piano';
const KEY = { major: 'C:major', minor: 'C:minor', modal: 'C:minor' };
// Voicing gate. Every comp dictionary on this page covers the same ten
// qualities, so one check stands for all of them — but assert that rather than
// assume it, or a dictionary added later silently greys out half the switcher
// mid-comparison, which would break the contrast at the worst possible moment.
const COMP_DICTS = [...new Set(PATTERNS.filter((p) => p.kind === 'comp').map((p) => p.dict))];
const GATE = COMP_DICTS[0];
for (const d of COMP_DICTS) {
  const a = Object.keys(VOICINGS[d].shapes).sort().join(',');
  const b = Object.keys(VOICINGS[GATE].shapes).sort().join(',');
  if (a !== b) throw new Error(`dict "${d}" covers different qualities than "${GATE}" — the pattern gate is no longer one check`);
}

const SAMPLE_NAMES = new Set(JSON.parse(readFileSync(join(ROOT, 'src/ingest/sample-names.json'), 'utf8')).names);
if (!SAMPLE_NAMES.has(SOUND)) throw new Error(`sound "${SOUND}" is not in any loaded sample map`);
for (const p of PATTERNS) {
  if (p.kind === 'comp') {
    if (!RHYTHMS[p.rhythm]) throw new Error(`pattern "${p.id}" names unknown rhythm "${p.rhythm}"`);
    if (!VOICINGS[p.dict]) throw new Error(`pattern "${p.id}" names unknown voicing "${p.dict}"`);
  } else if (!figOf(p)) {
    throw new Error(`pattern "${p.id}" names unknown figuration "${p.fig}"`);
  }
}

const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};

const playable = (e) => [...progressionQualities(e)].every((q) => q in VOICINGS[GATE].shapes);

/**
 * One entry -> its symbols, its bass line, and ALL SIX patterns.
 *
 * Every pattern is built for every trial, unconditionally. A switcher whose
 * buttons can be dead is worse than no switcher: you would form an impression
 * of A under four patterns and B under six without noticing.
 */
function render(entry) {
  const key = KEY[entry.family] ?? KEY.major;
  // D56 (meter-first, per Ethan 2026-08-25): a trailing chord that repeats the
  // first is a transcription convention ("and back to Cm") that loops as a
  // doubled bar. This page is 4/4 — an even meter — so the duplicate is
  // REPLACED, keeping the bar count, with the runner-up candidates carried as
  // variation material. The entry's own `degrees` is untouched, so tone votes
  // keyed by it still line up.
  const wrap = resolveLoopWrap(parseDegrees(entry.degrees), {
    meter: '4/4', family: entry.family, home: 0,
    qualities: new Set(Object.keys(VOICINGS[GATE].shapes)),
  });
  const cycle = wrap.cycle;
  const symbols = renderProgression({ degrees: toDegrees(cycle), numerals: entry.numerals }, key);
  const ctx = { harmony: symbols, barsPerChord: 1, key };
  const pats = {};
  for (const p of PATTERNS) {
    pats[p.id] = p.kind === 'comp'
      ? bindComp(RHYTHMS[p.rhythm], ctx, '4/4', { dict: p.dict, sound: SOUND, bounceSound: SOUND, fx: p.fx }).expr
      // a figuration names CHORD MEMBERS, so it voices any quality the chord
      // parser understands — there is no dictionary gap to check.
      // stateExtensions (D56) re-points ONE repeated onset per chord at its
      // 7th/6th/9th, so a G7 stops sounding identical to a G.
      : bindFigure(figOf(p), ctx, '4/4', { sound: SOUND, fx: p.fx, stateExtensions: true }).expr;
    if (!pats[p.id]) throw new Error(`pattern "${p.id}" produced nothing for ${entry.degrees}`);
  }
  return {
    symbols,
    wrap: wrap.action === 'none' ? null : {
      action: wrap.action,
      options: wrap.options.map((o) => `${o.semis}${o.quality ? ':' + o.quality : ''}`),
    },
    issues: loopIssues(parseDegrees(entry.degrees)),
    pats,
    bass: bindFigure(FIGURATIONS_UNDERTALE[BASS_FIG], ctx, '4/4', {
      sound: SOUND, fx: '.gain(0.7)',
    }).expr,
  };
}

// ---------------------------------------------------------------------------
// The contrasts. Each pairing answers a question the engine has, and the
// question is written on the trial so a verdict is interpretable later.
// ---------------------------------------------------------------------------

const pool = exemplarPool();
const byFamily = (f) => Object.entries(ALL_PROGRESSIONS).filter(([, e]) => e.family === f && playable(e));

const trials = [];
let tid = 0;
const push = (t) => { trials.push({ id: `t${tid++}`, ...t }); };

/** A vs B, same pattern, same key */
function ab(question, a, b, meta) {
  if (!a?.entry || !b?.entry || !playable(a.entry) || !playable(b.entry)) return;
  if (a.entry.degrees === b.entry.degrees) return;
  if (a.entry.family !== b.entry.family) return;
  const ra = render(a.entry); const rb = render(b.entry);
  // Which side is A is decided by a hash of the pair, not by which arm built
  // it — otherwise "A" would always be the generated one and a side bias would
  // read as a preference.
  const flip = fnv(`${a.entry.degrees}|${b.entry.degrees}`) % 2 === 1;
  const [x, y] = flip ? [b, a] : [a, b];
  const [rx, ry] = flip ? [rb, ra] : [ra, rb];
  push({
    type: 'ab',
    question,
    meta,
    a: { label: x.label, arm: x.arm, degrees: x.entry.degrees, ...rx },
    b: { label: y.label, arm: y.arm, degrees: y.entry.degrees, ...ry },
  });
}

// 1. Does exemplar variation (D50) beat composing from counts (D49)?
//    The question Ethan raised directly: "nice" vs merely "valid".
for (const [i, family] of ['major', 'minor', 'major', 'minor', 'major', 'minor'].entries()) {
  const exemplars = pool.entries.filter(([, e]) => e.family === family && playable(e));
  if (!exemplars.length) continue;
  const [exName, exEntry] = exemplars[i % exemplars.length];
  const varied = variationsOf(exName, { count: 1, intensity: 0.5, budget: 2, seed: `j${i}` })[0];
  const gen = generateProgression({ family, length: parseDegrees(exEntry.degrees).length, shape: GATE, seed: `j${i}` });
  if (varied) {
    ab('Which of these two would you rather build a song on?',
      { entry: varied, label: 'varied from a known song', arm: 'varied' },
      { entry: gen, label: 'composed from corpus statistics', arm: 'generated' },
      { asks: 'D50 exemplar variation vs D49 statistical composition' });
  }
}

// 2. Did the variation IMPROVE the foundation, or damage it?
//    The operators claim to preserve what works; this is the test of that claim.
for (const [i, [name, entry]] of pool.entries.filter(([, e]) => playable(e)).slice(0, 8).entries()) {
  const varied = variationsOf(name, { count: 1, intensity: i % 2 ? 0.75 : 0.3, budget: 2, seed: `f${i}` })[0];
  if (!varied) continue;
  ab('One of these is a known song\'s progression; the other is a variation on it. Which sounds better?',
    { entry, label: 'the original', arm: 'foundation' },
    { entry: varied, label: `varied (${varied.lineage.ops.map((o) => o.op).join(' + ')})`, arm: 'varied' },
    { asks: 'does a typed substitution help or hurt', intensity: i % 2 ? 0.75 : 0.3 });
}

// 3. Is composed harmony competitive with the corpus at all?
for (const [i, family] of ['major', 'minor', 'major', 'minor'].entries()) {
  const corpus = byFamily(family).filter(([, e]) => e.pack === 'ldrolez');
  if (!corpus.length) continue;
  const [cn, ce] = corpus[fnv(`corpus${i}`) % corpus.length];
  const gen = generateProgression({ family, length: parseDegrees(ce.degrees).length, shape: GATE, seed: `c${i}` });
  ab('Which of these two would you rather build a song on?',
    { entry: ce, label: `library entry (${cn})`, arm: 'corpus' },
    { entry: gen, label: 'composed', arm: 'generated' },
    { asks: 'is composed harmony competitive with the imported pool' });
}

// 4. Which CORPUS is worth mining? Same question, different packs.
const PACKS = ['ldrolez', 'undertale', 'unison-famous', 'vgmusic', 'igvideo'];
for (const [i, family] of ['minor', 'major', 'minor', 'major'].entries()) {
  const pa = PACKS[i % PACKS.length];
  const pb = PACKS[(i + 1) % PACKS.length];
  const ga = byFamily(family).filter(([, e]) => e.pack === pa);
  const gb = byFamily(family).filter(([, e]) => e.pack === pb);
  if (!ga.length || !gb.length) continue;
  const [an, ae] = ga[fnv(`pk${i}a`) % ga.length];
  const [bn, be] = gb[fnv(`pk${i}b`) % gb.length];
  ab('Which of these two would you rather build a song on?',
    { entry: ae, label: `${pa} (${an})`, arm: pa },
    { entry: be, label: `${pb} (${bn})`, arm: pb },
    { asks: 'which corpus is worth mining further' });
}

// 5. LAYER attribution — the direct fix for D51's confound. D54 adds the pattern
//    switcher, which turns "the voicing / register" from a guess into something
//    you can check: if it sounds fine arpeggiated, the chords were never the
//    problem.
const layerPicks = [
  ...pool.entries.filter(([, e]) => playable(e)).slice(0, 4),
  ...byFamily('minor').filter(([, e]) => e.pack === 'vgmusic').slice(0, 3),
  ...byFamily('major').filter(([, e]) => e.pack === 'vgmusic').slice(0, 3),
];
for (const [name, entry] of layerPicks) {
  const r = render(entry);
  push({
    type: 'layer',
    question: 'If something is wrong here, what is it?',
    name,
    label: entry.song ?? name,
    degrees: entry.degrees,
    ...r,
    options: ['nothing — this is good', 'the chords themselves', 'the chord rhythm / timing',
      'the voicing / register', 'the sound', 'only this pattern — it works in another',
      'something else (say in the notes)'],
    meta: { asks: 'de-confound: which layer does a rejection belong to' },
  });
}

// 6. OPEN — the principle channel.
const openPicks = [
  ...pool.entries.filter(([, e]) => playable(e)).slice(0, 2),
  ...byFamily('minor').filter(([, e]) => e.pack === 'vgmusic').slice(0, 2),
];
for (const [name, entry] of openPicks) {
  const r = render(entry);
  push({
    type: 'open',
    question: 'What would you change about this, and why?',
    hint: 'One sentence is plenty. A reason generalizes to every song; a verdict only applies to this one. Try it under a few patterns first.',
    name,
    label: entry.song ?? name,
    degrees: entry.degrees,
    ...r,
    meta: { asks: 'a principle, not a verdict' },
  });
}

// ---------------------------------------------------------------------------

const preamble = COMP_DICTS.map(voicingRegistration).join('\n');

// Self-check: EVERY trial × EVERY pattern must evaluate under the engine's own
// transpiler. Sampling would defeat the point — a switcher is only trustworthy
// if every button on it has been proven to make sound.
let checked = 0;
for (const t of trials) {
  for (const side of t.type === 'ab' ? [t.a, t.b] : [t]) {
    for (const p of PATTERNS) {
      const layers = p.bass ? `${side.pats[p.id]}, ${side.bass}` : side.pats[p.id];
      const ev = await evaluateSong(`setcpm(110/4)\n${preamble}\np: stack(${layers}).transpose(0)`);
      const haps = hapsByLabel(ev, 0, 4).get('p');
      if (!haps || haps.error || !haps.haps.length) {
        throw new Error(`trial ${t.id} pattern ${p.id} produced no haps: ${haps?.error ?? 'empty'}`);
      }
      checked++;
    }
  }
}

const DATA = {
  trials,
  preamble,
  patterns: PATTERNS.map(({ id, label, kind, blurb, bass, rhythm, dict, fig }) => ({
    id, label, kind, blurb, bass,
    detail: kind === 'comp' ? `${rhythm} × me_${dict}`
      : typeof fig === 'string' ? `${fig} · ${FIGURATIONS_UNDERTALE[fig].seen} bars in the corpus`
        : fig.provenance,
  })),
  bassLabel: `${BASS_FIG} — chord-relative`,
};
const html = page(DATA);
const inline = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>'));
acorn.parse(inline, { ecmaVersion: 'latest' });
if (!/<script src="[^"]*@strudel\/web@/.test(html)) throw new Error('page emits no strudel bundle tag');

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'judge.html'), html);
const byType = (t) => trials.filter((x) => x.type === t).length;
console.log(`wrote audition/judge.html — ${trials.length} trials (${byType('ab')} A/B, ${byType('layer')} layer, ${byType('open')} open)`);
console.log(`  ${PATTERNS.length} tones per SIDE per trial — each one playable, likeable and dislikeable:`);
for (const p of PATTERNS) console.log(`     ${p.label.padEnd(10)} ${p.blurb}`);
const wrapFixed = trials.flatMap((t) => (t.type === 'ab' ? [t.a, t.b] : [t])).filter((x) => x.wrap);
if (wrapFixed.length) {
  const rep = wrapFixed.filter((x) => x.wrap.action === 'replace').length;
  console.log(`  ${wrapFixed.length} sides ended by repeating their first chord — ${rep} replaced (even meter), ${wrapFixed.length - rep} trimmed (D56 meter-first)`);
}
console.log(`  ${checked} patterns evaluated green through the engine's own transpiler (all of them)`);
console.log(`  inline page script parses clean (${(inline.length / 1024).toFixed(0)} KB)`);
for (const q of [...new Set(trials.map((t) => t.meta?.asks).filter(Boolean))]) {
  console.log(`  asks: ${q} (${trials.filter((t) => t.meta?.asks === q).length})`);
}

function page(DATA) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>motif-engine — judging</title>
<style>
  :root { --bg:#12131a; --fg:#e8e9f0; --dim:#8a8d9f; --line:#2a2c39; --acc:#7dd3a0; --warn:#e0a458; --no:#e07070; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.55 ui-sans-serif,system-ui,sans-serif; }
  header { padding:12px 20px 11px; border-bottom:1px solid var(--line); }
  .hrow { display:flex; gap:14px; align-items:center; flex-wrap:wrap; }
  h1 { font-size:15px; margin:0; font-weight:600; letter-spacing:.02em; }
  /* the bar tracks WHERE YOU ARE; the lighter fill behind it is how much is
     answered. Two different facts, and conflating them is why "back" looked
     like it did nothing. */
  .prog { flex:1; min-width:120px; height:6px; background:var(--line); border-radius:3px; overflow:hidden; position:relative; }
  .prog > .ans { position:absolute; inset:0 auto 0 0; background:#2f4c3c; }
  .prog > .pos { position:absolute; inset:0 auto 0 0; background:var(--acc); transition:width .18s; }
  .count { color:var(--dim); font-variant-numeric:tabular-nums; font-size:13px; }
  main { max-width:1060px; margin:0 auto; padding:26px 20px 80px;
         display:grid; grid-template-columns:1fr 232px; gap:26px; align-items:start; }
  @media (max-width:860px) { main { grid-template-columns:1fr; } aside { position:static !important; } }
  .asks { color:var(--dim); font-size:12px; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
  .q { font-size:20px; font-weight:600; margin:0 0 4px; line-height:1.35; }
  .hint { color:var(--dim); font-size:13px; margin:0 0 20px; }
  .sides { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin:20px 0; }
  @media (max-width:660px) { .sides { grid-template-columns:1fr; } }
  .side { border:1px solid var(--line); border-radius:10px; padding:15px; background:#171823; }
  .side h3 { margin:0 0 7px; font-size:13px; color:var(--dim); font-weight:500; }
  .syms { font:14px ui-monospace,monospace; margin-bottom:11px; word-spacing:.3em; }
  .trim { color:var(--warn); cursor:help; }
  button { font:inherit; color:var(--fg); background:#22243244; border:1px solid var(--line); border-radius:7px; padding:9px 14px; cursor:pointer; }
  button:hover { border-color:var(--dim); }
  button.pick { width:100%; font-weight:600; margin-top:10px; }

  /* one row per tone: [ name ] [ play ] [ thumbs down ] */
  .tones { display:flex; flex-direction:column; gap:5px; }
  .tone { display:flex; gap:4px; align-items:stretch; }
  .tone button { padding:6px 9px; font-size:13px; border-radius:6px; }
  .tone .tname { flex:1; text-align:left; }
  .tone .tplay, .tone .tdown { width:32px; padding:6px 0; text-align:center; color:var(--dim); flex:none; }
  .tone .tdown { font-size:12px; }
  .tone.liked   .tname { background:#1e3a2b; border-color:var(--acc); color:#d8f5e4; font-weight:600; }
  .tone.disliked .tname { border-color:#5a3438; color:#8f7276; text-decoration:line-through; }
  .tone.disliked .tdown { background:#3a2024; border-color:var(--no); color:#f0c0c0; }
  .tone.playing .tplay { background:var(--acc); color:#12131a; border-color:var(--acc); }
  .tone .both { font-size:10px; color:var(--acc); margin-left:6px; letter-spacing:.06em; }

  .opts { display:flex; flex-direction:column; gap:8px; margin:20px 0; }
  .opts button { text-align:left; }
  .extra { display:flex; gap:10px; justify-content:center; margin-top:14px; flex-wrap:wrap; }
  .extra button { color:var(--dim); }
  textarea { width:100%; background:#171823; color:var(--fg); border:1px solid var(--line);
             border-radius:8px; padding:10px; font:inherit; resize:vertical; }
  aside { position:sticky; top:16px; border:1px solid var(--line); border-radius:10px;
          background:#171823; padding:13px 14px 14px; }
  aside h4 { margin:0 0 3px; font-size:12px; text-transform:uppercase; letter-spacing:.07em; color:var(--dim); font-weight:600; }
  aside .why { color:var(--dim); font-size:11.5px; line-height:1.45; margin:0 0 9px; }
  aside textarea { min-height:104px; font-size:13.5px; }
  aside .saved { font-size:11.5px; color:var(--acc); min-height:15px; margin-top:5px; }
  aside .heard { font-size:11.5px; color:var(--dim); margin-top:10px; line-height:1.5; }
  .kbd { display:inline-block; border:1px solid var(--line); border-radius:4px; padding:0 5px;
         font:12px ui-monospace,monospace; color:var(--dim); }
  .done { text-align:center; padding:50px 0; }
  .done p { color:var(--dim); }
  .note { color:var(--dim); font-size:13px; margin-top:8px; }
</style>
</head>
<body>
<header>
  <div class="hrow">
    <h1>motif-engine · judging</h1>
    <div class="prog"><div class="ans" id="ansbar" style="width:0"></div><div class="pos" id="bar" style="width:0"></div></div>
    <span class="count" id="count"></span>
    <button id="back">‹ back</button>
    <button id="skip">skip ›</button>
    <label class="count"><input type="checkbox" id="bass" checked> bass <span id="bassLabel"></span></label>
    <button id="export">copy answers</button>
    <span class="count" id="rtstatus"></span>
  </div>
</header>
<main>
  <div id="main"></div>
  <aside>
    <h4>notes</h4>
    <p class="why">Anything you noticed — a chord pair that worked, a tone that
    ruined it, a rule. Saved as you type, and kept if you skip.</p>
    <textarea id="note" placeholder="e.g. Cm Bm is a pretty good transition, the progression around it isn't"></textarea>
    <div class="saved" id="saved"></div>
    <div class="heard" id="heard"></div>
  </aside>
</main>
<script src="${WEB_BUNDLE}"></script>
<script>
const DATA = ${JSON.stringify(DATA)};
${RUNTIME_JS}

const LS = 'motif-engine:judge-answers';
const LSN = 'motif-engine:judge-notes';
const LST = 'motif-engine:judge-tones';
const LSP = 'motif-engine:judge-pos';
const LSH = 'motif-engine:judge-heard';
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || d); } catch { return JSON.parse(d); } };

let answers = read(LS, '{}');
let notes = read(LSN, '{}');
// TONE VOTES. Keyed by the HARMONY (its degrees string) and the tone, not by
// trial — the same progression turns up in more than one trial, and an opinion
// about how it should be voiced does not depend on what it was being compared
// against. 'good' / 'bad' rather than like/dislike, so these drop straight into
// the D53 facet bags without translation.
let tones = read(LST, '{}');
let heard = read(LSH, '{}');

const save = () => localStorage.setItem(LS, JSON.stringify(answers));
// Notes are written on every keystroke, into their own key. A note is worth
// more than the verdict it came with; a lost sentence is the most expensive
// small bug on this page.
const saveNotes = () => localStorage.setItem(LSN, JSON.stringify(notes));
const saveTones = () => localStorage.setItem(LST, JSON.stringify(tones));
const $ = (id) => document.getElementById(id);

let playing = null;      // "<side>|<tone>" of whatever is sounding
let lastTone = DATA.patterns[0].id;

// WHERE YOU ARE is persisted. Without this, refreshing after pressing 'back'
// jumped straight past the trial you had gone back to look at, because the
// position was recomputed as "first unanswered" every load.
// Read presence, not just numeric validity: Number(null) is 0, so testing the
// parsed value alone would treat "never saved a position" as "saved position 0"
// and strand a returning user at trial 1 instead of their first unanswered one.
const savedPos = localStorage.getItem(LSP);
let i = savedPos == null ? NaN : Number(savedPos);
if (!Number.isInteger(i) || i < 0 || i > DATA.trials.length) {
  i = 0;
  while (i < DATA.trials.length && answers[DATA.trials[i].id]) i++;
}
const savePos = () => localStorage.setItem(LSP, String(i));
const go = (n) => {
  rtStop(); playing = null;
  i = Math.max(0, Math.min(DATA.trials.length, n));
  savePos(); draw();
};

const patOf = (id) => DATA.patterns.find((p) => p.id === id);
const toneKey = (side, toneId) => side.degrees + '|' + toneId;

function codeFor(side, toneId) {
  const p = patOf(toneId);
  const expr = side.pats[toneId];
  // Every trial ships every tone, so this cannot be empty — but a blank
  // interpolated into stack() is a silent dead page, so it is checked anyway.
  if (!expr || !p) return null;
  // The bass line rides with the stacked tones and not with the figurations,
  // which already state the root in the bass register; doubling it there just
  // muddies the low end. The toggle overrides in both directions.
  const withBass = $('bass').checked && p.bass;
  return 'setcpm(110/4)\\n' + DATA.preamble + '\\np: stack('
    + (withBass ? expr + ', ' + side.bass : expr) + ').transpose(0)';
}

async function play(side, which, toneId) {
  const tag = which + '|' + toneId;
  if (playing === tag) { rtStop(); playing = null; draw(); return; }
  playing = tag;
  lastTone = toneId;
  const t = DATA.trials[i];
  if (t) {
    heard[t.id] = heard[t.id] || [];
    if (heard[t.id].indexOf(toneId) < 0) heard[t.id].push(toneId);
    localStorage.setItem(LSH, JSON.stringify(heard));
  }
  draw();
  const code = codeFor(side, toneId);
  if (code) await rtPlay(code);
}

/** three states, never two: unjudged / good / bad. An untouched tone means
 *  "haven't decided", and reading that as a rejection would invent negative
 *  evidence out of how far down the list you got. */
function voteTone(side, toneId, val) {
  const k = toneKey(side, toneId);
  if (tones[k] === val) delete tones[k]; else tones[k] = val;
  saveTones();
  draw();
}

function answer(value) {
  const t = DATA.trials[i];
  const text = $('note') ? $('note').value.trim() : '';
  answers[t.id] = {
    type: t.type, value, note: text || undefined, asks: t.meta && t.meta.asks,
    a: t.a && t.a.arm, b: t.b && t.b.arm, name: t.name,
    // WHICH TONE was last sounding, and everything auditioned on the way. A
    // preference that flips between block chords and an arpeggio is a finding
    // about texture; one that holds across six is about harmony.
    pattern: lastTone, heard: (heard[t.id] || []).slice(),
  };
  save();
  go(i + 1);
}

/** [ tone name ][ play ][ thumbs down ] — the name IS the like button */
function toneRows(side, which, other) {
  const box = document.createElement('div');
  box.className = 'tones';
  for (const p of DATA.patterns) {
    const k = toneKey(side, p.id);
    const v = tones[k];
    const row = document.createElement('div');
    row.className = 'tone' + (v === 'good' ? ' liked' : v === 'bad' ? ' disliked' : '')
      + (playing === which + '|' + p.id ? ' playing' : '');

    const name = document.createElement('button');
    name.className = 'tname';
    name.title = p.blurb + '   (' + p.detail + ')\\nclick to mark this tone as one that works here';
    name.textContent = p.label;
    // A tone liked on BOTH sides of the trial works regardless of which harmony
    // it is carrying — which is a different and stronger claim than liking it
    // on one, and worth being able to see at a glance.
    if (other && tones[toneKey(other, p.id)] === 'good' && v === 'good') {
      const b = document.createElement('span');
      b.className = 'both';
      b.textContent = 'BOTH';
      name.appendChild(b);
    }
    name.onclick = () => voteTone(side, p.id, 'good');
    row.appendChild(name);

    const pb = document.createElement('button');
    pb.className = 'tplay';
    pb.title = 'play this side with this tone';
    pb.textContent = playing === which + '|' + p.id ? '\\u25a0' : '\\u25b6';
    pb.onclick = () => play(side, which, p.id);
    row.appendChild(pb);

    const db = document.createElement('button');
    db.className = 'tdown';
    db.title = 'this tone does not work on this chord';
    db.textContent = '\\ud83d\\udc4e';
    db.onclick = () => voteTone(side, p.id, 'bad');
    row.appendChild(db);

    box.appendChild(row);
  }
  return box;
}

function draw() {
  const m = $('main');
  const n = DATA.trials.length;
  const done = Object.keys(answers).length;
  // POSITION drives the bright bar and the counter; the dim fill behind it is
  // how much has been answered. Before this, both showed 'done', so stepping
  // back through trials looked like nothing had happened.
  $('bar').style.width = (100 * Math.min(i, n) / n) + '%';
  $('ansbar').style.width = (100 * done / n) + '%';
  $('count').textContent = (i >= n ? n : i + 1) + ' / ' + n + '  ·  ' + done + ' answered';

  const t0 = DATA.trials[i];
  const nb = $('note');
  if (nb) nb.value = (t0 && notes[t0.id]) || '';
  if ($('saved')) $('saved').textContent = '';
  const hd = $('heard');
  if (hd) {
    const h = (t0 && heard[t0.id]) || [];
    hd.innerHTML = !t0 ? ''
      : h.length ? 'heard in: <b>' + h.map((x) => patOf(x).label).join(', ') + '</b>'
        : 'not played yet — try at least two tones before deciding';
  }

  if (i >= n) {
    m.innerHTML = '<div class="done"><h2>Done — ' + done + ' answers.</h2>' +
      '<p>Hit <b>copy answers</b> and paste them back, then run<br>' +
      '<code>node scripts/import-verdicts.mjs &lt;file.json&gt;</code></p></div>';
    return;
  }
  const t = t0;
  m.innerHTML = '';

  const asks = document.createElement('div');
  asks.className = 'asks';
  asks.textContent = (t.meta && t.meta.asks) || t.type;
  m.appendChild(asks);

  const q = document.createElement('h2');
  q.className = 'q';
  q.textContent = t.question;
  m.appendChild(q);

  if (t.hint) {
    const h = document.createElement('p');
    h.className = 'hint';
    h.textContent = t.hint;
    m.appendChild(h);
  }
  if (answers[t.id]) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.innerHTML = 'already answered: <b>' + answers[t.id].value + '</b> — answering again replaces it';
    m.appendChild(p);
  }

  if (t.type === 'ab') {
    const wrap = document.createElement('div');
    wrap.className = 'sides';
    for (const [k, side, other] of [['A', t.a, t.b], ['B', t.b, t.a]]) {
      const d = document.createElement('div');
      d.className = 'side';
      const h = document.createElement('h3');
      h.textContent = k;
      d.appendChild(h);
      const s = document.createElement('div');
      s.className = 'syms';
      s.textContent = side.symbols.join('  ');
      if (side.wrap) {
        const w = document.createElement('span');
        w.className = 'trim';
        w.textContent = ' \u21ba';
        w.title = side.wrap.action === 'replace'
          ? 'the written progression ended by repeating its first chord; looped, that doubles a bar. 4/4 is an even meter, so the duplicate is REPLACED (D56 meter-first). Alternates for in-song variation: ' + side.wrap.options.join(', ')
          : 'the written progression ended by repeating its first chord; trimmed for loop playback (D56)';
        s.appendChild(w);
      }
      d.appendChild(s);
      d.appendChild(toneRows(side, k, other));
      const cb = document.createElement('button');
      cb.className = 'pick';
      cb.textContent = 'pick ' + k;
      cb.onclick = () => answer(k);
      d.appendChild(cb);
      wrap.appendChild(d);
    }
    m.appendChild(wrap);
    const ex = document.createElement('div');
    ex.className = 'extra';
    for (const [v, txt] of [['same', 'too close to call'], ['neither', 'neither is any good'],
      ['depends', 'depends on the tone']]) {
      const b = document.createElement('button');
      b.textContent = txt;
      b.onclick = () => answer(v);
      ex.appendChild(b);
    }
    m.appendChild(ex);
    const kb = document.createElement('p');
    kb.className = 'note';
    kb.innerHTML = '<span class="kbd">1</span>–<span class="kbd">6</span> play that tone on A, '
      + '<span class="kbd">shift</span>+ for B &nbsp; <span class="kbd">A</span>/<span class="kbd">B</span> pick &nbsp; '
      + '<span class="kbd">S</span> same &nbsp; <span class="kbd">N</span> neither &nbsp; <span class="kbd">D</span> depends'
      + ' &nbsp; <span class="kbd">\\u2190</span><span class="kbd">\\u2192</span> back/skip';
    m.appendChild(kb);
    return;
  }

  // single-stimulus trials — same tone list, one card
  const lab = document.createElement('div');
  lab.className = 'hint';
  lab.textContent = t.label + '  ·  ' + t.symbols.join('  ')
    + (t.wrap ? '  \u21ba ' + (t.wrap.action === 'replace' ? 'last chord replaced (was a repeat of the first)' : 'trimmed') : '');
  m.appendChild(lab);
  const card = document.createElement('div');
  card.className = 'side';
  card.appendChild(toneRows(t, 'X', null));
  m.appendChild(card);

  if (t.type === 'layer') {
    const o = document.createElement('div');
    o.className = 'opts';
    t.options.forEach((opt, ix) => {
      const b = document.createElement('button');
      b.textContent = (ix + 1) + '. ' + opt;
      b.onclick = () => answer(opt);
      o.appendChild(b);
    });
    m.appendChild(o);
    const kb = document.createElement('p');
    kb.className = 'note';
    kb.innerHTML = '<span class="kbd">1</span>–<span class="kbd">6</span> play a tone &nbsp; '
      + '<span class="kbd">shift</span>+<span class="kbd">1</span>–<span class="kbd">7</span> answer &nbsp; '
      + '<span class="kbd">\\u2190</span><span class="kbd">\\u2192</span> back/skip';
    m.appendChild(kb);
    return;
  }

  const sub = document.createElement('div');
  sub.className = 'extra';
  const b = document.createElement('button');
  b.textContent = 'submit  (\\u2318\\u21b5 in the notes box)';
  b.onclick = () => answer('open');
  sub.appendChild(b);
  m.appendChild(sub);
  if ($('note')) $('note').focus();
}

$('note').oninput = () => {
  const t = DATA.trials[i];
  if (!t) return;
  notes[t.id] = $('note').value;
  saveNotes();
  $('saved').textContent = $('note').value.trim() ? 'saved' : '';
};

document.onkeydown = (e) => {
  const t = DATA.trials[i];
  const typing = e.target && e.target.tagName === 'TEXTAREA';
  if (typing) {
    // Cmd/Ctrl+Enter submits an OPEN trial and otherwise just lets go of the
    // box, so the single-key shortcuts work again. The old build answered
    // "skip" here, which threw the trial away mid-sentence.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (t && t.type === 'open') answer('open'); else e.target.blur();
    }
    return;
  }
  if (e.key === 'ArrowLeft') { e.preventDefault(); return go(i - 1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); return go(i + 1); }
  if (!t) return;
  // e.code so shift+1 is still recognisably "1" rather than "!"
  const digit = /^Digit([1-9])$/.exec(e.code || '');
  if (digit) {
    const ix = Number(digit[1]) - 1;
    if (t.type === 'layer' && e.shiftKey) {
      const opt = t.options[ix];
      if (opt) answer(opt);
      return;
    }
    const p = DATA.patterns[ix];
    if (!p) return;
    const side = t.type === 'ab' ? (e.shiftKey ? t.b : t.a) : t;
    const which = t.type === 'ab' ? (e.shiftKey ? 'B' : 'A') : 'X';
    play(side, which, p.id);
    return;
  }
  const k = e.key.toLowerCase();
  if (t.type === 'ab') {
    if (k === 'a') answer('A');
    else if (k === 'b') answer('B');
    else if (k === 's') answer('same');
    else if (k === 'n') answer('neither');
    else if (k === 'd') answer('depends');
  }
};

$('bassLabel').textContent = '(' + DATA.bassLabel + ', stacked tones only)';
$('bass').onchange = () => {
  if (!playing) return;
  const [which, toneId] = playing.split('|');
  const t = DATA.trials[i];
  const side = which === 'A' ? t.a : which === 'B' ? t.b : t;
  playing = null;
  play(side, which, toneId);
};
$('back').onclick = () => go(i - 1);
$('skip').onclick = () => go(i + 1);
$('export').onclick = async () => {
  // Notes on trials that were never answered ship too — a sentence Ethan typed
  // and then skipped past is exactly the kind of thing this page exists for.
  const stray = {};
  for (const id of Object.keys(notes)) {
    if (!answers[id] && notes[id].trim()) stray[id] = notes[id].trim();
  }
  const out = { generated: new Date().toISOString(), page: 'judge', answers, tones, strayNotes: stray };
  const ok = await rtCopy(JSON.stringify(out, null, 2));
  $('export').textContent = ok ? 'copied \\u2713' : 'copy failed';
  setTimeout(() => { $('export').textContent = 'copy answers'; }, 1200);
};

// rtInit() is lazy — the first play boots audio inside the click gesture.
draw();
</script>
</body>
</html>`;
}
