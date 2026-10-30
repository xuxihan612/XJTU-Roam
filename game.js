'use strict';
// 兴庆漫游 — source-sharing edition. Local map via source-settings.js; no geometry bundled.
const C=window.CAMPUS,$=id=>document.getElementById(id);
const W=C.W,H=C.H,SAVE='xingqing-osm-v2',CELL=4,GW=Math.ceil(W/CELL),GH=Math.ceil(H/CELL);
const canvas=$('game'),ctx=canvas.getContext('2d'),mini=$('mini'),mc=mini.getContext('2d');
let seed=20261029;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}
function hash(n){n=Math.imul(n^61^(n>>>16),9);n^=n>>>4;n=Math.imul(n,0x27d4eb2d);return((n^(n>>>15))>>>0)/4294967296}
function rect(c,x,y,w,h,col){c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function path(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath()}
function poly(c,pts,col){c.fillStyle=col;path(c,pts);c.fill()}
function pip(x,y,pts){let v=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])v=!v}return v}
function bounds(o){const xs=o.p.map(p=>p[0]),ys=o.p.map(p=>p[1]);o.x0=Math.min(...xs);o.x1=Math.max(...xs);o.y0=Math.min(...ys);o.y1=Math.max(...ys);o.cx=(o.x0+o.x1)/2;o.cy=(o.y0+o.y1)/2;return o}
[...C.buildings,...C.pitches,...C.parks,...C.water,...C.woods].forEach(bounds);
// Supplement only the footprint clearly identified on the university campus plan.
const BUILDING_NAME_NOTES=C.nameNotes||{};
C.buildings.forEach((b,i)=>{const note=BUILDING_NAME_NOTES[i];if(!b.n&&note)b.n=note.name;b.unknownName=!b.n;if(!b.n)b.n='未标注建筑 '+String(i+1).padStart(3,'0')});
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

// ---------- walkability grids ----------
const block=new Uint8Array(GW*GH),road=new Uint8Array(GW*GH),occupied=new Uint8Array(GW*GH);
const gi=(x,y)=>{const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL);return cx<0||cy<0||cx>=GW||cy>=GH?-1:cy*GW+cx};
function fillPoly(o,grid,val){for(let cy=Math.floor(o.y0/CELL);cy<=Math.ceil(o.y1/CELL);cy++)for(let cx=Math.floor(o.x0/CELL);cx<=Math.ceil(o.x1/CELL);cx++){if(cx<0||cy<0||cx>=GW||cy>=GH)continue;if(pip(cx*CELL+2,cy*CELL+2,o.p))grid[cy*GW+cx]=val}}
function strokeGrid(pts,r,grid,val){for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/2));for(let k=0;k<=n;k++){const x=a[0]+(b[0]-a[0])*k/n,y=a[1]+(b[1]-a[1])*k/n;for(let dy=-r;dy<=r;dy+=CELL)for(let dx=-r;dx<=r;dx+=CELL){if(dx*dx+dy*dy>r*r)continue;const id=gi(x+dx,y+dy);if(id>=0)grid[id]=val}}}}
const WL=C.wall;
for(let cy=0;cy<GH;cy++)for(let cx=0;cx<GW;cx++){const x=cx*CELL+2,y=cy*CELL+2;if(x<WL.x0+6||x>WL.x1-6||y<WL.y0+6||y>WL.y1-6)block[cy*GW+cx]=3}
C.buildings.forEach(b=>fillPoly(b,block,1));C.water.forEach(w=>fillPoly(w,block,2));
C.roads.forEach(r=>strokeGrid(r.p,Math.max(3,r.w/2),road,1));
C.pitches.forEach(p=>fillPoly(p,occupied,1));C.water.forEach(p=>fillPoly(p,occupied,1));
function blockedAt(x,y){const id=gi(x,y);return id<0||block[id]>0}
let trees=[];const treeHash=new Map();
function blocked(x,y){if(blockedAt(x-5,y)||blockedAt(x+5,y)||blockedAt(x,y-3)||blockedAt(x,y+3))return true;for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const l=treeHash.get((Math.floor(x/48)+dx)+','+(Math.floor(y/48)+dy));if(l)for(const t of l)if(Math.hypot(t.x-x,(t.y-y)*1.6)<7)return true}return false}
function snap(p){if(!blocked(p.x,p.y))return p;for(let r=4;r<160;r+=4)for(let a=0;a<16;a++){const x=p.x+Math.cos(a/16*6.283)*r,y=p.y+Math.sin(a/16*6.283)*r;if(!blocked(x,y)){p.x=Math.round(x);p.y=Math.round(y);return p}}return p}

// ---------- trees ----------
function addTree(x,y,kind,s=1){const id=gi(x,y);if(id<0||block[id]||road[id]||occupied[id])return false;for(let dx=-12;dx<=12;dx+=6)for(let dy=-8;dy<=8;dy+=4)if(blockedAt(x+dx,y+dy))return false;
 if(typeof keepClear!=='undefined'&&keepClear.some(p=>Math.hypot(p.x-x,p.y-y)<42))return false;const k=Math.floor(x/48)+','+Math.floor(y/48),l=treeHash.get(k)||[];if(l.some(t=>Math.hypot(t.x-x,t.y-y)<17))return false;const t={x:Math.round(x),y:Math.round(y),kind,s,v:Math.floor(rand()*3)};l.push(t);treeHash.set(k,l);trees.push(t);return true}
function lineTrees(pts,off,step,kind){for(let i=1;i<pts.length;i++){const[a,b]=[pts[i-1],pts[i]],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<1)continue;const nx=-(b[1]-a[1])/L,ny=(b[0]-a[0])/L;for(let d=step/2;d<L;d+=step){const x=a[0]+(b[0]-a[0])*d/L,y=a[1]+(b[1]-a[1])*d/L;for(const sgn of[-1,1])addTree(x+nx*off*sgn,y+ny*off*sgn,kind,.9+rand()*.15)}}}
LANDMARKS.forEach(snap);
const keepClear=[...LANDMARKS,...C.gates];
for(const r of C.roads){const n=r.n||'';if(/梧桐|文治|学森|思源|彭康|皇甫/.test(n))lineTrees(r.p,r.w/2+12,44,'plane');else if(/樱花/.test(n))lineTrees(r.p,r.w/2+9,30,'sakura')}
for(const w of C.woods){const n=(w.x1-w.x0)*(w.y1-w.y0)/1300;for(let i=0;i<n;i++){const x=w.x0+rand()*(w.x1-w.x0),y=w.y0+rand()*(w.y1-w.y0);if(pip(x,y,w.p))addTree(x,y,rand()<.35?'pine':'round',.8+rand()*.3)}}
for(const p of C.parks){const sak=/樱花/.test(p.n||'')||Math.hypot(p.cx-LANDMARKS.find(l=>l.id==='sakura').x,p.cy-LANDMARKS.find(l=>l.id==='sakura').y)<180,n=(p.x1-p.x0)*(p.y1-p.y0)/2600;for(let i=0;i<n;i++){const x=p.x0+rand()*(p.x1-p.x0),y=p.y0+rand()*(p.y1-p.y0);if(pip(x,y,p.p))addTree(x,y,sak&&rand()<.6?'sakura':rand()<.3?'pine':'round',.8+rand()*.25)}}
for(let i=0;i<300;i++)addTree(WL.x0+rand()*(WL.x1-WL.x0),WL.y0+rand()*(WL.y1-WL.y0),rand()<.3?'pine':'round',.75+rand()*.3);

// ---------- ground layer ----------
const ground=document.createElement('canvas');ground.width=W;ground.height=H;const g=ground.getContext('2d');
function stroke(c,pts,w,col,closed=false){c.strokeStyle=col;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));if(closed)c.closePath();c.stroke()}
function drawGround(){
 rect(g,0,0,W,H,'#8d9183');for(let i=0;i<5000;i++)rect(g,rand()*W,rand()*H,2,2,rand()<.5?'#858a7c':'#979b8c');
 for(const s of C.streets){stroke(g,s.p,40,'#b9b6a6');stroke(g,s.p,30,'#6b7068')}
 rect(g,WL.x0,WL.y0,WL.x1-WL.x0,WL.y1-WL.y0,'#9fbb72');
 for(let i=0;i<30000;i++){const x=WL.x0+rand()*(WL.x1-WL.x0),y=WL.y0+rand()*(WL.y1-WL.y0);rect(g,x,y,2,2,rand()<.5?'#93af68':'#adc77f')}
 for(const w of C.woods)poly(g,w.p,'#8aa863');
 for(const p of C.parks)poly(g,p.p,'#a8c479');
 const rs=[...C.roads].sort((a,b)=>a.w-b.w);
 for(const r of rs)stroke(g,r.p,r.w+3,r.k==='path'||r.k==='track'?'#bdb48c':'#b6b291');
 for(const r of rs)stroke(g,r.p,r.w,r.k==='unclassified'?'#dccfa3':r.k==='path'||r.k==='track'?'#d9c99a':'#e3d8b0');
 poly(g,C.plaza,'#ddd6bc');g.save();path(g,C.plaza);g.clip();const[px0,py0]=C.plaza[0];for(let x=px0;x<px0+260;x+=16)rect(g,x,py0,1,160,'#c9c2a6');for(let y=py0;y<py0+160;y+=16)rect(g,px0,y,260,1,'#c9c2a6');
 for(let r=0;r<2;r++)for(let k=0;k<5;k++)for(const side of[0,1]){const x=px0+14+k*20+side*136,y=py0+40+r*56;rect(g,x,y,14,14,'#7fa463');rect(g,x+2,y+2,10,3,'#97b97a')}g.restore();
 for(const p of C.pitches){const tr=/田径/.test(p.n),tennis=/网球/.test(p.n),court=/篮球|排球|网球/.test(p.n)||(p.x1-p.x0)<90||(p.y1-p.y0)<40;g.save();path(g,p.p);g.clip();
  if(tr){rect(g,p.x0,p.y0,p.x1-p.x0,p.y1-p.y0,'#b9654c');const ix=p.x0+24,iy=p.y0+24,iw=p.x1-p.x0-48,ih=p.y1-p.y0-48;g.fillStyle='#5f9a5a';g.beginPath();g.roundRect(ix,iy,iw,ih,iw/2);g.fill();g.strokeStyle='#ecc7ad';g.lineWidth=1;for(let k=1;k<5;k++){g.beginPath();g.roundRect(ix-k*4.5,iy-k*4.5,iw+k*9,ih+k*9,(iw+k*9)/2);g.stroke()}p.field=[ix+10,iy+iw*.32,iw-20,ih-iw*.64]}
  else{rect(g,p.x0,p.y0,p.x1-p.x0,p.y1-p.y0,tennis?'#4f8a78':court?'#b47b56':'#5f9a5a');if(!court)for(let y=p.y0;y<p.y1;y+=20)rect(g,p.x0,y,p.x1-p.x0,10,'#68a462');p.field=[p.x0+7,p.y0+7,p.x1-p.x0-14,p.y1-p.y0-14]}
  g.restore();const[fx,fy,fw,fh]=p.field;g.strokeStyle='#eef3d8';g.lineWidth=1.5;g.strokeRect(fx,fy,fw,fh);g.beginPath();if(fh>fw){g.moveTo(fx,fy+fh/2);g.lineTo(fx+fw,fy+fh/2)}else{g.moveTo(fx+fw/2,fy);g.lineTo(fx+fw/2,fy+fh)}g.stroke();if(!court||tr){g.beginPath();g.arc(fx+fw/2,fy+fh/2,Math.min(fw,fh)*.14,0,7);g.stroke()}}
 for(const w of C.water){poly(g,w.p,'#4f92a3');g.save();path(g,w.p);g.clip();for(let i=0;i<(w.x1-w.x0)*(w.y1-w.y0)/60;i++)rect(g,w.x0+rand()*(w.x1-w.x0),w.y0+rand()*(w.y1-w.y0),5,1,'#86c1c8');g.restore();stroke(g,w.p,2,'#c9c3a6',true)}
 g.strokeStyle='#9b6b55';g.lineWidth=5;g.strokeRect(WL.x0,WL.y0,WL.x1-WL.x0,WL.y1-WL.y0);
 for(const q of C.gates){const v=q.side==='n'||q.side==='s';rect(g,q.x-(v?26:4),q.y-(v?4:26),v?52:8,v?8:52,'#e3d8b0')}
 for(let i=0;i<400;i++){const x=WL.x0+rand()*(WL.x1-WL.x0),y=WL.y0+rand()*(WL.y1-WL.y0),id=gi(x,y);if(id>=0&&!block[id]&&!road[id]&&!occupied[id]){rect(g,x,y,2,2,['#f1e3a6','#e9a7b0','#ffffff'][i%3]);rect(g,x+1,y+2,1,2,'#6f8f4f')}}
}
drawGround();
// ---------- buildings: footprint extruded into a simple pixel block ----------
let night=false;
const PAL={
 redroof:{wall:'#c9b49a',side:'#a8927a',roof:'#b5583f',roof2:'#cf7656',win:'#8a3b2e',tile:true},
 dorm:{wall:'#dccaa6',side:'#b9a682',roof:'#a9917a',roof2:'#c2ab92',win:'#557a86'},
 library:{wall:'#d8cdb4',side:'#b3a88f',roof:'#c9bfa5',roof2:'#7ea862',win:'#3f8597'},
 maintower:{wall:'#dccb9f',side:'#b7a67f',roof:'#d4c39a',roof2:'#e8dcb6',win:'#4c7488'},
 mainwing:{wall:'#dccb9f',side:'#b7a67f',roof:'#cbbb93',roof2:'#e2d5ae',win:'#4c7488'},
 activity:{wall:'#e4dcc6',side:'#bdb49b',roof:'#d7cfb6',roof2:'#9aa4a0',win:'#3f6f82'},
 gym:{wall:'#cfd6d6',side:'#a6aeb0',roof:'#6f8fae',roof2:'#9fb8cc',win:'#3c6886'},
 memorial:{wall:'#b77a5d',side:'#935f48',roof:'#8f4a3b',roof2:'#b0624c',win:'#e4c58b',tile:true},
 canteen:{wall:'#e1cfa8',side:'#bba985',roof:'#4f7d6c',roof2:'#6d9a85',win:'#466f6b'},
 glass:{wall:'#bfc9c4',side:'#97a29e',roof:'#a8b3b0',roof2:'#c4cdc9',win:'#3f7f95'},
 hospital:{wall:'#e8e6dc',side:'#c1beb2',roof:'#c9c6ba',roof2:'#e0ddd2',win:'#5f8ea0'},
 commercial:{wall:'#c4c6c2',side:'#9ea09c',roof:'#a9aba6',roof2:'#bfc1bb',win:'#4f7487'},
 utility:{wall:'#b9b3a3',side:'#999383',roof:'#8e8a7e',roof2:'#a29e92',win:'#5d6a6a'},
 modern:{wall:'#d6ccb8',side:'#b1a793',roof:'#bcb29e',roof2:'#d0c7b3',win:'#4f7487'}
};
function bh(b){return b.s==='library'?44:b.s==='activity'?32:b.s==='canteen'?28:Math.min(110,b.lv*(b.s==='maintower'?6:5)+4)}
function paintBuilding(c,b){
 const pal=PAL[b.s],h=bh(b),P=b.p,up=P.map(([x,y])=>[x,y-h]);
 poly(c,P.map(([x,y])=>[x+h*.35,y+4]),'#2c45352e');
 for(let i=0;i<P.length;i++){const a=P[i],q=P[(i+1)%P.length],dx=q[0]-a[0],dy=q[1]-a[1],L=Math.hypot(dx,dy);if(L<1)continue;
  // outward normal for clockwise (screen) polygons; check with a probe point.
  let nx=dy/L,ny=-dx/L;const mx=(a[0]+q[0])/2,my=(a[1]+q[1])/2;if(pip(mx+nx*2,my+ny*2,P)){nx=-nx;ny=-ny}
  if(ny<=0.05)continue;const shade=ny>.7?pal.wall:pal.side;
  poly(c,[a,q,[q[0],q[1]-h],[a[0],a[1]-h]],shade);
  const floors=Math.floor((h-6)/5);if(L<8)continue;
  for(let f=0;f<floors;f++){const yo=6+f*5;for(let d=4;d<L-3;d+=7){const x=a[0]+dx*d/L,y=a[1]+dy*d/L-h+yo;const lit=night&&hash(Math.round(x*7+y*13+b.lv))<.45;rect(c,x,y,3,3,lit?'#ffd98a':pal.win)}}
  if(ny>.7&&L>24){const d=L/2,x=a[0]+dx*d/L,y=a[1]+dy*d/L;rect(c,x-4,y-7,8,7,'#3d5a60');rect(c,x-6,y,12,2,'#e4dcc0')}
  poly(c,[a,q,[q[0],q[1]-1.5],[a[0],a[1]-1.5]],'#6b6455')}
 poly(c,up,pal.roof);c.save();path(c,up);c.clip();
 if(pal.tile){for(let y=b.y0-h;y<b.y1-h;y+=3)rect(c,b.x0,y,b.x1-b.x0,1,pal.roof2)}
 else if(b.s==='library'){for(let k=0;k<3;k++){c.strokeStyle=k?'#e6dcc2':'#a59a82';c.lineWidth=2;c.beginPath();up.forEach((p,i)=>{const x=b.cx+(p[0]-b.cx)*(1-k*.22),y=b.cy-h+(p[1]-b.cy+h)*(1-k*.22);i?c.lineTo(x,y):c.moveTo(x,y)});c.closePath();c.stroke()}
  const cx=b.cx,cy=b.cy-h;poly(c,[[cx-70,cy+10],[cx-20,cy-14],[cx-20,cy+30]],pal.roof2);poly(c,[[cx+70,cy+10],[cx+20,cy-14],[cx+20,cy+30]],pal.roof2);rect(c,cx-14,cy-20,28,26,'#e1d6bb');rect(c,cx-8,cy-14,16,14,'#3f8597')}
 else{c.strokeStyle=pal.roof2;c.lineWidth=3;path(c,up);c.stroke();for(let i=0;i<(b.x1-b.x0)*(b.y1-b.y0)/900;i++)rect(c,b.x0+hash(i*31+b.lv)*(b.x1-b.x0),b.y0-h+hash(i*17+7)*(b.y1-b.y0),5,3,'#9c9584')}
 c.restore();c.strokeStyle='#4d4a3f';c.lineWidth=1;path(c,up);c.stroke();
 if(b.s==='redroof'&&b.x1-b.x0>60){for(const fx of[b.x0+(b.x1-b.x0)*.3,b.x0+(b.x1-b.x0)*.7]){rect(c,fx-1,b.y0-h-10,3,10,'#8f4a3b')}}
 architecturalDetails(c,b,pal,h);
 // Building names are painted directly onto the visible facade, like architectural lettering.
 if(b.n&&b.s!=='library'){
  let face=null;for(let i=0;i<P.length;i++){const a=P[i],q=P[(i+1)%P.length],dx=q[0]-a[0],dy=q[1]-a[1],len=Math.hypot(dx,dy);if(len<22||Math.abs(dy)>len*.28)continue;let nx=dy/len,ny=-dx/len,mx=(a[0]+q[0])/2,my=(a[1]+q[1])/2;if(pip(mx+nx*2,my+ny*2,P))ny=-ny;if(ny>.65&&(!face||len>face.len))face={mx,my,len}}
  const name=b.n.replace(/^.+书院·/,'');c.save();c.textAlign='center';c.textBaseline='middle';
  if(face&&h>=12&&face.len>=name.length*4){const sy=face.my-h+6;c.fillStyle=pal.wall;c.fillRect(face.mx-face.len/2+1,sy-5,face.len-2,11);c.font='bold 9px Microsoft YaHei, sans-serif';c.fillStyle=night?'#f5deb0':'#314947';c.fillText(name,face.mx,sy,face.len-6)}
  else{c.save();path(c,up);c.clip();const fs=Math.max(6,Math.min(9,(b.x1-b.x0-4)/Math.max(1,name.length)));c.font='bold '+fs+'px Microsoft YaHei, sans-serif';c.lineWidth=2;c.strokeStyle='#f2e8ce';c.strokeText(name,b.cx,b.cy-h,b.x1-b.x0-3);c.fillStyle='#344b43';c.fillText(name,b.cx,b.cy-h,b.x1-b.x0-3);c.restore()}
  c.restore();
 }
}
const spriteCache=new Map();
function buildingSprite(b){const key=C.buildings.indexOf(b)+':'+night;let s=spriteCache.get(key);if(!s){const h=bh(b),pad=50;s=document.createElement('canvas');s.width=Math.ceil(b.x1-b.x0+pad*2+h*.4);s.height=Math.ceil(b.y1-b.y0+h+pad*2);const c=s.getContext('2d');c.translate(pad-b.x0,pad+h-b.y0);paintBuilding(c,b);s.ox=b.x0-pad;s.oy=b.y0-h-pad;spriteCache.set(key,s)}return s}
for(const b of C.buildings){const h=bh(b);poly(g,b.p.map(([x,y])=>[x+Math.min(h*.3,22),y+5]),'#3d553f40')}

// ---------- trees, people and props ----------
let season=1;const SEASONS=['春','夏','秋','冬'];
const TREEPAL={
 plane:[['#5f8a4d','#79a35a','#98bd6c'],['#3f6b42','#557f49','#73985a'],['#c08a35','#dba84a','#efc865'],['#8b8070','#a59a88','#f4f4ee']],
 sakura:[['#e7a3b5','#f2c0cd','#fde3ea'],['#4c7b4a','#628f55','#82a86a'],['#b46c4c','#cf8d5c','#e2ad73'],['#8b8070','#a59a88','#f4f4ee']],
 round:[['#5c8c4e','#76a55c','#97c06f'],['#3b6a44','#4f7f4c','#6c9a5a'],['#7a8b46','#9aa451','#c3b862'],['#5d6f5b','#7a8a74','#f1f3ec']],
 pine:[['#2f5b45','#3f6f50','#5b8a62'],['#2b5440','#3a684b','#56845d'],['#2f5b45','#3f6f50','#5b8a62'],['#2f5b45','#4f7a60','#f4f6f0']]};
const treeCache=new Map();
function treeSprite(kind,v){const key=kind+v+season;let s=treeCache.get(key);if(s)return s;s=document.createElement('canvas');s.width=40;s.height=50;const c=s.getContext('2d'),p=TREEPAL[kind][season];
 c.fillStyle='#2c453533';c.beginPath();c.ellipse(22,46,13,4,0,0,7);c.fill();
 if(kind==='pine'){rect(c,18,38,4,9,'#6b543c');for(let k=0;k<4;k++){const w=22-k*5,y=34-k*8;poly(c,[[20-w/2,y],[20+w/2,y],[20,y-12]],k%2?p[1]:p[0]);rect(c,20-w/2+3,y-2,w/3,2,p[2])}}
 else{rect(c,18,30,4,17,kind==='plane'?'#9b8a6d':'#6b543c');if(kind==='plane')rect(c,18,34,2,6,'#c8bc9f');
  const big=kind==='plane'?1.15:1;const blobs=[[20,20,13],[11,25,9],[29,25,9],[15,14,8],[26,14,8]];
  blobs.forEach(([x,y,r],i)=>{c.fillStyle=p[i%2];c.beginPath();c.arc(x,y,r*big,0,7);c.fill()});
  let sd=v*97+kind.length;for(let i=0;i<30;i++){sd=(sd*16807)%2147483647;const x=6+sd%28;sd=(sd*16807)%2147483647;const y=6+sd%24;rect(c,x,y,2,2,p[2])}}
 treeCache.set(key,s);return s}
function person(c,x,y,o={}){let yy=y;
 if(o.bike){rect(c,x-9,y-5,6,6,'#333');rect(c,x+3,y-5,6,6,'#333');rect(c,x-8,y-4,4,4,'#9aa');rect(c,x+4,y-4,4,4,'#9aa');rect(c,x-6,y-7,13,2,'#2fa37a');yy-=4}
 const tpl=o.tpl||(o.gender==='female'?'female':'male'),pal=o.palette||(tpl==='female'?'female-npc-sage':'male-npc-sage');
 drawCharacter(c,x,yy,tpl,pal,o.dir||0,!!o.moving,o.step||0,o.scale||CHAR_SCALE)}
function cat(c,x,y,col,t){x=Math.round(x);y=Math.round(y);const tail=Math.round(Math.sin(t*3+x)*2);c.fillStyle='#27433440';c.beginPath();c.ellipse(x,y,7,2,0,0,7);c.fill();rect(c,x-6,y-6,11,5,col);rect(c,x+3,y-10,6,6,col);rect(c,x+3,y-12,2,2,col);rect(c,x+7,y-12,2,2,col);rect(c,x+4,y-8,1,1,'#222');rect(c,x+7,y-8,1,1,'#222');rect(c,x-9,y-9+tail,3,5,col);rect(c,x-5,y-1,2,1,col);rect(c,x+2,y-1,2,1,col)}
function lamp(c,x,y){rect(c,x-1,y-26,3,26,'#4d5a50');rect(c,x-4,y-31,9,6,'#3a4b42');rect(c,x-3,y-30,7,4,night?'#ffe2a0':'#e9d9a8');rect(c,x-3,y,7,2,'#5f6b5f')}
function bench(c,x,y){rect(c,x-11,y-6,22,3,'#9a7149');rect(c,x-11,y-3,22,3,'#b98d5f');rect(c,x-10,y,2,3,'#4d5a50');rect(c,x+8,y,2,3,'#4d5a50')}
function bikes(c,x,y){for(let i=0;i<4;i++){const bx=x+i*9;rect(c,bx-3,y-3,3,3,'#333');rect(c,bx+3,y-3,3,3,'#333');rect(c,bx-2,y-6,8,2,['#f2c230','#38a0d8','#2fa37a','#f2c230'][i])}}
function tengfei(c,x,y){rect(c,x-12,y-6,24,8,'#d9d2bd');rect(c,x-8,y-14,16,9,'#ebe6d6');poly(c,[[x-6,y-14],[x+6,y-14],[x+2,y-120],[x-2,y-120]],'#f2efe4');poly(c,[[x+1,y-14],[x+6,y-14],[x+2,y-120],[x+1,y-120]],'#cfcabb');poly(c,[[x-2,y-120],[x+2,y-120],[x,y-138]],'#d7d1c0');rect(c,x-1,y-146,2,10,'#c9c2ae');for(let k=0;k<4;k++)rect(c,x-4+k*.4,y-40-k*20,8-k*.8,2,'#b9b29f')}
function yinshui(c,x,y){rect(c,x-16,y-6,32,8,'#c98c7c');rect(c,x-10,y-36,20,31,'#b5564a');rect(c,x-8,y-34,4,27,'#c7695b');rect(c,x-6,y-60,12,24,'#e4d8bf');c.fillStyle='#5b5a50';c.font='7px sans-serif';c.textAlign='center';['饮','水','思','源'].forEach((t,i)=>c.fillText(t,x,y-54+i*6));c.strokeStyle='#4b4f48';c.lineWidth=2;c.beginPath();c.arc(x,y-70,9,0,7);c.stroke();for(let a=0;a<8;a++)rect(c,x+Math.cos(a*.785)*11-1,y-70+Math.sin(a*.785)*11-1,3,3,'#4b4f48');rect(c,x-2,y-76,4,10,'#4b4f48')}
function invention(c,x,y,k){rect(c,x-8,y-4,16,5,'#bdb6a0');if(k===0){rect(c,x-6,y-14,12,10,'#a08a58');rect(c,x-1,y-20,2,6,'#c33')}else if(k===1){rect(c,x-6,y-22,12,18,'#efe6cf');rect(c,x-4,y-18,8,1,'#a99');rect(c,x-4,y-14,8,1,'#a99')}else if(k===2){rect(c,x-7,y-16,14,12,'#8d7a5a');for(let i=0;i<3;i++)rect(c,x-5+i*4,y-14,3,3,'#e5d7b4')}else{rect(c,x-4,y-18,8,14,'#b5473b');rect(c,x-1,y-23,2,5,'#e8c06a')}}
function southGate(c,x,y){rect(c,x-60,y-34,10,34,'#e6e3da');rect(c,x+50,y-34,10,34,'#e6e3da');poly(c,[[x-64,y-40],[x+64,y-48],[x+64,y-36],[x-64,y-30]],'#f1efe7');poly(c,[[x-64,y-30],[x+64,y-36],[x+64,y-33],[x-64,y-27]],'#c9c6bc');c.fillStyle='#4f4b44';c.font='bold 8px KaiTi,serif';c.textAlign='center';c.fillText('交 通 大 学',x-8,y-35)}
// ---------- world state ----------
const L=id=>LANDMARKS.find(p=>p.id===id);
function playerLook(g){g=g||S.appearance?.gender||'male';return{gender:g,palette:PLAYER_PAL[g]}}
const S0={found:[],chapter:0,intro:false,pages:[],leaves:[],cats:[],goals:0,hoops:0,foodBest:0,runBest:0,quiz:0,finished:false,x:L('gate').x,y:L('gate').y-20,night:false,season:1,bgm:true,volume:.3,sfx:true,labels:true,weather:'clear',rainVol:.35,rainOn:true,appearance:null,cameos:{}};
let S={...S0};try{Object.assign(S,JSON.parse(localStorage.getItem(SAVE)||'{}'))}catch{}
['found','pages','leaves','cats'].forEach(k=>{if(!Array.isArray(S[k]))S[k]=[]});
// Save compatibility: older saves have no appearance/weather/cameos; fill without touching progress.
if(S.weather!=='rain')S.weather='clear';if(!(S.rainVol>=0&&S.rainVol<=1))S.rainVol=.35;if(typeof S.rainOn!=='boolean')S.rainOn=true;
if(!S.cameos||typeof S.cameos!=='object'||Array.isArray(S.cameos))S.cameos={};
if(!S.appearance||!['male','female'].includes(S.appearance.gender))S.appearance=null;
const PLAYER_PAL={male:'male-player-navy',female:'female-player-sky'};
night=!!S.night;season=Number.isInteger(S.season)?S.season%4:1;
const player={x:S.x,y:S.y,dir:3,moving:false,step:0,bike:false};if(blocked(player.x,player.y)){player.x=L('gate').x;player.y=L('gate').y;snap(player)}
let zoom=1.6,viewW=600,viewH=400,camX=0,camY=0,started=false,modal=null,near=null,run=false,last=0,t=0,saveT=0,mapT=0,toastT=0,keys=new Set(),joy={x:0,y:0},particles=[],stamina=100,tired=false,runGame=null;
function roadPoint(r){const pts=C.roads[r].p,i=Math.floor(rand()*(pts.length-1)),k=rand();return{x:pts[i][0]+(pts[i+1][0]-pts[i][0])*k,y:pts[i][1]+(pts[i+1][1]-pts[i][1])*k}}
const mainRoads=C.roads.map((r,i)=>[r,i]).filter(([r])=>r.k==='unclassified'||r.k==='service').map(([,i])=>i);
// Placed props (lamps on main roads, benches beside paths, bike racks near teaching buildings and dorms).
const props=[];for(const i of mainRoads){const r=C.roads[i];for(let s=1;s<r.p.length;s++){const[a,b]=[r.p[s-1],r.p[s]],len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=30;d<len;d+=90){const x=a[0]+(b[0]-a[0])*d/len,y=a[1]+(b[1]-a[1])*d/len,nx=-(b[1]-a[1])/len,ny=(b[0]-a[0])/len,ox=x+nx*(r.w/2+5),oy=y+ny*(r.w/2+5);if(!blockedAt(ox,oy))props.push({k:'lamp',x:ox,y:oy})}}}
for(let i=0;i<70;i++){const r=mainRoads[Math.floor(rand()*mainRoads.length)],p=roadPoint(r);p.y+=C.roads[r].w/2+9;if(!blocked(p.x,p.y))props.push({k:'bench',x:p.x,y:p.y})}
const racks=[];for(const b of C.buildings)if((b.s==='dorm'||b.s==='redroof'||b.s==='mainwing'||b.s==='library')&&hash(b.x0*3+b.y0)<.45){const p={x:b.cx-14,y:b.y1+12};if(!blocked(p.x,p.y)&&!blocked(p.x+30,p.y)){racks.push(p);props.push({k:'bikes',x:p.x,y:p.y})}}
const pl=C.plaza[0];[[pl[0]+30,pl[1]+30],[pl[0]+230,pl[1]+30],[pl[0]+30,pl[1]+135],[pl[0]+230,pl[1]+135]].forEach(([x,y],k)=>props.push({k:'inv',x,y,n:k}));
// NPCs
const NAMES=['学长','学姐','新生','研究生','保洁阿姨','保安师傅','外卖小哥','社团同学','晨跑的同学','图书管理员'];
const LINES={
 '学长':['兴庆校区东西两半：西区是工科老楼和西区宿舍，东区是书院、康桥苑和田径场。','中一、中二、中三楼是红瓦坡顶的老教学楼，考试周去那里自习的人可多了。'],
 '学姐':['春天一定要来樱花道，就在腾飞塔两边。','梧桐东道、梧桐西道一到秋天就是金色的，记得捡几片梧桐叶。'],
 '新生':['我在找主楼 E 座……是不是那座有钟的高楼？','听说思源活动中心今晚有晚会。'],
 '研究生':['我去中二楼做实验，路过北门顺便看看饮水思源碑。','钱学森图书馆的屋顶是退台式的，楼顶还有绿化。'],
 '保洁阿姨':['落叶扫了又落，秋天就是这样的。','走路看着点车，同学们骑车都快。'],
 '保安师傅':['南门、北门、东门、西门都能进出，东南门挨着校医院。','晚上校园里也很安全，放心逛。'],
 '外卖小哥':['东区书院那几栋我闭着眼都能送到。','借过借过，这单要超时了！'],
 '社团同学':['要不要来社团招新？就在思源活动中心门口。','西篮球场今晚有三对三。'],
 '晨跑的同学':['东田径场一圈 400 米，按 Shift 可以跑起来。','跑累了就在长椅上坐坐，体力恢复得快。'],
 '图书管理员':['馆里安静，记得把手机调成静音。','借书去一楼，自习去楼上。']};
const NPC_GENDER={'学长':'male','学姐':'female','新生':null,'研究生':null,'保洁阿姨':'female','保安师傅':'male','外卖小哥':'male','社团同学':null,'晨跑的同学':null,'图书管理员':null};
const NPC_PAL={male:['male-npc-sage','male-npc-grayblue','male-npc-brown'],female:['female-npc-terracotta','female-npc-sage','female-npc-mauve']};
const npcs=[];for(let i=0;i<46;i++){const r=mainRoads[Math.floor(rand()*mainRoads.length)],p=roadPoint(r);if(blocked(p.x,p.y))continue;const name=NAMES[i%NAMES.length],bike=i%5===2;npcs.push({...p,name,bike,road:r,seg:0,dirv:rand()<.5?1:-1,speed:bike?55:22+rand()*10,dir:0,step:0,pause:rand()*3,shirt:['#c9604d','#4d78a8','#e0b84f','#6c9a63','#a77bb8','#e8e2d0','#3d4a5c'][i%7],hair:['#2f2a26','#5a3b2b','#1d1d1d'][i%3],bag:i%3===0?'#7a5134':null,hat:name==='保安师傅'?'#2c3e5a':name==='外卖小哥'?'#f2c230':null,pants:name==='保安师傅'?'#2c3e5a':undefined,line:0})}
npcs.forEach((p,i)=>{p.gender=NPC_GENDER[p.name]||(i%2?'female':'male');p.palette=p.name==='保安师傅'?'male-npc-guard':p.name==='外卖小哥'?'male-npc-yellow':p.name==='保洁阿姨'?'female-npc-orange':NPC_PAL[p.gender][Math.floor(i/2)%3]});
const catSpots=[[L('library').x-150,L('library').y+40],[L('yanzhi').x-60,L('yanzhi').y],[L('garden').x+20,L('garden').y-40],[L('wutong').x+60,L('wutong').y+30],[L('kangqiao').x+70,L('kangqiao').y],[L('zhongyi').x-160,L('zhongyi').y+40],[L('memorial').x+40,L('memorial').y+30]];
const cats=catSpots.map(([x,y],i)=>snap({x,y,id:i,col:['#e6a24f','#3a3a3a','#f2efe6','#9a8f84','#e6a24f','#5a5a5a','#d9c7a5'][i],name:['橘座','小黑','雪球','灰灰','大黄','煤球','奶茶'][i],hx:x,hy:y}));
const leafSpots=[];{const plane=C.roads.filter(r=>/梧桐|文治|学森/.test(r.n));for(let i=0;i<16;i++){const r=plane[i%plane.length],pts=r.p,k=Math.floor(hash(i*13+5)*(pts.length-1)),f=hash(i*7+1);leafSpots.push({id:i,x:pts[k][0]+(pts[k+1][0]-pts[k][0])*f,y:pts[k][1]+(pts[k+1][1]-pts[k][1])*f})}}
const pageSpots=[snap({id:'p1',x:L('tengfei').x-150,y:L('tengfei').y+20}),snap({id:'p2',x:L('garden').x,y:L('garden').y+60}),snap({id:'p3',x:L('tengfei').x+60,y:L('tengfei').y-140})];
function updateNPC(p,dt){if(p.pause>0){p.pause-=dt;p.moving=false;return}const pts=C.roads[p.road].p;if(p.ti===undefined){let best=0;pts.forEach((q,i)=>{if(Math.hypot(q[0]-p.x,q[1]-p.y)<Math.hypot(pts[best][0]-p.x,pts[best][1]-p.y))best=i});p.ti=best}
 const tgt=pts[p.ti],dx=tgt[0]-p.x,dy=tgt[1]-p.y,d=Math.hypot(dx,dy);
 if(d<3){if(p.ti+p.dirv<0||p.ti+p.dirv>=pts.length){p.dirv*=-1;if(!p.bike)p.pause=1+rand()*4}p.ti+=p.dirv;if(!p.bike&&rand()<.05)p.pause=2+rand()*3;return}
 if(Math.hypot(player.x-p.x,player.y-p.y)<16&&!p.bike){p.moving=false;return}
 const sp=p.speed*dt;p.x+=dx/d*Math.min(sp,d);p.y+=dy/d*Math.min(sp,d);p.moving=true;p.step+=Math.min(sp,d)*(p.bike?.04:.075);p.dir=Math.abs(dx)>Math.abs(dy)?dx>0?1:2:dy>0?0:3}
// ---------- rendering ----------
const petals=[];for(let i=0;i<70;i++)petals.push({x:rand(),y:rand(),s:.5+rand(),p:rand()*6});
function inView(x,y,m=160){return x>camX-m&&x<camX+viewW/zoom+m&&y>camY-m&&y<camY+viewH/zoom+m*1.6}
function marker(c,p,col){const x=p.x+16,y=p.y-7+Math.sin(t*2.5+p.x)*2;poly(c,[[x,y-6],[x+4,y-2],[x,y+2],[x-4,y-2]],col);poly(c,[[x,y-4],[x+2,y-2],[x,y],[x-2,y-2]],'#fff5c8')}
function render(){
 ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;rect(ctx,0,0,viewW,viewH,'#6b7068');
 ctx.save();ctx.scale(zoom,zoom);ctx.translate(-camX,-camY);
 const sx=Math.max(0,Math.floor(camX)),sy=Math.max(0,Math.floor(camY)),sw=Math.min(W-sx,Math.ceil(viewW/zoom)+2),sh=Math.min(H-sy,Math.ceil(viewH/zoom)+2);if(sw>0&&sh>0)ctx.drawImage(ground,sx,sy,sw,sh,sx,sy,sw,sh);
 if(season===3){ctx.fillStyle='#ffffff38';ctx.fillRect(camX,camY,viewW/zoom,viewH/zoom)}
 if(typeof drawEntranceGround==='function')drawEntranceGround(ctx);
 for(const w of C.water)if(inView(w.cx,w.cy,80))for(let i=0;i<3;i++){const ph=(t*.4+i/3)%1;rect(ctx,w.x0+(w.x1-w.x0)*hash(i+Math.floor(t*.4+i/3)*7),w.y0+(w.y1-w.y0)*(.2+.6*ph),6,1,'#c4e6e8')}
 for(const s of leafSpots)if(!S.leaves.includes(s.id)&&inView(s.x,s.y)){const y=s.y+Math.sin(t*2+s.id)*2;poly(ctx,[[s.x-5,y],[s.x-2,y-7],[s.x+5,y-9],[s.x+6,y-3],[s.x+1,y+2]],'#e3a93a');rect(ctx,s.x,y-6,1,8,'#8a6a2f')}
 if(CHAPTERS[S.chapter]?.place==='tengfei')for(const p of pageSpots)if(!S.pages.includes(p.id)){const y=p.y+Math.sin(t*2+p.x)*3;rect(ctx,p.x-6,y-18,12,15,'#fff0bc');for(let k=0;k<3;k++)rect(ctx,p.x-4,y-15+k*4,8,1,'#b8a475')}
 if(runGame)runGame.cps.forEach((q,i)=>{if(i>=runGame.idx){ctx.strokeStyle=i===runGame.idx?'#ffe37a':'#ffffff88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,12+Math.sin(t*6)*2,0,7);ctx.stroke()}});
 const A=[];
 for(const b of C.buildings)if(b.x1>camX-140&&b.x0<camX+viewW/zoom+40&&b.y0-bh(b)<camY+viewH/zoom+40&&b.y1>camY-20)A.push({y:b.y1,f:()=>{const s=buildingSprite(b);ctx.drawImage(s,s.ox,s.oy)}});
 for(const tr of trees)if(inView(tr.x,tr.y,40))A.push({y:tr.y,f:()=>{const s=treeSprite(tr.kind,tr.v);ctx.drawImage(s,tr.x-20*tr.s,tr.y-46*tr.s,40*tr.s,50*tr.s)}});
 for(const p of props)if(inView(p.x,p.y,40))A.push({y:p.y,f:()=>p.k==='lamp'?lamp(ctx,p.x,p.y):p.k==='bench'?bench(ctx,p.x,p.y):p.k==='bikes'?bikes(ctx,p.x,p.y):invention(ctx,p.x,p.y,p.n)});
 const tf=C.pois.tengfei;if(inView(tf.x,tf.y,200))A.push({y:tf.y+4,f:()=>tengfei(ctx,tf.x,tf.y+4)});
 const ys=L('yinshui');A.push({y:ys.y-6,f:()=>yinshui(ctx,ys.x,ys.y-6)});
 const sg=C.gates[1];A.push({y:sg.y+6,f:()=>southGate(ctx,sg.x,sg.y+6)});
 for(const p of npcs)if(inView(p.x,p.y,30))A.push({y:p.y,f:()=>{person(ctx,p.x,p.y,p);if(near===p){ctx.font='8px sans-serif';ctx.textAlign='center';const w=ctx.measureText(p.name).width+8;rect(ctx,p.x-w/2,p.y-42,w,11,'#233c35d0');ctx.fillStyle='#fff0c3';ctx.fillText(p.name,p.x,p.y-33)}}});
 for(const k of cats)if(inView(k.x,k.y,30))A.push({y:k.y,f:()=>{cat(ctx,k.x,k.y,k.col,t);if(!S.cats.includes(k.id))rect(ctx,k.x+1,k.y-17+Math.sin(t*3)*1.5,4,4,'#ff8fa3')}});
 if(typeof drawCampusObjects==='function')drawCampusObjects(ctx,A);
 A.push({y:player.y,f:()=>person(ctx,player.x,player.y,{...player,...playerLook()})});
 A.sort((a,b)=>a.y-b.y).forEach(a=>a.f());
 for(const p of LANDMARKS)if(inView(p.x,p.y))marker(ctx,p,CHAPTERS[S.chapter]?.place===p.id?'#ff9d4d':S.found.includes(p.id)?'#80a866':'#f8d684');
 for(const p of particles)rect(ctx,p.x,p.y,p.s,p.s,p.c);
 if(season===0||season===2)for(const q of petals){const x=camX+((q.x*viewW/zoom+t*12*q.s)%(viewW/zoom)),y=camY+((q.y*viewH/zoom+t*18*q.s)%(viewH/zoom));rect(ctx,x+Math.sin(t+q.p)*6,y,2,2,season===0?'#f6c3d0':'#dca04a')}
 if(season===3)for(const q of petals){const x=camX+((q.x*viewW/zoom+Math.sin(t+q.p)*8)%(viewW/zoom)),y=camY+((q.y*viewH/zoom+t*22*q.s)%(viewH/zoom));rect(ctx,x,y,2,2,'#ffffff')}
 ctx.restore();
 if(night){rect(ctx,0,0,viewW,viewH,'#14284a8c');ctx.save();ctx.globalCompositeOperation='lighter';for(const p of props)if(p.k==='lamp'&&inView(p.x,p.y,40)){const x=(p.x-camX)*zoom,y=(p.y-28-camY)*zoom,gr=ctx.createRadialGradient(x,y,0,x,y,34*zoom);gr.addColorStop(0,'#7a5a2266');gr.addColorStop(1,'#00000000');ctx.fillStyle=gr;ctx.fillRect(x-34*zoom,y-34*zoom,68*zoom,68*zoom)}ctx.restore()}
}
function drawMap(c,cw,ch,full){c.clearRect(0,0,cw,ch);const s=Math.min(cw/W,ch/H),ox=(cw-W*s)/2,oy=(ch-H*s)/2;c.save();c.translate(ox,oy);c.scale(s,s);c.drawImage(ground,0,0);
 for(const b of C.buildings)poly(c,b.p,PAL[b.s].roof);
 if(full){c.textAlign='center';c.textBaseline='middle';for(const b of C.buildings){if(!b.n||(b.x1-b.x0)<70||/舍|公寓|水房|面屋|实验室|研究所南楼/.test(b.n))continue;const n=b.n;c.font='bold 30px Microsoft YaHei';c.fillStyle='#fff8e2';c.fillText(n,b.cx+1,b.cy+1);c.fillStyle='#2c3a30';c.fillText(n,b.cx,b.cy)}
  for(const q of C.gates){c.font='bold 36px Microsoft YaHei';c.fillStyle='#8a2f22';c.fillText(q.n,q.x,q.y+(q.side==='n'?-30:q.side==='s'?34:0)+(q.side==='e'?0:0))}}
 for(const p of LANDMARKS){const cur=CHAPTERS[S.chapter]?.place===p.id;c.fillStyle=cur?'#ff7a2f':S.found.includes(p.id)?'#4b8053':'#d69b39';c.beginPath();c.arc(p.x,p.y,full?(cur?16:10):(cur?26:16),0,7);c.fill();if(full&&cur){c.strokeStyle='#fff';c.lineWidth=4;c.stroke()}}
 c.fillStyle='#d8392b';c.strokeStyle='#fff';c.lineWidth=full?5:10;c.beginPath();c.arc(player.x,player.y,full?14:30,0,7);c.fill();c.stroke();
 if(!full){c.strokeStyle='#fff6';c.lineWidth=10;c.strokeRect(camX,camY,viewW/zoom,viewH/zoom)}c.restore()}
// ---------- helpers ----------
const bgm=$('bgm');bgm.volume=Math.max(0,Math.min(1,Number(S.volume)||.3));let audioCtx;
function persist(){S.x=Math.round(player.x);S.y=Math.round(player.y);S.night=night;S.season=season;S.volume=bgm.volume;try{localStorage.setItem(SAVE,JSON.stringify(S))}catch{}}
function notify(m){$('toast').textContent=m;$('toast').classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>$('toast').classList.remove('show'),3200)}
function chime(f=[523,659,784]){if(!S.sfx)return;try{audioCtx??=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();f.forEach((fr,i)=>{const o=audioCtx.createOscillator(),gn=audioCtx.createGain(),t0=audioCtx.currentTime+i*.09;o.type='square';o.frequency.value=fr;gn.gain.setValueAtTime(.035,t0);gn.gain.exponentialRampToValueAtTime(.001,t0+.25);o.connect(gn);gn.connect(audioCtx.destination);o.start(t0);o.stop(t0+.26)})}catch{}}
const buzz=()=>chime([220,180]);
function burst(x,y){for(let i=0;i<26;i++)particles.push({x,y:y-20,vx:(rand()-.5)*90,vy:-30-rand()*80,life:1.1,s:2+rand()*2,c:['#f8d980','#fff1bd','#e1aa6c','#91b778'][i%4]})}
function stamp(id){if(S.found.includes(id))return;S.found.push(id);const p=L(id);burst(p.x,p.y);chime();notify('收集「'+p.seal+'」印章 · '+S.found.length+'/'+LANDMARKS.length);persist();refreshHUD()}
function nearestPlace(){let best=null,d=1e9;for(const b of C.buildings){if(!b.n)continue;const dd=Math.hypot(Math.max(b.x0-player.x,0,player.x-b.x1),Math.max(b.y0-player.y,0,player.y-b.y1));if(dd<d){d=dd;best=b.n}}for(const p of LANDMARKS){const dd=dist(p,player)-30;if(dd<d){d=dd;best=p.name}}return best}
function dirTo(p){const dx=p.x-player.x,dy=p.y-player.y,d=Math.hypot(dx,dy);if(d<60)return'就在附近';const a=Math.atan2(dy,dx)*180/Math.PI,ds=['东 →','东南 ↘','南 ↓','西南 ↙','西 ←','西北 ↖','北 ↑','东北 ↗'][((Math.round(a/45)%8)+8)%8];return ds+' '+Math.round(d/2)+'m'}
function refreshHUD(){const ch=CHAPTERS[S.chapter],tg=ch&&L(ch.place);$('quest').textContent=ch?'第'+(S.chapter+1)+'章 · '+ch.title:'兴庆拾光人 · 故事已完成';$('bar').style.width=S.chapter/CHAPTERS.length*100+'%';$('nextLabel').textContent=ch?'前往 · '+tg.name:'自由探索';$('distance').textContent=tg?dirTo(tg):S.found.length+'/'+LANDMARKS.length;
 $('count').textContent=S.found.length+'/'+LANDMARKS.length;$('leafCount').textContent='梧桐叶 '+S.leaves.length+'/'+leafSpots.length+' · 猫 '+S.cats.length+'/'+cats.length;$('energyFill').style.width=stamina+'%';$('energyLabel').textContent=player.bike?'🚲 骑行中（B 下车）':tired?'歇一歇，体力恢复中':'体力 '+Math.round(stamina)+'%'}
function updateNearby(){let best=null,d=48;for(const p of LANDMARKS){const dd=dist(p,player);if(dd<d){d=dd;best=p}}
 for(const p of npcs){const dd=dist(p,player);if(dd<26&&dd<d){d=dd;best=p}}for(const k of cats){const dd=dist(k,player);if(dd<24&&dd<d){d=dd;best={...k,kind:'cat',ref:k}}}
 if(CHAPTERS[S.chapter]?.place==='tengfei')for(const p of pageSpots)if(!S.pages.includes(p.id)&&dist(p,player)<30){best={...p,kind:'page'};break}
 if(!best&&!player.bike)for(const r of racks)if(Math.hypot(r.x+14-player.x,r.y-player.y)<28){best={kind:'bike',name:'共享单车'};break}
 near=best;const icon=$('interactIcon'),hint=$('nearHint'),btn=$('interactBtn');btn.disabled=!best;
 if(!best){$('nearName').textContent='沿着梧桐道，慢慢走';hint.textContent='靠近金色菱形打卡，走近同学或小猫按 E 互动';btn.textContent='走近互动';icon.textContent='✦'}
 else if(best.kind==='cat'){$('nearName').textContent='校园猫 · '+best.name;hint.textContent=S.cats.includes(best.id)?'它认得你了，蹭了蹭你的鞋。':'按 E 摸摸它';btn.textContent='撸猫 E';icon.textContent='🐱'}
 else if(best.kind==='page'){$('nearName').textContent='风吹散的纪念册书页';hint.textContent='按 E 捡起 · '+S.pages.length+'/3';btn.textContent='拾取 E';icon.textContent='▤'}
 else if(best.kind==='bike'){$('nearName').textContent='共享单车停放点';hint.textContent='按 E 扫码骑车，速度更快；按 B 下车';btn.textContent='骑车 E';icon.textContent='🚲'}
 else if(best.id){const cur=CHAPTERS[S.chapter]?.place===best.id;$('nearName').textContent=best.name;hint.textContent=cur?CHAPTERS[S.chapter].task:S.found.includes(best.id)?'已打卡，可以再读一遍介绍':'按 E 打卡收集印章';btn.textContent=cur?'剧情 E':'打卡 E';icon.textContent=cur?'!':'✦'}
 else{$('nearName').textContent=best.name;hint.textContent='按 E 聊两句';btn.textContent='交谈 E';icon.textContent='…'}
 $('location').textContent=(nearestPlace()||'兴庆校区')+' 附近 · '+SEASONS[season]+(night?' · 夜':'')}
// ---------- dialogue + modals ----------
let mini_=null,focusBefore=null;
function openModal(id){if(!started)return;keys.clear();joy={x:0,y:0};focusBefore=document.activeElement;if(modal)$(modal).classList.remove('open');modal=id;$(id).classList.add('open');$(id).querySelector('[data-close]')?.focus();if(id==='mapModal')drawMap($('fullmap').getContext('2d'),600,780,true);if(id==='journalModal')renderJournal();if(id==='questModal')renderQuest()}
function closeModal(){if(modal)$(modal).classList.remove('open');modal=null;mini_=null;$('storyModal').classList.remove('mini-mode','activity-mode','conversation-mode');focusBefore?.focus()}
function say(speaker,text,choices,title='校园奇遇'){mini_=null;$('storyModal').querySelector('.story-note').textContent='关闭后，回到对应地标按 E 可继续。';$('storyModal').classList.remove('mini-mode','activity-mode','conversation-mode');$('storyChoices').classList.remove('puzzle-grid');$('storyTitle').textContent=title;$('speaker').textContent=speaker;$('dialogueText').textContent=text;$('storyContent').innerHTML='';$('storyChoices').innerHTML='';choices.forEach(([l,fn],i)=>addChoice(l,fn,i===0));openModal('storyModal');drawPortrait(speaker)}
function addChoice(l,fn,primary=false){const b=document.createElement('button');b.className='choice'+(primary?' primary':'');b.textContent=l;b.onclick=fn;$('storyChoices').appendChild(b);return b}
function drawPortrait(name,look){const c=$('portrait').getContext('2d');c.imageSmoothingEnabled=false;rect(c,0,0,58,70,'#d5d5ad');
 if(!look){const n=npcs.find(p=>name&&name.startsWith(p.name));look=n?{gender:n.gender,palette:n.palette}:/学姐|阿姨|小林|管理员|馆员/.test(name)?{gender:'female',palette:'female-npc-terracotta'}:{gender:'male',palette:'male-npc-grayblue'}}
 person(c,29,96,{...look,dir:0,scale:1.9})}
function miniDlg(title,text){say('',text,[],title);$('storyModal').classList.add('mini-mode')}
function complete(i){if(S.chapter!==i){closeModal();return}S.chapter++;chime([523,659,784,1046]);persist();refreshHUD();closeModal();if(S.chapter===CHAPTERS.length){S.finished=true;persist();ending()}else notify('获得「'+CHAPTERS[i].reward+'」 · 下一站：'+L(CHAPTERS[S.chapter].place).name)}
function intro(){S.intro=true;persist();say('迎新志愿者 · 小林','你在南门捡到一本旧纪念册，第一页写着：\n「从南门走到北门，把八页故事写满。」\n\n小林说：“先去钱学森图书馆吧，沿中轴线往北，过了主楼和广场就是。”\n\n小提示：路边的自行车停放点可以按 E 骑车，按 B 下车。',[['接下这段旅程',closeModal],['看看任务列表',()=>openModal('questModal')]],'序章 · 没写完的纪念册')}
function chapter(){const s=S.chapter;
 if(s===0)say('图书馆员','“这本纪念册……是我们学校的东西。”\n“先考考你对交大的了解，答对三题我就帮你找到下一条线索。”',[['开始答题',()=>quiz(0,0)],['稍后再来',closeModal]],'第一章 · 书页里的第一站');
 else if(s===1)puzzle(0);
 else if(s===2)say('主楼前的同学','你把纪念册里夹着的信递过去。信上只有一句话：\n\n“如果把今天寄给未来，你想留下什么？”',[['一次认真探索的勇气',()=>letter('勇气')],['一段和朋友相处的时光',()=>letter('陪伴')],['一件还没放弃的热爱',()=>letter('热爱')]],'第三章 · 寄给明天的信');
 else if(s===3)say('康桥苑的同学','“帮我记住订单里四道菜的顺序，再按原顺序点出来。”',[['开始点餐',()=>food(true)],['稍后再来',closeModal]],'第四章 · 记住校园的味道');
 else if(s===4)say('晨跑的同学','“田径场上我放了四个打卡圈。45 秒内按顺序跑过去，按住 Shift 冲刺！”',[['开跑！',()=>startRun(true)],['先热热身',closeModal]],'第五章 · 田径场上的风');
 else if(s===5){if(S.pages.length===3)complete(5);else say('腾飞塔下的风','一阵风把三张散页吹散了：一张落在樱花西道旁，一张在东花园池边，还有一张被吹到了北面。\n已找到：'+S.pages.length+' / 3',[['去找书页',closeModal],['打开地图',()=>openModal('mapModal')]],'第六章 · 风吹散的三页')}
 else if(s===6)say('西迁纪念馆讲解员','“1955 年，国家决定交通大学内迁西安。1956 年起，师生员工陆续从上海来到这片麦田上建校。”\n\n“这就是‘西迁精神’：胸怀大局、无私奉献、弘扬传统、艰苦创业。”\n\n讲解员把一页泛黄的信纸交给你：“最后一页，写在北门的饮水思源碑前吧。”',[['收好初心书页',()=>complete(6)]],'第七章 · 西迁的来信');
 else if(s===7)say('饮水思源','你在纪念碑前翻开纪念册。书香、灵感、求索、烟火、奔跑、花影、初心……每一页都有你走过的路。\n\n你在最后一页写下：“饮水思源，爱国荣校。”',[['合上纪念册',()=>complete(7)]],'终章 · 饮水思源')}
function letter(w){S.letter=w;persist();say('主楼前的同学','“那就把「'+w+'」写在这一页吧。”\n“下一站去东区的康桥苑，我朋友在那儿等一份订单。”',[['收好求索书页',()=>complete(2)]],'回信')}
function ending(){say('兴庆拾光人','你从南门一路走到北门，把一本空白的纪念册写满了。\n\n还有没打卡的地标、没捡完的梧桐叶和没摸过的校园猫，都在等你。试试切换季节和夜游吧。',[['继续自由探索',closeModal],['查看成就',()=>openModal('questModal')]],'故事通关')}
const QUIZ=[['交通大学的前身南洋公学创办于哪一年？',['1896 年','1921 年','1956 年','1949 年'],0],['交通大学主体西迁到西安是从哪一年开始的？',['1937 年','1956 年','1978 年','2000 年'],1],['钱学森图书馆是以哪位校友命名的？',['钱学森','钱三强','钱伟长','钱钟书'],0],['西安交大的校训是？',['精勤求学，敦笃励志，果毅力行，忠恕任事','厚德载物','实事求是','博学笃志'],0],['兴庆校区北面隔着咸宁西路的是哪座公园？',['兴庆宫公园','大雁塔广场','曲江池','大唐芙蓉园'],0]];
function quiz(i,ok){if(i===3){if(ok>=2){S.quiz=Math.max(S.quiz,ok);say('图书馆员','答对 '+ok+' 题，不错！\n“下一条线索在南边的四大发明广场，把四件发明和它们的用途配起来。”',[['收好书香书页',()=>complete(0)]],'答题完成')}else say('图书馆员','只答对 '+ok+' 题，再来一次吧。',[['重新答题',()=>quiz(0,0)],['稍后',closeModal]],'答题');return}
 const q=QUIZ[(i+S.found.length)%QUIZ.length];say('图书馆员','第 '+(i+1)+' / 3 题\n\n'+q[0],[],'第一章 · 校史问答');q[1].forEach((a,k)=>addChoice(a,()=>{if(k===q[2]){chime();quiz(i+1,ok+1)}else{buzz();notify('正确答案：'+q[1][q[2]]);quiz(i+1,ok)}}))}
const PAIRS=[['辨别方向','指南针'],['留下文字的载体','造纸术'],['批量复制书页','印刷术'],['制作焰火的材料','火药']];
function puzzle(i){if(i===4){say('广场上的暗号','四组暗号全部配对成功！灵感书页背面写着：\n“去教学主楼，把信交给楼前的同学。”',[['去主楼',()=>complete(1)]],'解谜成功');return}say('四大发明广场','第 '+(i+1)+' / 4 组\n“'+PAIRS[i][0]+'”对应哪一项？',[],'第二章 · 四大发明的暗号');$('storyChoices').classList.add('puzzle-grid');['指南针','造纸术','印刷术','火药'].forEach(a=>addChoice(a,()=>{if(a===PAIRS[i][1]){chime();puzzle(i+1)}else{buzz();notify('再想想～')}}))}
const FOODS=[['🍜','油泼面'],['🥟','饺子'],['🍚','盖浇饭'],['🥙','肉夹馍'],['🍲','羊肉泡馍'],['🥗','凉皮'],['🥛','酸奶'],['🍢','麻辣烫']];
function food(story,order){order=order||[0,0,0,0].map(()=>Math.floor(rand()*FOODS.length));miniDlg('康桥苑 · 记忆点餐','记住订单的顺序。');$('storyContent').innerHTML='<div class="food-order">'+order.map((k,i)=>'<div>'+FOODS[k][0]+'<small style="display:block;font-size:10px;text-align:center">'+(i+1)+'·'+FOODS[k][1]+'</small></div>').join('')+'</div>';addChoice('我记住了',()=>foodInput(story,order,0),true)}
function foodInput(story,order,i){$('dialogueText').textContent='按顺序点菜 · '+i+'/4';$('storyContent').innerHTML='<div class="food-grid" id="fg"></div>';$('storyChoices').innerHTML='';FOODS.forEach(([ic,n],k)=>{const b=document.createElement('button');b.className='choice';b.innerHTML=ic+'<small>'+n+'</small>';b.onclick=()=>{if(k!==order[i]){buzz();$('storyContent').innerHTML='<div class="mini-status error">顺序记错啦，再看一次订单吧。</div>';addChoice('再看一次',()=>food(story,order),true);return}chime([660]);if(i===3){S.foodBest=4;persist();say('康桥苑的同学','四道菜全对！“下一站去东田径场吧。”',[[story?'收好烟火书页':'再来一局',()=>story?complete(3):food(false)],['继续散步',closeModal]],'点餐成功')}else foodInput(story,order,i+1)};$('fg').appendChild(b)})}
// Run challenge happens in the world: four rings on the track, 45 s.
const trackPitch=C.pitches.find(p=>/田径/.test(p.n));
function startRun(story){closeModal();const p=trackPitch,cx=p.cx,cy=p.cy,rx=(p.x1-p.x0)/2-12,ry=(p.y1-p.y0)/2-12;const cps=[[0,-1],[1,0],[0,1],[-1,0]].map(([a,b])=>({x:cx+a*rx,y:cy+b*ry*.85}));runGame={story,cps,idx:0,time:45};notify('计时开始！按顺序跑过 4 个金色圆圈')}
function updateRun(dt){if(!runGame)return;runGame.time-=dt;const q=runGame.cps[runGame.idx];if(dist(q,player)<16){runGame.idx++;chime([784]);burst(q.x,q.y);if(runGame.idx===4){const used=45-runGame.time,story=runGame.story;runGame=null;S.runBest=S.runBest?Math.min(S.runBest,used):used;persist();say('晨跑的同学','用时 '+used.toFixed(1)+' 秒，漂亮！\n“去腾飞塔看看吧，听说那边起风了。”',[[story?'收好奔跑书页':'再跑一次',()=>story?complete(4):startRun(false)],['休息一下',closeModal]],'跑完啦');return}}
 if(runGame.time<=0){const story=runGame.story;runGame=null;buzz();say('晨跑的同学','时间到了，差一点点！',[['再来一次',()=>startRun(story)],['先休息',closeModal]],'再试一次')}$('distance').textContent=runGame?'⏱ '+runGame.time.toFixed(1)+'s · '+runGame.idx+'/4':$('distance').textContent}
// Penalty kicks (canvas mini game).
function football(){miniDlg('东南足球场 · 点球挑战','守门员在移动，准星到空位时射门。五次机会，进三球！');$('storyContent').innerHTML='<canvas id="fc" class="game-stage" width="560" height="320"></canvas><div class="mini-status" id="fs">进球 0/3 · 剩余 5 次 · 空格或按钮射门</div>';mini_={type:'kick',goals:0,shots:0,ph:'aim',el:0,aim:280,keeper:280,ball:null,cd:0};addChoice('射门！Space',kick,true)}
function kick(){const g=mini_;if(!g||g.type!=='kick'||g.ph!=='aim')return;g.shots++;const ok=Math.abs(g.aim-g.keeper)>40;g.ph='fly';g.ball={tx:g.aim,age:0};g.cd=.8;if(ok){g.goals++;S.goals++;chime()}else buzz();$('fs').textContent=(ok?'好球！':'被扑出了！')+' 进球 '+g.goals+'/3 · 剩余 '+(5-g.shots)+' 次'}
function drawKick(){const g=mini_,cv=$('fc');if(!cv)return;const c=cv.getContext('2d');rect(c,0,0,560,320,'#6c9e61');for(let i=0;i<8;i++)rect(c,0,i*40,560,20,'#77aa68');rect(c,124,66,312,8,'#eee');rect(c,124,66,8,72,'#ddd');rect(c,428,66,8,72,'#ddd');rect(c,132,74,296,64,'#38575566');person(c,g.keeper,145,{gender:'male',palette:'male-npc-yellow',scale:1.4});c.strokeStyle='#ffdf84';c.lineWidth=2;c.beginPath();c.arc(g.aim,100,9,0,7);c.stroke();let bx=280,by=270;if(g.ball){const f=Math.min(1,g.ball.age/.6);bx=280+(g.ball.tx-280)*f;by=274-174*f-40*Math.sin(f*Math.PI)}c.fillStyle='#fff';c.beginPath();c.arc(bx,by,7,0,7);c.fill();rect(c,bx-2,by-2,4,4,'#333');person(c,280,305,{...playerLook(),dir:3,scale:1.4})}
// Basketball: stop the power bar in the green zone.
function hoop(){miniDlg('西篮球场 · 定点投篮','力度条来回移动，在绿色区域按下投篮。十投六中算赢！');$('storyContent').innerHTML='<canvas id="fc" class="game-stage" width="560" height="320"></canvas><div class="mini-status" id="fs">命中 0 · 剩余 10 次</div>';mini_={type:'hoop',made:0,shots:0,ph:'aim',el:0,pw:0,zone:.62,ball:null,cd:0};addChoice('投篮！Space',shootHoop,true)}
function shootHoop(){const g=mini_;if(!g||g.type!=='hoop'||g.ph!=='aim')return;g.shots++;const ok=Math.abs(g.pw-g.zone)<.08;g.ph='fly';g.ball={age:0,ok,pw:g.pw};g.cd=.9;if(ok){g.made++;chime()}else buzz();$('fs').textContent=(ok?'空心入网！':g.pw<g.zone?'力度小了':'力度大了')+' · 命中 '+g.made+' · 剩余 '+(10-g.shots)+' 次'}
function drawHoop(){const g=mini_,cv=$('fc');if(!cv)return;const c=cv.getContext('2d');rect(c,0,0,560,320,'#b47b56');for(let x=0;x<560;x+=28)rect(c,x,0,1,320,'#a46e4c');rect(c,0,0,560,90,'#87a7bf');rect(c,400,40,10,220,'#555');rect(c,360,40,70,46,'#f4f4f4');rect(c,372,52,46,24,'#d33');rect(c,376,56,38,16,'#f4f4f4');rect(c,350,86,44,4,'#e2572c');for(let i=0;i<4;i++)rect(c,354+i*10,90,2,18,'#eee');person(c,110,280,{...playerLook(),dir:1,scale:1.4});let bx=120,by=240;if(g.ball){const f=Math.min(1,g.ball.age/.75),tx=g.ball.ok?372:372+(g.ball.pw-g.zone)*260;bx=120+(tx-120)*f;by=240+(88-240)*f-150*Math.sin(f*Math.PI)}c.fillStyle='#e07b2f';c.beginPath();c.arc(bx,by,9,0,7);c.fill();rect(c,bx-9,by,18,1,'#5a2c10');
 rect(c,30,300,500,12,'#3e3a36');rect(c,30+500*(g.zone-.08),300,500*.16,12,'#6fc26b');rect(c,30+500*g.pw-2,296,4,20,'#fff')}
function miniTick(dt){const g=mini_;if(!g||modal!=='storyModal')return;g.el+=dt;
 if(g.type==='kick'){if(g.ph==='aim'){g.aim=280+133*Math.sin(g.el*2.3);g.keeper=280+105*Math.sin(g.el*1.6+1.1)}else{g.ball.age+=dt;g.cd-=dt;if(g.cd<=0){if(g.goals>=3||g.shots>=5){const won=g.goals>=3;say('球场队友',won?'进了 '+g.goals+' 球，太强了！':'只进了 '+g.goals+' 球，再来！',[['再来一局',football],['继续散步',closeModal]],won?'点球挑战成功':'再试一次');return}g.ph='aim';g.ball=null}}drawKick()}
 if(g.type==='hoop'){if(g.ph==='aim')g.pw=.5+.5*Math.sin(g.el*2.6);else{g.ball.age+=dt;g.cd-=dt;if(g.cd<=0){if(g.shots>=10||g.made>=6){const won=g.made>=6;S.hoops=Math.max(S.hoops,g.made);persist();say('球场上的学长',won?'十投 '+g.made+' 中，可以来院队了！':'命中 '+g.made+' 个，手感还差一点。',[['再来一局',hoop],['继续散步',closeModal]],won?'投篮挑战成功':'再试一次');return}g.ph='aim';g.ball=null}}drawHoop()}}
// ---------- interaction ----------
function interact(){if(!started||modal||!near)return;const n=near;
 if(n.kind==='cat'){if(!S.cats.includes(n.id)){S.cats.push(n.id);persist();chime([880,1046]);notify('认识了校园猫「'+n.name+'」 · '+S.cats.length+'/'+cats.length)}else notify(n.name+'：喵～');burst(n.x,n.y);refreshHUD();return}
 if(n.kind==='page'){S.pages.push(n.id);burst(n.x,n.y);chime();persist();notify('捡到散页 · '+S.pages.length+'/3');if(S.pages.length===3)say('风中的书页','三张散页拼在一起：\n“往东走，去西迁纪念馆，听听这所学校是怎么来的。”',[['收好花影书页',()=>complete(5)]],'书页找齐了');return}
 if(n.kind==='bike'){player.bike=true;chime([392,523]);notify('扫码成功，骑车速度更快。按 B 下车');refreshHUD();return}
 if(n.id){stamp(n.id);if(CHAPTERS[S.chapter]?.place===n.id){chapter();return}
  const extra=n.id==='football'?[['点球挑战',football]]:n.id==='basket'?[['投篮挑战',hoop]]:n.id==='kangqiao'?[['记忆点餐',()=>food(false)]]:n.id==='track'?[['限时跑圈',()=>startRun(false)]]:[];
  say(n.name,n.desc,[...extra,['继续散步',closeModal]],'校园地标 · 「'+n.seal+'」');return}
 n.line=(n.line+1)%LINES[n.name].length;say(n.name,LINES[n.name][n.line],[['问问纪念册的线索',()=>say(n.name,CHAPTERS[S.chapter]?'“'+CHAPTERS[S.chapter].task+'？去'+L(CHAPTERS[S.chapter].place).name+'看看吧，在你'+dirTo(L(CHAPTERS[S.chapter].place)).split(' ')[0]+'方向。”':'“你已经是兴庆通啦。”',[['谢谢',closeModal]],'同学的提示')],['再见',closeModal]],'偶遇')}
function renderJournal(){$('stamps').innerHTML=LANDMARKS.map(p=>'<div class="stamp '+(S.found.includes(p.id)?'found':'')+'"><b class="seal">'+(S.found.includes(p.id)?p.seal:'◇')+'</b><span>'+p.name+'</span></div>').join('');$('journalStatus').textContent='印章 '+S.found.length+'/'+LANDMARKS.length+' · 梧桐叶 '+S.leaves.length+'/'+leafSpots.length+' · 校园猫 '+S.cats.length+'/'+cats.length}
function renderQuest(){$('questList').innerHTML=CHAPTERS.map((c,i)=>'<div class="quest-row '+(i<S.chapter?'done':i===S.chapter?'current':'')+'"><span class="step-no">'+(i<S.chapter?'✓':i+1)+'</span><div><strong>'+c.title+'</strong><p>'+c.task+' · '+L(c.place).name+'</p></div></div>').join('');
 const bd=[['兴庆拾光人',S.finished],['地标收集家',S.found.length===LANDMARKS.length],['梧桐收藏家',S.leaves.length===leafSpots.length],['猫猫之友',S.cats.length===cats.length],['点球射手',S.goals>=3],['三分王',S.hoops>=6],['疾风跑者',S.runBest>0&&S.runBest<30],['校史通',S.quiz>=3]];$('rewards').innerHTML=bd.map(([s,ok])=>'<span class="reward '+(ok?'earned':'')+'">'+(ok?'✓ ':'◇ ')+s+'</span>').join('');$('questStats').textContent='故事 '+S.chapter+'/'+CHAPTERS.length+' · 印章 '+S.found.length+'/'+LANDMARKS.length}

// ---------- loop ----------
function resize(){viewW=Math.ceil(innerWidth/2);viewH=Math.ceil(innerHeight/2);canvas.width=viewW;canvas.height=viewH;setCamera(true)}
function setCamera(now=false,dt=1/60){const tx=Math.max(0,Math.min(W-viewW/zoom,player.x-viewW/zoom/2)),ty=Math.max(0,Math.min(H-viewH/zoom,player.y-viewH/zoom*.58));const follow=1-Math.exp(-10*dt);camX=now?tx:camX+(tx-camX)*follow;camY=now?ty:camY+(ty-camY)*follow}
function frame(now){const dt=Math.min((now-last)/1000||.016,.04);last=now;t+=dt;
 if(started&&!modal){let dx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0)+joy.x,dy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0)+joy.y,l=Math.hypot(dx,dy);player.moving=l>.05;
  const sprint=(keys.has('shift')||run)&&!tired&&stamina>2&&!player.bike;
  if(player.moving){moveCampusPlayer(dx,dy,dt,sprint)}else player.motionSpeed=0;
  if(sprint&&player.moving){stamina=Math.max(0,stamina-dt*16);if(stamina<2)tired=true}else stamina=Math.min(100,stamina+dt*(props.some(p=>p.k==='bench'&&dist(p,player)<20)?40:10));if(tired&&stamina>35)tired=false;
  for(const s of leafSpots)if(!S.leaves.includes(s.id)&&dist(s,player)<14){S.leaves.push(s.id);burst(s.x,s.y);chime([988]);persist();notify('拾到梧桐叶 · '+S.leaves.length+'/'+leafSpots.length)}
  npcs.forEach(p=>updateNPC(p,dt));for(const k of cats){k.x=k.hx+Math.sin(t*.3+k.id)*6}
  updateRun(dt);saveT+=dt;if(saveT>3){persist();saveT=0}updateNearby();refreshHUD()}
 else player.moving=false;miniTick(dt);
 particles=particles.filter(p=>(p.life-=dt)>0);for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=150*dt}
 setCamera(false,dt);render();mapT+=dt;if(mapT>.2){drawMap(mc,144,186,false);mapT=0}requestAnimationFrame(frame)}
function begin(){started=true;$('welcome').classList.add('hidden');canvas.focus();if(S.bgm&&bgm.getAttribute('src'))bgm.play().catch(()=>{});if(!S.intro)intro();else notify('欢迎回来。按 T 看任务，按 E 互动。')}
// ---------- input + UI wiring ----------
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();if(k==='escape'){closeModal();return}
 if(modal){if(k===' '&&mini_?.type==='kick')kick();if(k===' '&&mini_?.type==='hoop')shootHoop();return}
 if(!started){if(k==='enter'||k===' ')begin();return}keys.add(k);if(e.repeat)return;
 if(k==='e'||k===' ')interact();if(k==='m')openModal('mapModal');if(k==='j')openModal('journalModal');if(k==='t')openModal('questModal');if(k==='b'&&player.bike){player.bike=false;notify('已还车')}if(k==='n')toggleNight();if(k==='y')nextSeason()});
addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));addEventListener('blur',()=>{keys.clear();run=false});
function toggleNight(){night=!night;spriteCache.clear();document.body.classList.toggle('night',night);$('dayBtn').textContent=night?'☾ 夜游':'☀ 白昼';persist()}
function nextSeason(){season=(season+1)%4;$('seasonBtn').textContent='❀ '+SEASONS[season];notify('季节切换：'+SEASONS[season]+(season===0?' · 樱花开了':season===2?' · 梧桐黄了':season===3?' · 下雪了':''));persist()}
$('startBtn').onclick=begin;$('interactBtn').onclick=interact;$('journalBtn').onclick=()=>openModal('journalModal');$('questBtn').onclick=()=>openModal('questModal');$('missionPanel').onclick=()=>openModal('questModal');$('mapBtn').onclick=()=>openModal('mapModal');$('helpBtn').onclick=()=>openModal('helpModal');$('taskMapBtn').onclick=()=>openModal('mapModal');
$('quickFootball').onclick=football;$('quickFood').onclick=()=>food(false);$('quickHoop').onclick=hoop;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeModal);document.querySelectorAll('.modal').forEach(m=>m.onclick=e=>{if(e.target===m)closeModal()});
$('dayBtn').onclick=toggleNight;$('seasonBtn').onclick=nextSeason;$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom+.25);setCamera(true)};$('zoomOut').onclick=()=>{zoom=Math.max(.8,zoom-.25);setCamera(true)};
$('homeBtn').onclick=()=>{player.x=L('gate').x;player.y=L('gate').y;setCamera(true);notify('回到南门')};
$('soundBtn').onclick=()=>{if(!bgm.getAttribute('src'))return notify('未配置背景音乐');if(bgm.paused){S.bgm=true;bgm.play().catch(()=>notify('音乐加载失败'))}else{S.bgm=false;bgm.pause()}$('soundBtn').textContent=bgm.paused?'♫ 关':'♫ 开';persist()};
$('volume').value=Math.round(bgm.volume*100);$('volume').oninput=e=>{bgm.volume=e.target.value/100;persist()};
$('sfxToggle').onclick=()=>{S.sfx=!S.sfx;$('sfxToggle').textContent='互动音效：'+(S.sfx?'开':'关');persist()};
$('resetBtn').onclick=()=>{if(confirm('重新开始会清除所有进度，确定吗？')){localStorage.removeItem(SAVE);location.reload()}};
$('fullmap').onclick=e=>{const r=e.target.getBoundingClientRect(),cw=600,ch=780,s=Math.min(cw/W,ch/H),ox=(cw-W*s)/2,oy=(ch-H*s)/2,mx=((e.clientX-r.left)/r.width*cw-ox)/s,my=((e.clientY-r.top)/r.height*ch-oy)/s;const p=LANDMARKS.reduce((a,b)=>Math.hypot(b.x-mx,b.y-my)<Math.hypot(a.x-mx,a.y-my)?b:a);if(Math.hypot(p.x-mx,p.y-my)<80&&S.found.includes(p.id)){player.x=p.x;player.y=p.y+14;snap(player);setCamera(true);closeModal();notify('快速前往：'+p.name)}else notify(S.found.includes(p.id)?'点击已打卡的地标可快速前往':'先步行到「'+p.name+'」打卡，之后可在地图上快速前往')};
let joyId=null;const jy=$('joystick');function stick(e){const r=jy.getBoundingClientRect();let dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,l=Math.hypot(dx,dy);if(l>36){dx=dx/l*36;dy=dy/l*36}joy={x:dx/36,y:dy/36};$('stick').style.transform=`translate(${dx}px,${dy}px)`}
jy.addEventListener('pointerdown',e=>{joyId=e.pointerId;jy.setPointerCapture(e.pointerId);stick(e)});jy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)stick(e)});['pointerup','pointercancel'].forEach(ev=>jy.addEventListener(ev,()=>{joyId=null;joy={x:0,y:0};$('stick').style.transform=''}));
$('runBtn').addEventListener('pointerdown',()=>run=true);['pointerup','pointercancel','pointerleave'].forEach(ev=>$('runBtn').addEventListener(ev,()=>run=false));
document.body.classList.toggle('night',night);$('dayBtn').textContent=night?'☾ 夜游':'☀ 白昼';$('seasonBtn').textContent='❀ '+SEASONS[season];$('soundBtn').textContent=S.bgm?'♫ 开':'♫ 关';$('sfxToggle').textContent='互动音效：'+(S.sfx?'开':'关');
if(S.intro)$('startBtn').textContent='继续旅程 →';
addEventListener('resize',resize);addEventListener('beforeunload',persist);resize();refreshHUD();updateNearby();requestAnimationFrame(frame);
window.campusGame={state:()=>({x:player.x,y:player.y,chapter:S.chapter,found:S.found.length,near:near?.name,modal,trees:trees.length,npcs:npcs.length}),teleport:(id)=>{const p=L(id);player.x=p.x;player.y=p.y;setCamera(true)},start:begin,blocked};
