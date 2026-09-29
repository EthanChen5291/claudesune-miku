// build-sample-pack.mjs — local sample hosting for the audition tier (the
// "sample hosting story" that closes the todo.md gap: "124 WAV one-shots +
// FX ... need sample hosting the engine has no story for yet").
//
// Reads src/lib/sample-pack-def.js (single source of truth, shared with the
// HQ tier) and emits audition/sample-pack.js: a plain <script> (NOT a module
// or fetch — file:// pages can't fetch local files, but sibling <script src>
// tags load fine) defining window.LOCAL_SAMPLES, a strudel samples() object
// map whose URLs are data: URIs (fetch(data:) works from any origin, and the
// sampler in @strudel/web loads lazily per name, so unplayed entries cost
// only disk). Audio is mono mp3 (decodeAudioData-safe everywhere, ~10x
// smaller than wav); HQ renders use the ORIGINAL wavs, so mp3 is
// audition-only. The generated pack IS committed (source wavs are not).
import { execFileSync } from 'node:child_process';
import { writeFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SAMPLE_PACK } from '../src/lib/sample-pack-def.js';
import { swellOffset } from '../src/ingest/swell.js';

const ROOT = new URL('..', import.meta.url).pathname;
const OUT = join(ROOT, 'audition', 'sample-pack.js');

// kbps by content: sub-heavy loops need low-end headroom; tiny hits go low.
const RATE = { oneshot: 96, hit: 64, loop: 80, beat: 96 };

// r38: `trimS` caps the encoded length, and the BROWSER tier needs it for the
// same reason the HQ tier does — the sampler plays each trigger once through,
// so VCSL's untrimmed concert tails overlap themselves (measured: a median 6.1
// simultaneous hi-hats over the band page). Both tiers must apply the SAME trim
// or they stop playing the same audio, which is the one invariant this file and
// hq-instruments.js exist to hold. Short fade so the cut cannot click.
function enc(src, kbps, trimS = 0, startS = 0, fadeS = 0) {
  const args = ['-v', 'error', '-i', src, '-ac', '1'];
  // r43: seek AFTER -i (accurate seek). VSCO's soft sustain layer SWELLS — half
  // peak at 1.1-3.2 s — and build-sfz.mjs already measured a per-sample offset
  // for exactly that (D138). Without applying it here the browser tier would
  // reproduce the "starts really soft and then becomes really loud" defect his
  // ear rejected, on the very samples added to make it sound better.
  if (startS > 0) args.push('-ss', startS.toFixed(4));
  if (trimS > 0) {
    // r43: a bowed sustain cut at 20 ms clicks. A caller that is deliberately
    // shortening a sustain (the string banks, so a sixteenth cannot ring for
    // three seconds) asks for a longer fade.
    const fade = fadeS > 0 ? Math.min(fadeS, trimS * 0.5) : Math.min(0.02, trimS * 0.15);
    // r43 SECOND PASS — THE FADE IS ON THE SOURCE TIMELINE, NOT THE OUTPUT'S.
    // `-ss` sits AFTER `-i`, which is an OUTPUT seek: ffmpeg decodes from zero
    // and discards, so the filter graph still counts time from the start of the
    // FILE. `afade=st=trimS-fade` therefore ran its fade-out before the first
    // sample that survives the seek, and any bank whose de-swell offset reached
    // `trimS - fade` encoded to DIGITAL SILENCE — measured, 20 of 88 notes in
    // the shipped pack, including ALL ELEVEN of vsco_violin.
    //
    // That is what "it also overpowers the violin sound" was: the violin group
    // was not quiet, it was not there. And it is why the de-swelled sustains
    // measured as if they never decayed — a silent file has no decay to find,
    // which is D85's "a suspiciously bad number is a bug" arriving on the one
    // measurement this round's design decision rested on.
    args.push('-t', String(trimS), '-af', `afade=t=out:st=${(startS + Math.max(0, trimS - fade)).toFixed(4)}:d=${fade.toFixed(4)}`);
  }
  args.push('-codec:a', 'libmp3lame', '-b:a', `${kbps}k`, '-f', 'mp3', 'pipe:1');
  const raw = execFileSync('ffmpeg', args, { maxBuffer: 64 * 1024 * 1024 });
  return `data:audio/mpeg;base64,${raw.toString('base64')}`;
}

const map = {}; const info = {}; let missing = 0;
for (const [name, e] of Object.entries(SAMPLE_PACK)) {
  // r43 — HIS ASK: "can you allow HQ on for all of them because otherwise the
  // strings dont sound good". A combination lab cannot pre-render its
  // combinations (51 layers is 2^51 mixes), so the way to make it sound like the
  // HQ tier is to give the BROWSER tier the HQ tier's own samples.
  //
  // Built straight from a GENERATED SFZ rather than from the sample folder, so
  // the browser and the renderer resolve the identical file, the identical
  // velocity layer and the identical de-swell offset. Re-deriving any of those
  // by hand is how the two tiers drift apart.
  //
  // One velocity layer per keycentre — the LOUD one. VSCO's soft layer is the
  // one that swells (D138), and a browser map has no velocity crossfade to hide
  // it behind.
  // ...and the same thing from the SAMPLE FOLDER, for a voice whose generated
  // sfz zone is deliberately clipped. `strings-sections.sfz` layers cello under
  // violin, so it caps the cello at key 65 and keeps only the three violin
  // keycentres above it — correct for a layered patch, and three samples is not
  // a playable violin on its own. The folder gives the full range; the de-swell
  // comes from the SAME `swellOffset` the sfz builder uses, so the one thing
  // that must not drift does not.
  if (e.kind === 'vsco') {
    const dir = join(ROOT, e.dir);
    const byNote = new Map();
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.wav'))) {
      const m = /_([A-G]#?)(-?\d)_v(\d)/.exec(f);
      if (!m) continue;
      const note = `${m[1].toLowerCase()}${m[2]}`;
      const vel = Number(m[3]);
      const prev = byNote.get(note);
      if (!prev || vel > prev.vel) byNote.set(note, { f, vel });
    }
    if (!byNote.size) { console.error(`MISSING ${name}: no _<note>_v<n> files in ${e.dir}`); missing++; continue; }
    const bank = {};
    for (const [note, r] of byNote) {
      const src = join(dir, r.f);
      // r43: `noSwell` on a STRUCK bank. The de-swell seeks the first window at
      // 80% of peak, which on a spiccato or a pizzicato is its attack — measuring
      // it would seek past the bow. (It returns 0 today only because of the
      // `len - minLeftSec` clamp inside swellOffset; a struck sample must not
      // depend on that.)
      const so = e.noSwell ? null : swellOffset(src);
      bank[note] = [enc(src, e.kbps ?? 64, e.durS ?? 3, (so?.sec ?? 0), e.fadeS ?? 0)];
    }
    map[name] = bank;
    info[name] = { kind: e.kind, n: Object.keys(bank).length, from: e.dir, note: e.note };
    continue;
  }
  if (e.kind === 'sfz') {
    const sfz = readFileSync(join(ROOT, e.sfz), 'utf8');
    const defPath = (/default_path=(\S+)/.exec(sfz) ?? [])[1] ?? '';
    const base = join(ROOT, e.sfz, '..', defPath);
    const byKey = new Map();
    for (const line of sfz.split('\n')) {
      if (!line.startsWith('<region>')) continue;
      const g = (k) => (new RegExp(`\\b${k}=([^\\s]+)`).exec(line) ?? [])[1];
      const rel = (/sample=(.+?)\s+lokey=/.exec(line) ?? [])[1];
      if (!rel || !e.zone.test(rel)) continue;
      const kc = Number(g('pitch_keycenter'));
      const lovel = Number(g('lovel') ?? 0);
      const prev = byKey.get(kc);
      if (!prev || lovel > prev.lovel) byKey.set(kc, { rel, lovel, offset: Number(g('offset') ?? 0) });
    }
    if (!byKey.size) { console.error(`MISSING ${name}: no ${e.zone} regions in ${e.sfz}`); missing++; continue; }
    const NAMES = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    const bank = {};
    for (const [kc, r] of [...byKey].sort((a2, b2) => a2[0] - b2[0])) {
      const src = join(base, r.rel);
      if (!existsSync(src)) { console.error(`MISSING ${name}: ${r.rel}`); missing++; continue; }
      // the note name comes from pitch_keycenter, never from the filename — the
      // keycentre is what the renderer repitches around, and VSCO's names use a
      // different octave convention in places
      bank[`${NAMES[kc % 12]}${Math.floor(kc / 12) - 1}`] = [enc(src, e.kbps ?? 64, e.durS ?? 3, r.offset / 44100)];
    }
    map[name] = bank;
    info[name] = { kind: e.kind, n: Object.keys(bank).length, from: e.sfz, note: e.note };
    continue;
  }
  if (e.kind === 'pitched') {
    // note-keyed map from a sample folder: filename carries the pitch
    // (…-c3.wav, …-g#4.wav); strudel repitches from the nearest key.
    const dir = join(ROOT, e.dir);
    const files = readdirSync(dir).filter((f) => e.match.test(f) && f.endsWith('.wav')).sort();
    const bank = {};
    for (const f of files) {
      const m = /-([a-g]#?\d)\.wav$/.exec(f);
      if (!m) continue;
      bank[m[1]] = [enc(join(dir, f), 64)];
    }
    if (!Object.keys(bank).length) { console.error(`MISSING ${name}: no pitched files in ${e.dir}`); missing++; continue; }
    map[name] = bank;
    info[name] = { kind: e.kind, n: Object.keys(bank).length, note: e.note };
    continue;
  }
  const urls = [];
  for (const rel of e.srcs) {
    const src = join(ROOT, rel);
    if (!existsSync(src)) { console.error(`MISSING ${name}: ${rel}`); missing++; continue; }
    urls.push(enc(src, RATE[e.kind] ?? 80, e.trimS ?? 0));
  }
  if (!urls.length) continue;
  // keyNote pins the sample to a pitch so .note() repitches around it; plain
  // arrays register as unpitched one-shots with .n() round-robin variants.
  map[name] = e.keyNote ? { [`${e.keyNote}3`]: urls } : urls;
  info[name] = { kind: e.kind, n: urls.length, ...(e.bpm ? { bpm: e.bpm } : {}), ...(e.durS ? { durS: e.durS } : {}), note: e.note };
}
const js = `// GENERATED by scripts/build-sample-pack.mjs — do not edit.\n`
  + `// Local sample map for the audition tier (data: URIs; lazy-loaded by strudel).\n`
  + `window.LOCAL_SAMPLES = ${JSON.stringify(map)};\n`
  + `window.LOCAL_SAMPLE_INFO = ${JSON.stringify(info, null, 1)};\n`;
writeFileSync(OUT, js);
console.log(`wrote audition/sample-pack.js — ${Object.keys(map).length} names, ${(js.length / 1024 / 1024).toFixed(2)} MB${missing ? `, ${missing} MISSING sources` : ''}`);
