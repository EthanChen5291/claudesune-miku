import { readFileSync } from 'node:fs';
import { evaluateSong, hapsByLabel } from './src/harness/evaluate.js';
const html = readFileSync('audition/vocalab.html','utf8');
const i = html.indexOf('const DATA = '), j = html.indexOf(';\n', i);
const DATA = JSON.parse(html.slice(i+13, j));
const NAMES=['pc','c','db','d','eb','e','f','gb','g','ab','a','bb','b'];
const PC={c:0,d:2,e:4,f:5,g:7,a:9,b:11};
function midi(n){ if(typeof n==='number') return n; const m=/^([a-gA-G])([#b]*)(-?\d+)$/.exec(String(n)); if(!m) return null;
  let p=PC[m[1].toLowerCase()]; for(const ch of m[2]) p+= ch==='#'?1:-1; return p+12*(Number(m[3])+1); }
const MINOR=[0,2,3,5,7,8,10], MAJOR=[0,2,4,5,7,9,11];
function keyPcs(key){ const [t,mode]=key.split(':'); const m=/^([a-gA-G])([#b]*)$/.exec(t); let p=PC[m[1].toLowerCase()]; for(const ch of m[2]) p+= ch==='#'?1:-1;
  const sc = mode && mode.startsWith('min')?MINOR:MAJOR; return new Set(sc.map(x=>(x+p)%12)); }
const rows=[];
for (const s of DATA.songs) {
  const parts = Object.entries(s.solos||{}).filter(([k])=>/harmony_support|melody_takeover/.test(k));
  if(!parts.length) continue;
  const pcs = keyPcs(s.key);
  for (const [k,src] of parts) {
    const snd = [...new Set([...String(src).matchAll(/\.s\("([^"]+)"\)/g)].map(m=>m[1]))].join(',');
    const ev = await evaluateSong(`setcpm(${s.bpm}/${s.beats})\np: ${src}`);
    const haps = hapsByLabel(ev, 0, s.totalBars).get('p')?.haps ?? [];
    const notes = haps.map(h=>({t:Number(h.whole?.begin ?? h.part.begin), m:midi(h.value.note), g:h.value.gain ?? 1})).filter(x=>x.m!=null);
    if(!notes.length){ rows.push([s.name,k,snd,0,'-','-','-','-']); continue; }
    const out = notes.filter(n=>!pcs.has(((n.m%12)+12)%12)).length;
    const ms = notes.map(n=>n.m).sort((a,b)=>a-b);
    const first = Math.min(...notes.map(n=>n.t));
    rows.push([s.name,k.split('::')[1]||k,snd,notes.length, ms[0]+'-'+ms[ms.length-1], (100*out/notes.length).toFixed(0)+'%', first.toFixed(1)+'bar', (notes.reduce((a,b)=>a+b.g,0)/notes.length).toFixed(2)]);
  }
}
console.log(['song','part','sound','n','midi','outkey','entry','gain'].map(x=>String(x).padEnd(13)).join(''));
for(const r of rows) console.log(r.map(x=>String(x).padEnd(13)).join(''));
