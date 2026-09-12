// r34 — Japanese mora lyrics for the vocal tier ("vary the lyrics a bit more -
// learn from miku songs").
//
// What a Miku song does with words, as DELIVERY rather than meaning (the
// engine composes nothing by hand, so the lyric is generated too):
//   - one MORA per note, syllabic and fast — 8ths and 16ths each carry a
//     syllable; only a very short note (a run member) melismas on the vowel
//     of the one before it;
//   - a long held note keeps ONE mora and holds its vowel;
//   - the same melodic phrase returns with the SAME words (the hook) — here a
//     phrase is keyed by its interval+rhythm signature, so a returning letter
//     sings its line again without the generator knowing the form;
//   - lines are built from the words those songs actually lean on: kimi /
//     boku / sekai / koe / sora / yume / hikari / kokoro / mirai / ima …, with
//     particles (wa, ga, o, ni, no, to, e, mo, yo, ne) and verb endings (-ru,
//     -te, -tai, -nai, -yo) as the connective tissue that makes a line scan;
//   - a phrase ends on a word boundary, and long phrase-final notes take a
//     line-ending particle (yo / ne / sa) or an open vowel;
//   - a few vocalise fills (la la la, ah, oh) — the corpus habit for a run.
// Vowel balance is Japanese's own: a and i dominate, which is also what the
// DiffSinger voice renders cleanest. Every mora is spelled in the voicebank's
// phoneme set (vendor/vocal/tiger/voicebank/dsdur/dsdict-ja.yaml, transcribed
// below), so nothing here can produce a token the acoustic model lacks.
//
// Rows are addressed by the generator only through `assignLyrics`; the word
// list is a POOL picked by hash (fnv of song name + phrase signature), so
// adding a word re-rolls lines on unpinned songs — the same D95 law as any
// retrieval pool. Nothing here reaches the judged pages.

import { writeLyrics } from './lyrics-ja-writer.js';

const V = { a: 'a', i: 'iy', u: 'ux', e: 'ee', o: 'oo' };
const C = { k: 'kx', g: 'g', s: 's', z: 'dz', t: 'tx', d: 'd', n: 'n', h: 'hh', b: 'b', p: 'px', m: 'm', y: 'y', r: 'rj', w: 'w' };
const SPECIAL = {
  shi: ['sh', 'iy'], sha: ['sh', 'a'], shu: ['sh', 'ux'], sho: ['sh', 'oo'],
  ji: ['jh', 'iy'], ja: ['jh', 'a'], ju: ['jh', 'ux'], jo: ['jh', 'oo'],
  chi: ['ch', 'iy'], cha: ['ch', 'a'], chu: ['ch', 'ux'], cho: ['ch', 'oo'],
  tsu: ['ts', 'ux'], fu: ['fp', 'ux'], n: ['nn'],
};
// romaji mora -> phoneme list (consonants first, vowel last)
export function moraPhonemes(m) {
  if (SPECIAL[m]) return SPECIAL[m];
  const r = /^([kgsztdnhbpmyrw]?)(y?)([aiueo])$/.exec(m);
  if (!r) throw new Error(`not a mora: ${m}`);
  const out = [];
  if (r[1]) out.push(C[r[1]]);
  if (r[2]) out.push('y');
  out.push(V[r[3]]);
  return out;
}

// ---- the pool: words as mora arrays ---------------------------------------
// (gloss in the comment; themes are the ones those songs return to)
const WORDS = [
  // pronouns / people
  ['ki', 'mi'], ['bo', 'ku'], ['wa', 'ta', 'shi'], ['a', 'na', 'ta'], ['fu', 'ta', 'ri'], ['mi', 'n', 'na'],
  // the world / sky / light
  ['se', 'ka', 'i'], ['so', 'ra'], ['ho', 'shi'], ['hi', 'ka', 'ri'], ['ka', 'ze'], ['a', 'me'], ['u', 'mi'], ['tsu', 'ki'],
  ['yo', 'ru'], ['a', 'sa'], ['ha', 'na'], ['ni', 'ji'], ['ku', 'mo'], ['ma', 'chi'], ['mi', 'chi'], ['ma', 'do'],
  // heart / dream / voice
  ['ko', 'ko', 'ro'], ['yu', 'me'], ['ko', 'e'], ['u', 'ta'], ['ko', 'to', 'ba'], ['na', 'mi', 'da'], ['e', 'ga', 'o'],
  ['ki', 'mo', 'chi'], ['o', 'mo', 'i'], ['ne', 'ga', 'i'], ['i', 'no', 'ri'], ['ki', 'o', 'ku'], ['ki', 'se', 'ki'],
  // time
  ['i', 'ma'], ['i', 'tsu', 'mo'], ['zu', 't', 'to'].filter((x) => x !== 't'), ['mi', 'ra', 'i'], ['a', 'shi', 'ta'], ['ki', 'no', 'u'], ['to', 'ki'],
  ['ha', 'ji', 'ma', 'ri'], ['o', 'wa', 'ri'], ['ha', 'ru'], ['na', 'tsu'], ['fu', 'yu'],
  // verbs / verb forms (dictionary, -te, -tai)
  ['u', 'ta', 'u'], ['o', 'do', 'ru'], ['ha', 'shi', 'ru'], ['to', 'bu'], ['ma', 'tsu'], ['wa', 'ra', 'u'], ['na', 'ku'],
  ['sa', 'ga', 'su'], ['mi', 'tsu', 'ke', 'ru'], ['tsu', 'na', 'gu'], ['to', 'do', 'ke'], ['ka', 'na', 'e', 'ru'], ['ka', 'wa', 'ru'],
  ['shi', 'n', 'ji', 'te'], ['wa', 'su', 're', 'na', 'i'], ['a', 'i', 'ta', 'i'], ['i', 'ki', 'ta', 'i'], ['mi', 'ta', 'i'],
  ['ki', 'i', 'te'], ['mi', 'te'], ['i', 'ko', 'u'], ['i', 'ku', 'yo'], ['mo', 'u', 'i', 'chi', 'do'],
  // adverbs / adjectives
  ['ki', 't', 'to'].filter((x) => x !== 't'), ['mo', 't', 'to'].filter((x) => x !== 't'), ['ma', 'da'], ['mo', 'u'], ['ta', 'da'],
  ['to', 'o', 'ku'], ['ta', 'ka', 'ku'], ['tsu', 'yo', 'ku'], ['ya', 'sa', 'shi', 'ku'], ['a', 'ka', 'ru', 'i'], ['a', 'o', 'i'],
  // set phrases those songs live on
  ['a', 'ri', 'ga', 'to', 'u'], ['sa', 'yo', 'na', 'ra'], ['da', 'i', 'su', 'ki'], ['o', 'ha', 'yo', 'u'], ['ma', 'ta', 'ne'],
  ['do', 'ki', 'do', 'ki'], ['ki', 'ra', 'ki', 'ra'], ['fu', 'wa', 'fu', 'wa'],
];
const PARTICLES = [['wa'], ['ga'], ['o'], ['ni'], ['no'], ['to'], ['e'], ['mo'], ['de'], ['yo'], ['ne'], ['sa']];
const ENDERS = [['yo'], ['ne'], ['sa'], ['na'], ['a'], ['o']];
const VOCALISE = [['ra', 'ra', 'ra'], ['ra', 'ra'], ['a'], ['o'], ['u', 'u'], ['pa', 'ra', 'pa'], ['ru', 'ru']];

const fnv = (str) => { let h = 0x811c9dc5; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); } return h >>> 0; };
const pick = (arr, seed) => arr[seed % arr.length];

/** Build a line of exactly `n` moras: word (+particle) chunks, a line ender
 *  when the phrase ends on a long note, a vocalise chunk now and then. */
function makeLine(n, seed, { longEnd = false, vocalise = false } = {}) {
  const out = [];
  let left = n, s = seed, guard = 0;
  const endLen = longEnd && n >= 4 ? 1 : 0;
  left -= endLen;
  while (left > 0 && guard++ < 64) {
    s = fnv(`${s}|${left}`);
    let chunk;
    const cands = WORDS.filter((w) => w.length <= left);
    // a vocalise fill about one chunk in twelve (1 in 7 read as "u u u u" salad)
    if (vocalise && left >= 2 && s % 12 === 0) chunk = pick(VOCALISE.filter((w) => w.length <= left), s >>> 3);
    else if (cands.length) {
      chunk = pick(cands, s >>> 3).slice();
      // particle after a content word when it fits and the hash says so
      if (left - chunk.length >= 1 && (s >>> 9) % 3 !== 0 && left - chunk.length !== 2) chunk = chunk.concat(pick(PARTICLES, s >>> 11));
    }
    // a single leftover mora (no word is one mora long) takes a particle
    if (!chunk || !chunk.length) chunk = pick(PARTICLES, s).slice();
    if (chunk.length > left) chunk = chunk.slice(0, left);
    out.push(...chunk); left -= chunk.length;
  }
  if (endLen) out.push(...pick(ENDERS, fnv(`${seed}|end`)));
  return out;
}

/** phrase signature: the CONTOUR (up / down / same per step) and the note
 *  count. A returning letter comes back varied by statement (D97), so an
 *  exact interval+rhythm key never matched; contour survives the variation
 *  and still tells two tunes apart. Two different tunes with one contour
 *  share a line — that reads as a rhyme, not a bug. */
function signature(ph) {
  return `${ph.length}:` + ph.map((n, i) => (i ? Math.sign(n.midi - ph[i - 1].midi) : 0)).join('');
}

/**
 * Assign moras to a score's notes. `score.notes` are {start,dur,midi,…} sorted
 * by start; phrases split at rests >= phraseGap. Mutates notes: adds `syl`
 * (romaji), `ph` (phoneme list), `melisma` (true = vowel continuation of the
 * previous note, no new mora). Returns [{ start, text }] per phrase.
 */
// r36 — the POOL writer (words by hash until the count is met). Superseded as
// the default by src/lib/lyrics-ja-writer.js (real sentences bound to the
// melody); kept as `mode: 'pool'` / `--lyrics pool` so a judged line can be
// reproduced byte-for-byte.
export function assignLyricsPool(score, { seed = score.name ?? 'song', phraseGap = 0.5, melismaUnder = 0.14, longNote = 1.2, vocalise = true } = {}) {
  const notes = score.notes;
  const phrases = [];
  let cur = [];
  for (const n of notes) {
    // the exporter's own phrase index wins when present (2-bar lines, r34)
    const brk = cur.length && (n.phrase != null && cur[0].phrase != null
      ? n.phrase !== cur[0].phrase
      : n.start - (cur[cur.length - 1].start + cur[cur.length - 1].dur) >= phraseGap);
    if (brk) { phrases.push(cur); cur = []; }
    cur.push(n);
  }
  if (cur.length) phrases.push(cur);
  const lines = new Map();
  const out = [];
  for (const ph of phrases) {
    // which notes take a mora: a very short note after another note continues its vowel
    const takers = ph.map((n, i) => !(i > 0 && n.dur < melismaUnder && n.start - (ph[i - 1].start + ph[i - 1].dur) < 0.03));
    const count = takers.filter(Boolean).length;
    const sig = signature(ph);
    let line = lines.get(sig);
    if (!line) {
      const last = ph[ph.length - 1];
      line = makeLine(count, fnv(`${seed}|${sig}`), { longEnd: last.dur >= longNote, vocalise });
      lines.set(sig, line);
    }
    let k = 0, lastVowel = 'a';
    for (let i = 0; i < ph.length; i++) {
      const n = ph[i];
      if (takers[i]) {
        const m = line[Math.min(k, line.length - 1)]; k++;
        n.syl = m; n.ph = moraPhonemes(m); n.melisma = false;
        lastVowel = n.ph[n.ph.length - 1];
      } else {
        n.syl = '-'; n.ph = [lastVowel]; n.melisma = true;
      }
    }
    out.push({ start: ph[0].start, notes: ph.length, text: line.join(' ') });
  }
  return out;
}

/**
 * r36 — REAL lyrics (his "currently, our vocaloid produces random japanese
 * syllables. it should actually produce real japanese lyrics, of course with
 * parts bound to the melody"). Same contract as before: mutates notes (syl /
 * ph / melisma), returns [{ start, notes, text, … }] per phrase — plus kana,
 * romaji (bunsetsu-spaced), gloss, section/role/key and the refrain flags.
 * `score.theme` ({ emotion, environment, description }) and `score.sections`
 * ([{ letter, role, startBar, bars }]) steer it when the exporter sets them.
 * `mode: 'pool'` reproduces the r34 lines.
 */
export function assignLyrics(score, opts = {}) {
  if (opts.mode === 'pool') return assignLyricsPool(score, opts);
  return writeLyrics(score, { melismaUnder: 0, ...opts });
}

/**
 * r36 — his vo_chase note: "if there are multiple voices, even if notes are
 * different they should be saying the same lyrics". A second sung voice
 * (the harmony line) takes the LEAD's mora at every shared onset; a note the
 * lead does not strike (the harmony rests differently) carries the lead's
 * current syllable rather than a word of its own. Mutates `score.notes`
 * (syl / ph / melisma) and rewrites `score.lyrics`; returns the match count.
 */
export function copyLyricsFrom(score, lead, { tol = 0.03 } = {}) {
  const ln = (lead.notes ?? []).filter((n) => n.syl && n.syl !== '-');
  if (!ln.length) return 0;
  let matched = 0;
  for (const n of score.notes) {
    let hit = ln.find((l) => Math.abs(l.start - n.start) <= tol);
    if (hit) matched++;
    else {
      // the lead's syllable sounding at this onset (last lead onset at or before it)
      let best = null;
      for (const l of ln) { if (l.start <= n.start + tol) best = l; else break; }
      hit = best ?? ln[0];
    }
    n.syl = hit.syl; n.ph = hit.ph.slice(); n.melisma = false;
  }
  const phrases = new Map();
  for (const n of score.notes) { const k = n.phrase ?? 0; if (!phrases.has(k)) phrases.set(k, []); phrases.get(k).push(n); }
  score.lyrics = [...phrases.values()].map((ph) => ({ start: ph[0].start, notes: ph.length, text: ph.map((n) => n.syl).join(' ') }));
  return matched;
}
