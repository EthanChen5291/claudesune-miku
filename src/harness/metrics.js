// Section metrics (§3.3), computed per label per cycle range.
// Definitions documented in DECISIONS.md D8. The beat grid is DERIVED from the
// meter (1 cycle = 1 bar, grid = 1/numerator), never hardcoded 4/4 (D7).

import { pitchOf, gainOf } from './signature.js';

export function parseMeter(meter = '4/4') {
  const m = /^(\d+)\s*\/\s*(\d+)$/.exec(String(meter).trim());
  if (!m) throw new Error(`unparseable meter "${meter}"`);
  return { num: Number(m[1]), den: Number(m[2]) };
}

function cyclePos(f) {
  // exact position within cycle as {num, den} integers from a fraction.js value
  const n = BigInt(f.n) * BigInt(f.s < 0 ? -1 : 1);
  const d = BigInt(f.d);
  const mod = ((n % d) + d) % d;
  return { n: mod, d };
}

function onGrid(f, gridSteps) {
  const { n, d } = cyclePos(f);
  // position*gridSteps integral  <=>  n*gridSteps % d == 0
  return (n * BigInt(gridSteps)) % d === 0n;
}

function inRange(h, a, b) {
  const t = h.whole.begin.valueOf();
  return t >= a - 1e-9 && t < b - 1e-9;
}

/**
 * Metrics for one label's onset haps over [from, to) cycles, or over several
 * disjoint ranges (a recurring section) via opts.ranges = [[a,b], ...].
 */
export function labelMetrics(haps, { from = 0, to = 16, meter = '4/4', ranges = null } = {}) {
  const { num } = parseMeter(meter);
  const rs = ranges ?? [[from, to]];
  const hs = haps.filter((h) => rs.some(([a, b]) => inRange(h, a, b)));
  const cycles = Math.max(rs.reduce((acc, [a, b]) => acc + (b - a), 0), 1e-9);

  // pitch
  const midis = [];
  let unpitched = 0;
  for (const h of hs) {
    const p = pitchOf(h.value);
    if (p == null) unpitched++;
    else midis.push(p);
  }

  // syncopation: fraction of onsets off the meter's beat grid
  let off = 0;
  for (const h of hs) if (!onGrid(h.whole.begin, num)) off++;

  // pitch-class entropy
  const pcCounts = new Map();
  for (const p of midis) {
    const pc = ((Math.round(p) % 12) + 12) % 12;
    pcCounts.set(pc, (pcCounts.get(pc) ?? 0) + 1);
  }
  let entropy = 0;
  for (const c of pcCounts.values()) {
    const q = c / Math.max(midis.length, 1);
    entropy -= q * Math.log2(q);
  }

  // gains / accent variance
  const gains = hs.map((h) => gainOf(h.value));
  const gMean = gains.length ? gains.reduce((a, x) => a + x, 0) / gains.length : 0;
  const gVar = gains.length ? gains.reduce((a, x) => a + (x - gMean) ** 2, 0) / gains.length : 0;

  // onset variety: does the rhythm evolve cycle to cycle? (D8)
  const byCycle = new Map();
  for (const h of hs) {
    const c = Math.floor(h.whole.begin.valueOf() + 1e-9);
    const { n, d } = cyclePos(h.whole.begin);
    const key = `${n}/${d}`;
    if (!byCycle.has(c)) byCycle.set(c, new Set());
    byCycle.get(c).add(key);
  }
  const cycleKeys = [...byCycle.keys()].sort((a, b) => a - b);
  let repeats = 0, comparisons = 0;
  for (let i = 1; i < cycleKeys.length; i++) {
    if (cycleKeys[i] !== cycleKeys[i - 1] + 1) continue;
    comparisons++;
    const prev = byCycle.get(cycleKeys[i - 1]);
    const cur = byCycle.get(cycleKeys[i]);
    if (prev.size === cur.size && [...cur].every((k) => prev.has(k))) repeats++;
  }

  return {
    onsets: hs.length,
    density: round(hs.length / cycles),
    gwDensity: round(gains.reduce((a, x) => a + x, 0) / cycles), // gain-weighted density (loudness proxy, A1.3)
    registerSpan: midis.length ? Math.max(...midis) - Math.min(...midis) : 0,
    registerCenter: midis.length ? round(midis.reduce((a, x) => a + x, 0) / midis.length) : null,
    registerMax: midis.length ? Math.max(...midis) : null,
    pitched: midis.length,
    unpitched,
    syncopation: hs.length ? round(off / hs.length) : 0,
    pitchClassEntropy: round(entropy),
    accentMean: round(gMean),
    accentVariance: round(gVar),
    onsetVariety: comparisons ? round(1 - repeats / comparisons) : 0,
    activeCycles: byCycle.size,
  };
}

/**
 * Harmonic rhythm: chord CHANGES per cycle over a harmony stream's haps.
 * Simultaneous onsets are grouped into one sonority (so voiced chords count once);
 * a restatement of the same harmony (same chord symbol / same pc-set) is NOT a change.
 */
export function harmonicRhythm(haps, { from = 0, to = 16, ranges = null } = {}) {
  const rs = ranges ?? [[from, to]];
  const hs = haps.filter((h) => rs.some(([a, b]) => inRange(h, a, b)))
    .slice()
    .sort((a, b) => a.whole.begin.valueOf() - b.whole.begin.valueOf());
  // group by onset time
  const groups = new Map();
  for (const h of hs) {
    const t = h.whole.begin.valueOf();
    const key = Math.round(t * 1e9);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(h);
  }
  let changes = 0;
  let prev = null;
  for (const key of [...groups.keys()].sort((a, b) => a - b)) {
    const sonority = JSON.stringify(groups.get(key).map((h) => chordKey(h.value)).sort());
    if (prev !== null && sonority !== prev) changes++;
    if (prev === null) changes++; // first sonority establishes the harmony
    prev = sonority;
  }
  const totalCycles = rs.reduce((acc, [a, b]) => acc + (b - a), 0);
  return { changes, perCycle: round(changes / Math.max(totalCycles, 1e-9)), sonorities: groups.size };
}

function chordKey(v) {
  if (v == null || typeof v !== 'object') return v;
  if (v.chord !== undefined) return v.chord;
  if (v.note !== undefined) {
    const p = pitchOf(v);
    return p == null ? v.note : ((Math.round(p) % 12) + 12) % 12; // pitch class, octave-blind
  }
  if (v.n !== undefined) return v.n;
  return JSON.stringify(v);
}

/**
 * Aggregate metrics across several labels' haps (e.g. a whole section):
 * density sums; register span is over the union; entropy over union pcs.
 */
export function aggregateMetrics(hapLists, opts) {
  const all = hapLists.flat();
  return labelMetrics(all, opts);
}

function round(x) { return Math.round(x * 1e6) / 1e6; }
