// A single measured scene owns BOTH the live SVG and the saved PNG.
// No content is rewrapped or resized by either painter.
const RESULT_STYLE = {
  paper:'#F7F1DF', ink:'#2D493C', text:'#485649', main:'#DCE6CC', mainLine:'#AABB99',
  card:'#FFFCF3', line:'#C5CDB9', self:'#EFDEA1', selfInk:'#65532C',
  sans:'"Noto Sans CJK SC","PingFang SC","Microsoft YaHei",sans-serif',
  serif:'"Noto Serif CJK SC","Songti SC","STSong",serif',
  mainRoles:{please:'#934832',avoid:'#406749'},
  roles:{anger:'#A34024',perfect:'#69558E',anxvig:'#8A591D',please:'#9C5037',avoid:'#466F51',numb:'#795A3A'}
};
let sharedResultScene = null;
function resultLayoutWidth(){
  return Math.max(280,Math.min(390,(typeof window.innerWidth==='number' ? window.innerWidth : 390)));
}
function resultSceneKey(result,width){ return JSON.stringify([width,result]); }
function sceneFont(size,bold){return (bold?'700 ':'400 ')+size+'px '+(bold?RESULT_STYLE.serif:RESULT_STYLE.sans);}
function resultLines(ctx,text,width){
  const tokens=text.match(/[A-Za-z0-9.%]+|[^\n]|\n/g)||[];
  const lines=[];let line='';
  const endPunctuation=/^[，。！？；：、”）》]/;
  const opening=/[（“《]$/;
  for(const token of tokens){
    if(token==='\n'){lines.push(line);line='';continue;}
    if(line && ctx.measureText(line+token).width>width){
      if(endPunctuation.test(token)){
        const chars=Array.from(line);let moved='';
        do { moved=chars.pop()+moved; } while(chars.length && endPunctuation.test(moved));
        if(chars.length){lines.push(chars.join(''));line=moved+token;}else{line+=token;}
      } else if(opening.test(line)){
        const chars=Array.from(line);const last=chars.pop();
        if(chars.length)lines.push(chars.join(''));line=last+token;
      } else {lines.push(line);line=token;}
    } else line+=token;
  }
  if(line)lines.push(line);
  return lines;
}
function getResultPresentation(result){
  const active=result.animals.filter(a=>a.count>0);
  const selfCount=Math.max(0,Math.min(20,Math.round(result.selfPct/5)));
  return {main:active[0]||null,others:active.slice(1,3),allSelf:active.length===0,
    weather:COPY.weather.find(w=>selfCount>=w.min && selfCount<=w.max)};
}
function getResultScene(result){
  const width=resultLayoutWidth(), key=resultSceneKey(result,width);
  if(sharedResultScene && sharedResultScene.key===key)return sharedResultScene;
  const measure=document.createElement('canvas').getContext('2d');
  if(!measure)throw new Error('当前浏览器无法绘制结果，请使用系统浏览器打开。');
  const scene={key,width,height:0,items:[],sections:[],result};
  const items=scene.items;
  function rect(x,y,w,h,r,fill,stroke){const item={kind:'rect',x,y,w,h,r,fill,stroke};items.push(item);return item;}
  function text(value,x,y,w,size,lineHeight,bold=false,color=RESULT_STYLE.text,center=false,balance=false){
    measure.font=sceneFont(size,bold);measure.textBaseline='alphabetic';
    let lines=resultLines(measure,value,w);
    if(balance && lines.length>1){
      const chars=Array.from(value),balanced=[],count=lines.length;let offset=0;
      for(let i=0;i<count;i++){const take=Math.ceil((chars.length-offset)/(count-i));balanced.push(chars.slice(offset,offset+take).join(''));offset+=take;}
      for(let i=1;i<balanced.length;i++){
        while(/^[，。！？；：、”）》]/.test(balanced[i])){balanced[i-1]+=balanced[i][0];balanced[i]=balanced[i].slice(1);}
        while(/[（“《]$/.test(balanced[i-1])){balanced[i]=balanced[i-1].slice(-1)+balanced[i];balanced[i-1]=balanced[i-1].slice(0,-1);}
      }
      if(balanced.every(line=>line && measure.measureText(line).width<=w))lines=balanced;
    }
    let inkBottom=y;
    lines.forEach((line,i)=>{
      const metrics=measure.measureText(line);
      const ascent=Number.isFinite(metrics.actualBoundingBoxAscent)?metrics.actualBoundingBoxAscent:size*.88;
      const descent=Number.isFinite(metrics.actualBoundingBoxDescent)?metrics.actualBoundingBoxDescent:size*.12;
      const xx=center?x+(w-metrics.width)/2:x;
      items.push({kind:'text',text:line,x:xx,y:y+i*lineHeight+ascent,font:sceneFont(size,bold),size,bold,color});
      inkBottom=y+i*lineHeight+ascent+descent;
    });
    return {end:y+lines.length*lineHeight,inkBottom,lines};
  }
  function avatar(key,x,y,size){items.push({kind:'avatar',key,x,y,size,r:size*.2});}
  const presentation=getResultPresentation(result);
  const animals=[presentation.main,...presentation.others].filter(Boolean);
  let y=16;
  if(presentation.main){
    const main=presentation.main,c=CATS[main.key],top=y;
    const panel=rect(16,top,width-32,0,24,RESULT_STYLE.main,RESULT_STYLE.mainLine);panel.section='main';panel.key=main.key;
    text(COPY.mainLabel,32,top+18,width-64,14,22,true,RESULT_STYLE.ink,true);
    items.push({kind:'ellipse',cx:width/2,cy:top+136,rx:92,ry:92,fill:'#C5D4AF'});
    avatar(main.key,(width-176)/2,top+48,176);
    let line=text(c.mascot,29,top+236,width-58,32,40,true,RESULT_STYLE.ink,true,true);
    line=text(c.title,30,line.end+4,width-60,14,21,false,RESULT_STYLE.mainRoles[main.key]||RESULT_STYLE.roles[main.key],true);
    const quoteTop=line.end+12;
    measure.font=sceneFont(18,false);
    const quoteHeight=resultLines(measure,'“'+c.quote+'”',width-84).length*26+20;
    rect(28,quoteTop,width-56,quoteHeight,18,'#F8F8EB');
    text('“'+c.quote+'”',42,quoteTop+10,width-84,18,26,false,RESULT_STYLE.ink,true,true);
    y=quoteTop+quoteHeight+16;
    c.main.forEach((paragraph,i)=>{line=text(paragraph,32,y,width-64,16,26);y=line.end+(i<c.main.length-1?8:0);});
    y=Math.ceil(line.inkBottom+24);panel.h=y-top;
    scene.sections.push({kind:'main',key:main.key,x:16,y:top,width:width-32,height:panel.h,bodyInkBottom:line.inkBottom,bottomPadding:y-line.inkBottom});
    y+=28;
  }
  if(presentation.others.length){
    y=text(COPY.othersLabel,22,y,width-44,20,30,true,RESULT_STYLE.ink).end+16;
    presentation.others.forEach(a=>{
      const c=CATS[a.key],top=y;
      const panel=rect(16,y,width-32,0,18,RESULT_STYLE.card,RESULT_STYLE.line);panel.section='secondary';panel.key=a.key;
      const stripe=rect(17,y+20,4,0,2,RESULT_STYLE.roles[a.key]);
      avatar(a.key,30,y+12,56);
      let line=text(c.mascot,98,y+14,width-132,17,24,true,RESULT_STYLE.ink);
      line=text(c.title,98,line.end+5,width-132,13,20,false,RESULT_STYLE.roles[a.key]);
      y=Math.max(top+76,line.end+8);
      y=text('“'+c.quote+'”',34,y,width-68,14,21).end+5;
      y=text(c.secondary,34,y,width-68,14,21).end+14;
      panel.h=y-top;stripe.h=panel.h-40;
      scene.sections.push({kind:'secondary',key:a.key,x:16,y:top,width:width-32,height:panel.h});
      y+=12;
    });y+=12;
  }
  if(!presentation.allSelf)y=text(COPY.ending,24,y,width-48,15,25,false,RESULT_STYLE.text).end+28;
  y=text(presentation.allSelf?COPY.allSelfHeading:COPY.weatherHeading,22,y,width-44,20,30,true,RESULT_STYLE.ink).end+12;
  const selfTop=y,panel=rect(16,y,width-32,0,22,RESULT_STYLE.self,'#CDBB7D');panel.section='self';
  items.push({kind:'sun',x:32,y:y+16,size:52});
  const selfTitle=text(presentation.weather.name,90,y+29,width-116,22,32,true,RESULT_STYLE.selfInk);
  y=text(presentation.weather.desc,34,Math.max(y+74,selfTitle.end+13),width-68,16,27,false,RESULT_STYLE.selfInk).end+14;
  if(presentation.allSelf)y=text(COPY.allSelfRest,34,y,width-68,16,27,false,RESULT_STYLE.selfInk).end+14;
  CATS.self.paragraphs.forEach((paragraph,i)=>{y=text(paragraph,34,y,width-68,15,26,false,RESULT_STYLE.selfInk).end+(i<CATS.self.paragraphs.length-1?8:0);});
  y+=22;panel.h=y-selfTop;
  scene.sections.push({kind:'self',x:16,y:selfTop,width:width-32,height:panel.h});
  y+=28;
  if(presentation.allSelf)y=text(COPY.ending,24,y,width-48,15,25,false,RESULT_STYLE.text).end+24;
  y=text(DISCLAIMER,24,y,width-48,13,24,false,'#5D6956').end;
  y+=16;y=text('V0.6',24,y,width-48,13,20,false,'#5D6956',true).end+24;
  scene.height=Math.ceil(y);sharedResultScene=scene;return scene;
}
function escapeResultXml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function resultSceneSvg(scene){
  let defs='',body='';
  scene.items.forEach((b,i)=>{
    if(b.kind==='rect')body+='<rect '+(b.section?'data-section="'+b.section+'" '+(b.key?'data-protector="'+b.key+'" ':''):'')+'x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" rx="'+b.r+'" fill="'+b.fill+'"'+(b.stroke?' stroke="'+b.stroke+'"':'')+'/>';
    else if(b.kind==='ellipse')body+='<ellipse cx="'+b.cx+'" cy="'+b.cy+'" rx="'+b.rx+'" ry="'+b.ry+'" fill="'+b.fill+'"/>';
    else if(b.kind==='text')body+='<text x="'+b.x+'" y="'+b.y+'" style="font:'+escapeResultXml(b.font)+'" fill="'+b.color+'">'+escapeResultXml(b.text)+'</text>';
    else if(b.kind==='avatar'){
      const id='result-avatar-'+i;defs+='<clipPath id="'+id+'"><rect x="'+b.x+'" y="'+b.y+'" width="'+b.size+'" height="'+b.size+'" rx="'+b.r+'"/></clipPath>';
      body+='<image href="'+escapeResultXml(AVATARS[b.key].large)+'" x="'+b.x+'" y="'+b.y+'" width="'+b.size+'" height="'+b.size+'" clip-path="url(#'+id+')"/>';
    } else if(b.kind==='sun'){
      const cx=b.x+b.size/2,cy=b.y+b.size/2;body+='<g fill="#D0A427" stroke="#D0A427" stroke-width="2"><circle cx="'+cx+'" cy="'+cy+'" r="10"/>';
      for(let a=0;a<8;a++){const angle=a*Math.PI/4;body+='<path d="M'+(cx+16*Math.cos(angle))+' '+(cy+16*Math.sin(angle))+'L'+(cx+24*Math.cos(angle))+' '+(cy+24*Math.sin(angle))+'"/>';}
      body+='</g>';
    }
  });
  return '<svg class="shared-result-scene" xmlns="http://www.w3.org/2000/svg" width="'+scene.width+'" height="'+scene.height+'" viewBox="0 0 '+scene.width+' '+scene.height+'" aria-hidden="true"><defs>'+defs+'</defs><rect width="100%" height="100%" fill="'+RESULT_STYLE.paper+'"/>'+body+'</svg>';
}
function paintResultScene(ctx,scene,images){
  ctx.fillStyle=RESULT_STYLE.paper;ctx.fillRect(0,0,scene.width,scene.height);
  ctx.textBaseline='alphabetic';
  scene.items.forEach(b=>{
    if(b.kind==='rect'){
      ctx.beginPath();roundedExportRect(ctx,b.x,b.y,b.w,b.h,b.r);ctx.fillStyle=b.fill;ctx.fill();
      if(b.stroke){ctx.strokeStyle=b.stroke;ctx.lineWidth=1;ctx.stroke();}
    } else if(b.kind==='ellipse'){
      ctx.beginPath();ctx.ellipse(b.cx,b.cy,b.rx,b.ry,0,0,Math.PI*2);ctx.fillStyle=b.fill;ctx.fill();
    } else if(b.kind==='text'){ctx.font=b.font;ctx.fillStyle=b.color;ctx.fillText(b.text,b.x,b.y);}
    else if(b.kind==='avatar'){
      ctx.save();ctx.beginPath();roundedExportRect(ctx,b.x,b.y,b.size,b.size,b.r);ctx.clip();ctx.drawImage(images[b.key],b.x,b.y,b.size,b.size);ctx.restore();
    } else if(b.kind==='sun'){
      const cx=b.x+b.size/2,cy=b.y+b.size/2;ctx.fillStyle='#D0A427';ctx.strokeStyle='#D0A427';ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(cx,cy,10,0,Math.PI*2);ctx.fill();
      for(let a=0;a<8;a++){const angle=a*Math.PI/4;ctx.beginPath();ctx.moveTo(cx+16*Math.cos(angle),cy+16*Math.sin(angle));ctx.lineTo(cx+24*Math.cos(angle),cy+24*Math.sin(angle));ctx.stroke();}
    }
  });
}
