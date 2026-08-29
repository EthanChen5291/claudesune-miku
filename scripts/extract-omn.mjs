// r22 — read the ARP STEP SEQUENCES out of Omnisphere .prt_omn patches.
//
// I told him these were unusable: "Spectrasonics' proprietary patch format,
// our render chain cannot load them." That was WRONG in the way that matters.
// They cannot be loaded as INSTRUMENTS — true, and unchanged. But the files are
// plain XML and every one of them carries an <ARPSEQ2> block of
// <SLICESEQSTEP BEGIN END CH SLICEINDEX VEL> elements: a step sequence with
// timing, note index and velocity. His point stands — "the .omn and the .mid
// can be copied as sub-foundations for melody or harmony ... in a reliable way
// without hardcoding".
//
// COMMERCIAL PACK. Same treatment as the Miraleste drums and the ripped BRR
// rows: the patches stay outside the repo, the extract is gitignored, and
// anything promoted into src/lib is HAND-AUTHORED from it (D95), never counted.
//
// Run: node scripts/extract-omn.mjs [<bank dir>]

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const BANK = process.argv[2] ?? '/Users/ethanchen/Downloads/685floyd - Cottonwood Omnisphere Bank';
const OUT = join(ROOT, 'audios', 'omn-extract');

const attrs = (tag) => {
  const o = {};
  for (const m of tag.matchAll(/(\w+)="([^"]*)"/g)) o[m[1]] = m[2];
  return o;
};
// Omnisphere stores floats as raw IEEE-754 hex (e.g. TEMPO="42f00000" = 120.0)
const hexFloat = (h) => {
  if (!/^[0-9a-fA-F]{8}$/.test(String(h ?? ''))) return null;
  const b = Buffer.alloc(4);
  b.writeUInt32BE(parseInt(h, 16), 0);
  return b.readFloatBE(0);
};

export function readOmn(path) {
  const src = readFileSync(path, 'utf8');
  const seqTag = src.match(/<ARPSEQ2[^>]*>/);
  const seq = seqTag ? attrs(seqTag[0]) : {};
  const tpq = Number(seq.TICKSPERQUARTER) || 2400;
  const steps = [];
  for (const m of src.matchAll(/<SLICESEQSTEP\s+([^>]*)>/g)) {
    const a = attrs('<x ' + m[1] + '>');
    const begin = Number(a.BEGIN), end = Number(a.END);
    if (!Number.isFinite(begin) || !Number.isFinite(end)) continue;
    steps.push({
      beat: begin / tpq, lenBeats: (end - begin) / tpq,
      note: Number(a.SLICEINDEX), vel: Number(a.VEL), ch: Number(a.CH),
      // CAVEAT, measured: VEL is not reliably a 0-127 MIDI velocity here —
      // values above 127 (3014, 3127, ...) occur inside SLICESEQSTEP across the
      // bank. Treat it as an ordinal curve, not a velocity, until the scale is
      // understood. `velOk` marks the rows that are in MIDI range.
      velOk: Number(a.VEL) >= 0 && Number(a.VEL) <= 127,
    });
  }
  const arpTag = src.match(/<ARP\s[^>]*>/);
  const arp = arpTag ? attrs(arpTag[0]) : {};
  return {
    name: path.split('/').pop().replace(/\.prt_omn$/, ''),
    tempo: hexFloat(seq.TEMPO),
    timeSig: `${seq.TIMESIGNUM ?? 4}/${seq.TIMESIGDENOM ?? 4}`,
    tpq, steps,
    groove: arp.ArpGrooveName ?? null,
    arpOn: hexFloat(arp.ArpOnOff) === 1,
    arpMode: arp.ArpMode ?? null,
  };
}

const files = readdirSync(BANK).filter((f) => f.endsWith('.prt_omn')).sort();
const out = [];
for (const f of files) {
  try { out.push(readOmn(join(BANK, f))); }
  catch (e) { console.log(`FAILED ${f}: ${e.message}`); }
}
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'omn-sequences.json'), JSON.stringify(out, null, 1));

// ---- what did we actually get? measure, do not assert -----------------------
const withSteps = out.filter((p) => p.steps.length);
// SLICEINDEX < 0 is a sentinel (rest / tie), not a pitch. Counting it as one
// reported 55 of 57 patches as "melodic" on the first pass — a suspiciously
// clean number, and wrong: most of these are a FIXED note with a rhythm and a
// velocity curve, which is a groove template, not a melody.
const pitches = (p) => [...new Set(p.steps.map((s) => s.note).filter((n) => n >= 0))];
const melodic = withSteps.filter((p) => pitches(p).length > 1);
const velVaried = withSteps.filter((p) => new Set(p.steps.map((s) => s.vel)).size > 1);
const rhythmic = withSteps.filter((p) => pitches(p).length <= 1);
console.log(`read ${out.length}/${files.length} patches -> audios/omn-extract/omn-sequences.json`);
console.log(`  carrying a step sequence: ${withSteps.length}`);
console.log(`  MELODIC (>1 real pitch, sentinels excluded): ${melodic.length}`);
console.log(`  RHYTHM+VELOCITY only (one fixed pitch): ${rhythmic.length}`);
console.log(`  velocity-varied: ${velVaried.length}`);
const fam = new Map();
for (const p of out) { const k = p.name.split(' - ')[0]; fam.set(k, (fam.get(k) ?? 0) + 1); }
console.log(`  families: ${[...fam].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k}:${n}`).join(' ')}`);
const allSteps = withSteps.reduce((a, p) => a + p.steps.length, 0);
console.log(`  ${allSteps} steps total, median ${withSteps.length ? withSteps.map((p) => p.steps.length).sort((a, b) => a - b)[Math.floor(withSteps.length / 2)] : 0} per patch`);
for (const p of melodic.slice(0, 8)) {
  console.log(`   ${p.name.padEnd(30)} ${p.steps.length} steps  pitches {${pitches(p).sort((a, b) => a - b).join(' ')}}  vel ${Math.min(...p.steps.map((s2) => s2.vel))}-${Math.max(...p.steps.map((s2) => s2.vel))}  groove ${p.groove || '-'}`);
}
