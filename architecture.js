'use strict';
// Pixel reinterpretations of landmark silhouettes; footprint/collision data stays in campus-data.js.
function archWindow(c,x,y,w,h,lit=false){rect(c,x,y,w,h,lit?'#e4c88d':'#345e6d');rect(c,x+1,y+1,Math.max(1,w-2),Math.max(1,h-2),lit?'#f1dca9':'#7196a0');rect(c,x+w/2,y,1,h,'#c5c8b5')}
function archPlanter(c,x,y){rect(c,x-5,y-2,10,4,'#a77954');rect(c,x-4,y-5,8,4,'#426e4b');rect(c,x-2,y-7,5,3,'#7c9e59')}
function architecturalDetails(c,b,pal,h){
 const w=b.x1-b.x0,d=b.y1-b.y0,cx=b.cx,front=b.y1,top=front-h;
 if(b.s==='library'){
  // Terraces planted on the north/south footprint; a stepped south mass replaces the plain roof.
  c.save();path(c,b.p.map(([x,y])=>[x,y-h]));c.clip();
  for(let y=b.y0-h+18;y<top-80;y+=25){rect(c,b.x0+15,y,w-30,16,'#b9b9a1');for(let x=b.x0+20;x<b.x1-15;x+=22){rect(c,x,y+3,15,9,'#789365');rect(c,x+2,y+4,11,2,'#99ad78')}}c.restore();
  const widths=[w-4,w*.84,w*.68,w*.52,w*.36,w*.24];
  for(let i=0;i<widths.length;i++){const tw=widths[i],y=top-i*12;rect(c,cx-tw/2-2,y-13,tw+4,15,'#b1ac98');rect(c,cx-tw/2,y-12,tw,11,'#dfd9c4');rect(c,cx-tw/2,y-14,tw,2,'#f1ead5');
   for(let x=cx-tw/2+5;x<cx+tw/2-4;x+=8){archWindow(c,x,y-10,5,7,night&&hash(x+i)<.4)}rect(c,cx-tw/2,y-2,tw,1,'#929c8a');
  }
  rect(c,cx-16,top-82,32,9,'#d4cfb6');rect(c,cx-10,top-78,20,9,'#416e83');rect(c,cx-1,top-79,2,11,'#e7dfc8');
  // Glazed reading hall, stone bays and broad central entrance.
  rect(c,b.x0+3,top+13,w-6,h-16,'#345b68');for(let x=b.x0+8;x<b.x1-5;x+=13){rect(c,x,top+14,8,h-18,night?'#d8c28a':'#688e99');rect(c,x+3,top+14,1,h-18,'#adc4bf')}
  for(const x of [b.x0+2,cx-28,cx+25,b.x1-5])rect(c,x,top+12,4,h-12,'#ddd2b8');rect(c,cx-12,front-13,24,13,'#263f4c');for(let x=cx-10;x<cx+11;x+=5)rect(c,x,front-11,3,10,'#88a8b0');
  for(let i=0;i<3;i++)rect(c,cx-22-i*3,front+i*2,44+i*6,2,i%2?'#bab59f':'#e1d8bf');archPlanter(c,cx-37,front+3);archPlanter(c,cx+37,front+3);c.save();rect(c,cx-64,top+1,128,12,'#e4dac0');c.fillStyle='#334e48';c.font='bold 10px Microsoft YaHei';c.textAlign='center';c.textBaseline='middle';c.fillText(b.n,cx,top+7,124);c.restore();
 }
 if(b.s==='maintower'){
  // Main E tower: strong upright frame and the recognizable open crown, no fictional clock.
  const fy=front,ft=fy-h;rect(c,b.x0+5,ft+10,w-10,h-12,'#4a606b');
  for(let i=0;i<8;i++){const yy=ft+15+i*(h-21)/8;rect(c,b.x0+7,yy,w-14,2,'#b5b8aa');for(let x=b.x0+10;x<b.x1-7;x+=7)archWindow(c,x,yy+3,4,5,night&&hash(x+yy)<.45)}
  for(const x of [b.x0+3,b.x0+10,b.x1-13,b.x1-6])rect(c,x,ft+7,4,h-7,'#c9c4b1');
  rect(c,cx-20,ft-26,40,30,'#bcb8a6');rect(c,cx-14,ft-20,28,19,'#324b53');rect(c,cx-9,ft-18,18,11,'#799ba5');rect(c,cx-22,ft-28,44,3,'#e7dfc9');rect(c,cx-17,ft-1,34,3,'#e1d8bf');
  rect(c,cx-10,front-16,20,16,'#314c58');rect(c,cx-7,front-13,14,12,'#70969d');for(let x=cx-6;x<cx+7;x+=4)rect(c,x,front-13,1,12,'#d3d7c7');for(let k=0;k<4;k++)rect(c,cx-17-k*2,front+k,34+k*4,1,k%2?'#bab69e':'#ded5bb');
 }
 if(b.s==='mainwing'){
  const y=front-h;for(const x of [b.x0+2,b.x1-6])rect(c,x,y+2,4,h-3,'#ede1c4');rect(c,b.x0+3,y+2,w-6,3,'#cec3a3');
  for(let x=b.x0+10;x<b.x1-8;x+=12){rect(c,x,y+14,2,h-16,'#eee2c7');archWindow(c,x+3,y+15,5,Math.max(5,h-21),night&&hash(x)<.35)}
  rect(c,cx-7,front-10,14,10,'#3b6270');rect(c,cx-10,front,20,2,'#e8debf');
 }
 if(b.s==='activity'){
  // Broad cream cantilever, exposed dark truss and recessed glass entrance, from the actual facade.
  rect(c,b.x0-4,top-10,w+8,8,'#b8ae91');poly(c,[[b.x0-5,top-12],[b.x1+5,top-9],[b.x1+7,top-4],[b.x0-7,top-6]],'#d8c9a6');
  rect(c,b.x0+1,top-3,w-2,6,'#354949');for(let x=b.x0+4;x<b.x1-4;x+=8){poly(c,[[x,top-3],[x+3,top+2],[x+6,top-3]],'#899082')}
  rect(c,b.x0+2,top+3,w-4,h-4,'#d5c9b2');rect(c,b.x0+12,top+14,w-24,h-14,'#283e50');
  for(let x=b.x0+15;x<b.x1-12;x+=10){rect(c,x,top+15,6,h-17,night?'#baaf7e':'#526b79');rect(c,x,top+15,1,h-15,'#bac4bb')}
  for(const x of [b.x0+10,cx-26,cx+23,b.x1-13])rect(c,x,top+12,3,h-11,'#b39d7b');rect(c,cx-18,front-9,36,9,'#b4c3bb');for(let x=cx-16;x<cx+17;x+=8)rect(c,x,front-7,6,7,'#476a78');
  for(let k=0;k<3;k++)rect(c,cx-25-k*3,front+k*2,50+k*6,2,k%2?'#bfb49b':'#e1d7bd');archPlanter(c,b.x0+7,front+3);archPlanter(c,b.x1-7,front+3);
  // Low skylights articulate the otherwise empty auditorium roof.
  c.save();path(c,b.p.map(([x,y])=>[x,y-h]));c.clip();for(let y=b.y0-h+15;y<top-20;y+=18){rect(c,b.x0+18,y,w-36,5,'#a8ac9f');for(let x=b.x0+20;x<b.x1-18;x+=12)rect(c,x,y,8,3,'#cbd4cd')}c.restore();
 }
 if(b.s==='canteen'){
  const kang=/康桥/.test(b.n),roof=kang?'#9b6c54':'#52745d',trim=kang?'#d4b38c':'#b1c49a';
  c.save();path(c,b.p.map(([x,y])=>[x,y-h]));c.clip();rect(c,b.x0,b.y0-h,w,d,roof);for(let y=b.y0-h;y<top;y+=5)rect(c,b.x0,y,w,1,kang?'#b68464':'#78916d');
  for(let x=b.x0+10;x<b.x1-5;x+=25){rect(c,x,b.y0-h+10,17,7,'#314c51');rect(c,x+1,b.y0-h+10,15,2,'#b5c9b9')}c.restore();
  rect(c,b.x0,top+1,w,h-1,kang?'#dfc6a2':'#e4d3b0');for(let x=b.x0+7;x<b.x1-5;x+=14)archWindow(c,x,top+12,9,Math.max(6,h-16),night);
  rect(c,cx-15,front-11,30,11,'#365b60');rect(c,cx-12,front-10,24,9,'#7d9c97');rect(c,cx-1,front-11,2,11,'#ded9bd');
  // Shallow striped entrance canopy, separate color identity for the two dining halls.
  rect(c,cx-21,front-15,42,4,kang?'#8f4b37':'#42674c');for(let x=cx-20;x<cx+21;x+=8)rect(c,x,front-15,4,4,trim);rect(c,cx-22,front+1,44,2,'#d8cfb4');archPlanter(c,cx-29,front+3);archPlanter(c,cx+29,front+3);
 }
 if(['library','maintower','activity','canteen'].includes(b.s)){for(const x of [cx-19,cx+17]){rect(c,x,front-14,3,6,'#536359');rect(c,x+1,front-13,1,4,night?'#ffe39b':'#d4cfad')}}

}
