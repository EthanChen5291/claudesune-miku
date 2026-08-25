// What the ear verdicts actually say (D51).
//
// Computed from src/lib/verdicts.js at load, never hard-coded, so it moves when
// Ethan judges more cards. Everything here reports its own n, because the honest
// summary of the first pass is "36 verdicts, 11 keeps, treat as a hint".
//
// THE HEADLINE, AND IT IS NOT A TASTE FINDING. The single strongest separator
// between keep and kill is `coverage` — how much of the sounding material the
// chord labels explain — at 0.95 for keeps against 0.84 for kills. Coverage is a
// measure of TRANSCRIPTION QUALITY, not of music. Six of the kills sit below
// 0.80 (Your Best Nightmare twice at 0.57, Amalgam 0.65, Ghouliday 0.65,
// Waterfall 0.67, Undertale 0.74). So a large share of the first ear pass was
// Ethan rejecting bad transcriptions rather than expressing preference, and the
// fix for those is the D45 labeller, not the generator.
//
// THE REAL TASTE FINDING is simplicity of chord quality, and it shows up three
// independent ways: kept progressions are 84% plain triads against 59% for
// killed ones, use fewer distinct qualities (2.1 vs 2.8), and score far better
// on quality-given-degree under the counted model (-0.81 vs -1.94). The kills
// are full of m6, diminished, 6ths and ^7 on chromatic degrees; the keeps are
// mostly bare triads.
//
// WHAT DOES **NOT** PREDICT ANYTHING: cadence strength, transition plausibility,
// chords per bar, whether the loop starts on the tonic. All at |d| < 0.1. Those
// are exactly what D49's verifier measures, so the verifier is orthogonal to the
// only taste data that exists. Worth knowing before trusting it.

import { VERDICTS } from './verdicts.js';
import { ALL_PROGRESSIONS, parseDegrees } from './progressions.js';

/** ireal qualities that are bare triads */
const PLAIN = new Set(['', 'm', 'sus', '2', '5']);

/** entries below this coverage are transcription failures, not musical choices */
export const COVERAGE_FLOOR = 0.85;

let PROFILE = null;

/**
 * tasteProfile() -> what the verdicts imply, with the evidence attached.
 *
 * Returns { n, keeps, kills, plainShare, colour, coverage, confidence, caveats }.
 * `colour` is a 0..1 value in the units generateProgression() takes, derived
 * from the share of plain triads in kept progressions rather than chosen.
 */
export function tasteProfile() {
  if (PROFILE) return PROFILE;

  const rows = [];
  for (const [name, v] of Object.entries(VERDICTS)) {
    const e = ALL_PROGRESSIONS[name];
    if (!e) continue;
    const toks = parseDegrees(e.degrees);
    rows.push({
      verdict: v.verdict,
      plain: toks.filter((t) => PLAIN.has(t.quality)).length / toks.length,
      nQual: new Set(toks.map((t) => t.quality)).size,
      len: toks.length,
      coverage: e.coverage ?? null,
      family: e.family,
    });
  }
  const keeps = rows.filter((r) => r.verdict === 'keep');
  const kills = rows.filter((r) => r.verdict === 'kill');
  const mean = (rs, k) => {
    const xs = rs.map((r) => r[k]).filter((x) => x != null);
    return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  };

  const plainShare = keeps.length ? mean(keeps, 'plain') : null;
  PROFILE = {
    n: rows.length,
    keeps: keeps.length,
    kills: kills.length,
    plainShare,
    // generateProgression's `colour` runs 0 (all triads) to 1 (all extensions),
    // so the observed plain share inverts straight into it.
    colour: plainShare == null ? null : Number((1 - plainShare).toFixed(2)),
    nQual: { keep: mean(keeps, 'nQual'), kill: mean(kills, 'nQual') },
    coverage: { keep: mean(keeps, 'coverage'), kill: mean(kills, 'coverage') },
    length: { keep: mean(keeps, 'len'), kill: mean(kills, 'len') },
    // With 11 keeps against 19 features examined, three separators at |d| ~ 0.9
    // is around the edge of what multiple comparisons make believable. What
    // makes the quality finding credible is not the effect size but that three
    // independent measures of the same underlying thing all moved together.
    confidence: rows.length < 60 ? 'low' : rows.length < 200 ? 'moderate' : 'usable',
    caveats: [
      `n=${rows.length} (${keeps.length} keep) — a hint, not a model`,
      'every verdict came from audition/undertale.html, which plays a FULL '
        + 'arrangement: the judgment mixes harmony with instruments, form and mix',
      'the strongest separator (coverage 0.95 vs 0.84) measures transcription '
        + 'quality, not taste — those kills are the D45 labeller\'s problem',
      'all verdicts are Undertale-idiom, so the profile is that idiom\'s, not Ethan\'s in general',
    ],
  };
  return PROFILE;
}

/** a one-screen summary, for scripts and audition pages */
export function explainTaste() {
  const t = tasteProfile();
  if (!t.n) return ['no verdicts recorded yet — run scripts/import-verdicts.mjs'];
  return [
    `${t.n} verdicts (${t.keeps} keep, ${t.kills} kill) · confidence ${t.confidence}`,
    `plain triads:      keep ${(100 * t.plainShare).toFixed(0)}%   -> colour ${t.colour}`,
    `distinct qualities keep ${t.nQual.keep.toFixed(1)}   kill ${t.nQual.kill.toFixed(1)}`,
    `label coverage:    keep ${t.coverage.keep.toFixed(2)}  kill ${t.coverage.kill.toFixed(2)}   <- transcription, not taste`,
    `chords per loop:   keep ${t.length.keep.toFixed(1)}   kill ${t.length.kill.toFixed(1)}`,
    ...t.caveats.map((c) => `  caveat: ${c}`),
  ];
}
