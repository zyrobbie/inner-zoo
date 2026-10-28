// VM branch coverage, not actual browser or native share validation.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(process.argv[2]||'zoo-v051'),{CATS,ANIMAL_ORDER,DISCLAIMER}=require(path.join(root,'src/data.js')),{AVATARS}=require(path.join(root,'src/avatar-assets.js'));
const result={selfPct:50,animals:ANIMAL_ORDER.map((key,i)=>({key,count:i?0:10,pct:i?0:50}))};
const cases=['normal','no-File','canShare-throws','no-showModal','share-throws','share-AbortError','image-stuck'];
(async()=>{for(const fault of cases){let dialog,loads=0;
 const node=()=>({hidden:true,disabled:false,style:{},classList:{add(){}},setAttribute(){},addEventListener(){},remove(){},close(){},focus(){}});
 const ctx={font:'16px',measureText:t=>({width:Array.from(t).length*14}),scale(){},fillRect(){},beginPath(){},rect(){},clip(){},save(){},restore(){},drawImage(){},fill(){},fillText(){}};
 const canvas={getContext:()=>ctx,toBlob:cb=>queueMicrotask(()=>cb(new Blob(['png'],{type:'image/png'})))};
 const navigator={canShare(){if(fault==='canShare-throws')throw Error('unsupported');return true},share(){if(fault==='share-throws')throw Error('not allowed');return fault==='share-AbortError'?Promise.reject(Object.assign(Error('cancel'),{name:'AbortError'})):Promise.resolve()}};
 const document={activeElement:{isConnected:true,focus(){}},body:{appendChild(){}},createElement(type){if(type==='canvas')return canvas;dialog=node();let map=new Map();dialog.querySelector=s=>{if(!map.has(s))map.set(s,node());return map.get(s)};if(fault!=='no-showModal')dialog.showModal=()=>{};return dialog}};
 const sandbox={CATS,ANIMAL_ORDER,DISCLAIMER,AVATARS,TEST_QR:require(path.join(root,'src/test-qr.json')),Image:class{set src(v){loads++;if(fault==='image-stuck')return;queueMicrotask(()=>this.onload?.())}},document,window:{addEventListener(){}},navigator,Blob,File:fault==='no-File'?undefined:class extends Blob{constructor(parts,name,options){super(parts,options);this.name=name}},URL:{createObjectURL:()=> 'blob:mock',revokeObjectURL(){}},Uint8Array,atob,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,5)),clearTimeout,computeResults:()=>result};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'src/result-export.js'),'utf8'),sandbox);
 await sandbox.openResultExport();const d=dialog,download=d.querySelector('.export-download'),status=d.querySelector('.export-status');
 if(fault==='image-stuck'){assert.equal(d.querySelector('.export-retry').hidden,false);assert.match(status.textContent,/超时/)}else{assert.equal(download.hidden,false);assert.equal(d.querySelector('.export-preview').hidden,false);if(fault==='no-File'||fault==='canShare-throws')assert.equal(d.querySelector('.export-share').hidden,true);else{d.querySelector('.export-share').onclick();await new Promise(r=>setTimeout(r,1));assert.equal(d.querySelector('.export-share').disabled,false);assert.doesNotMatch(status.textContent,/已保存|保存成功/)}sandbox.closeResultExport();await sandbox.openResultExport();assert.equal(loads,1,'reopen reuses images/output');}
 console.log('PASS VM export UI',fault);
}})().catch(e=>{console.error(e);process.exitCode=1});
