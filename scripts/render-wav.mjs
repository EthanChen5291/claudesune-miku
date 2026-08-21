#!/usr/bin/env node
// .mid -> .wav via fluidsynth (offline render: -F writes the file faster than
// realtime, no audio device involved). Also imported by `cli.js export --wav`.
//
//   node scripts/render-wav.mjs <in.mid> [out.wav] [--soundfont f.sf2] [--gain 0.7] [--rate 44100]
//
// Soundfont resolution order: --soundfont flag > $SOUNDFONT env > first
// vendor/soundfonts/*.sf2|*.sf3 (sorted by name).

import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SOUNDFONT_DIR = join(ROOT, 'vendor', 'soundfonts');

export function findSoundfont(explicit = null) {
  if (explicit) {
    if (!existsSync(explicit)) throw new Error(`soundfont not found: ${explicit}`);
    return explicit;
  }
  if (process.env.SOUNDFONT && existsSync(process.env.SOUNDFONT)) return process.env.SOUNDFONT;
  if (existsSync(SOUNDFONT_DIR)) {
    const fonts = readdirSync(SOUNDFONT_DIR).filter((f) => /\.sf[23]$/i.test(f)).sort();
    if (fonts.length) return join(SOUNDFONT_DIR, fonts[0]);
  }
  throw new Error(
    `no soundfont found. Put a .sf2 in ${SOUNDFONT_DIR}/, set $SOUNDFONT, or pass --soundfont.\n` +
    `(e.g. GeneralUser GS: https://github.com/mrbumpy409/GeneralUser-GS)`
  );
}

/** Render midPath to wavPath. Throws with a useful message on any failure. */
export function renderWav(midPath, wavPath, { soundfont = null, gain = 0.7, rate = 44100 } = {}) {
  if (!existsSync(midPath)) throw new Error(`no such file: ${midPath}`);
  const sf = findSoundfont(soundfont);
  const args = ['-ni', '-g', String(gain), '-r', String(rate), '-F', wavPath, sf, midPath];
  const res = spawnSync('fluidsynth', args, { encoding: 'utf8' });
  if (res.error?.code === 'ENOENT') {
    throw new Error('fluidsynth is not installed (brew install fluidsynth)');
  }
  if (res.status !== 0) {
    throw new Error(`fluidsynth failed (exit ${res.status}):\n${res.stderr || res.stdout}`);
  }
  if (!existsSync(wavPath) || statSync(wavPath).size < 1024) {
    throw new Error(`fluidsynth produced no audio at ${wavPath}:\n${res.stderr || res.stdout}`);
  }
  return { wavPath, soundfont: sf, bytes: statSync(wavPath).size };
}

// CLI entry
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) flags[args[i].slice(2)] = args[++i];
    else positional.push(args[i]);
  }
  const [mid, wav] = positional;
  if (!mid) { console.error('usage: render-wav.mjs <in.mid> [out.wav] [--soundfont f.sf2] [--gain 0.7] [--rate 44100]'); process.exit(1); }
  try {
    const out = renderWav(mid, wav ?? mid.replace(/\.midi?$/i, '') + '.wav', {
      soundfont: flags.soundfont ?? null,
      gain: flags.gain ? Number(flags.gain) : 0.7,
      rate: flags.rate ? Number(flags.rate) : 44100,
    });
    console.log(`wrote ${out.wavPath} (${(out.bytes / 1e6).toFixed(1)} MB, soundfont: ${out.soundfont})`);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
