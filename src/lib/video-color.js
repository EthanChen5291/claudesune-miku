// r24 — GOOD COLOUR, RECOVERED FROM DATA WE ALREADY HAD.
//
// HIS RULING: "there's good color and bad color. the ones i mentioned are bad
// color. good color is like the songs in videolab.html of the songs i liked
// (kpop, citypop, etc. should we save these as foundational chord patterns to
// hardcode so we know what's going on)?"
//
// The answer to the question is: THEY ARE ALREADY SAVED. Every one of the 48
// entries in progressions-videos.js carries a `voicedAs` array — the literal
// chord spellings transcribed off the video, "G7(9,13)", "A7#5(#9)", "Gm7(9)",
// "F7(b9)" — a test validates it chord-for-chord against the degrees, and he has
// clicked KEEP on 12 of the 13 that reached a page.
//
// And NOTHING READ IT. Measured: `voicedAs` appears in the data file, in one
// comment, and in one test. The generator retrieved the degree string, threw the
// transcribed voicing away, and re-voiced generically — so "2:m9 7:7 0:^7" lost
// the 9 and the 13 that made `G7(9,13)` sound like city-pop.
//
// That is the whole good/bad colour distinction in one mechanism. GOOD colour is
// VERTICAL and part of the chord: an extension the source actually played, in
// the harmony, where the ear hears it as the chord's own flavour. BAD colour is
// HORIZONTAL: an ornament layer sounding a tone the chord does not contain, which
// his r23 export called "a dissonance pass ... randomly add dissonance".
//
// This module recovers the vertical half. It is PURE and returns an UPGRADED
// DIALECT TOKEN, never a new pool entry, so it cannot re-roll a retrieval
// (D95) — the degrees keep their roots and their count; only the quality gets
// richer, and only where the transcription says so.

/** extension spellings -> the dialect quality that carries them */
const UPGRADES = [
  // dominant family
  { from: '7', has: /\b13\b/, to: '13' },
  { from: '7', has: /\(9|[^b#]9\)|\(9,/, to: '9' },
  // major family
  { from: '^7', has: /\b13\b/, to: '^9' },   // no ^13 in the dialect; 9 is the audible half
  { from: '^7', has: /9/, to: '^9' },
  // minor family
  { from: 'm7', has: /\b13\b/, to: 'm9' },   // no m13 in the dialect
  { from: 'm7', has: /9/, to: 'm9' },
  // plain triads that the source voiced with a 6th or a 9th
  { from: '', has: /6\/9|\b69\b/, to: '69' },
  { from: '', has: /\badd9\b|\(9\)/, to: 'add9' },
  { from: '', has: /\b6\b/, to: '6' },
  { from: 'm', has: /add9/, to: 'madd9' },
  { from: 'm', has: /\b6\b/, to: 'm6' },
];

/**
 * Upgrade ONE degree token using the voicing transcribed beside it.
 * `token` is dialect ("7:7", "0:^7", "2:m7", "5"); `voiced` is free text from
 * `voicedAs` ("G7(9,13)"). Returns the token unchanged when the transcription
 * says nothing the dialect can carry — which is most of them, deliberately.
 */
export function colorUpgrade(token, voiced) {
  if (!token || !voiced || typeof voiced !== 'string') return token;
  // Several voicedAs cells are transcription PROSE rather than a chord symbol
  // ("3 G#3 C#4 D4 F#4 G4 D5 (G-D against C#-G#)"). Refuse those outright — a
  // regex that matches a stray "9" inside a note name would invent colour that
  // was never played, which is the exact failure this module exists to avoid.
  if (/\s[A-G][#b]?\d/.test(voiced) || voiced.length > 24) return token;
  const [root, quality = ''] = String(token).split(':');
  // the tail after the chord letter, e.g. "7(9,13)" from "G7(9,13)"
  const tail = voiced.replace(/^[A-G][#b]?/, '');
  for (const u of UPGRADES) {
    if (u.from !== quality) continue;
    if (!u.has.test(tail)) continue;
    return u.to ? `${root}:${u.to}` : root;
  }
  return token;
}

/**
 * Upgrade a whole degree string against a whole voicedAs array. Lengths must
 * agree chord-for-chord (test/videos.test.js already enforces that on the pack);
 * a mismatch returns the original untouched rather than guessing an alignment.
 */
export function colorUpgradeDegrees(degrees, voicedAs) {
  if (!degrees || !Array.isArray(voicedAs)) return degrees;
  const toks = String(degrees).trim().split(/\s+/);
  if (toks.length !== voicedAs.length) return degrees;
  return toks.map((t, i) => colorUpgrade(t, voicedAs[i])).join(' ');
}
