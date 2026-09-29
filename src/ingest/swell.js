// The de-swell measurement, shared by the two builders that need it (r43).
//
// It lived inside scripts/build-sfz.mjs, and build-sample-pack.mjs importing it
// from there re-ran that script's whole top-level body as a side effect — a
// sample-pack build silently regenerating every SFZ. Deterministic, so nothing
// moved, but a build step that rebuilds an unrelated tier when imported is a
// trap waiting for the day the library underneath it changes.
//
// WHY IT EXISTS (r35/D138, his cards): "starts really soft and then becomes
// really loud over time rather than more flowy", "violin much too loud".
import { execFileSync } from 'node:child_process';

export const SWELL = { level: 0.8, maxSec: 4, minLeftSec: 3, attack: 0.04 };
export function swellOffset(path) {
  const rateTxt = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=sample_rate', '-of', 'csv=p=0', path], { encoding: 'utf8' }).trim();
  const rate = Number(rateTxt) || 44100;
  const ANALYSIS_RATE = 8000;
  const buf = execFileSync('ffmpeg', ['-v', 'error', '-i', path, '-f', 'f32le', '-ac', '1', '-ar', String(ANALYSIS_RATE), '-'], { maxBuffer: 1 << 28 });
  const x = new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.byteLength / 4));
  const w = Math.round(ANALYSIS_RATE * 0.01);
  const env = [];
  for (let i = 0; i + w <= x.length; i += w) { let a = 0; for (let k = i; k < i + w; k++) a += x[k] * x[k]; env.push(Math.sqrt(a / w)); }
  const peak = Math.max(...env, 1e-9);
  let at = env.findIndex((e) => e >= SWELL.level * peak);
  if (at < 0) at = 0;
  let sec = at * w / ANALYSIS_RATE;
  const len = x.length / ANALYSIS_RATE;
  sec = Math.min(sec, SWELL.maxSec, Math.max(0, len - SWELL.minLeftSec));
  return { samples: Math.round(sec * rate), sec, peakSec: env.indexOf(peak) * w / ANALYSIS_RATE };
}
