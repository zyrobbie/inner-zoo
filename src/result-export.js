// Local-only PNG rendering. QR is a build-time matrix, never an external API.
function qrSvg(){
  const n = TEST_QR.length;
  let d = '';
  TEST_QR.forEach((row,y) => row.forEach((on,x) => { if(on) d += 'M'+x+' '+y+'h1v1h-1z'; }));
  return '<svg viewBox="0 0 '+n+' '+n+'" role="img" aria-label="扫码进入内在动物园测试" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="white"/><path d="'+d+'" fill="#203b2d"/></svg>';
}
let exportDialog = null;
let exportGeneration = 0;
let exportObjectUrl = null;
function closeResultExport(){
  exportGeneration++;
  if(exportDialog){ if(typeof exportDialog.close === 'function') exportDialog.close(); exportDialog.remove(); exportDialog = null; }
  if(exportObjectUrl){ URL.revokeObjectURL(exportObjectUrl); exportObjectUrl = null; }
}
function wrapResultText(ctx, text, width){
  const lines = []; let line = '';
  for(const char of Array.from(text)){
    if(char === '\n'){ lines.push(line); line = ''; continue; }
    if(line && ctx.measureText(line + char).width > width){ lines.push(line); line = char; }
    else line += char;
  }
  if(line) lines.push(line);
  return lines;
}
const exportAvatars = new Map();
let resultExportCache = null;
function loadExportAvatar(key){
  if(exportAvatars.has(key)) return exportAvatars.get(key);
  const promise = new Promise((resolve,reject) => {
    const img = new Image(); let settled = false;
    const timer = setTimeout(() => finish(new Error('头像载入超时，请检查网络后重试。')), 6000);
    const finish = error => {
      if(settled) return; settled = true; clearTimeout(timer);
      img.onload = img.onerror = null;
      if(error){ img.src = ''; reject(error); } else resolve(img);
    };
    img.onload = () => finish();
    img.onerror = () => finish(new Error('头像未能载入，请联网后重试。'));
    // Reuse the same compact image as the visible result, not a second 0.6 MB PNG.
    img.src = AVATARS[key].large;
    if(img.complete && img.naturalWidth) finish();
  });
  exportAvatars.set(key,promise);
  promise.catch(() => { if(exportAvatars.get(key) === promise) exportAvatars.delete(key); });
  return promise;
}
function prefetchExportAvatars(){
  ANIMAL_ORDER.forEach(key => { loadExportAvatar(key).catch(() => {}); });
}
function clearResultExportCache(){ resultExportCache = null; sharedResultScene = null; }
function prepareResultExport(result){
  const key = resultSceneKey(result,resultLayoutWidth());
  if(resultExportCache && resultExportCache.key === key) return resultExportCache.promise;
  const record = {key,promise:null}; resultExportCache = record;
  record.promise = makeResultPng(result).then(output => {record.output=output;return output;}).catch(error=>{
    if(resultExportCache === record) resultExportCache = null;
    throw error;
  });
  return record.promise;
}
function roundedExportRect(ctx,x,y,w,h,r){
  if(typeof ctx.roundRect === 'function') ctx.roundRect(x,y,w,h,r);
  else ctx.rect(x,y,w,h); // Older iOS: square corners are preferable to failed saving.
}
function canvasPngBlob(canvas){
  return new Promise((resolve,reject)=>{
    let done=false;
    const finish=(blob,error)=>{if(done)return;done=true;clearTimeout(timer);error?reject(error):resolve(blob);};
    const fallback=()=>{
      if(done)return;
      try{
        const data=canvas.toDataURL('image/png').split(',')[1];
        if(!data) throw new Error('图片生成失败，请关闭其他页面后重试。');
        const raw=atob(data), bytes=new Uint8Array(raw.length);
        for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
        finish(new Blob([bytes],{type:'image/png'}));
      }catch(error){finish(null,error);}
    };
    const timer=setTimeout(fallback,1800);
    try{ if(typeof canvas.toBlob==='function') canvas.toBlob(blob=>blob?finish(blob):fallback(),'image/png'); else fallback(); }
    catch(error){fallback();}
  });
}
async function makeResultPng(result){
  const scene=getResultScene(result);
  const images={};
  await Promise.all(result.animals.filter(a=>a.count>0).map(async a=>{images[a.key]=await loadExportAvatar(a.key);}));
  const scale=2,canvas=document.createElement('canvas');
  canvas.width=scene.width*scale;canvas.height=(scene.height+246)*scale;
  const ctx=canvas.getContext('2d');
  if(!ctx)throw new Error('当前浏览器不能生成图片，请换用系统浏览器。');
  ctx.scale(scale,scale);ctx.fillStyle=RESULT_STYLE.paper;ctx.fillRect(0,0,scene.width,scene.height+246);
  paintResultScene(ctx,scene,images);
  const n=TEST_QR.length,cell=4,qrSize=n*cell,qrX=(scene.width-qrSize)/2,qrY=scene.height+8;
  ctx.fillStyle='white';ctx.fillRect(qrX,qrY,qrSize,qrSize);ctx.fillStyle='#203b2d';
  TEST_QR.forEach((row,j)=>row.forEach((on,i)=>{if(on)ctx.fillRect(qrX+i*cell,qrY+j*cell,cell,cell);}));
  const caption='扫码，看看你的内在动物园';ctx.font=sceneFont(14,false);ctx.textBaseline='top';ctx.fillStyle=RESULT_STYLE.ink;
  ctx.fillText(caption,(scene.width-ctx.measureText(caption).width)/2,scene.height+166);
  const blob=await canvasPngBlob(canvas);
  return {blob,width:canvas.width,height:canvas.height,commonHeight:scene.height*scale};
}
async function openResultExport(){
  if(exportDialog) return;
  const generation = ++exportGeneration;
  const trigger = document.activeElement;
  const dialog = document.createElement('dialog'); exportDialog = dialog;
  dialog.className = 'export-dialog';
  dialog.setAttribute('aria-labelledby','exportTitle');
  dialog.innerHTML = '<h2 id="exportTitle">保存你的内在动物园</h2><p class="export-status" role="status" aria-live="polite">正在准备图片…</p><div class="export-preview" hidden><img alt="完整测试结果长图，可上下滑动查看并长按保存"></div><p class="export-help">图片生成后，可长按图片选择“存储图像”。也可打开系统分享菜单，选择“存储图像”；具体选项以手机系统为准。微信内若没有保存选项，请在系统浏览器打开本页再保存。</p><div class="export-actions"><button class="export-share" hidden>系统分享 / 存储图像</button><a class="export-download" hidden download="内在动物园-V0.5.png">下载 PNG</a><button class="export-retry" hidden>重新生成</button><button class="export-close">关闭</button></div>';
  document.body.appendChild(dialog);
  if(typeof dialog.showModal === 'function') dialog.showModal(); else {dialog.setAttribute('open','');dialog.classList.add('export-fallback');dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');}
  const status = dialog.querySelector('.export-status');
  const close = () => { closeResultExport(); if(trigger && trigger.isConnected) trigger.focus(); };
  dialog.querySelector('.export-close').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  dialog.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
  try{
    const output = await prepareResultExport(computeResults());
    if(generation !== exportGeneration) return;
    exportObjectUrl=URL.createObjectURL(output.blob);
    dialog.querySelector('img').src=exportObjectUrl;
    dialog.querySelector('.export-preview').hidden=false;
    const download=dialog.querySelector('.export-download');download.href=exportObjectUrl;download.hidden=false;
    download.onclick=()=>{status.textContent='已请求下载；手机可能打开原图。若未进入相册，请长按图片选择“存储图像”。';};
    let file=null;
    try{if(typeof File==='function') file=new File([output.blob],'内在动物园-V0.5.png',{type:'image/png'});}catch(_){}
    const share=dialog.querySelector('.export-share');
    let shareSupported=false;
    try{shareSupported=Boolean(file && navigator.share && navigator.canShare && navigator.canShare({files:[file]}));}catch(_){}
    if(shareSupported){
      share.hidden=false;
      share.onclick=()=>{
        // File is already ready: call inside the click, without an intervening await.
        share.disabled=true;
        let shareRequest;
        try{shareRequest=navigator.share({files:[file]});}catch(error){share.disabled=false;status.textContent='系统分享未完成，请长按图片保存或下载 PNG。';return;}
        Promise.resolve(shareRequest).then(()=>{status.textContent='已调用系统分享，请在系统选项中完成保存。';}).catch(err=>{status.textContent=err.name==='AbortError'?'未完成保存。你仍可下载 PNG，或长按下方原图保存。':'系统分享未完成。请长按下方图片保存，或选择下载 PNG。';}).finally(()=>{share.disabled=false;});
      };
    }
    status.textContent='高清图片已生成（'+output.width+' × '+output.height+'），上下滑动可查看完整内容。';
  } catch(err){
    if(generation === exportGeneration){
      status.textContent=err.message || '图片生成失败，请重试。';
      const retry=dialog.querySelector('.export-retry');retry.hidden=false;retry.onclick=()=>{closeResultExport();clearResultExportCache();openResultExport();};
    }
  }
}
window.addEventListener('pagehide',closeResultExport);
