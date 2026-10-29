// Independent measured-scene model, not rendered-browser proof.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(process.argv[2]||'zoo-result-upgrade');
const {CATS,ANIMAL_ORDER,DISCLAIMER}=require(path.join(root,'src/data.js')),{AVATARS}=require(path.join(root,'src/avatar-assets.js'));
const ctx={font:'16px sans-serif',measureText(t){let n=Number(this.font.match(/([\d.]+)px/)[1]);return{width:Array.from(t).reduce((a,c)=>a+(/[\x00-\xff]/.test(c)?n*.55:n),0),actualBoundingBoxAscent:n*.86,actualBoundingBoxDescent:n*.14}}};
const s={CATS,ANIMAL_ORDER,DISCLAIMER,AVATARS,window:{innerWidth:390},document:{createElement:()=>({getContext:()=>ctx})},roundedExportRect(){}};
vm.createContext(s);vm.runInContext(fs.readFileSync(path.join(root,'src/result-layout.js'),'utf8'),s);
let cases=0;
for(const w of [280,300,320,350,360,375,390,430])for(const main of [...ANIMAL_ORDER,'self'])for(const mode of ['single','fiveothers','tie']){
 s.window.innerWidth=w;
 const counts=Object.fromEntries(ANIMAL_ORDER.map(k=>[k,main==='self'?0:(mode==='tie'?3:(k===main?10:(mode==='single'?0:2)))]));
 const result={selfPct:(20-Object.values(counts).reduce((a,b)=>a+b,0))*5,animals:ANIMAL_ORDER.map((key,idx)=>({key,idx,count:counts[key],pct:counts[key]*5})).sort((a,b)=>b.count-a.count||a.idx-b.idx)};
 const scene=s.getResultScene(result),text=scene.items.filter(i=>i.kind==='text');
 const title=text.filter(i=>i.size===32);for(const line of title)assert(Array.from(line.text).length>1,'orphan main-title at '+w+' '+main+': '+line.text);
 for(const t of text){ctx.font=t.font;assert(t.x>=15&&t.x+ctx.measureText(t.text).width<=scene.width-15+0.1,'text overflows scene at '+w+': '+t.text);assert(!/^[，。！？；：、”）》]/.test(t.text));assert(!/[（“《]$/.test(t.text));}
 for(const card of scene.sections){assert(card.height>0);assert(card.y+card.height<scene.height);if(card.kind==='main')assert(card.bottomPadding>=24&&card.bottomPadding<25);}
 const mainSection=scene.sections.find(i=>i.kind==='main');assert.equal(!!mainSection,main!=='self');assert.equal(scene.sections.filter(i=>i.kind==='secondary').length,Object.values(counts).filter(n=>n>0).length?Object.values(counts).filter(n=>n>0).length-1:0);
 assert(text.map(t=>t.text).join('').includes(DISCLAIMER));cases++;
}
console.log('PASS',cases,'independent scenes: 8 widths / 6 mains / self / single / fiveothers / tie; no title orphan, overflow, missing disclaimer, phantom card; main padding24');
