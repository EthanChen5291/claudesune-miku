// r23 — WHAT MAKES A BATTLE THEME FEEL LIKE ONE.
//
// His ask: "for the boss fights learn what makes them actually feel energetic
// with stakes on the line and epic through their layering patterns and what
// they do in each instrument and rhythm and intervals."
//
// Method note that matters: the contrast is BATTLE files vs the REST OF HIS OWN
// hand-picked set, not vs a generic corpus. Both groups are music he chose, so
// anything that separates them is a battle property rather than a taste
// property. n is small (15 vs 46) — every number here is a hand-picked-set
// statistic, printed with its n, and nothing is counted into src/lib (D95).
//
// His scoping rule applies with full force: "some songs are abstract or have
// specific quirks - just analyze in terms of sections or the 'normal' sections".
// Every per-part statistic is taken inside the CORE WINDOW only.
//
// Run: node scripts/analyze-boss-r23.mjs

import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCorpusMidi, extractParts, GM_FAMILY, DRUM_ROLE, PC_NAMES } from './corpus-midi.mjs';
import { detectKey, labelChord, classifyParts } from './corpus-features.mjs';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const DIRS = ['audios/manual-r22', 'audios/manual-r22b'];
const mod12 = (x) => ((x % 12) + 12) % 12;
const median = (a) => { if (!a.length) return 0; const b = [...a].sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (x) => (x * 100).toFixed(1) + '%';

// Explicit, printed, reviewable. A file lands in BATTLE only on an unambiguous
// name; "chase"/"chaos" go to a separate TENSION bucket so a chase cue cannot
// silently carry the battle claim.
const BATTLE_RE = /battle|boss|miniboss|combat|army|airman|eggreverie|hand_combat/i;
const TENSION_RE = /chase|chaos|challenge/i;

// ------------------------------------------------------------------ helpers

/** is this part a MOTOR: continuous subdivision with (almost) no rests? */
function motorProfile(notes, barTicks, bars) {
  if (notes.length < 8) return { isMotor: false, sub: 0, fill: 0 };
  const onsets = [...new Set(notes.map((n) => n.tick))].sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < onsets.length; i++) gaps.push(onsets[i] - onsets[i - 1]);
  const g = median(gaps);
  if (g <= 0) return { isMotor: false, sub: 0, fill: 0 };
  const sub = barTicks / g;               // 8 = 8ths, 16 = 16ths
  // fill = share of the expected grid slots that actually carry an onset
  const slots = Math.round(bars * sub);
  const fill = slots ? onsets.length / slots : 0;
  return { isMotor: sub >= 7.5 && fill >= 0.75, sub, fill };
}

/** melodic behaviour of one line's top voice */
function melodic(notes) {
  const byTick = new Map();
  for (const n of notes) byTick.set(n.tick, Math.max(byTick.get(n.tick) ?? -1, n.midi));
  const seq = [...byTick.entries()].sort((a, b) => a[0] - b[0]).map((x) => x[1]);
  let rep = 0, step = 0, leap = 0, big = 0;
  const ivs = [];
  for (let i = 1; i < seq.length; i++) {
    const d = seq[i] - seq[i - 1];
    ivs.push(Math.abs(d));
    if (d === 0) rep++; else if (Math.abs(d) <= 2) step++; else if (Math.abs(d) <= 7) leap++; else big++;
  }
  const m = rep + step + leap + big || 1;
  return { n: seq.length, rep: rep / m, step: step / m, leap: leap / m, big: big / m, medIv: median(ivs),
           range: seq.length ? Math.max(...seq) - Math.min(...seq) : 0 };
}

/** how many DISTINCT pitches this part uses relative to its onset count */
const pitchEconomy = (notes) => new Set(notes.map((n) => n.midi)).size / (notes.length || 1);

// --------------------------------------------------------------- one file

function analyze(path, name) {
  const mid = readCorpusMidi(path);
  const parts = extractParts(mid);
  const [num, den] = mid.timeSig;
  const barTicks = Math.round(mid.ppq * 4 * (num / den));
  const totalBars = Math.max(1, Math.ceil(mid.endTick / barTicks));
  const pitched = parts.filter((p) => !p.isDrum);
  const drums = parts.filter((p) => p.isDrum);
  if (!pitched.length) return null;

  // ---- CORE WINDOW: longest stretch where the sounding-part SET holds still
  const barSet = Array.from({ length: totalBars }, () => new Set());
  const arc = new Array(totalBars).fill(0);
  for (const p of pitched) {
    const bs = new Set(p.notes.map((n) => Math.floor(n.tick / barTicks)));
    for (const b of bs) if (b < totalBars) { barSet[b].add(p.key); arc[b]++; }
  }
  const jac = (x, y) => { if (!x.size && !y.size) return 1; let i = 0; for (const v of x) if (y.has(v)) i++; return i / (x.size + y.size - i || 1); };
  const W = Math.min(16, Math.max(8, Math.floor(totalBars / 4)));
  const peak = Math.max(...arc) || 1;
  let core = { start: 0, len: Math.min(W, totalBars), score: -1 };
  for (let st = 0; st + W <= totalBars; st++) {
    let stab = 0;
    for (let i = st + 1; i < st + W; i++) stab += jac(barSet[i], barSet[i - 1]);
    stab /= (W - 1) || 1;
    const strength = mean(arc.slice(st, st + W)) / peak;
    const sc = stab * 0.6 + strength * 0.4;
    if (sc > core.score) core = { start: st, len: W, score: sc };
  }
  const t0 = core.start * barTicks, t1 = (core.start + core.len) * barTicks;
  const inCore = (n) => n.tick >= t0 && n.tick < t1;
  const coreBars = core.len;

  const cParts = pitched.map((p) => ({ ...p, notes: p.notes.filter(inCore) })).filter((p) => p.notes.length >= 3);
  if (!cParts.length) return null;
  const cDrums = drums.map((p) => ({ ...p, notes: p.notes.filter(inCore) })).filter((p) => p.notes.length);
  const { feats } = classifyParts([...cParts, ...cDrums], barTicks);
  const role = new Map(feats.map((f) => [f.key, f.role]));

  const coreNotes = mid.notes.filter((n) => inCore(n) && n.channel !== 9);
  const key = detectKey(coreNotes, mid.ppq);

  // ---- CONCURRENCY: pitched parts sounding per bar, inside the core
  const conc = [];
  for (let b = core.start; b < core.start + coreBars; b++) {
    let c = 0;
    for (const p of cParts) if (p.notes.some((n) => Math.floor(n.tick / barTicks) === b)) c++;
    conc.push(c);
  }

  // ---- HARMONIC RHYTHM + chord qualities, on a HALF-BAR grid (a battle theme
  // that changes chord twice a bar is invisible on a per-bar grid)
  const chords = [];
  for (let h = 0; h < coreBars * 2; h++) {
    const a = t0 + h * barTicks / 2, b = a + barTicks / 2;
    const w = new Array(12).fill(0); let low = null; const pcs = new Set();
    for (const n of coreNotes) {
      const s = Math.max(n.tick, a), e = Math.min(n.tick + n.dur, b);
      if (e <= s) continue;
      w[mod12(n.midi)] += e - s; pcs.add(mod12(n.midi));
      if (low == null || n.midi < low) low = n.midi;
    }
    const lab = labelChord(w, low == null ? null : mod12(low), pcs.size);
    chords.push(lab ? { name: PC_NAMES[lab.root] + lab.quality, root: lab.root, quality: lab.quality } : null);
  }
  let changes = 0;
  for (let i = 1; i < chords.length; i++) if (chords[i] && chords[i - 1] && chords[i].name !== chords[i - 1].name) changes++;
  const harmRate = changes / coreBars;                     // chord changes per bar
  const qual = {};
  for (const c of chords) if (c) qual[c.quality] = (qual[c.quality] ?? 0) + 1;
  const qTot = Object.values(qual).reduce((a, b) => a + b, 0) || 1;

  // ---- VERTICAL interval classes across the whole core texture, weighted by
  // sounding time. This is where "epic" lives if it lives anywhere harmonic.
  const grid = barTicks / 4;               // sample every beat
  const ic = new Array(12).fill(0); let icN = 0;
  const stackSizes = [];
  for (let t = t0; t < t1; t += grid) {
    const on = coreNotes.filter((n) => n.tick <= t && n.tick + n.dur > t).map((n) => n.midi).sort((a, b) => a - b);
    if (on.length < 2) { if (on.length) stackSizes.push(on.length); continue; }
    stackSizes.push(new Set(on).size);
    for (let i = 0; i < on.length; i++) for (let j = i + 1; j < on.length; j++) { ic[mod12(on[j] - on[i])]++; icN++; }
  }
  const icShare = ic.map((x) => x / (icN || 1));

  // ---- BASS: the engine's own question. Is it a driver or a floor?
  const bassF = feats.find((f) => f.role === 'bass');
  let bass = null;
  if (bassF) {
    const bn = bassF.part.notes;
    const mp = motorProfile(bn, barTicks, coreBars);
    bass = {
      onsetsPerBar: [...new Set(bn.map((n) => n.tick))].length / coreBars,
      medPitch: median(bn.map((n) => n.midi)),
      medDurBeats: median(bn.map((n) => n.dur)) / (barTicks / 4),
      econ: pitchEconomy(bn),
      sub: mp.sub, motor: mp.isMotor,
      ...melodic(bn),
      // octave leaps — the classic driving-bass device
      octLeap: (() => { const s = [...new Map(bn.map((n) => [n.tick, n.midi]))].map((x) => x[1]); let c = 0;
        for (let i = 1; i < s.length; i++) if (Math.abs(s[i] - s[i - 1]) === 12) c++; return c / (s.length || 1); })(),
    };
  }

  // ---- LEAD
  const leadF = feats.find((f) => f.role === 'lead');
  let lead = null;
  if (leadF) {
    const ln = leadF.part.notes;
    lead = {
      onsetsPerBar: [...new Set(ln.map((n) => n.tick))].length / coreBars,
      medPitch: median(ln.map((n) => n.midi)),
      medDurBeats: median(ln.map((n) => n.dur)) / (barTicks / 4),
      family: leadF.part.family,
      ...melodic(ln),
    };
  }

  // ---- SUPPORT LAYERS: everything that is not bass/lead/drums. His words:
  // "other than alternate melody, there can also just be support in some
  // instruments too ... root third fifth ... 8th note style".
  const support = feats.filter((f) => f.role && !['bass', 'lead'].includes(f.role) && !f.part.isDrum).map((f) => {
    const sn = f.part.notes;
    const mp = motorProfile(sn, barTicks, coreBars);
    const on = [...new Set(sn.map((n) => n.tick))];
    // REPEATED-CELL test: does its onset pattern repeat bar to bar?
    const patt = new Set();
    for (const t of on) patt.add(Math.round(((t - t0) % barTicks) / (barTicks / 16)));
    return {
      role: f.role, family: f.part.family, onsetsPerBar: on.length / coreBars,
      medPitch: median(sn.map((n) => n.midi)),
      medDurBeats: median(sn.map((n) => n.dur)) / (barTicks / 4),
      poly: f.polyRatio, maxCluster: f.maxCluster,
      sub: mp.sub, motor: mp.isMotor, fill: mp.fill,
      slotsUsed: patt.size, econ: pitchEconomy(sn),
      ...melodic(sn),
    };
  });

  // ---- REGISTER BANDS: do layers occupy disjoint octaves?
  const bands = cParts.map((p) => ({ lo: Math.min(...p.notes.map((n) => n.midi)), hi: Math.max(...p.notes.map((n) => n.midi)) }));
  let overlapPairs = 0, allPairs = 0;
  for (let i = 0; i < bands.length; i++) for (let j = i + 1; j < bands.length; j++) {
    allPairs++;
    if (Math.min(bands[i].hi, bands[j].hi) - Math.max(bands[i].lo, bands[j].lo) > 4) overlapPairs++;
  }

  // ---- DRUMS: the part of his note that named a defect ("bare minimum")
  let drumStats = null;
  if (cDrums.length) {
    const dn = cDrums.flatMap((p) => p.notes);
    const byRole = {};
    for (const n of dn) { const r = DRUM_ROLE(n.midi) ?? 'other'; byRole[r] = (byRole[r] ?? 0) + 1; }
    const kickT = dn.filter((n) => DRUM_ROLE(n.midi) === 'kick').map((n) => (n.tick - t0) % barTicks);
    const snareT = dn.filter((n) => DRUM_ROLE(n.midi) === 'snare').map((n) => (n.tick - t0) % barTicks);
    const beat = barTicks / 4;
    const near = (arr, b) => arr.filter((t) => Math.abs(t - b * beat) < beat / 8).length;
    drumStats = {
      hitsPerBar: dn.length / coreBars,
      voices: new Set(dn.map((n) => n.midi)).size,
      roles: byRole,
      kickPerBar: kickT.length / coreBars,
      snarePerBar: snareT.length / coreBars,
      backbeat: snareT.length ? (near(snareT, 1) + near(snareT, 3)) / snareT.length : 0,
      fourOnFloor: kickT.length ? (near(kickT, 0) + near(kickT, 1) + near(kickT, 2) + near(kickT, 3)) / kickT.length : 0,
      // TOMS + CRASH: the two things a "bare minimum" kit lacks
      tomShare: (byRole.tom ?? 0) / dn.length,
      cymShare: ((byRole.crash ?? 0) + (byRole.ride ?? 0)) / dn.length,
      offGrid16: dn.filter((n) => Math.round(((n.tick - t0) % barTicks) / (barTicks / 16)) % 1 !== 0).length / dn.length,
    };
  }

  // ---- VELOCITY: accent shaping (the field is `velocity`, not `vel` — a
  // previous round reported "0% varied velocity" off that typo)
  const vels = coreNotes.map((n) => n.velocity).filter((v) => v != null);
  const vMean = mean(vels);
  const vStd = Math.sqrt(mean(vels.map((v) => (v - vMean) ** 2)));

  // ---- UNISON / STOP: instants where EVERY sounding part strikes together
  let unison = 0;
  for (let b = 0; b < coreBars; b++) {
    const dt = t0 + b * barTicks;
    const hitters = cParts.filter((p) => p.notes.some((n) => Math.abs(n.tick - dt) < barTicks / 32)).length;
    if (hitters >= Math.max(3, cParts.length - 1)) unison++;
  }

  return {
    name, bpm: mid.bpm, timeSig: mid.timeSig.join('/'),
    key: key ? `${PC_NAMES[key.tonic]}:${key.mode}` : null, mode: key?.mode ?? null,
    totalBars, core: { start: core.start, len: coreBars },
    parts: cParts.length, drumParts: cDrums.length,
    concMed: median(conc), concMax: Math.max(...conc, 0),
    harmRate, qualShare: Object.fromEntries(Object.entries(qual).map(([k, v]) => [k, v / qTot])),
    stackMed: median(stackSizes),
    icShare, tritone: icShare[6], semitone: icShare[1], fifth: icShare[7], third: icShare[3] + icShare[4],
    bass, lead, support,
    motorCount: support.filter((s) => s.motor).length + (bass?.motor ? 1 : 0),
    regOverlap: allPairs ? overlapPairs / allPairs : 0,
    drums: drumStats,
    vMean, vStd,
    unisonPerBar: unison / coreBars,
    span: Math.max(...cParts.map((p) => Math.max(...p.notes.map((n) => n.midi)))) - Math.min(...cParts.map((p) => Math.min(...p.notes.map((n) => n.midi)))),
  };
}

// ------------------------------------------------------------------- run

const rows = [];
for (const d of DIRS) {
  for (const f of readdirSync(join(ROOT, d))) {
    if (!/\.mid$/i.test(f)) continue;
    try {
      const r = analyze(join(ROOT, d, f), f);
      if (r) { r.group = BATTLE_RE.test(f) ? 'battle' : TENSION_RE.test(f) ? 'tension' : 'other'; r.dir = d; rows.push(r); }
    } catch (e) { console.error(`  SKIP ${f}: ${e.message}`); }
  }
}

const battle = rows.filter((r) => r.group === 'battle');
const other = rows.filter((r) => r.group === 'other');
const tension = rows.filter((r) => r.group === 'tension');

console.log(`\n=== ${rows.length} files: ${battle.length} battle, ${tension.length} tension, ${other.length} other ===\n`);
console.log('BATTLE:', battle.map((r) => r.name.slice(0, 34)).join(' | '));
console.log('\nTENSION:', tension.map((r) => r.name.slice(0, 34)).join(' | '));

// Report MEAN for anything that is a rate/share/indicator and MEDIAN for
// magnitudes. The first pass used median throughout, and a median over a 0/1
// indicator is not a statistic: it printed "minor share: battle 100.0%, other
// 0.0%" (really "more than half vs fewer than half") and a flat 0.0% for every
// chord quality. Project law — a suspiciously clean number is a bug.
const cmp = (label, fn, kind = 'num') => {
  const b = battle.map(fn).filter((x) => x != null && !Number.isNaN(x));
  const o = other.map(fn).filter((x) => x != null && !Number.isNaN(x));
  if (!b.length || !o.length) { console.log(`${label.padEnd(30)} \u2014`); return; }
  const agg = kind === 'num' ? median : mean;
  const fmt = kind === 'num' ? ((x) => x.toFixed(2)) : pct;
  const mb = agg(b), mo = agg(o);
  const arrow = mo === 0 ? (mb > 0 ? '  \u2191' : '   ')
    : mb > mo * 1.15 ? '  \u2191' : mb < mo * 0.87 ? '  \u2193' : '   ';
  console.log(`${label.padEnd(30)} battle ${fmt(mb).padStart(7)} (n=${String(b.length).padStart(2)})   other ${fmt(mo).padStart(7)} (n=${String(o.length).padStart(2)})${arrow}`);
};

console.log('\n--- GLOBAL ---');
cmp('bpm', (r) => r.bpm);
cmp('minor share', (r) => (r.mode === 'minor' ? 1 : 0), 'pct');
cmp('pitched parts (core)', (r) => r.parts);
cmp('concurrency (median)', (r) => r.concMed);
cmp('concurrency (max)', (r) => r.concMax);
cmp('chord changes / bar', (r) => r.harmRate);
cmp('stack size (median)', (r) => r.stackMed);
cmp('pitch span (semitones)', (r) => r.span);
cmp('register overlap rate', (r) => r.regOverlap, 'pct');
cmp('unison downbeats / bar', (r) => r.unisonPerBar, 'pct');
cmp('velocity mean', (r) => r.vMean);
cmp('velocity stdev', (r) => r.vStd);

console.log('\n--- VERTICAL INTERVALS (share of all sounding dyads) ---');
cmp('tritone', (r) => r.tritone, 'pct');
cmp('semitone', (r) => r.semitone, 'pct');
cmp('fifth', (r) => r.fifth, 'pct');
cmp('thirds (m+M)', (r) => r.third, 'pct');
cmp('fourth', (r) => r.icShare[5], 'pct');
cmp('octave/unison', (r) => r.icShare[0], 'pct');
cmp('major 2nd (9th)', (r) => r.icShare[2], 'pct');

console.log('\n--- CHORD QUALITY ---');
for (const q of ['min', 'maj', 'dom7', 'min7', 'maj7', 'dim', 'dim7', 'min7b5', 'aug', 'sus4', 'sus2', '5', 'min9', 'maj9', 'dom9', 'min6', 'maj6', 'minMaj7']) {
  cmp(`  ${q}`, (r) => r.qualShare[q] ?? 0, 'pct');
}

console.log('\n--- BASS ---');
cmp('bass onsets/bar', (r) => r.bass?.onsetsPerBar);
cmp('bass median pitch', (r) => r.bass?.medPitch);
cmp('bass note len (beats)', (r) => r.bass?.medDurBeats);
cmp('bass subdivision', (r) => r.bass?.sub);
cmp('bass is MOTOR', (r) => (r.bass ? (r.bass.motor ? 1 : 0) : null), 'pct');
cmp('bass repeated-note rate', (r) => r.bass?.rep, 'pct');
cmp('bass stepwise rate', (r) => r.bass?.step, 'pct');
cmp('bass octave-leap rate', (r) => r.bass?.octLeap, 'pct');
cmp('bass pitch economy', (r) => r.bass?.econ, 'pct');

console.log('\n--- LEAD ---');
cmp('lead onsets/bar', (r) => r.lead?.onsetsPerBar);
cmp('lead median pitch', (r) => r.lead?.medPitch);
cmp('lead note len (beats)', (r) => r.lead?.medDurBeats);
cmp('lead repeated rate', (r) => r.lead?.rep, 'pct');
cmp('lead stepwise rate', (r) => r.lead?.step, 'pct');
cmp('lead leap rate (3rd-5th)', (r) => r.lead?.leap, 'pct');
cmp('lead big-leap rate (>P5)', (r) => r.lead?.big, 'pct');
cmp('lead range', (r) => r.lead?.range);

console.log('\n--- SUPPORT LAYERS (non-bass, non-lead) ---');
cmp('support layer count', (r) => r.support.length);
cmp('MOTOR layers per file', (r) => r.motorCount);
cmp('has >=1 motor', (r) => (r.motorCount > 0 ? 1 : 0), 'pct');
cmp('support onsets/bar (med)', (r) => median(r.support.map((s) => s.onsetsPerBar)));
cmp('support poly ratio (med)', (r) => median(r.support.map((s) => s.poly)), 'pct');
cmp('support maxCluster (med)', (r) => median(r.support.map((s) => s.maxCluster)));
cmp('support note len (beats)', (r) => median(r.support.map((s) => s.medDurBeats)));
cmp('support pitch economy', (r) => median(r.support.map((s) => s.econ)), 'pct');
cmp('support repeated rate', (r) => median(r.support.map((s) => s.rep)), 'pct');

console.log('\n--- DRUMS ---');
cmp('has drums', (r) => (r.drums ? 1 : 0), 'pct');
cmp('hits / bar', (r) => r.drums?.hitsPerBar);
cmp('distinct drum voices', (r) => r.drums?.voices);
cmp('kick / bar', (r) => r.drums?.kickPerBar);
cmp('snare / bar', (r) => r.drums?.snarePerBar);
cmp('snare on 2&4 share', (r) => r.drums?.backbeat, 'pct');
cmp('kick four-on-floor', (r) => r.drums?.fourOnFloor, 'pct');
cmp('tom share', (r) => r.drums?.tomShare, 'pct');
cmp('cymbal share', (r) => r.drums?.cymShare, 'pct');

writeFileSync(join(ROOT, 'research', 'boss-r23.json'), JSON.stringify({ rows }, null, 1));
console.log('\nwrote research/boss-r23.json');
