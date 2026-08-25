// NOT A STANDALONE MODULE. This file is appended verbatim to the generated
// src/lib/progressions.js by scripts/import-ldrolez.mjs — its `./voicings.js`
// import and its references to PROGRESSIONS only resolve once concatenated
// there. Edit retrieval logic here, then re-run the importer.

// ---------------------------------------------------------------------------
// Parsing + retrieval (§3.5: retrieval by computed properties, tags secondary)
// ---------------------------------------------------------------------------
import { VOICINGS } from './voicings.js';
import { PROGRESSIONS_UNISON } from './progressions-unison.js';
import { PROGRESSIONS_UNDERTALE } from './progressions-undertale.js';
import { PROGRESSIONS_VGMUSIC } from './progressions-vgmusic.js';
import { PROGRESSIONS_VIDEOS } from './progressions-videos.js';
import { VERDICTS } from './verdicts.js';

/** All pools in one registry. `pack` says where an entry came from; the ldrolez
 *  set is Roman-numeral source data, the unison set is extracted from labeled
 *  MIDI (D29), the undertale set is solved from unlabeled full songs (D30). */
export const ALL_PROGRESSIONS = {
  ...PROGRESSIONS, ...PROGRESSIONS_UNISON, ...PROGRESSIONS_UNDERTALE, ...PROGRESSIONS_VGMUSIC,
  // D57: hand-transcribed by eye from the igexport-* videos — the only pack
  // with no MIDI behind it (coverage: null on every entry, see the file header)
  ...PROGRESSIONS_VIDEOS,
};

// D51: the ear, overlaid. `ratified` was false on all 421 entries because the
// audition pages' keep/kill verdicts had no path back into the library; A6.1
// says ratification is earned by ear, and this is where that earning lands.
// Applied HERE, once, so nothing downstream has to know verdicts exist —
// `findProgressions({ ratifiedOnly: true })` and exemplarPool() just work.
// A verdict judges THE MUSIC THAT PLAYED. If the entry has been re-transcribed
// since, the verdict is about a different piece and is not honoured — D52's
// percussion fix moved both Amalgam entries from B:minor to D:major, so the two
// kills recorded against them were kills of music that no longer exists. Such
// entries go back to needing an ear rather than silently keeping a stale label.
for (const [name, v] of Object.entries(VERDICTS)) {
  const e = ALL_PROGRESSIONS[name];
  if (!e) continue;
  if (v.judged != null && v.judged !== e.degrees) { e.verdictStale = v.verdict; continue; }
  e.ratified = v.verdict === 'keep';
  e.verdict = v.verdict;
  e.needsEar = false;       // heard, whichever way it went
}

/** 'degrees' string -> [{ semis, spell, quality }] ('spell' = source accidental) */
export function parseDegrees(degrees) {
  return String(degrees).trim().split(/\s+/).map((tok) => {
    const m = /^(\d{1,2})([b#])?(?::(.+))?$/.exec(tok);
    if (!m) throw new Error(`bad degree token "${tok}" (expected "<semitones>[b|#][:<quality>]")`);
    const semis = Number(m[1]);
    if (semis < 0 || semis > 11) throw new Error(`degree "${tok}" out of range (0-11 semitones above the tonic)`);
    return { semis, spell: m[2] ?? null, quality: m[3] ?? '' };
  });
}

/** the distinct chord qualities an entry needs a voicing for */
export function progressionQualities(entry) {
  return new Set(parseDegrees(entry.degrees).map((c) => c.quality));
}

/** can voicing shape `shape` (src/lib/voicings.js) voice every chord in `entry`? */
export function playableWith(entry, shape) {
  const shapes = VOICINGS[shape]?.shapes;
  if (!shapes) throw new Error(`unknown voicing shape "${shape}" (have: ${Object.keys(VOICINGS).join(', ')})`);
  return [...progressionQualities(entry)].every((q) => q in shapes);
}

/**
 * Retrieve by musical function. `moods` matches the SOURCE's tags (any-of);
 * `shape` restricts to progressions the given voicing shape can actually play —
 * use it rather than discovering a silent chord at bind time.
 */
export function findProgressions({
  family = null, moods = null, length = null, minLength = 0, maxLength = Infinity,
  shape = null, ratifiedOnly = false, pack = null, needsEar = null,
} = {}) {
  const want = moods ? [].concat(moods).map((m) => m.toLowerCase()) : null;
  const packs = pack ? new Set([].concat(pack)) : null;
  const out = [];
  for (const [name, entry] of Object.entries(ALL_PROGRESSIONS)) {
    if (packs && !packs.has(entry.pack)) continue;
    if (needsEar != null && Boolean(entry.needsEar) !== needsEar) continue;
    if (family && entry.family !== family) continue;
    if (ratifiedOnly && !entry.ratified) continue;
    const n = parseDegrees(entry.degrees).length;
    if (length != null && n !== length) continue;
    if (n < minLength || n > maxLength) continue;
    if (want && !entry.moods.some((m) => want.includes(m.toLowerCase()))) continue;
    if (shape && !playableWith(entry, shape)) continue;
    out.push({ name, entry, length: n, qualities: [...progressionQualities(entry)] });
  }
  return out;
}
