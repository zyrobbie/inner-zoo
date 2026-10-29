// Scene contract test. Browser SVG/PNG comparison remains a separate release gate.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {CATS,ANIMAL_ORDER,DISCLAIMER}=require('../src/data');
const {AVATARS}=require('../src/avatar-assets');
const measured={font:'',measureText(t){const n=Number(this.font.match(/([\d.]+)px/)[1]);return {width:[...t].reduce((v,c)=>v+(/[\x00-\xff]/.test(c)?n*.55:n),0),actualBoundingBoxAscent:n*.86,actualBoundingBoxDescent:n*.14};}};
const s={CATS,AVATARS,DISCLAIMER,document:{createElement:()=>({getContext:()=>measured})},window:{innerWidth:390},roundedExportRect(){}};
vm.createContext(s);vm.runInContext(fs.readFileSync(require.resolve('../src/result-layout'),'utf8'),s);
let cases=0;
for(const width of [280,320,375,390]){
 s.window.innerWidth=width;
 for(const mainKey of [...ANIMAL_ORDER,'self']){
  for(const tie of [false,true]){
   const result={selfPct:mainKey==='self'?100:10,animals:ANIMAL_ORDER.map((key,idx)=>({key,idx,count:mainKey==='self'?0:(tie?3:(key===mainKey?8:2)),pct:mainKey==='self'?0:(tie?15:(key===mainKey?40:10))})).sort((a,b)=>b.count-a.count||a.idx-b.idx)};
   const scene=s.getResultScene(result), svg=s.resultSceneSvg(scene), painted=[];
   const painter={beginPath(){},fillRect(){},fill(){},stroke(){},ellipse(){},arc(){},moveTo(){},lineTo(){},save(){},restore(){},clip(){},drawImage(){},fillText(text,x,y){painted.push({text,x,y,font:this.font,color:this.fillStyle});}};
   s.paintResultScene(painter,scene,{});
   const textItems=scene.items.filter(i=>i.kind==='text');
   assert.equal(painted.length,textItems.length);
   textItems.forEach((item,i)=>{
    assert.equal(painted[i].text,item.text);assert.equal(painted[i].x,item.x);assert.equal(painted[i].y,item.y);assert.equal(painted[i].font,item.font);
    assert(svg.includes('x="'+item.x+'" y="'+item.y+'" style="font:'+s.escapeResultXml(item.font)+'" fill="'+item.color+'">'+s.escapeResultXml(item.text)+'</text>'));
    if(item.size===32)assert([...item.text].length>=2,'Orphaned main title character');
    if(item.size===18)assert((item.text.match(/[\u3400-\u9fff]/g)||[]).length>=2,'Orphaned main quote character');
    assert(item.y>0&&item.y<scene.height);assert(item.x>=0&&item.x<width);
    assert(!/^[，。！？；：、”）》]/.test(item.text),'punctuation starts line: '+item.text);
    assert(!/[（“《]$/.test(item.text),'opening punctuation ends line: '+item.text);
   });
   const joined=textItems.map(i=>i.text).join('');assert(joined.includes(DISCLAIMER));
   for(const animal of result.animals.filter(a=>a.count>0)){const c=CATS[animal.key];assert(joined.includes(c.mascot));assert(joined.includes(c.quote));assert(joined.includes(c.desc));}
   assert(!joined.includes('保存结果图片'));assert(!joined.includes('扫码'));assert(!joined.startsWith('你的内在动物园'));
   const main=scene.sections.find(i=>i.kind==='main');if(main)assert(main.bottomPadding>=24&&main.bottomPadding<25);else assert.equal(mainKey,'self');
   for(const panel of scene.sections)assert(panel.y+panel.height<=scene.height);
   assert.equal(s.getResultScene(result),scene);cases++;
  }
 }
}
console.log('PASS',cases,'shared scenes: 6 mains/all-self/ties × 4 widths; identical SVG/PNG text/font/coordinates; full copy; compact main padding; punctuation');
