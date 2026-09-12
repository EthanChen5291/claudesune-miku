import { readFileSync } from 'node:fs';
import { evaluateSong, hapsByLabel } from './src/harness/evaluate.js';
const html=readFileSync('audition/band.html','utf8');
const i=html.indexOf('const DATA = '), j=html.indexOf(';\n',i);
const DATA=JSON.parse(html.slice(i+13,j));
const key=h=>`${Number(h.whole?.begin??h.part.begin).toFixed(6)}|${h.value.s??''}|${h.value.note??''}`;
console.log('song'.padEnd(14),'haps sung'.padEnd(11),'haps instr'.padEnd(11),'same events'.padEnd(12),'louder in twin'.padEnd(15),'median ratio');
for (const s of DATA.songs) {
  if (!s.mixInstrumental) continue;
  const bars=Math.min(s.totalBars,24);
  const A=hapsByLabel(await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: ${s.mix}`),0,bars).get('p')?.haps??[];
  const B=hapsByLabel(await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: ${s.mixInstrumental}`),0,bars).get('p')?.haps??[];
  const ma=new Map(A.map(h=>[key(h),h.value.gain??1])), mb=new Map(B.map(h=>[key(h),h.value.gain??1]));
  const shared=[...ma.keys()].filter(k=>mb.has(k));
  const ratios=shared.map(k=>mb.get(k)/ma.get(k)).filter(r=>Number.isFinite(r)).sort((x,y)=>x-y);
  const louder=ratios.filter(r=>r>1.001).length;
  console.log(s.name.padEnd(14), String(A.length).padEnd(11), String(B.length).padEnd(11),
    `${shared.length}/${ma.size}`.padEnd(12),
    `${louder} (${(100*louder/Math.max(1,ratios.length)).toFixed(0)}%)`.padEnd(15),
    ratios.length?ratios[Math.floor(ratios.length/2)].toFixed(3):'-',
    ' max '+(ratios.length?ratios[ratios.length-1].toFixed(3):'-'));
}
