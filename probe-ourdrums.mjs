import { readFileSync } from 'node:fs';
import { evaluateSong, hapsByLabel } from './src/harness/evaluate.js';
const page = process.argv[2] || 'audition/songs.html';
const html = readFileSync(page,'utf8');
const i = html.indexOf('const DATA = '), j = html.indexOf(';\n', i);
const DATA = JSON.parse(html.slice(i+13, j));
const CLS = s => /bd|kick/.test(s)?'kick': /sd|snare|cp|clap/.test(s)?'snare': /hh|hat/.test(s)?'hat': /cr|crash|rd|ride/.test(s)?'cym': /lt|mt|ht|tom/.test(s)?'tom':'perc';
let agg=[];
for (const s of DATA.songs) {
  const src = s.solos?._drums; if(!src) continue;
  const ev = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: ${src}`);
  const haps = hapsByLabel(ev, 0, Math.min(s.totalBars,32)).get('p')?.haps ?? [];
  const on = haps.filter(h=>(h.value.gain??1)>0.001).map(h=>({t:Number(h.whole?.begin ?? h.part.begin), s:String(h.value.s||''), g:h.value.gain??1}));
  if(!on.length) continue;
  const bars = Math.min(s.totalBars,32);
  const cls = new Set(on.map(x=>CLS(x.s)));
  const snd = new Set(on.map(x=>x.s));
  const gains = new Set(on.map(x=>Number(x.g).toFixed(3)));
  const slots = new Map();
  let off16=0, off8=0;
  for(const x of on){ const inbar=((x.t%1)+1)%1; const s16=inbar*16;
    if(Math.abs(s16-Math.round(s16))>0.12) off16++; else if(Math.round(s16)%2===1) off8++;
    const k=Math.round(x.t*32); if(!slots.has(k)) slots.set(k,new Set()); slots.get(k).add(CLS(x.s)); }
  const stacked=[...slots.values()].filter(v=>v.size>1).length;
  const sigs=new Set();
  for(let b=0;b<Math.min(bars,8);b++){ const sig=on.filter(x=>Math.floor(x.t)===b).map(x=>Math.round((x.t%1)*16)+':'+CLS(x.s)).sort().join(','); if(sig) sigs.add(sig); }
  agg.push({name:s.name, perBar:+(on.length/bars).toFixed(2), pieces:cls.size, sounds:snd.size,
    velDistinct:gains.size, off16:+(off16/on.length).toFixed(3), off8:+(off8/on.length).toFixed(3),
    stack:+(stacked/slots.size).toFixed(3), distinctBars:sigs.size, has:[...cls].join('/')});
}
const mean=k=>+(agg.reduce((a,b)=>a+b[k],0)/agg.length).toFixed(3);
console.log(page, agg.length,'songs with drums');
console.log('MEAN  perBar',mean('perBar'),' pieces',mean('pieces'),' sounds',mean('sounds'),' velDistinct',mean('velDistinct'),
  ' off16',mean('off16'),' off8',mean('off8'),' stack',mean('stack'),' distinctBars(of 8)',mean('distinctBars'));
const snareN = agg.filter(a=>/snare/.test(a.has)).length;
console.log('songs with a SNARE class:',snareN,'/',agg.length,'   with a CYM:',agg.filter(a=>/cym/.test(a.has)).length);
for(const a of agg.slice(0,8)) console.log(' ',a.name.padEnd(24),JSON.stringify(a));
