// r40 helper: print one reference file bar by bar, per part, as beat:pitches cells.
// node scripts/dump-serious-r40.mjs "<file>" <fromBar> <toBar>
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readCorpusMidi, extractParts, PC_NAMES } from './corpus-midi.mjs';
const ROOT = join(fileURLToPath(new URL('..', import.meta.url)));
const [file, from = '0', to = '8'] = process.argv.slice(2);
const mid = readCorpusMidi(join(ROOT, 'audios', 'serious-r40', file));
const parts = extractParts(mid).filter((p) => !p.isDrum);
const [num, den] = mid.timeSig; const barTicks = mid.ppq * 4 * (num / den); const beat = mid.ppq;
const nm = (m) => `${PC_NAMES[((m % 12) + 12) % 12]}${Math.floor(m / 12) - 1}`;
for (let b = +from; b < +to; b++) {
  console.log(`bar ${b}`);
  parts.forEach((p, i) => {
    const ns = p.notes.filter((n) => n.tick >= b * barTicks && n.tick < (b + 1) * barTicks).sort((a, c) => a.tick - c.tick || c.midi - a.midi);
    if (!ns.length) return;
    const cells = []; for (const n of ns) { const t = Math.round(((n.tick % barTicks) / beat) * 4) / 4; const d = Math.round((n.dur / beat) * 4) / 4; const last = cells[cells.length - 1]; const tok = `${nm(n.midi)}${d !== 0.25 ? '(' + d + ')' : ''}`; if (last && last.t === t) last.p.push(tok); else cells.push({ t, p: [tok] }); }
    console.log(`  P${i}[${p.name}] ${cells.map((c) => `${c.t}:${c.p.join('.')}`).join('  ')}`);
  });
}
