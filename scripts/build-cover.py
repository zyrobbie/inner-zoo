# Approved cover composition rasterized as code-native UI; CTA remains HTML.
from PIL import Image,ImageDraw,ImageFont
from pathlib import Path
import re,json,math,random,html
P=Path(__file__).resolve().parents[1]
import subprocess
copy=json.loads(subprocess.check_output(['node','-e',"const {DISCLAIMER}=require('./src/data.js');console.log(JSON.stringify({pill:'选择题版 · 方案一',title:'你内在的动物园',description:'20个日常小场景，看看最近是哪几位“内在保护者”比较忙。每题选一个最像你当下反应的选项，凭第一感觉作答就好。',button:'开始测试',disclaimer:DISCLAIMER}))"],cwd=P))
S=2; W=390; H=1000
im=Image.new('RGB',(W*S,H*S),'#F7F1DF');d=ImageDraw.Draw(im)
def box(b):return tuple(round(v*S) for v in b)
def rounded(b,fill,r,outline=None,width=1): d.rounded_rectangle(box(b),radius=r*S,fill=fill,outline=outline,width=width*S)
def font(size,serif=False,bold=False):return ImageFont.truetype('/usr/share/fonts/opentype/noto/Noto'+('Serif' if serif else 'Sans')+'CJK-'+('Bold' if bold else 'Regular')+'.ttc',round(size*S))
def text(x,y,t,size=16,col='#536151',serif=False,bold=False,center=False):
 f=font(size,serif,bold)
 if center:x-=d.textlength(t,font=f)/S/2
 d.text((round(x*S),round(y*S)),t,font=f,fill=col,anchor='lt')
def lines(t,size,width):
 f=font(size);out=[];cur=''
 for c in t:
  if d.textlength(cur+c,font=f)>width*S and c not in '，。、；：？！）”～》':out.append(cur);cur=''
  cur+=c
 if cur:out.append(cur)
 return out
def para(t,x,y,size,width,lh,col='#536151'):
 ls=lines(t,size,width)
 for j,l in enumerate(ls):text(x,y+j*lh,l,size,col)
 return y+len(ls)*lh
random.seed(7)
for _ in range(7000):
 x=random.randrange(W*S);y=random.randrange(H*S);d.point((x,y),fill=random.choice(['#ECE6D2','#EEE8D6','#E8E2CD']))
# Sun identity retained, in airy upper safe area.
cx=195;cy=52
for a in range(0,360,45):
 t=math.radians(a);d.line(box((cx+14*math.cos(t),cy+14*math.sin(t),cx+19*math.cos(t),cy+19*math.sin(t))),fill='#B28A25',width=2*S)
d.ellipse(box((cx-9,cy-9,cx+9,cy+9)),fill='#B28A25')
text(195,89,copy['pill'],12,'#69745C',center=True)
text(195,120,copy['title'],32,'#2D493C',True,True,True)
# Painterly-paper ensemble: unchanged final portrait assets, individually framed.
d.ellipse(box((37,203,355,465)),fill='#E4E8CB')
d.ellipse(box((70,190,334,458)),fill='#E4E8CB')
# Leaf/starlight accents, no new words.
def leaf(x,y,ang):
 layer=Image.new('RGBA',(40*S,40*S));ld=ImageDraw.Draw(layer);ld.ellipse(box((14,5,25,29)),fill='#87965F');ld.line(box((19,9,20,29)),fill='#F7F1DF',width=S);layer=layer.rotate(ang,resample=Image.Resampling.BICUBIC);im.paste(layer,(int((x-20)*S),int((y-20)*S)),layer)
leaf(35,214,-28);leaf(351,427,35)
for x,y,sz in [(351,244,6),(31,397,5)]:d.polygon(box((x,y-sz,x+sz/2,y,x,y+sz,x-sz/2,y)),fill='#B28A25')
positions=[('02',29,211,-7),('03',145,196,3),('04',260,219,8),('01',39,342,5),('05',151,333,-4),('06',263,350,-7)]
for prefix,x,y,ang in positions:
 key={'01':'anger','02':'perfect','03':'anxvig','04':'please','05':'avoid','06':'numb'}[prefix]
 p=P/'assets/avatars/web'/f'{key}-640.png'
 tile=Image.new('RGBA',(110*S,116*S));td=ImageDraw.Draw(tile)
 td.rounded_rectangle(box((1,3,109,115)),radius=20*S,fill='#D7DAC1')
 td.rounded_rectangle(box((0,0,108,111)),radius=20*S,fill='#FFFCF3')
 av=Image.open(p).convert('RGB').resize((100*S,100*S),Image.Resampling.LANCZOS)
 mask=Image.new('L',av.size);ImageDraw.Draw(mask).rounded_rectangle((0,0,100*S,100*S),radius=16*S,fill=255)
 tile.paste(av,(4*S,4*S),mask)
 tile=tile.rotate(ang,resample=Image.Resampling.BICUBIC,expand=True)
 im.paste(tile,(int((x+54)*S-tile.width/2),int((y+55)*S-tile.height/2)),tile)
end=para(copy['description'],28,502,17,334,29)
# CTA is a real HTML button over this reserved empty area.


sep=end+115;d.line(box((28,sep,362,sep)),fill='#D6D9C3',width=S)
last=para(copy['disclaimer'],28,sep+25,14,334,24,'#69725E')
# Fit full content and retain bottom safe area.
im=im.crop((0,0,W*S,int((last+40)*S)))
(P/'assets/cover').mkdir(exist_ok=True)
im.save(P/'assets/cover/intro-v051.webp',quality=88,method=6)
im.save(P/'assets/cover/intro-v051.jpg',quality=90,optimize=True)
print({'size':im.size,'description_end':end,'disclaimer_start':sep+25,'disclaimer_end':last,'chars':{k:len(v) for k,v in copy.items()}})
