// Measurement/contents contract only; real browser rendering is a separate gate.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {CATS,ANIMAL_ORDER,DISCLAIMER}=require('../src/data.js');
const {AVATARS}=require('../src/avatar-assets.js');
const painted=[];
let canvas;
const ctx={font:'',measureText(t){const n=Number(this.font.match(/([\d.]+)px/)[1]);return{width:Array.from(t).reduce((s,c)=>s+(c.charCodeAt(0)>255?n:n*.55),0)}},scale(){},fillRect(){},beginPath(){},roundRect(){},clip(){},save(){},restore(){},drawImage(){},fill(){},fillText(t,x,y){assert(y>=0&&y<canvas.height/3);painted.push(t)}};
const sandbox={CATS,ANIMAL_ORDER,DISCLAIMER,AVATARS,TEST_QR:require('../src/test-qr.json'),Image:class{set src(v){queueMicrotask(()=>this.onload())}},document:{fonts:{ready:Promise.resolve()},createElement(){canvas={getContext:()=>ctx,toBlob:fn=>fn(new Blob(['png'],{type:'image/png'}))};return canvas}},window:{addEventListener(){}},Blob};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require.resolve('../src/result-export.js'),'utf8'),sandbox);
(async()=>{
 for(const counts of [[20,0,0,0,0,0],[4,4,3,3,3,3],[0,0,0,0,0,0]]){
  painted.length=0;
  const animals=ANIMAL_ORDER.map((key,i)=>({key,count:counts[i],pct:counts[i]*5}));
  const selfPct=100-counts.reduce((a,b)=>a+b,0)*5;
  const output=await sandbox.makeResultPng({animals,selfPct});
  assert.equal(output.width,1260);assert(output.height>1000&&output.height<12000);
  const text=painted.join('');
  for(const a of animals.filter(a=>a.count>0)){assert(text.includes(CATS[a.key].desc));assert(text.includes(CATS[a.key].quote));assert(text.includes(CATS[a.key].mascot));}
  assert(text.includes(DISCLAIMER));assert(text.includes('扫码，看看你的内在动物园'));assert(text.includes('真我在场 · '+selfPct+'%'));
  console.log('PASS export contents/measurements',counts,output.width+'x'+output.height);
 }
})().catch(e=>{console.error(e);process.exitCode=1});
