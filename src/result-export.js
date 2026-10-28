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
  if(exportDialog){ exportDialog.close(); exportDialog.remove(); exportDialog = null; }
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
async function makeResultPng(result){
  if(document.fonts && document.fonts.ready) await document.fonts.ready;
  const animals = result.animals.filter(a => a.count > 0);
  const images = {};
  await Promise.all(animals.map(a => new Promise((resolve,reject) => {
    const img = new Image();
    img.onload = () => { images[a.key] = img; resolve(); };
    img.onerror = () => reject(new Error('头像未能载入，请联网后重试。'));
    img.src = AVATARS[a.key].png;
  })));
  // Measure first, then paint once at 3x. There is no viewport screenshot/cropping.
  const width = 420, scale = 3;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if(!ctx) throw new Error('当前浏览器不能生成图片，请换用系统浏览器。');
  const blocks = [];
  const panels = [];
  let y = 38;
  function textBlock(text, size, lineHeight, options){
    const o = options || {}, x = o.x || 28, w = o.width || width - x - 28;
    ctx.font = (o.bold ? '600 ' : '') + size + 'px system-ui, sans-serif';
    const lines = wrapResultText(ctx,text,w);
    blocks.push({kind:'text',lines,size,lineHeight,x,y,color:o.color || '#2D493C',bold:o.bold});
    y += lines.length * lineHeight;
  }
  textBlock('你的内在动物园',26,36,{bold:true});
  y += 18;
  animals.forEach((a,i) => {
    const c = CATS[a.key];
    if(i === 0){
      textBlock('最近最忙的一位',14,22,{color:'#657455'}); y += 12;
      blocks.push({kind:'image',key:a.key,x:100,y,size:220}); y += 238;
      textBlock(c.mascot,26,36,{bold:true}); y += 8;
      const ties = animals.slice(1).filter(b => b.count === a.count).map(b => CATS[b.key].name);
      textBlock(c.name+' · 出现在 '+a.pct+'% 的选择里'+(ties.length ? '（与「'+ties.join('」「')+'」并列）' : ''),15,24);
      y += 14; textBlock('“'+c.quote+'”',18,29); y += 12;
      textBlock(c.desc,16,28); y += 30;
    } else {
      if(i === 1){ textBlock('其他也在活动的部分',18,28,{bold:true}); y += 16; }
      const top = y;
      blocks.push({kind:'image',key:a.key,x:28,y,size:68});
      textBlock(c.mascot,18,27,{x:110,bold:true});
      textBlock(c.name+' · 出现在 '+a.pct+'% 的选择里',14,22,{x:110});
      y = Math.max(y,top+68)+12;
      textBlock('“'+c.quote+'”',16,26); y += 8;
      textBlock(c.desc,15,25); panels.push({y:top-12,height:y-top+24}); y += 38;
    }
  });
  textBlock('真我',20,30,{bold:true}); y += 6;
  textBlock('真我在场 · '+result.selfPct+'%',18,28,{bold:true}); y += 8;
  textBlock(result.selfPct > 0 ? '有 '+result.selfPct+'% 的选择，是真我在直接回应当下。'+CATS.self.desc : '这次的选择里，真我没有直接出现。这并不代表它不在，它一直在，只是需要被留意。',16,27);
  y += 30; textBlock(DISCLAIMER,13,23,{color:'#657455'});
  y += 28;
  const qrY = y, qrSize = TEST_QR.length * 4; y += qrSize + 12;
  textBlock('扫码，看看你的内在动物园',16,25,{x:70,width:310});
  y += 10; textBlock('内在动物园 · V0.5',12,20,{x:148,width:230,color:'#657455'}); y += 28;
  canvas.width = width*scale; canvas.height = Math.ceil(y)*scale;
  ctx.scale(scale,scale); ctx.fillStyle='#F7F1DF'; ctx.fillRect(0,0,width,y);
  ctx.fillStyle='#FFFCF3';
  panels.forEach(p=>{ctx.beginPath();ctx.roundRect(16,p.y,width-32,p.height,18);ctx.fill();});
  ctx.textBaseline = 'top';
  blocks.forEach(b => {
    if(b.kind === 'image'){
      ctx.save(); ctx.beginPath(); ctx.roundRect(b.x,b.y,b.size,b.size,20); ctx.clip();
      ctx.drawImage(images[b.key],b.x,b.y,b.size,b.size); ctx.restore();
    } else {
      ctx.font=(b.bold?'600 ':'')+b.size+'px system-ui, sans-serif';ctx.fillStyle=b.color;
      b.lines.forEach((line,i) => ctx.fillText(line,b.x,b.y+i*b.lineHeight));
    }
  });
  const qrX=(width-qrSize)/2;
  ctx.fillStyle='white';ctx.fillRect(qrX,qrY,qrSize,qrSize);ctx.fillStyle='#203b2d';
  TEST_QR.forEach((row,j)=>row.forEach((on,i)=>{if(on)ctx.fillRect(qrX+i*4,qrY+j*4,4,4);}));
  const blob = await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('图片生成失败，请重试。')),'image/png'));
  return {blob,width:canvas.width,height:canvas.height};
}
async function openResultExport(){
  if(exportDialog) return;
  const generation = ++exportGeneration;
  const trigger = document.activeElement;
  const dialog = document.createElement('dialog'); exportDialog = dialog;
  dialog.className = 'export-dialog';
  dialog.setAttribute('aria-labelledby','exportTitle');
  dialog.innerHTML = '<h2 id="exportTitle">保存你的内在动物园</h2><p class="export-status" role="status" aria-live="polite">正在生成完整高清图片…</p><div class="export-preview" hidden><img alt="完整测试结果长图，可上下滑动查看并长按保存"></div><p class="export-help">图片生成后，可长按图片选择“存储图像”。也可打开系统分享菜单，选择“存储图像”；具体选项以手机系统为准。微信内若没有保存选项，请在系统浏览器打开本页再保存。</p><div class="export-actions"><button class="export-share" hidden>系统分享 / 存储图像</button><a class="export-download" hidden download="内在动物园-V0.5.png">下载 PNG</a><button class="export-close">关闭</button></div>';
  document.body.appendChild(dialog); dialog.showModal();
  const status = dialog.querySelector('.export-status');
  const close = () => { closeResultExport(); if(trigger && trigger.isConnected) trigger.focus(); };
  dialog.querySelector('.export-close').onclick=close;
  dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
  try{
    const output = await makeResultPng(computeResults());
    if(generation !== exportGeneration) return;
    exportObjectUrl=URL.createObjectURL(output.blob);
    dialog.querySelector('img').src=exportObjectUrl;
    dialog.querySelector('.export-preview').hidden=false;
    const download=dialog.querySelector('.export-download');download.href=exportObjectUrl;download.hidden=false;
    download.onclick=()=>{status.textContent='已请求下载；手机可能打开原图。若未进入相册，请长按图片选择“存储图像”。';};
    const file=new File([output.blob],'内在动物园-V0.5.png',{type:'image/png'});
    const share=dialog.querySelector('.export-share');
    if(navigator.share && navigator.canShare && navigator.canShare({files:[file]})){
      share.hidden=false;
      share.onclick=()=>{
        // File is already ready: call inside the click, without an intervening await.
        share.disabled=true;
        navigator.share({files:[file]}).then(()=>{status.textContent='已调用系统分享，请在系统选项中完成保存。';}).catch(err=>{status.textContent=err.name==='AbortError'?'未完成保存。你仍可下载 PNG，或长按下方原图保存。':'系统分享未完成。请长按下方图片保存，或选择下载 PNG。';}).finally(()=>{share.disabled=false;});
      };
    }
    status.textContent='高清图片已生成（'+output.width+' × '+output.height+'），上下滑动可查看完整内容。';
  } catch(err){
    if(generation === exportGeneration) status.textContent=err.message || '图片生成失败，请关闭后重试。';
  }
}
window.addEventListener('pagehide',closeResultExport);
