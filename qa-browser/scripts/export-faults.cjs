// Independent failure-path model. NOT browser/device testing.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(process.argv[2]||'zoo-v05');
const {CATS,ANIMAL_ORDER,DISCLAIMER}=require(path.join(root,'src/data.js'));
const {AVATARS}=require(path.join(root,'src/avatar-assets.js'));
const source=fs.readFileSync(path.join(root,'src/result-export.js'),'utf8');
const result={selfPct:50,animals:ANIMAL_ORDER.map((key,i)=>({key,count:i?0:10,pct:i?0:50}))};
const scenarios=['normal','fonts-never-ready','image-never-settles','image-errors','blob-never-calls','blob-null','context-unavailable','roundRect-unavailable'];
(async()=>{let hang=false;for(const fault of scenarios){
 const ctx={font:'16px system-ui',measureText(t){return{width:Array.from(t).length*14}},scale(){},fillRect(){},beginPath(){},roundRect(){},rect(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},clip(){},save(){},restore(){},drawImage(){},fill(){},fillText(){}};if(fault==='roundRect-unavailable')delete ctx.roundRect;
 const canvas={getContext:()=>fault==='context-unavailable'?null:ctx,toBlob(cb){if(fault==='blob-never-calls')return;queueMicrotask(()=>cb(fault==='blob-null'?null:new Blob(['png'],{type:'image/png'})))},toDataURL(){return'data:image/png;base64,cG5n'}};
 class Img {constructor(){this.complete=false;this.naturalWidth=640;this.naturalHeight=640} set src(v){this._src=v;if(fault==='image-never-settles')return;queueMicrotask(()=>{this.complete=true;if(fault==='image-errors')this.onerror?.(new Error('offline'));else this.onload?.()})}get src(){return this._src}decode(){return fault==='image-never-settles'?new Promise(()=>{}):Promise.resolve()}}
 const sandbox={CATS,ANIMAL_ORDER,DISCLAIMER,AVATARS,TEST_QR:require(path.join(root,'src/test-qr.json')),Image:Img,document:{fonts:{ready:fault==='fonts-never-ready'?new Promise(()=>{}):Promise.resolve()},createElement(){return canvas}},window:{addEventListener(){}},navigator:{},Blob,File:globalThis.File,URL,Uint8Array,atob,Promise,console,setTimeout:(fn,ms)=>setTimeout(fn,Math.min(ms,5)),clearTimeout,requestAnimationFrame:fn=>setTimeout(fn,0)};
 vm.createContext(sandbox);vm.runInContext(source,sandbox);
 const pending=sandbox.makeResultPng(result).then(o=>({status:'resolved',width:o.width,height:o.height}),e=>({status:'rejected',message:e.message}));
 const got=await Promise.race([pending,new Promise(r=>setTimeout(()=>r({status:'UNBOUNDED'}),250))]);console.log(JSON.stringify({fault,...got}));if(got.status==='UNBOUNDED')hang=true;
 const expected=['image-never-settles','image-errors','context-unavailable'].includes(fault)?'rejected':'resolved';
 assert.equal(got.status,expected,fault+' must terminate with the intended fallback');
 if(expected==='resolved')assert.equal(got.width,840);
 }
 if(hang)process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
