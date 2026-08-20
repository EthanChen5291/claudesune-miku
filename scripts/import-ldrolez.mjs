#!/usr/bin/env node
// Transcode vendor/ldrolez/chords.py -> src/lib/progressions.js  (D28).
//
// The source writes progressions as Roman numerals in THREE notations:
//   major family — traditional major-key numerals   (I ii iii IV V vi vii)
//   minor family — traditional natural-minor numerals (i ii III iv v VI VII)
//   modal family — Ionian degree NAMES with accidentals, anchored on the tonic
//                  (bIII = 3 semitones above the tonic, always)
// Three spellings, one meaning. We normalize all of them to semitones-from-tonic
// so the library holds ONE representation (D28) and nothing has to re-parse a
// numeral against a mode at bind time. The numeral string is kept for display.
//
// Usage: node scripts/import-ldrolez.mjs [--check]
//        --check  re-transcode and diff against the committed library (CI guard)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'vendor/ldrolez/chords.py');
const OUT = join(ROOT, 'src/lib/progressions.js');

// Ionian degree names -> semitones above the tonic. The modal family and the
// major family both read against this; only the minor family differs.
const IONIAN = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
const NATMIN = { I: 0, II: 2, III: 3, IV: 5, V: 7, VI: 8, VII: 10 };
const MAJ_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MIN_SCALE = [0, 2, 3, 5, 7, 8, 10];

// source suffix -> our canonical quality (the ireal dialect, which is what the
// compiler emits and what harness/chords.js resolves against).
// 'DIA7'/'DIA9' mean "the diatonic seventh/ninth of that degree in this family".
const SUFFIX = {
  '': null, M: '', m: 'm', 7: 'DIA7', dom7: '7', M7: '^7', m7: 'm7', 9: 'DIA9',
  m9: 'm9', 6: '6', M6: '6', m6: 'm6', 69: '69', add9: 'add9', madd9: 'madd9',
  sus2: '2', sus4: 'sus', 5: '5', dim: 'o',
  'M-5': null, // major b5 — no ireal equivalent; entry is dropped (see below)
};
const UNSUPPORTED = new Set(['M-5']);

const NUMERAL = /^(b|#)?(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(.*)$/;

function pyList(src, name) {
  const m = new RegExp(`${name}\\s*=\\s*\\[(.*?)\\n\\]`, 's').exec(src);
  if (!m) throw new Error(`no list "${name}" in chords.py`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/** quality of the diatonic 7th rooted `semis` above the tonic within `scale` */
function diatonicSeventh(semis, scale) {
  const i = scale.indexOf(semis);
  if (i < 0) return null;
  const iv = [2, 4, 6].map((k) => (scale[(i + k) % 7] - semis + 12) % 12).join(',');
  return { '4,7,11': '^7', '3,7,10': 'm7', '4,7,10': '7', '3,6,10': 'm7b5' }[iv] ?? null;
}
const NINTH_OF = { '^7': 'add9', 7: '9', m7: 'm9', m7b5: 'm7b5' };

function transcode(body, family) {
  const scale = family === 'minor' ? MIN_SCALE : MAJ_SCALE;
  const table = family === 'minor' ? NATMIN : IONIAN;
  const chords = [];
  for (const tok of body.split(/\s+/)) {
    const m = NUMERAL.exec(tok);
    if (!m) throw new Error(`unparseable numeral "${tok}"`);
    const [, acc, num, suf] = m;
    if (UNSUPPORTED.has(suf)) return { unsupported: tok };
    if (!(suf in SUFFIX)) throw new Error(`unmapped suffix "${suf}" in "${tok}"`);
    const semis = (table[num.toUpperCase()] + (acc === 'b' ? -1 : acc === '#' ? 1 : 0) + 12) % 12;
    let q = SUFFIX[suf];
    if (q === 'DIA7' || q === 'DIA9') {
      const dia = diatonicSeventh(semis, scale);
      // every 7/9 in the corpus sits on a diatonic root; guard anyway
      const seventh = dia ?? (num === num.toUpperCase() ? '7' : 'm7');
      q = q === 'DIA7' ? seventh : NINTH_OF[seventh];
    } else if (q === null) {
      q = num === num.toUpperCase() ? '' : 'm'; // case carries the triad quality
    }
    // The source's accidental is real information about SPELLING (bVI wants Ab,
    // #IV wants F#) and the semitone number alone cannot recover it — both sit a
    // chromatic step from a diatonic neighbour. Carry it; the renderer needs it.
    chords.push(`${semis}${acc ?? ''}${q ? `:${q}` : ''}`);
  }
  return { degrees: chords.join(' ') };
}

const slug = (family, body) =>
  `${{ major: 'maj', minor: 'min', modal: 'mod' }[family]}_` +
  body.replace(/#/g, 's').replace(/\s+/g, '_');

const src = readFileSync(SRC, 'utf8');
const families = { major: pyList(src, 'prog_maj'), minor: pyList(src, 'prog_min'), modal: pyList(src, 'prog_modal') };

const entries = [];
const dropped = [];
const merged = [];
const seen = new Set();
for (const [family, lines] of Object.entries(families)) {
  for (const line of lines) {
    const [body, tags] = line.split(' =');
    const moods = tags.trim().split(/\s+/).filter((t) => t !== 'New');
    const res = transcode(body, family);
    if (res.unsupported) { dropped.push({ family, body, why: `quality "${res.unsupported}" has no ireal equivalent` }); continue; }
    const name = slug(family, body);
    // The same progression appears twice when it is also listed as a cadence —
    // same chords, different tags. Merge the tags; never drop one (that would
    // silently lose the source's 'Cadence' mark).
    if (seen.has(name)) {
      const prior = entries.find((e) => e.name === name);
      for (const m of moods) if (!prior.moods.includes(m)) prior.moods.push(m);
      merged.push({ family, body, moods });
      continue;
    }
    seen.add(name);
    entries.push({ name, family, numerals: body, degrees: res.degrees, moods });
  }
}

const L = [];
L.push(`// Progression library (§3.5, D28). ABSTRACT ONLY: each entry is a sequence of`);
L.push(`// SEMITONES ABOVE THE TONIC plus a chord quality — no key, no note names, no`);
L.push(`// Roman numerals at bind time. Rendering a progression into a song's key is`);
L.push(`// \`renderProgression(entry, key)\` in src/binder/harmony.js.`);
L.push(`//`);
L.push(`// \`degrees\` grammar: space-separated \`<semitones>[b|#][:<quality>]\`; a bare number`);
L.push(`// is a major triad. An optional b/# is the SOURCE's spelling of a chromatic degree,`);
L.push(`// kept because the semitone count alone cannot recover it (bVI and #V are one`);
L.push(`// pitch, two spellings). Qualities are the IREAL dialect — the spelling the compiler`);
L.push(`// emits and harness/chords.js resolves against, so one symbol is valid on both the`);
L.push(`// harmony timeline and any me_* voicing shape. ('sus' not 'sus4', 'o' not 'dim'.)`);
L.push(`//`);
L.push(`// GENERATED by scripts/import-ldrolez.mjs from vendor/ldrolez/chords.py (MIT,`);
L.push(`// (c) 2019-2026 Ludovic Drolez). Do not hand-edit — re-run the importer.`);
L.push(`//`);
L.push(`// \`moods\` are the SOURCE's human-authored tags and are real data. \`character\` is`);
L.push(`// deliberately null on every entry: a character line is written when Ethan's ear`);
L.push(`// ratifies the entry (A6.1), never generated at import — an imported corpus is a`);
L.push(`// CANDIDATE POOL, not a library. All entries are \`ratified: false\`.`);
L.push('');
L.push(`export const PROGRESSIONS = {`);
for (const e of entries) {
  L.push(`  ${e.name}: {`);
  L.push(`    family: '${e.family}', role: 'harmony', style: 'universal',`);
  L.push(`    provenance: 'transcribed', source: 'ldrolez/free-midi-chords@MIT', ratified: false,`);
  L.push(`    numerals: '${e.numerals}',`);
  L.push(`    degrees: '${e.degrees}',`);
  L.push(`    moods: [${e.moods.map((m) => `'${m}'`).join(', ')}],`);
  L.push(`    character: null,`);
  L.push(`  },`);
}
L.push(`}`);
L.push('');
L.push(readFileSync(join(ROOT, 'scripts/progressions-tail.js'), 'utf8').trimEnd());
L.push('');

const out = L.join('\n');
if (process.argv.includes('--check')) {
  const have = readFileSync(OUT, 'utf8');
  if (have !== out) { console.error(`${OUT} is stale — re-run: node scripts/import-ldrolez.mjs`); process.exit(1); }
  console.log(`progressions.js up to date (${entries.length} entries)`);
} else {
  writeFileSync(OUT, out);
  console.log(`wrote ${OUT}: ${entries.length} entries (${Object.entries(families).map(([f, l]) => `${f} ${l.length}`).join(', ')} in source)`);
  for (const d of dropped) console.log(`  dropped ${d.family} "${d.body}" — ${d.why}`);
  for (const m of merged) console.log(`  merged duplicate ${m.family} "${m.body}" — tags ${m.moods.join('/')} folded into the first listing`);
}
