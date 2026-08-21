// Roman-numeral parsing for the Unison packs, whose filenames carry the analysis:
//   "Post Malone - Circles (Imaj7-iii-IV-iv-Imaj7-V-IVmaj7-V6) .mid"
//   "Minor Prog 06 (VImaj9-VII6(9)-vm7add11-im7-IIImaj7).mid"
// Numerals are tonic-anchored Ionian degree names (same convention D28 settled on),
// so a numeral becomes SEMITONES ABOVE THE TONIC plus a quality — the exact shape
// src/lib/progressions.js already stores.
//
// The filename is a LABEL, not ground truth. Every quality it claims is checked
// against the notes actually in the MIDI (see bestQuality), and disagreements are
// reported rather than quietly trusted.

import { voicingRegistry } from '@strudel/tonal';

const IONIAN = { I: 0, II: 2, III: 4, IV: 5, V: 7, VI: 9, VII: 11 };
const NUMERAL = /^(b|#)?(VII|VI|IV|V|III|II|I|vii|vi|iv|v|iii|ii|i)(.*)$/;

// Unison suffix -> ireal quality. `null` = decide from the notes.
// Lowercase numerals carry the minor third, so a bare suffix differs by case.
const SUFFIX = {
  '': { upper: '', lower: 'm' },
  m: { upper: 'm', lower: 'm' },
  maj7: '^7', maj9: '^9', 'maj7#11': '^7#11', 'maj7#5': '^7#5', maj11: '^7#11',
  m7: 'm7', m9: 'm9', m11: 'm11', m7b5: 'm7b5', m6: 'm6', 'm6(9)': 'm69',
  m7add11: 'm11', madd9: 'madd9', dim7: 'o7', dim: 'o',
  add9: { upper: 'add9', lower: 'madd9' },
  add11: { upper: '11', lower: 'm11' },
  6: '6', '6(9)': '69', 7: '7', 9: '9', '9(13)': '13', 11: '11', 13: '13',
  sus: 'sus', m7sus: '7sus', '7sus': '7sus', '13sus': '13sus', '9sus': '9sus',
  '7alt': '7alt', '7b9': '7b9', '7b13': '7b13', '7#11': '7#11', '7b5': '7b5',
  5: '5', 2: '2', sus2: '2', sus4: 'sus',
  // no clean ireal equivalent — resolved from the MIDI notes instead
  maj7sus: null, 'add#11': null, m7b9b5: null,
};

/** parse one token, e.g. "bIImaj7#11" -> { semis: 1, spell: 'b', quality: '^7#11' } */
export function parseNumeral(token) {
  const m = NUMERAL.exec(String(token).trim());
  if (!m) return null;
  const [, acc, num, rawSuffix] = m;
  const upper = num === num.toUpperCase();
  const semis = (IONIAN[num.toUpperCase()] + (acc === 'b' ? -1 : acc === '#' ? 1 : 0) + 12) % 12;
  // The pack spells the minor third in the SUFFIX when there is one ("im7", not
  // "i7"), so the suffix is looked up verbatim; case only decides the bare case
  // and the handful of suffixes that read differently over a minor numeral.
  let quality = SUFFIX[rawSuffix];
  if (quality && typeof quality === 'object') quality = upper ? quality.upper : quality.lower;
  if (quality === undefined) quality = null; // unmapped -> resolve from the notes
  return { semis, spell: acc ?? null, quality: quality === undefined ? null : quality, raw: token, suffix: rawSuffix, upper };
}

/** "(Imaj7-iii-IV-iv)" style list out of a filename, honouring nested "6(9)" groups */
export function numeralsFromFilename(name) {
  const base = name.replace(/\.mid$/i, '').trim();
  const close = base.lastIndexOf(')');
  if (close < 0) return null;
  let depth = 0, open = -1;
  for (let i = close; i >= 0; i--) {
    if (base[i] === ')') depth++;
    else if (base[i] === '(') { depth--; if (depth === 0) { open = i; break; } }
  }
  if (open < 0) return null;
  const inner = base.slice(open + 1, close);
  const tokens = inner.split('-').map((s) => s.trim()).filter(Boolean);
  return tokens.length ? { tokens, label: base.slice(0, open).trim() } : null;
}

/** "04 - Eb Major - C Minor" -> { majorRoot: 'Eb', minorRoot: 'C' } */
const NOTE_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
export function parseKeyDir(dir) {
  const m = /(\d+)\s*-\s*([A-G][#b]?)\s*Major\s*-\s*([A-G][#b]?)\s*Minor/i.exec(dir);
  if (!m) return null;
  const pc = (n) => (NOTE_PC[n[0].toUpperCase()] + (n[1] === '#' ? 1 : n[1] === 'b' ? -1 : 0) + 12) % 12;
  return { majorRoot: m[2], minorRoot: m[3], majorPc: pc(m[2]), minorPc: pc(m[3]) };
}

// ---------------------------------------------------------------------------
// Ground truth: what the NOTES say
// ---------------------------------------------------------------------------

const DEGREE_SEMITONES = { 1: 0, 2: 2, 3: 4, 4: 5, 5: 7, 6: 9, 7: 11 };
function intervalToPc(ivl) {
  const m = /^(\d+)([PMmAd])$/.exec(ivl.trim());
  if (!m) return null;
  const deg = ((Number(m[1]) - 1) % 7) + 1;
  let s = DEGREE_SEMITONES[deg];
  if (m[2] === 'm') s -= 1;
  else if (m[2] === 'A') s += 1;
  else if (m[2] === 'd') s -= [1, 4, 5].includes(deg) ? 1 : 2;
  return ((s % 12) + 12) % 12;
}

/** quality -> pitch classes relative to the root, straight from the ireal dictionary */
let QUALITY_PCS = null;
export function qualityPcs() {
  if (QUALITY_PCS) return QUALITY_PCS;
  QUALITY_PCS = new Map();
  const dict = voicingRegistry?.ireal?.dictionary ?? {};
  for (const [q, voicings] of Object.entries(dict)) {
    const pcs = new Set([0]);
    for (const v of [].concat(voicings)) {
      for (const ivl of String(v).split(/\s+/)) { const pc = intervalToPc(ivl); if (pc != null) pcs.add(pc); }
    }
    QUALITY_PCS.set(q, pcs);
  }
  return QUALITY_PCS;
}

/**
 * Which ireal quality best explains the pitch classes actually played (given the
 * root)? Scored by set agreement, tie-broken toward the SIMPLER spelling, so a
 * plain triad is never dressed up as a 13th.
 */
export function bestQuality(pcsRelToRoot, { prefer = null } = {}) {
  const want = new Set(pcsRelToRoot);
  let best = null;
  for (const [q, pcs] of qualityPcs()) {
    let hit = 0, missing = 0;
    for (const p of want) if (pcs.has(p)) hit++;
    for (const p of pcs) if (!want.has(p)) missing++;
    const score = hit - 0.55 * (want.size - hit) - 0.35 * missing - 0.01 * q.length;
    if (!best || score > best.score + 1e-9 || (Math.abs(score - best.score) < 1e-9 && q === prefer)) {
      best = { quality: q, score, covers: hit === want.size };
    }
  }
  return best;
}
