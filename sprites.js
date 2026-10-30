'use strict';
// Character sprites: two shared body templates (male / female) plus the 临兵者 cameo.
// Each frame is drawn procedurally on a 32x48 native grid (foot anchor 16,44), 4 directions x 4 frames,
// then cached per template+palette. Directions follow game.js: 0 down, 1 right, 2 left, 3 up.
const SPRITE_W=32,SPRITE_H=48,FOOT_X=16,FOOT_Y=44;
const TEMPLATES={
 male:{hair:'#533d32',hairL:'#6e5242',hairD:'#3c2b23',inner:'#e9e2cc',sleeve:'#ece5d2',sleeveD:'#cfc7b1',pants:'#b9a88a',pantsD:'#998a6f',shoes:'#ece8dc',shoesD:'#b9b4a6',bag:'#435b76',bagD:'#2f4258',skin:'#f0c9a4',skinD:'#d9a983'},
 female:{hair:'#483630',hairL:'#5f4840',hairD:'#33251f',inner:'#e8deca',pants:'#e8deca',pantsD:'#c9bea8',shoes:'#ece8dc',shoesD:'#b9b4a6',bag:'#687e5d',bagD:'#4c5f44',skin:'#f0c9a4',skinD:'#d9a983'},
 linbingzhe:{hair:'#2e2c36',hairL:'#5a4a3f',hairD:'#1d1b22',inner:'#a9abac',pants:'#414950',pantsD:'#30363c',shoes:'#ece8dc',shoesD:'#b9b4a6',bag:'#d9d0b5',bagD:'#b3aa8f',skin:'#f0c9a4',skinD:'#d9a983'}
};
const PALETTES={
 'male-player-navy':['#405b7b','#30425d','#66809b'],'male-npc-sage':['#6c8970','#4d6955','#95aa8b'],'male-npc-grayblue':['#8394a0','#5d6f7f','#a6b4b9'],'male-npc-brown':['#a58c6b','#79654d','#c4b18c'],
 'male-npc-guard':['#3d5677','#2c3e5a','#5e7896'],'male-npc-yellow':['#d9a93a','#a87e22','#efc865'],
 'female-player-sky':['#93b5cd','#6d91af','#bdcfd8'],'female-npc-terracotta':['#bd806e','#945d53','#d59d85'],'female-npc-sage':['#6d9587','#4e756b','#9ab5a0'],'female-npc-mauve':['#9d889d','#776477','#bdabba'],
 'female-npc-orange':['#d98a4a','#ad6633','#eeab72'],
 'linbingzhe':['#344760','#263449','#4e6380']
};
const OUTLINE='#2b2523';
const spriteSheets=new Map();
function px(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h)}
// frame: 0 idle, 1 left-step, 2 pass, 3 right-step
function drawFrame(c,tplName,pal,dir,frame){
 const T=TEMPLATES[tplName],[top,topD,topL]=pal,female=tplName==='female',lbz=tplName==='linbingzhe';
 const bob=0;            // fixed head/torso anchor prevents face shimmer
 const stepA=frame===1?2:frame===3?-2:0;         // leg offset, front/back legs
 const side=dir===1||dir===2,flip=dir===2;
 c.save();if(flip){c.translate(SPRITE_W,0);c.scale(-1,1)}
 // shadow
 c.fillStyle='rgba(30,40,30,.28)';c.beginPath();c.ellipse(16,44.5,7,2.2,0,0,7);c.fill();
 const by=bob; // vertical body offset
 // ---- legs: fixed hips, alternating planted and lifted feet ----
 const stride=frame===1?1:frame===3?-1:0;
 if(!side){
  for(const [hip,phase] of [[12,stride],[18,-stride]]){const footY=phase>0?39:41,footX=hip+(phase<0?-1:0);
   px(c,hip-1,32,4,Math.max(3,footY-31),OUTLINE);px(c,hip,32,2,Math.max(3,footY-32),phase>0?T.pantsD:T.pants);
   px(c,footX-2,footY,6,3,OUTLINE);px(c,footX-1,footY,4,2,T.shoes);px(c,footX-1,footY+1,4,1,T.shoesD)}
 }else{
  for(const [hip,phase,back] of [[14,-stride,true],[16,stride,false]]){const footX=hip+phase*3,footY=phase<0?40:41;
   c.strokeStyle=OUTLINE;c.lineWidth=4;c.beginPath();c.moveTo(hip,32);c.lineTo(hip+phase,36);c.lineTo(footX,footY);c.stroke();
   c.strokeStyle=back?T.pantsD:T.pants;c.lineWidth=2;c.beginPath();c.moveTo(hip,32);c.lineTo(hip+phase,36);c.lineTo(footX,footY);c.stroke();
   px(c,footX-2,footY,6,3,OUTLINE);px(c,footX-1,footY,4,2,back?T.shoesD:T.shoes)}
 }
 // ---- torso ----
 const ty=21+by;
 if(dir===3&&!female&&!lbz){/* backpack drawn after torso */}
 px(c,9,ty,14,12,OUTLINE);px(c,10,ty,12,11,top);px(c,10,ty+9,12,2,topD);
 if(!side){
  if(tplName==='male'){px(c,14,ty,4,6,T.inner);px(c,13,ty,1,7,topL);px(c,18,ty,1,7,topL);px(c,10,ty+10,12,1,T.sleeveD)}
  else if(female){px(c,13,ty,6,1,topL);px(c,10,ty+10,12,1,topD)}
  else{px(c,14,ty,4,9,T.inner);px(c,13,ty,1,10,topD);px(c,18,ty,1,10,topD)}
 }else{px(c,side?17:12,ty+1,2,8,topL)}
 // arms (swing opposite to legs)
 const swing=side?0:(frame===1?1:frame===3?-1:0);
 const sleeve=tplName==='male'?T.sleeve:top,sleeveD=tplName==='male'?T.sleeveD:topD;
 if(!side){
  px(c,7,ty+1+swing,3,10,OUTLINE);px(c,7,ty+1+swing,2,8,sleeve);px(c,7,ty+8+swing,2,2,T.skin);
  px(c,22,ty+1-swing,3,10,OUTLINE);px(c,23,ty+1-swing,2,8,sleeveD);px(c,23,ty+8-swing,2,2,T.skin);
 }else{
  const a=frame===1?-2:frame===3?2:0;
  px(c,14+a,ty+1,4,10,OUTLINE);px(c,15+a,ty+1,2,8,sleeve);px(c,15+a,ty+8,2,2,T.skin);
 }
 // ---- bag ----
 if(tplName==='male'){
  if(dir===3){px(c,10,ty+1,12,10,OUTLINE);px(c,11,ty+1,10,9,T.bag);px(c,11,ty+7,10,2,T.bagD);px(c,13,ty+3,6,1,T.bagD)}
  else if(side){px(c,6,ty+1,5,9,OUTLINE);px(c,7,ty+1,3,8,T.bag)}
  else{px(c,9,ty,1,6,T.bagD);px(c,22,ty,1,6,T.bagD)}
 }else{
  // crossbody strap + pouch (female and 临兵者)
  if(dir===0){for(let i=0;i<8;i++)px(c,19-i,ty+i,1,1,T.bagD);px(c,8,ty+7,6,5,OUTLINE);px(c,9,ty+7,4,4,T.bag)}
  else if(dir===3){for(let i=0;i<8;i++)px(c,12+i,ty+i,1,1,T.bagD);px(c,18,ty+7,6,5,OUTLINE);px(c,19,ty+7,4,4,T.bag)}
  else{px(c,15,ty,1,8,T.bagD);px(c,7,ty+6,6,6,OUTLINE);px(c,8,ty+6,4,5,T.bag)}
 }
 if(lbz&&dir!==3){const bx=side?18:18;px(c,bx,ty+3,2,2,'#dfbc6e');px(c,bx+1,ty+2,1,1,'#f1d58b')} // brass leaf pin
 // ---- head ----
 const hy=5+by,H=T.hair,HL=T.hairL,HD=T.hairD;
 // Rounded head: rows of [x0,x1] spans give a soft silhouette instead of a box.
 const rows=(spans,y0,col)=>spans.forEach(([a,b],i)=>px(c,a,y0+i,b-a,1,col));
 const SKULL=[[12,20],[10,22],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[9,23],[10,22],[10,22],[11,21],[12,20]];
 const FACE=[[11,21],[10,22],[10,22],[10,22],[10,22],[10,22],[11,21],[11,21],[12,20]];
 rows(SKULL,hy,OUTLINE);rows(SKULL.map(([a,b])=>[a+1,b-1]),hy,H);
 px(c,14,hy+14,4,2,T.skinD); // neck
 const eye='#2a2625',mouth='#c98a72',blush='#f2b4a0',frame_='#2f313b';
 if(dir===3){
  px(c,12,hy+2,6,2,HL);px(c,11,hy+6,10,1,HD);
  if(female){rows([[9,23],[9,23],[9,23],[10,22]],hy+13,OUTLINE);rows([[10,22],[10,22],[10,22],[11,21]],hy+13,H);px(c,11,hy+16,10,1,HD)}
  if(lbz){px(c,12,hy-1,2,2,OUTLINE);px(c,16,hy-2,2,3,OUTLINE);px(c,20,hy,2,2,OUTLINE);px(c,13,hy,1,1,H);px(c,16,hy-1,1,1,H)}
 }else if(!side){
  rows(FACE,hy+5,T.skin);px(c,11,hy+12,10,1,T.skinD);
  px(c,12,hy+1,6,1,HL);px(c,11,hy+2,3,1,HL);
  // ragged fringe
  px(c,10,hy+5,4,2,H);px(c,14,hy+5,2,1,H);px(c,16,hy+5,4,2,H);px(c,20,hy+5,2,3,H);px(c,10,hy+7,1,2,H);
  if(female){rows([[8,12],[8,12],[8,12],[8,12],[8,12],[8,12],[8,12],[8,12],[9,12],[9,12]],hy+6,OUTLINE);rows([[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[9,11],[10,11]],hy+6,H);
   rows([[20,24],[20,24],[20,24],[20,24],[20,24],[20,24],[20,24],[20,24],[20,23],[20,23]],hy+6,OUTLINE);rows([[21,23],[21,23],[21,23],[21,23],[21,23],[21,23],[21,23],[21,23],[21,22]],hy+6,H)}
  if(lbz){px(c,11,hy-1,2,2,OUTLINE);px(c,15,hy-2,2,3,OUTLINE);px(c,19,hy-1,2,2,OUTLINE);px(c,13,hy+7,1,1,H);px(c,18,hy+7,1,1,H)}
  // eyes 2x3 with highlight
  px(c,13,hy+8,2,3,eye);px(c,18,hy+8,2,3,eye);px(c,13,hy+8,1,1,'#fff');px(c,18,hy+8,1,1,'#fff');
  px(c,15,hy+11,2,1,mouth);px(c,11,hy+10,2,1,blush);px(c,20,hy+10,2,1,blush);
  if(lbz){c.fillStyle=frame_; // two rims with clear lenses + bridge
   for(const lx of[12,17]){c.fillRect(lx,hy+7,4,1);c.fillRect(lx,hy+11,4,1);c.fillRect(lx-0,hy+7,1,5);c.fillRect(lx+3,hy+7,1,5)}c.fillRect(16,hy+8,1,1);
   px(c,13,hy+8,2,3,eye);px(c,18,hy+8,2,3,eye);px(c,14,hy+8,1,1,'#dfe9ee');px(c,19,hy+8,1,1,'#dfe9ee')}
 }else{
  // side, facing right (mirrored for left)
  rows([[15,22],[15,22],[15,23],[15,23],[15,22],[16,22],[16,21],[17,20]],hy+5,T.skin);px(c,23,hy+7,1,4,OUTLINE);px(c,23,hy+9,1,1,T.skinD); // face + nose
  px(c,12,hy+1,6,1,HL);
  rows([[10,16],[10,16],[10,15],[10,15],[10,15],[10,15],[11,15]],hy+5,H); // back of head
  px(c,16,hy+5,6,2,H);px(c,21,hy+5,1,3,H); // fringe
  px(c,14,hy+8,2,3,T.skinD); // ear
  px(c,19,hy+8,2,3,eye);px(c,19,hy+8,1,1,'#fff');px(c,20,hy+12,2,1,mouth);px(c,17,hy+11,2,1,blush);
  if(female){rows([[9,16],[9,16],[9,16],[9,16],[9,16],[9,16],[9,15],[10,15]],hy+10,OUTLINE);rows([[10,15],[10,15],[10,15],[10,15],[10,15],[10,15],[10,14]],hy+10,H)}
  if(lbz){px(c,12,hy-1,2,2,OUTLINE);px(c,16,hy-2,2,3,OUTLINE);px(c,19,hy-1,2,2,OUTLINE);c.fillStyle=frame_;c.fillRect(18,hy+7,4,1);c.fillRect(18,hy+11,4,1);c.fillRect(18,hy+7,1,5);c.fillRect(21,hy+7,1,5);c.fillRect(15,hy+8,3,1);px(c,19,hy+8,2,3,eye);px(c,20,hy+8,1,1,'#dfe9ee')}
 }
 c.restore();
}
function sheetFor(tpl,paletteId){const key=tpl+'|'+paletteId;let s=spriteSheets.get(key);if(s)return s;s=document.createElement('canvas');s.width=SPRITE_W*4;s.height=SPRITE_H*4;const c=s.getContext('2d');c.imageSmoothingEnabled=false;
 const pal=PALETTES[paletteId]||PALETTES['male-npc-sage'];for(let d=0;d<4;d++)for(let f=0;f<4;f++){c.save();c.translate(f*SPRITE_W,d*SPRITE_H);drawFrame(c,tpl,pal,d,f);c.restore()}spriteSheets.set(key,s);return s}
// Walk cycle [1,2,3,2]; `phase` advances with distance/time. Run only speeds the cycle.
function frameIndex(moving,phase){if(!moving)return 0;return[1,2,3,2][Math.floor(phase)%4]}
// Draws a character with feet at (x,y) in world space. scale 0.5 => 16x24 world px frame.
const CHAR_SCALE=0.5;
// Align the destination rectangle to render pixels so subpixel camera movement cannot
// change which source rows/columns are sampled on every frame. Keep the native pixel art.
function drawCharacter(c,x,y,tpl,paletteId,dir,moving,phase,scale=CHAR_SCALE){
 const s=sheetFor(tpl,paletteId),f=frameIndex(moving,phase),w=SPRITE_W*scale,h=SPRITE_H*scale;
 const m=c.getTransform(),dx=x-FOOT_X*scale,dy=y-FOOT_Y*scale;c.save();c.imageSmoothingEnabled=false;
 if(m.b===0&&m.c===0&&m.a>0&&m.d>0){c.setTransform(1,0,0,1,0,0);c.drawImage(s,f*32,(dir||0)*48,32,48,Math.round(dx*m.a+m.e),Math.round(dy*m.d+m.f),Math.round(w*m.a),Math.round(h*m.d))}
 else c.drawImage(s,f*32,(dir||0)*48,32,48,Math.round(dx),Math.round(dy),w,h);c.restore()
}
