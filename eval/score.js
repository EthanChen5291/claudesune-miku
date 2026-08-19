// Eval scorer: runs the SAME measurements over all three arms (PROTOCOL.md).
//   node eval/score.js            -> eval/results/*.json + aggregate summary
// Arms:
//   b0    eval/before-default/C*/r*/v*/ (.mid per version, wav alongside)
//   b1    eval/before/C*/r*/v*.strudel
//   after eval/after/C*/r*/v*.strudel

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { strudelStreams, midiArmStreams, matchAllowed } from './lib/streams.js';

const ROOT = new URL('..', import.meta.url).pathname;
const CASES = JSON.parse(readFileSync(join(ROOT, 'eval/cases.json'), 'utf8'));
const REPS = CASES.replicates;

const round = (x) => (x == null ? null : Math.round(x * 1e4) / 1e4);

// ---------------------------------------------------------------------------
// version discovery + stream loading per arm
// ---------------------------------------------------------------------------

function versionsB1orAfter(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map((f) => /^v(\d+)\.strudel$/.exec(f)).filter(Boolean)
    .map((m) => Number(m[1])).sort((a, b) => a - b).map((n) => join(dir, `v${n}.strudel`));
}
function versionsB0(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).map((f) => /^v(\d+)$/.exec(f)).filter(Boolean)
    .map((m) => Number(m[1])).sort((a, b) => a - b).map((n) => join(dir, `v${n}`));
}
function findFile(dir, ext) {
  const f = readdirSync(dir).find((x) => x.toLowerCase().endsWith(ext));
  return f ? join(dir, f) : null;
}

async function loadStreams(arm, versionPath, meterBarQuarters) {
  if (arm === 'b0') {
    const mid = findFile(versionPath, '.mid') ?? findFile(versionPath, '.midi');
    if (!mid) return { streams: null, error: 'no MIDI file', wav: findFile(versionPath, '.wav') };
    const res = midiArmStreams(mid, meterBarQuarters);
    return { ...res, wav: findFile(versionPath, '.wav') };
  }
  const src = readFileSync(versionPath, 'utf8');
  return { ...(await strudelStreams(src, { cycles: 64 })), wav: null };
}

// ---------------------------------------------------------------------------
// stream diffing
// ---------------------------------------------------------------------------

const evKey = (e) => JSON.stringify([e.t, e.pitch ?? e.drumNote ?? null, e.vel, e.sound ?? null]);
const sorted = (a) => [...a].sort();

function streamDiff(before = [], after = []) {
  const fullA = sorted(before.map(evKey));
  const fullB = sorted(after.map(evKey));
  const changed = fullA.length !== fullB.length || fullA.some((x, i) => x !== fullB[i]);
  const timeA = sorted(before.map((e) => String(e.t)));
  const timeB = sorted(after.map((e) => String(e.t)));
  const seqOf = (evs, f) => evs.map(f); // already time-ordered
  const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  return {
    changed,
    timeChanged: !eq(timeA, timeB),
    pitchChanged: !eq(seqOf(before, (e) => String(e.pitch ?? e.drumNote ?? '')), seqOf(after, (e) => String(e.pitch ?? e.drumNote ?? ''))),
    velChanged: !eq(seqOf(before, (e) => String(e.vel)), seqOf(after, (e) => String(e.vel))),
    soundChanged: !eq(seqOf(before, (e) => String(e.sound ?? '')), seqOf(after, (e) => String(e.sound ?? ''))),
    changedFraction: fullA.length || fullB.length
      ? round(1 - intersectCount(fullA, fullB) / Math.max(fullA.length, fullB.length)) : 0,
  };
}
function intersectCount(a, b) {
  const m = new Map();
  for (const x of a) m.set(x, (m.get(x) ?? 0) + 1);
  let n = 0;
  for (const x of b) { const c = m.get(x) ?? 0; if (c > 0) { n++; m.set(x, c - 1); } }
  return n;
}

// ---------------------------------------------------------------------------
// metrics used by effectiveness checks
// ---------------------------------------------------------------------------

function songBars(streams) {
  let max = 0;
  for (const evs of Object.values(streams)) for (const e of evs) max = Math.max(max, e.t);
  return Math.max(Math.ceil(max), 1);
}
function densityOf(streams, pattern) {
  const bars = songBars(streams);
  let n = 0;
  for (const [name, evs] of Object.entries(streams)) if (matchAllowed(name, [pattern])) n += evs.length;
  return n / bars;
}
function registerMaxOf(streams, pattern) {
  let max = null;
  for (const [name, evs] of Object.entries(streams)) {
    if (!matchAllowed(name, [pattern])) continue;
    for (const e of evs) if (e.pitch != null) max = Math.max(max ?? -1, e.pitch);
  }
  return max;
}
function velVarianceOf(streams, pattern) {
  const vels = [];
  for (const [name, evs] of Object.entries(streams)) if (matchAllowed(name, [pattern])) vels.push(...evs.map((e) => e.vel));
  if (!vels.length) return null;
  const mean = vels.reduce((a, x) => a + x, 0) / vels.length;
  return round(vels.reduce((a, x) => a + (x - mean) ** 2, 0) / vels.length);
}
function offgridOf(streams, pattern, gridPerBar) {
  let off = 0, n = 0;
  for (const [name, evs] of Object.entries(streams)) {
    if (!matchAllowed(name, [pattern])) continue;
    for (const e of evs) {
      n++;
      const pos = ((e.t % 1) + 1) % 1;
      const nearest = Math.round(pos * gridPerBar) / gridPerBar;
      if (Math.abs(pos - nearest) > 1e-3) off++;
    }
  }
  return n ? round(off / n) : null;
}
function harmonicRhythmOf(streams, pattern) {
  // group chord-stream events into sonorities per onset time; count pc-set changes per bar
  const evs = [];
  for (const [name, list] of Object.entries(streams)) if (matchAllowed(name, [pattern])) evs.push(...list.filter((e) => e.pitch != null));
  if (!evs.length) return null;
  const byT = new Map();
  for (const e of evs) {
    const k = Math.round(e.t * 1e4);
    if (!byT.has(k)) byT.set(k, new Set());
    byT.get(k).add(((e.pitch % 12) + 12) % 12);
  }
  const times = [...byT.keys()].sort((a, b) => a - b);
  let changes = 0; let prev = null;
  for (const k of times) {
    const sig = [...byT.get(k)].sort().join(',');
    if (prev === null || sig !== prev) changes++;
    prev = sig;
  }
  return round(changes / songBars(Object.fromEntries([['x', evs]])));
}
function transpositionOf(beforeStreams, afterStreams) {
  // over all pitched streams: the multiset of per-position deltas; success if all +2
  const deltas = new Map();
  for (const name of Object.keys(beforeStreams)) {
    const a = (beforeStreams[name] ?? []).filter((e) => e.pitch != null);
    const b = (afterStreams[name] ?? []).filter((e) => e.pitch != null);
    if (!a.length || a.length !== b.length) continue;
    for (let i = 0; i < a.length; i++) {
      const d = b[i].pitch - a[i].pitch;
      deltas.set(d, (deltas.get(d) ?? 0) + 1);
    }
  }
  const total = [...deltas.values()].reduce((x, y) => x + y, 0);
  return { plus2Fraction: total ? round((deltas.get(2) ?? 0) / total) : null, total };
}
function wavHash(p) { return p && existsSync(p) ? createHash('sha256').update(readFileSync(p)).digest('hex').slice(0, 16) : null; }

// ---------------------------------------------------------------------------

function effectiveness(caseId, editId, ctx) {
  const { before, after, wavBefore, wavAfter, meterNum } = ctx;
  const key = `${caseId}.${editId}`;
  switch (key) {
    case 'C1.E1': return delta('hat density/bar', densityOf(before, 'hat'), densityOf(after, 'hat'), 'up');
    case 'C1.E2': {
      const r = delta('lead register max', registerMaxOf(before, 'lead'), registerMaxOf(after, 'lead'), 'up');
      const d = delta('lead density/bar', densityOf(before, 'lead'), densityOf(after, 'lead'), 'up');
      return { ...r, achieved: r.achieved || d.achieved, extra: d };
    }
    case 'C1.E3': {
      const soundMoved = Object.entries(after).some(([n]) =>
        matchAllowed(n, ['bass']) && streamDiff(before[n] ?? [], after[n] ?? []).soundChanged);
      const wavMoved = wavBefore && wavAfter && wavBefore !== wavAfter;
      return { metric: 'bass sound changed', before: null, after: null, achieved: !!(soundMoved || wavMoved), note: wavMoved ? 'wav differs' : soundMoved ? 'sound params differ' : 'no evidence of timbre change' };
    }
    case 'C2.E1': return delta(`hat offgrid (grid ${meterNum})`, offgridOf(before, 'hat', meterNum * 2), offgridOf(after, 'hat', meterNum * 2), 'up');
    case 'C2.E2': return delta('lead density/bar', densityOf(before, 'lead'), densityOf(after, 'lead'), 'down');
    case 'C3.E1': return delta('harmonic changes/bar', harmonicRhythmOf(before, 'chord'), harmonicRhythmOf(after, 'chord'), 'down');
    case 'C3.E2': return delta('drum vel variance', velVarianceOf(before, 'drum'), velVarianceOf(after, 'drum'), 'up');
    case 'C4.E1': return delta('transition onsets/bar', densityOf(before, 'transition'), densityOf(after, 'transition'), 'up');
    case 'C4.E2': {
      const t = transpositionOf(before, after);
      return { metric: 'transposed +2 fraction', before: null, after: t.plus2Fraction, achieved: t.plus2Fraction != null && t.plus2Fraction >= 0.95, note: `${t.total} paired pitches` };
    }
    default: return { metric: 'unknown', achieved: null };
  }
}
function delta(metric, b, a, dir) {
  const achieved = b == null || a == null ? null : dir === 'up' ? a > b + 1e-9 : a < b - 1e-9;
  return { metric, before: round(b), after: round(a), achieved };
}

// ---------------------------------------------------------------------------

async function scoreReplicate(arm, c, rep) {
  const meterNum = Number((c.meter ?? '4/4').split('/')[0]);
  const barQuarters = c.meter === '7/8' ? 3.5 : 4;
  const base = arm === 'b0' ? join(ROOT, 'eval/before-default', c.id, `r${rep}`)
    : arm === 'b1' ? join(ROOT, 'eval/before', c.id, `r${rep}`)
    : join(ROOT, 'eval/after', c.id, `r${rep}`);
  const versions = arm === 'b0' ? versionsB0(base) : versionsB1orAfter(base);
  const out = { arm, case: c.id, rep, versions: versions.length, expectedVersions: c.edits.length + 1, v0: null, edits: [] };
  if (!versions.length) { out.error = 'no versions found'; return out; }

  const loaded = [];
  for (const v of versions) loaded.push(await loadStreams(arm, v, barQuarters));

  const v0 = loaded[0];
  out.v0 = {
    evalOk: !!v0.streams,
    error: v0.error ?? null,
    streamCount: v0.streams ? Object.keys(v0.streams).length : 0,
    drumVelVariance: v0.streams ? velVarianceOf(v0.streams, 'drum') : null,
    meterOffgrid: v0.streams && c.meter === '7/8' ? offgridOf(v0.streams, 'drum', meterNum) : null,
  };

  for (let k = 0; k < c.edits.length; k++) {
    const edit = c.edits[k];
    const before = loaded[k];
    const after = loaded[k + 1];
    const rec = { edit: edit.id, prompt: edit.prompt };
    if (!after) { rec.status = 'missing-version'; out.edits.push(rec); continue; }
    if (!before?.streams || !after.streams) {
      rec.status = 'uneval';
      rec.error = before?.streams ? `after: ${after.error}` : `before: ${before?.error}`;
      out.edits.push(rec);
      continue;
    }
    const names = [...new Set([...Object.keys(before.streams), ...Object.keys(after.streams)])];
    const changed = [];
    const leaks = [];
    let changedFractionAllowed = null;
    for (const name of names) {
      const d = streamDiff(before.streams[name], after.streams[name]);
      if (!d.changed) continue;
      changed.push({ name, ...d });
      if (!matchAllowed(name, edit.allowed_streams)) leaks.push({ name, ...d });
      else changedFractionAllowed = Math.max(changedFractionAllowed ?? 0, d.changedFraction);
    }
    // aspect precision: for edits that lock aspects, did allowed streams keep them?
    const aspectViolations = [];
    const locked = { time: !edit.allowed_aspects.includes('time'), pitch: !edit.allowed_aspects.includes('pitch'), gain: !edit.allowed_aspects.includes('gain'), sound: !edit.allowed_aspects.includes('sound') };
    for (const chg of changed) {
      if (leaks.includes(chg)) continue;
      if (locked.time && chg.timeChanged) aspectViolations.push(`${chg.name}: time`);
      if (locked.pitch && chg.pitchChanged) aspectViolations.push(`${chg.name}: pitch`);
      if (locked.gain && chg.velChanged) aspectViolations.push(`${chg.name}: gain`);
      // sound aspect not observable in MIDI (lives in the synth), so only judge for strudel arms
      if (locked.sound && arm !== 'b0' && chg.soundChanged) aspectViolations.push(`${chg.name}: sound`);
    }
    rec.status = 'scored';
    rec.changedStreams = changed.map((x) => x.name);
    rec.leaks = leaks.map((x) => x.name);
    rec.contained = leaks.length === 0 && changed.length > 0;
    rec.noop = changed.length === 0;
    rec.aspectViolations = aspectViolations;
    rec.minimality = changedFractionAllowed;
    rec.effect = effectiveness(c.id, edit.id, {
      before: before.streams, after: after.streams,
      wavBefore: wavHash(before.wav), wavAfter: wavHash(after.wav), meterNum,
    });
    out.edits.push(rec);
  }
  return out;
}

async function main() {
  const arms = process.argv[2] ? [process.argv[2]] : ['b0', 'b1', 'after'];
  mkdirSync(join(ROOT, 'eval/results'), { recursive: true });
  const all = [];
  for (const arm of arms) {
    for (const c of CASES.cases) {
      for (let rep = 1; rep <= REPS; rep++) {
        const res = await scoreReplicate(arm, c, rep);
        all.push(res);
        writeFileSync(join(ROOT, `eval/results/${arm}-${c.id}-r${rep}.json`), JSON.stringify(res, null, 2));
        const editsSummary = res.edits.map((e) => e.status !== 'scored' ? e.status : `${e.contained ? 'OK' : e.noop ? 'NOOP' : 'LEAK'}${e.aspectViolations?.length ? '+asp' : ''}${e.effect?.achieved === false ? '-eff' : ''}`).join(' ');
        console.log(`${arm} ${c.id} r${rep}: v0=${res.v0?.evalOk ? 'ok' : 'FAIL'} edits: ${editsSummary || res.error || '-'}`);
      }
    }
  }
  // aggregate
  const agg = {};
  for (const arm of arms) {
    const rows = all.filter((r) => r.arm === arm);
    const scored = rows.flatMap((r) => r.edits.filter((e) => e.status === 'scored'));
    const withVersions = rows.filter((r) => !r.error);
    agg[arm] = {
      replicates: rows.length,
      v0EvalOk: withVersions.filter((r) => r.v0?.evalOk).length + '/' + rows.length,
      versionsComplete: rows.filter((r) => r.versions === r.expectedVersions).length + '/' + rows.length,
      editsScored: scored.length,
      editsMissingOrUneval: rows.flatMap((r) => r.edits.filter((e) => e.status !== 'scored')).length,
      contained: scored.filter((e) => e.contained).length,
      leaks: scored.filter((e) => e.leaks.length > 0).length,
      noops: scored.filter((e) => e.noop).length,
      aspectViolations: scored.filter((e) => e.aspectViolations?.length).length,
      effectAchieved: scored.filter((e) => e.effect?.achieved === true).length,
      effectFailed: scored.filter((e) => e.effect?.achieved === false).length,
      meanMinimality: round(mean(scored.map((e) => e.minimality).filter((x) => x != null))),
      meanDrumVelVariance: round(mean(rows.map((r) => r.v0?.drumVelVariance).filter((x) => x != null))),
    };
  }
  writeFileSync(join(ROOT, 'eval/results/summary.json'), JSON.stringify({ generated: 'eval/score.js', arms: agg, detail: all }, null, 2));
  console.log('\n' + JSON.stringify(agg, null, 2));
}
function mean(xs) { return xs.length ? xs.reduce((a, x) => a + x, 0) / xs.length : null; }

main().catch((e) => { console.error(e.stack); process.exit(1); });
