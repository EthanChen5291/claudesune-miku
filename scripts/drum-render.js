// Shared dp_* drum-pattern rendering (D63) — used by audition-songs.mjs.
// A harvested pattern is a set of per-voice grid entries; this stacks them
// through the loaded sample banks, optionally SLICED by bar range so a
// pattern's buildup bars (Ethan's b-52's note) can be split from its loop.

import { RHYTHMS_DRUM_PATTERNS } from '../src/lib/rhythms-drum-patterns.js';

export const VOICE_SOUND = {
  bd: 'bd', sd: 'sd', ch: 'hh', oh: 'hh', cy: 'cr', cp: 'cp', cb: 'cb',
  rs: 'click', hc: 'perc', lt: 'lt', mt: 'mt', ht: 'ht',
};

export function dpVoices(base) {
  return Object.entries(RHYTHMS_DRUM_PATTERNS)
    .filter(([n]) => n.startsWith(`${base}_`) && VOICE_SOUND[n.slice(base.length + 1)])
    .map(([n, e]) => ({ voice: n.slice(base.length + 1), ...e }));
}

/** Render a harvested pattern as a stacked expr. opts:
 *  from/to  — bar range [from, to) sliced out of the played expansion
 *  gainMul  — overall level (accents scale inside it; velocity-less voices flat) */
export function dpStack(base, { from = 0, to = null, gainMul = 0.8 } = {}) {
  const voices = dpVoices(base);
  if (!voices.length) throw new Error(`no renderable voices for ${base}`);
  const hi = to ?? voices[0].bars;
  const span = hi - from;
  if (span <= 0) throw new Error(`empty bar slice [${from},${hi}) for ${base}`);
  const parts = [];
  for (const e of voices) {
    const G = e.grid;
    const slots = Array(G * span).fill('~');
    const gains = Array(G * span).fill('0');
    let any = false;
    e.onsets.forEach((o, i) => {
      const [n, d] = o.split('/').map(Number);
      const pos = n / d;
      if (pos < from || pos >= hi) return;
      const ix = Math.round((pos - from) * G);
      if (ix >= slots.length) return;
      slots[ix] = VOICE_SOUND[e.voice];
      const a = e.accents ? e.accents[i] : 0.78;
      gains[ix] = String(Math.round(a * gainMul * 100) / 100);
      any = true;
    });
    if (!any) continue;
    let expr = `s("${slots.join(' ')}").gain("${gains.join(' ')}")`;
    if (span > 1) expr += `.slow(${span})`;
    parts.push(expr);
  }
  if (!parts.length) throw new Error(`bar slice [${from},${hi}) of ${base} is silent`);
  return { expr: parts.length === 1 ? parts[0] : `stack(${parts.join(', ')})`, bars: span };
}
