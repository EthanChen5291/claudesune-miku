// Hap signatures, per-label diffs, and the containment check (§3.3).
//
// A label's signature is its onset-filtered haps over a cycle range, canonically
// serialized. Aspect views (time / pitch / sound / gain) let the diff say things
// like "3 pitches changed, timing unchanged", and let scoped edits assert
// aspect-level invariants ("sound only": pitch+time signatures identical).

import { noteToMidi } from '@strudel/core';

// Value keys that carry pitch, loudness, or neither (sound/timbre).
const PITCH_KEYS = new Set(['note', 'n', 'scale', 'value']);
const GAIN_KEYS = new Set(['gain', 'velocity', 'amp']);

export function canonicalValue(v) {
  if (v === null || typeof v !== 'object') return v;
  const out = {};
  for (const k of Object.keys(v).sort()) {
    const x = v[k];
    if (typeof x === 'function' || x === undefined) continue;
    out[k] = typeof x === 'number' ? roundNum(x) : typeof x === 'object' ? canonicalValue(x) : x;
  }
  return out;
}
function roundNum(x) { return Math.round(x * 1e9) / 1e9; }

function frac(f) {
  // fraction.js Fraction -> exact string
  try { return f.toFraction(); } catch { return String(f); }
}

/** One hap -> canonical record. */
export function hapRecord(hap) {
  return {
    t: frac(hap.whole.begin),
    d: frac(hap.whole.end.sub(hap.whole.begin)),
    v: canonicalValue(hap.value),
  };
}

/** Full signature: sorted array of serialized hap records + muted flag. */
export function labelSignature(entry) {
  const recs = entry.haps.map(hapRecord).map((r) => JSON.stringify(r)).sort();
  return { muted: !!entry.muted, error: entry.error ?? null, recs };
}

export function signaturesEqual(a, b) {
  if (a.muted !== b.muted) return false;
  if (a.recs.length !== b.recs.length) return false;
  for (let i = 0; i < a.recs.length; i++) if (a.recs[i] !== b.recs[i]) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Aspect views
// ---------------------------------------------------------------------------

export function pitchOf(value) {
  if (value == null || typeof value !== 'object') {
    return typeof value === 'number' ? value : resolveNote(value);
  }
  if (value.note !== undefined) return resolveNote(value.note);
  return null; // bare n without note = sample index / unresolved: not a pitch
}
function resolveNote(x) {
  if (typeof x === 'number') return x;
  if (typeof x !== 'string') return null;
  try { const m = noteToMidi(x); return typeof m === 'number' && !Number.isNaN(m) ? m : null; }
  catch { return null; }
}

export function gainOf(value) {
  if (value == null || typeof value !== 'object') return 1;
  let g = 1;
  for (const k of GAIN_KEYS) if (typeof value[k] === 'number') g *= value[k];
  return roundNum(g);
}

export function soundOf(value) {
  if (value == null || typeof value !== 'object') return {};
  const out = {};
  for (const k of Object.keys(value).sort()) {
    if (PITCH_KEYS.has(k) || GAIN_KEYS.has(k)) continue;
    const x = value[k];
    if (typeof x === 'function' || x === undefined) continue;
    out[k] = typeof x === 'number' ? roundNum(x) : x;
  }
  return out;
}

/** Aspect signatures for one label entry.
 *  time  = sorted DISTINCT onset times (when strikes happen);
 *  pitch/sound/gain = per-strike value SETS in temporal order (t dropped) — so a
 *  pure timing edit (swing) changes only `time`; a sound swap only `sound`; and a
 *  chord growing from 4 to 5 voices at the same strike changes only `pitch`
 *  (the gain/sound SETS at that strike are unchanged). */
export function aspectSignatures(entry) {
  const groups = new Map(); // time fraction string -> haps
  for (const h of entry.haps) {
    const t = frac(h.whole.begin);
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t).push(h);
  }
  const times = [...groups.keys()].sort((a, b) => cmpFracStr(a, b));
  const pitch = [], sound = [], gain = [];
  for (const t of times) {
    const hs = groups.get(t);
    pitch.push(JSON.stringify(hs.map((h) => pitchOf(h.value)).sort(cmpAny)));
    sound.push(JSON.stringify([...new Set(hs.map((h) => JSON.stringify(soundOf(h.value))))].sort()));
    gain.push(JSON.stringify([...new Set(hs.map((h) => gainOf(h.value)))].sort((a, b) => a - b)));
  }
  return { time: times, pitch, sound, gain };
}
function cmpFracStr(a, b) {
  const pa = a.includes('/') ? a.split('/').map(Number) : [Number(a), 1];
  const pb = b.includes('/') ? b.split('/').map(Number) : [Number(b), 1];
  return pa[0] * pb[1] - pb[0] * pa[1];
}
function cmpAny(a, b) { return (a ?? -1e9) - (b ?? -1e9); }

function arrEq(a, b) {
  return a.length === b.length && a.every((x, i) => x === b[i]);
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

/**
 * Diff two label entries ({muted, haps, error}). Returns a structured diff plus a
 * human-readable one-liner ("bass: 8 haps, 3 pitches changed, timing unchanged").
 */
export function diffLabel(name, oldE, newE) {
  if (!oldE && !newE) return null;
  if (!oldE) return { label: name, kind: 'added', line: `${name}: layer added (${newE.haps.length} haps)` };
  if (!newE) return { label: name, kind: 'removed', line: `${name}: layer removed (was ${oldE.haps.length} haps)` };

  const oldSig = labelSignature(oldE);
  const newSig = labelSignature(newE);
  if (signaturesEqual(oldSig, newSig)) {
    return { label: name, kind: 'identical', line: `${name}: unchanged (${newE.haps.length} haps)` };
  }
  const a = aspectSignatures(oldE);
  const b = aspectSignatures(newE);
  const aspects = {
    time: !arrEq(a.time, b.time),
    pitch: !arrEq(a.pitch, b.pitch),
    sound: !arrEq(a.sound, b.sound),
    gain: !arrEq(a.gain, b.gain),
    muted: oldE.muted !== newE.muted,
  };
  // per-onset change counts: positional compare of the value sequences
  const changedCounts = {};
  for (const [key, viewA, viewB] of [['pitch', a.pitch, b.pitch], ['sound', a.sound, b.sound], ['gain', a.gain, b.gain]]) {
    const len = Math.max(viewA.length, viewB.length);
    let n = 0;
    for (let i = 0; i < len; i++) if (viewA[i] !== viewB[i]) n++;
    changedCounts[key] = n;
  }
  const parts = [];
  if (aspects.muted) parts.push(newE.muted ? 'muted' : 'unmuted');
  if (aspects.time) {
    const setA = new Set(a.time); const setB = new Set(b.time);
    const added = b.time.filter((t) => !setA.has(t)).length;
    const removed = a.time.filter((t) => !setB.has(t)).length;
    parts.push(`timing changed (+${added}/-${removed} onsets)`);
  } else parts.push('timing unchanged');
  parts.push(aspects.pitch ? `${changedCounts.pitch} pitches changed` : 'pitches unchanged');
  if (aspects.sound) parts.push(`${changedCounts.sound} sounds changed`);
  if (aspects.gain) parts.push(`${changedCounts.gain} gains changed`);

  const changedFraction = oldSig.recs.length
    ? changedHapFraction(oldSig.recs, newSig.recs)
    : 1;

  return {
    label: name,
    kind: 'changed',
    aspects,
    changedCounts,
    changedFraction,
    line: `${name}: ${oldE.haps.length}→${newE.haps.length} haps, ${parts.join(', ')}`,
  };
}

function changedHapFraction(oldRecs, newRecs) {
  const setOld = new Set(oldRecs);
  const setNew = new Set(newRecs);
  const kept = oldRecs.filter((r) => setNew.has(r)).length;
  const denom = Math.max(oldRecs.length, newRecs.length, 1);
  return roundNum(1 - kept / denom);
}

function outsideWindows(entry, windows) {
  if (!entry) return entry;
  const inside = (t) => windows.some(([a, b]) => t >= a - 1e-9 && t < b - 1e-9);
  return { ...entry, haps: entry.haps.filter((h) => !inside(h.whole.begin.valueOf())) };
}

/** Diff all labels of two evaluated songs' haps maps. Returns array of diffs (identical included). */
export function diffSongs(oldHaps, newHaps) {
  const names = [...new Set([...oldHaps.keys(), ...newHaps.keys()])].sort();
  return names.map((n) => diffLabel(n, oldHaps.get(n), newHaps.get(n))).filter(Boolean);
}

// ---------------------------------------------------------------------------
// Containment (§3.3) — the gate for every edit
// ---------------------------------------------------------------------------

/**
 * containment(oldEval+haps, newEval+haps, { allowLabels, allowBindings, allowAspects })
 *
 * - allowLabels: labels whose haps may change.
 * - allowBindings: hoisted bindings whose edit legitimizes changes in every label
 *   that (transitively) references them — expanded via static analysis.
 * - allowAspects: optional dimensional contract (addendum A2). Either an array
 *   (applies to every allowed label) or a per-label object with optional '*'
 *   default: { lead: ['pitch'], '*': ['gain'] }. Even ALLOWED labels must keep
 *   their non-contracted aspect signatures identical.
 * - allowLabels may include '*' — every label is allowed (used with an aspect
 *   contract, e.g. a key change: pitch may move everywhere, timing nowhere).
 * - allowWindows: optional [[fromCycle, toCycle], ...]; even ALLOWED labels must be
 *   unchanged OUTSIDE these windows (scoped "chorus only, verse untouched" edits).
 *
 * Returns { ok, leaks: [...], allowed: [...], changelog: [lines], diffs }.
 */
export function containment(oldRes, newRes, { allowLabels = [], allowBindings = [], allowAspects = null, allowWindows = null } = {}) {
  const allLabels = new Set([...oldRes.haps.keys(), ...newRes.haps.keys()]);
  const allowed = allowLabels.includes('*') ? new Set(allLabels) : new Set(allowLabels);
  for (const b of allowBindings) {
    for (const res of [oldRes, newRes]) {
      for (const [label, deps] of res.evaluated.labelDeps) {
        if (deps.has(b)) allowed.add(label);
      }
    }
  }
  const aspectsFor = (label) => {
    if (!allowAspects) return null;
    if (Array.isArray(allowAspects)) return allowAspects;
    return allowAspects[label] ?? allowAspects['*'] ?? null;
  };

  const diffs = diffSongs(oldRes.haps, newRes.haps);
  const leaks = [];
  const changedAllowed = [];
  for (const d of diffs) {
    if (d.kind === 'identical') continue;
    if (!allowed.has(d.label)) {
      leaks.push({ label: d.label, reason: d.line });
      continue;
    }
    const labelAspects = aspectsFor(d.label);
    if (labelAspects && d.kind === 'changed') {
      const forbidden = Object.entries(d.aspects)
        .filter(([k, changed]) => changed && k !== 'muted' && !labelAspects.includes(k))
        .map(([k]) => k);
      if (forbidden.length) {
        leaks.push({ label: d.label, reason: `${d.label}: allowed label but forbidden aspect(s) changed: ${forbidden.join(', ')} (allowed: ${labelAspects.join(', ')})` });
        continue;
      }
    }
    if (allowWindows && d.kind === 'changed') {
      const oldOut = outsideWindows(oldRes.haps.get(d.label), allowWindows);
      const newOut = outsideWindows(newRes.haps.get(d.label), allowWindows);
      const outDiff = diffLabel(d.label, oldOut, newOut);
      if (outDiff.kind !== 'identical') {
        leaks.push({ label: d.label, reason: `${d.label}: changed outside the allowed cycle window(s) ${JSON.stringify(allowWindows)} — ${outDiff.line}` });
        continue;
      }
    }
    changedAllowed.push(d);
  }

  const changelog = diffs.filter((d) => d.kind !== 'identical').map((d) => d.line);
  if (changelog.length === 0) changelog.push('no haps changed anywhere');

  return {
    ok: leaks.length === 0,
    leaks,
    allowed: [...allowed].sort(),
    changed: changedAllowed.map((d) => d.label),
    changelog,
    diffs,
  };
}
