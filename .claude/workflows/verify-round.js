// The motif-engine ROUND VERIFICATION workflow — his r33 ask, made standing:
// "you have control to do other things too. create a verifcation process and
// iterate."
//
// Run AFTER a round's fixes are built and pages rebuilt:
//   Workflow({ name: 'verify-round', args: {
//     pages: ['songs', 'reels'],                  // audition/<page>.html to sweep
//     snapshots: { songs: '/abs/path/pre.html' }, // judged baselines per page
//     movedExpected: ['vs_a', 'vs_b'],            // the ONLY songs allowed to move
//     claims: [ { name: 'acc-cap', text: 'the _acc runs <= 0.72x the lead realized mean on every reels card' }, ... ],
//   }})
//
// It runs the four standing checks every round has needed (the multi-agent
// verify pass has caught a real defect nearly every round — CLAUDE.md's own
// ultracode law), each agent REFUTING rather than confirming:
//   1. STABILITY  — byte-compare vs snapshots; only movedExpected may move;
//                   keeps/pins/niche lanes never.
//   2. CLAIMS     — one adversarial verifier per stated fix claim, independent
//                   re-measurement in the MIX.
//   3. RATIOS     — D77 sweep: every support layer vs its lead's REALIZED mean
//                   (never nominal), drums included; flags > 0.8x.
//   4. GRAMMAR    — melody metrics vs the r33 reference bands
//                   (research/melody-grammar-r33.md): odd-16th share,
//                   final-slot shorts, stepwise %, leap rate, NCT resolution,
//                   out-of-key parks.
// then a COMPLETENESS CRITIC over all findings + the round's verdict notes.

export const meta = {
  name: 'verify-round',
  description: 'Standing adversarial verification for a motif-engine round',
  whenToUse: 'After fixes + page rebuilds, before the D-entry. Pass pages/snapshots/movedExpected/claims via args.',
  phases: [
    { title: 'Stability' },
    { title: 'Claims' },
    { title: 'Ratios+Grammar' },
    { title: 'Critic' },
  ],
}

const REPO = '/Users/ethanchen/Documents/GitHub/motif-engine'
const A = args ?? {}
const pages = A.pages ?? ['songs']
const snapshots = A.snapshots ?? {}
const movedExpected = A.movedExpected ?? []
const claims = A.claims ?? []

const PROBE = `Measure IN THE MIX with the project probe pattern:
  import { evaluateSong, hapsByLabel } from '${REPO}/src/harness/evaluate.js';
  const html = readFileSync('${REPO}/audition/<page>.html','utf8');
  const i = html.indexOf('const DATA = ');
  const data = JSON.parse(html.slice(i+13, html.indexOf(';\\n', i)));
  // evaluateSong('setcpm(bpm/beats)\\np: stack(mix)'); hapsByLabel(ev,0,totalBars).get('p').haps
  // Number() Fraction begins; h.value.note may be a STRING ("d#4") or NUMERIC after .add(note(n)); onset haps: part.begin==whole.begin; one cycle = one bar.
Known traps (each has burned a round): solos are unmasked — never take a number from them; two layers share sounds; a suspiciously clean number (0.0%, 100%) is a bug until re-derived with independent code; .mul(gain) ramps emit gain-0 haps (exclude < 0.02); the lead's REALIZED mean is its envelope mean x nominal, not its nominal.`

phase('Stability')
const stability = await agent(`Adversarial stability check for motif-engine. Pages: ${JSON.stringify(pages)}. Snapshots: ${JSON.stringify(snapshots)}. The ONLY songs allowed to differ from their snapshot: ${JSON.stringify(movedExpected)}.
For each page with a snapshot: parse both DATA blocks, byte-compare every song object. Report: unexpected movers (any song not in the allowed list), allowed movers that did NOT move (a fix that never landed), and for every DERIVED keep (src/lib/verdicts.js), grammarPin/pinFrom song (grep SONG_OPTS in scripts/audition-songs.mjs) and niche-lane song (env desert/jungle/manor/catacombs/citadel) an explicit byte-identical verdict. A prose-keep pin is allowed to differ in card-TEXT fields only (cast/devicesAsked/why) — its MUSIC fields (mix, solos, degrees, symbols, bpm, key, drums, letters) must be identical; check that split explicitly.
${PROBE}
Return RAW verdicts per category with counts and names.`, { label: 'stability', phase: 'Stability' })

phase('Claims')
const claimResults = claims.length
  ? await parallel(claims.map((c) => () => agent(`Adversarially verify ONE claim about the rebuilt motif-engine pages. Try to REFUTE it by independent measurement; verdict CONFIRMED/REFUTED/CORRECTED + your number + method, then hunt one side effect the claim's fix could plausibly have caused and measure whether it did.
CLAIM [${c.name}]: ${c.text}
${PROBE}`, { label: `claim:${c.name}`, phase: 'Claims' })))
  : []

phase('Ratios+Grammar')
const [ratios, grammar] = await parallel([
  () => agent(`D77 ratio sweep over ${JSON.stringify(pages)} (motif-engine). For every song, in the MIX: per-sound mean gain and the ratio to the lead's REALIZED mean (identify the lead label from the solos map, compute its in-mix mean). Flag every pitched support and every drum voice at >= 0.8x. Also flag any layer whose gain is CONSTANT (min==max) across 20+ notes — a clobbered envelope. ${PROBE} Return the flag table only (song | layer/sound | ratio | note), plus totals.`, { label: 'ratios', phase: 'Ratios+Grammar' }),
  () => agent(`Melody grammar sweep over ${JSON.stringify(pages)} (motif-engine), leads in the MIX, against the r33 reference bands (${REPO}/research/melody-grammar-r33.md): odd-16th onset share (band 10-27%, flag songs > 50%), short-notes-in-final-16th-slot (~6% uniform; flag > 15%), stepwise % (flag < 20%), large-leap >P5 (flag > 12%), NCT step-resolution (flag < 25% where NCT rate > 5%), out-of-key PARKS (any repeated/held out-of-key pitch — the one shape no reference writes; flag EVERY instance with song+bar). ${PROBE} Return per-page aggregates + the flag list.`, { label: 'grammar', phase: 'Ratios+Grammar' }),
])

phase('Critic')
const critic = await agent(`Completeness critic for a motif-engine round verification. Below are the stability sweep, per-claim verdicts, the D77 ratio sweep and the melody-grammar sweep. Produce: (1) SHIP / DO-NOT-SHIP with the blocking items; (2) every REFUTED/CORRECTED claim that demands a code change; (3) flags worth a D-entry addendum but not a block; (4) what none of the agents measured that the round's claims imply should have been (the absent measurement is your specialty). Be blunt; the D-entry quotes you.
[STABILITY]\n${typeof stability === 'string' ? stability : JSON.stringify(stability)}
[CLAIMS]\n${claimResults.filter(Boolean).map((r, i) => `(${claims[i]?.name}) ${typeof r === 'string' ? r : JSON.stringify(r)}`).join('\n')}
[RATIOS]\n${typeof ratios === 'string' ? ratios : JSON.stringify(ratios)}
[GRAMMAR]\n${typeof grammar === 'string' ? grammar : JSON.stringify(grammar)}`, { label: 'critic', phase: 'Critic', effort: 'high' })

return { stability, claims: claimResults, ratios, grammar, critic }
