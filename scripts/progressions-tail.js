// NOT A STANDALONE MODULE. This file is appended verbatim to the generated
// src/lib/progressions.js by scripts/import-ldrolez.mjs — its `./voicings.js`
// import and its references to PROGRESSIONS only resolve once concatenated
// there. Edit retrieval logic here, then re-run the importer.

// ---------------------------------------------------------------------------
// Parsing + retrieval (§3.5: retrieval by computed properties, tags secondary)
// ---------------------------------------------------------------------------
import { VOICINGS } from './voicings.js';

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
  shape = null, ratifiedOnly = false,
} = {}) {
  const want = moods ? [].concat(moods).map((m) => m.toLowerCase()) : null;
  const out = [];
  for (const [name, entry] of Object.entries(PROGRESSIONS)) {
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
