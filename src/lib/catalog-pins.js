// catalog-pins.js — the ONE implementation of the catalog page's live pair
// math (key seating, add-on gain, tempo fit), shared by the page builder and
// the importer so a pair's judged {d, g, t} can be frozen EXACTLY as the
// client computed it when Ethan listened (r33/D129; the D127 addendum's
// "replica that drifts" lesson made this module).
//
// Candidate rows here are the PAGE DATA shape: { tpc, mode, pcs, cpm, cont,
// again } (builder rows and audition/catalog.html DATA.candidates both fit).

export const nearestD = (x) => { let d = x % 12; if (d > 6) d -= 12; if (d < -6) d += 12; return d; };

// client keyDelta replica (kept in lockstep with audition-catalog.mjs's
// inline client source — mode-aware relative-key seating, D125)
export function pairKeyDelta(cur, part) {
  if (cur.tpc == null || part.tpc == null) return 0;
  const cm = cur.mode;
  const pm = part.mode;
  const crossMode = (cm === 'major' || cm === 'minor') && (pm === 'major' || pm === 'minor') && cm !== pm;
  if (!crossMode) return nearestD(cur.tpc - part.tpc);
  const seats = pm === 'minor' ? [9, 2, 4] : [3, 8, 10];
  const scalePcs = cm === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const cands = seats.map((s) => nearestD((cur.tpc + s) % 12 - part.tpc));
  const total = part.pcs ? part.pcs.reduce((a, b) => a + b, 0) : 0;
  if (!total) return cands[0];
  const inScale = {};
  scalePcs.forEach((x) => { inScale[(x + cur.tpc) % 12] = 1; });
  let best = cands[0];
  let bestScore = -1;
  cands.forEach((k) => {
    let hit = 0;
    for (let pc = 0; pc < 12; pc++) if (inScale[(pc + k + 24) % 12]) hit += part.pcs[pc];
    const score = hit / total;
    if (score > bestScore + 1e-9) { bestScore = score; best = k; }
  });
  return best;
}

// the add-on gain the client realizes for an UNPINNED partner: 0.85 base,
// except an unread (again===1) CONTINUOUS partner sits at 0.7 (his dynamics
// law — continuous layers ride softer in the background)
export function pairLiveGain(p) {
  const again = p.again ?? 1;
  const base = p.cont && again === 1 ? 0.7 : 0.85;
  return Math.round(base * again * 1000) / 1000;
}

export const pairTimeFx = (card, p) => (card.cpm / p.cpm >= 1.75 ? '.slow(2)' : '');

// what the client would play for this pair right now, as a pin record
export function computeLivePin(card, p, { tonicOnly = false } = {}) {
  const d = tonicOnly
    ? (card.tpc != null && p.tpc != null ? nearestD(card.tpc - p.tpc) : 0)
    : pairKeyDelta(card, p);
  return { d, g: pairLiveGain(p), t: pairTimeFx(card, p) };
}
