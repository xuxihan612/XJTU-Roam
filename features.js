'use strict';
// Round-3 features layered on game.js: path navigation, world labels, rain + rain audio,
// run-challenge HUD, character select, and the optional 临兵者 cameo.
// Loaded after game.js (shares its globals; no module system).

// ================= navigation (A* over the existing 4px collision grid) =================
const NAV_STEP=2;                 // search on 8px cells (2x2 collision cells) for speed
const NW=Math.ceil(GW/NAV_STEP),NH=Math.ceil(GH/NAV_STEP);
const navFree=new Uint8Array(NW*NH);
for(let y=0;y<NH;y++)for(let x=0;x<NW;x++){const wx=x*NAV_STEP*CELL+NAV_STEP*CELL/2,wy=y*NAV_STEP*CELL+NAV_STEP*CELL/2;navFree[y*NW+x]=(blocked(wx,wy)||blocked(wx-4,wy)||blocked(wx+4,wy)||blocked(wx,wy-4)||blocked(wx,wy+4))?0:(road[gi(wx,wy)]?1:2)} // 1 road, 2 grass
const toN=v=>Math.floor(v/(NAV_STEP*CELL)),fromN=v=>v*NAV_STEP*CELL+NAV_STEP*CELL/2;
function nearestFree(nx,ny){if(navFree[ny*NW+nx])return[nx,ny];for(let r=1;r<20;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){if(Math.max(Math.abs(dx),Math.abs(dy))!==r)continue;const x=nx+dx,y=ny+dy;if(x>=0&&y>=0&&x<NW&&y<NH&&navFree[y*NW+x])return[x,y]}return null}
// Binary-heap A*. Grass costs more than road so the route prefers paths without forbidding lawns.
function findPath(ax,ay,bx,by){const s=nearestFree(toN(ax),toN(ay)),g=nearestFree(toN(bx),toN(by));if(!s||!g)return null;if(Math.hypot(fromN(g[0])-bx,fromN(g[1])-by)>60)return null;
 const N=NW*NH,G=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N),heap=[],hp=[];
 const push=(i,f)=>{heap.push(i);hp.push(f);let k=heap.length-1;while(k){const q=(k-1)>>1;if(hp[q]<=hp[k])break;[heap[q],heap[k]]=[heap[k],heap[q]];[hp[q],hp[k]]=[hp[k],hp[q]];k=q}};
 const pop=()=>{const top=heap[0],lh=heap.pop(),lf=hp.pop();if(heap.length){heap[0]=lh;hp[0]=lf;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&hp[l]<hp[m])m=l;if(r<heap.length&&hp[r]<hp[m])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];[hp[m],hp[k]]=[hp[k],hp[m]];k=m}}return top};
 const si=s[1]*NW+s[0],gi_=g[1]*NW+g[0],h=(i)=>{const x=i%NW,y=(i/NW)|0;return Math.hypot(x-g[0],y-g[1])};
 G[si]=0;push(si,h(si));let it=0;
 const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
 while(heap.length&&it++<200000){const i=pop();if(i===gi_)break;if(closed[i])continue;closed[i]=1;const x=i%NW,y=(i/NW)|0;
  for(const[dx,dy,c]of D){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=NW||ny>=NH)continue;const j=ny*NW+nx;if(!navFree[j]||closed[j])continue;
   if(dx&&dy&&(!navFree[y*NW+nx]||!navFree[ny*NW+x]))continue; // no corner cutting
   const ng=G[i]+c*(navFree[j]===1?1:2.2);if(ng<G[j]){G[j]=ng;from[j]=i;push(j,ng+h(j))}}}
 if(from[gi_]<0&&si!==gi_)return null;const out=[];for(let i=gi_;i>=0;i=from[i]){out.push([fromN(i%NW),fromN((i/NW)|0)]);if(i===si)break}out.reverse();
 // Simplify: keep a point only if the straight segment to the next kept point would cross a blocked cell.
 const clear=(a,b)=>{const n=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/2);for(let k=1;k<n;k++){const x=a[0]+(b[0]-a[0])*k/n,y=a[1]+(b[1]-a[1])*k/n;if(!navFree[toN(y)*NW+toN(x)])return false}return true};
 const simp=[out[0]];let a=0;for(let k=2;k<out.length;k++)if(!clear(out[a],out[k])){simp.push(out[k-1]);a=k-1}simp.push(out[out.length-1]);return simp}
const nav={target:null,path:null,failed:false,lastCheck:0,key:''};
function navTarget(){if(runGame)return null;const ch=CHAPTERS[S.chapter];if(!ch)return null;if(ch.place==='tengfei'&&S.pages.length<3){const p=pageSpots.filter(q=>!S.pages.includes(q.id)).sort((a,b)=>dist(a,player)-dist(b,player))[0];if(p)return{x:p.x,y:p.y,name:'风吹散的书页'}}const l=L(ch.place);return{x:l.x,y:l.y,name:l.name}}
function pathLen(p){let d=0;for(let i=1;i<p.length;i++)d+=Math.hypot(p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]);return d}
function offPath(){if(!nav.path)return true;let best=1e9;for(let i=1;i<nav.path.length;i++){const[a,b]=[nav.path[i-1],nav.path[i]],dx=b[0]-a[0],dy=b[1]-a[1],L2=dx*dx+dy*dy||1,k=Math.max(0,Math.min(1,((player.x-a[0])*dx+(player.y-a[1])*dy)/L2));best=Math.min(best,Math.hypot(a[0]+dx*k-player.x,a[1]+dy*k-player.y))}return best>48}
function replan(force){const tg=navTarget();const key=tg?Math.round(tg.x)+','+Math.round(tg.y):'';if(!tg){nav.target=null;nav.path=null;nav.failed=false;nav.key='';return}
 if(!force&&key===nav.key&&nav.path&&!offPath())return;nav.key=key;nav.target=tg;const p=findPath(player.x,player.y,tg.x,tg.y);nav.path=p;nav.failed=!p}
// Trim the part of the route already walked so the arrow points to the next waypoint.
function nextWaypoint(){const p=nav.path;if(!p||!p.length)return null;
 // Move past a waypoint once the player has actually reached or passed its segment.
 while(p.length>2){const a=p[0],b=p[1],dx=b[0]-a[0],dy=b[1]-a[1],len2=dx*dx+dy*dy||1;
  const progress=((player.x-a[0])*dx+(player.y-a[1])*dy)/len2;
  if(Math.hypot(b[0]-player.x,b[1]-player.y)<20||(progress>=1&&Math.hypot(player.x-b[0],player.y-b[1])<48))p.shift();else break}
 return p[1]||p[0]}
function navUpdate(dt){nav.lastCheck+=dt;if(nav.lastCheck>.6){nav.lastCheck=0;replan(false)}}
window.navReplan=()=>replan(true);
function drawRouteWorld(c){const p=nav.path;if(!p||!nav.target)return;c.save();c.fillStyle='#ffe28acc';let acc=(t*30)%24;
 for(let i=1;i<p.length;i++){const[a,b]=[p[i-1],p[i]],L_=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=acc;d<L_;d+=24){const x=a[0]+(b[0]-a[0])*d/L_,y=a[1]+(b[1]-a[1])*d/L_;if(dist({x,y},player)<14)continue;if(!inView(x,y,20))continue;c.fillRect(Math.round(x)-1,Math.round(y)-1,3,3)}acc=(acc-L_%24+24)%24}c.restore()}
function drawArrow(c){const w=nextWaypoint();if(!w||!nav.target||dist(nav.target,player)<50)return;const a=Math.atan2(w[1]-player.y,w[0]-player.x),r=22,x=player.x+Math.cos(a)*r,y=player.y-10+Math.sin(a)*r*.8;c.save();c.translate(x,y);c.rotate(a);c.fillStyle='#2b2523';c.beginPath();c.moveTo(7,0);c.lineTo(-4,-5);c.lineTo(-2,0);c.lineTo(-4,5);c.closePath();c.fill();c.fillStyle='#ffd25e';c.beginPath();c.moveTo(5.5,0);c.lineTo(-3,-3.6);c.lineTo(-1.2,0);c.lineTo(-3,3.6);c.closePath();c.fill();c.restore()}
function drawRouteMap(c,full){const p=nav.path;if(!p)return;c.save();c.strokeStyle='#2b2523';c.lineWidth=full?11:18;c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(player.x,player.y);p.forEach((q,i)=>i&&c.lineTo(q[0],q[1]));c.stroke();c.strokeStyle='#ffd25e';c.lineWidth=full?6:10;c.setLineDash(full?[18,10]:[]);c.stroke();c.restore()}

// ================= building / landmark labels (DOM overlay, readable at any zoom) =================
// Names come from OSM building tags in campus-data.js; landmarks from content.js. Priority decides
// what wins when labels collide; closer labels win among equals.
const LABEL_PRI=n=>/钱学森图书馆|主楼E座|思源活动中心|康桥苑|梧桐苑|西迁纪念馆|文体中心|中一楼|中二楼|中三楼/.test(n)?3:/主楼|书院|东一楼|东二楼|东三楼|西二楼|彭康楼|教一楼|教二楼|网络中心|逸夫|宪梓堂|校医院|能源馆|仲英楼|工程坊|强度楼|理科楼|文管大楼|外文楼|田径|足球|篮球/.test(n)?2:1;
const labelDefs=[];
{const seen=new Set();
 // Building names are rendered onto facades in paintBuilding; only places and gates use floating signs.
 for(const p of C.pitches)if(p.n){const n=p.n==='东南足球场'?'东南足球场':p.n;if(seen.has(n+Math.round(p.cx/200)))continue;seen.add(n+Math.round(p.cx/200));labelDefs.push({n,x:p.cx,y:p.cy,pri:/田径|足球/.test(n)?2:1,kind:'z'})}
 for(const[n,q]of[['腾飞塔',C.pois.tengfei],['饮水思源碑',{x:L('yinshui').x,y:L('yinshui').y-6}],['四大发明广场',{x:L('plaza').x,y:L('plaza').y+40}],['胭脂坡',L('yanzhi')],['西花园',C.pois.westGarden],['东花园',L('garden')],['樱花道',L('sakura')]])if(q)labelDefs.push({n,x:q.x,y:q.y+12,pri:3,kind:'z'})
 for(const g_ of C.gates)labelDefs.push({n:g_.n,x:g_.x,y:g_.y+(g_.side==='s'?-50:g_.side==='n'?18:0),pri:3,kind:'g'})}
const labelLayer=document.createElement('div');labelLayer.className='building-labels';labelLayer.setAttribute('aria-hidden','true');document.body.insertBefore(labelLayer,canvas.nextSibling);
labelDefs.forEach(d=>{d.el=document.createElement('div');d.el.className='building-label'+(d.kind==='z'?' zone-label':'')+(d.kind==='g'?' gate-label':'');d.el.textContent=d.n;d.el.style.display='none';labelLayer.appendChild(d.el);d.w=d.n.length*13+18});
let labelT=0;
function placeLabels(){if(!S.labels||!started){labelDefs.forEach(d=>d.el.style.display='none');return}
 const k=innerWidth/viewW*zoom,ui=[...document.querySelectorAll('.hud.plate,.hud.bottom,.hud.zoom,.hud.topnav,.travel-stats,#runHud')].map(e=>e.getBoundingClientRect()).filter(r=>r.width);
 const px_=(player.x-camX)*k,py_=(player.y-camY)*k,used=[{left:px_-30,right:px_+30,top:py_-70,bottom:py_+8}];
 const tgName=nav.target?.name;
 const list=labelDefs.map(d=>({d,sx:(d.x-camX)*k,sy:(d.y-camY)*k})).filter(o=>o.sx>-80&&o.sx<innerWidth+80&&o.sy>-30&&o.sy<innerHeight+30)
  .map(o=>({...o,score:(o.d.n===tgName?10:0)+o.d.pri*2-Math.hypot(o.sx-px_,o.sy-py_)/260})).sort((a,b)=>b.score-a.score);
 const shown=new Set();let n=0;
 for(const o of list){if(n>=16)break;if(zoom<1.1&&o.d.pri<2)continue;
  const r={left:o.sx-o.d.w/2,right:o.sx+o.d.w/2,top:o.sy-12,bottom:o.sy+12};
  if(r.left<4||r.right>innerWidth-4)continue;
  if([...used,...ui].some(u=>r.left<u.right&&r.right>u.left&&r.top<u.bottom&&r.bottom>u.top))continue;
  used.push(r);shown.add(o.d);n++;o.d.el.style.left=Math.round(o.sx)+'px';o.d.el.style.top=Math.round(o.sy)+'px';o.d.el.classList.toggle('quest-label',o.d.n===tgName)}
 labelDefs.forEach(d=>d.el.style.display=shown.has(d)?'block':'none')}

// ================= rain (visual + audio) =================
const drops=[],splashes=[];for(let i=0;i<150;i++)drops.push({x:rand(),y:rand(),v:.8+rand()*.5,l:5+rand()*4});
function rainWorld(c){if(S.weather!=='rain')return;
 // puddles: subtle sheen on a few road points in view (deterministic positions, no flicker)
 c.save();for(const r of C.roads){if(r.k!=='unclassified')continue;for(let i=1;i<r.p.length;i+=2){const q=r.p[i];if(!inView(q[0],q[1],10))continue;c.fillStyle='#8fb6c455';c.beginPath();c.ellipse(q[0]+6,q[1]+2,9,3,0,0,7);c.fill();c.fillStyle='#d8eef455';c.fillRect(q[0]+2,q[1]+1,5,1)}}
 for(const s_ of splashes){const a=1-s_.age/.35;c.strokeStyle=`rgba(220,236,242,${(a*.7).toFixed(2)})`;c.lineWidth=1;c.beginPath();c.ellipse(s_.x,s_.y,2+s_.age*14,1+s_.age*5,0,0,7);c.stroke()}c.restore()}
function rainScreen(c,dt){if(S.weather!=='rain')return;
 c.fillStyle=night?'#0a1a3022':'#33465a2a';c.fillRect(0,0,viewW,viewH); // gentle dim, keeps buildings readable
 c.fillStyle=night?'#b9cde0aa':'#e3eef6b0';
 for(const d of drops){d.y+=d.v*dt*1.1;d.x-=d.v*dt*.25;if(d.y>1){d.y-=1;d.x=rand()*1.1;if(started&&rand()<.5)splashes.push({x:camX+d.x*viewW/zoom,y:camY+rand()*viewH/zoom,age:0})}if(d.x<0)d.x+=1.1;
  const x=Math.round(d.x*viewW),y=Math.round(d.y*viewH);for(let k=0;k<d.l;k++)c.fillRect(x-Math.round(k*.3),y+k,1,1)}
 for(let i=splashes.length-1;i>=0;i--){splashes[i].age+=dt;if(splashes[i].age>.35)splashes.splice(i,1)}if(splashes.length>60)splashes.splice(0,splashes.length-60)}
// Optional local rain audio: one element, no bundled file and no stacked tracks.
const rainAudio=new Audio();if(window.XQ_SOURCE_CONFIG.rainSrc)rainAudio.src=window.XQ_SOURCE_CONFIG.rainSrc;rainAudio.loop=true;rainAudio.preload='none';rainAudio.volume=Math.max(0,Math.min(1,S.rainVol))*.6;
let userGestured=false;
function rainAudioSync(){const want=!!window.XQ_SOURCE_CONFIG.rainSrc&&S.weather==='rain'&&S.rainOn&&S.sfx!==false&&started&&userGestured&&!document.hidden;rainAudio.volume=Math.max(0,Math.min(1,S.rainVol))*.6;
 if(want&&rainAudio.paused)rainAudio.play().catch(()=>{});else if(!want&&!rainAudio.paused)rainAudio.pause()}
addEventListener('pointerdown',()=>{userGestured=true;rainAudioSync()},{once:true});addEventListener('keydown',()=>{userGestured=true;rainAudioSync()},{once:true});
document.addEventListener('visibilitychange',rainAudioSync);
function setWeather(w){S.weather=w;persist();weatherUI();rainAudioSync();notify(w==='rain'?'下雨了 · 雨声可在「?」设置中调节':'雨停了，天晴了')}
function weatherUI(){const b=$('weatherBtn');b.textContent=S.weather==='rain'?'☂ 雨天':'☼ 晴天';b.setAttribute('aria-pressed',S.weather==='rain');b.classList.toggle('active',S.weather==='rain');
 $('rainToggle').textContent='雨声：'+(S.rainOn?'开':'关');$('rainVol').value=Math.round(S.rainVol*100)}

// ================= run challenge HUD (dedicated panel; mission hint never overwrites it) =================
const runHud=$('runHud');let runResultT=0;
function runHudUpdate(dt){if(runGame){runHud.hidden=false;runHud.classList.remove('done','fail');const tm=Math.max(0,runGame.time);
  $('runTime').textContent=tm.toFixed(1)+'s';$('runCp').textContent=runGame.idx+' / '+runGame.cps.length;$('runState').textContent=tm<10?'加油，最后冲刺！':'按顺序跑过金色圆圈 · Esc 退出';runHud.classList.toggle('urgent',tm<10);$('runBar').style.width=(tm/45*100)+'%'}
 else if(runResultT>0){runResultT-=dt;if(runResultT<=0)runHud.hidden=true}else runHud.hidden=true}
function runResult(ok,text,rg){runHud.hidden=false;runHud.classList.add(ok?'done':'fail');runHud.classList.remove('urgent');$('runState').textContent=text;if(rg){$('runTime').textContent=Math.max(0,rg.time).toFixed(1)+'s';$('runCp').textContent=rg.idx+' / '+rg.cps.length}runResultT=4}
// Wrap updateRun: the base version ends a run by nulling runGame; detect that transition and show the result.
const _updateRun=updateRun;updateRun=function(dt){const before=runGame;const keep=$('distance').textContent;_updateRun(dt);
 if(before&&!runGame){if(before.idx>=before.cps.length)runResult(true,'挑战成功！用时 '+(45-before.time).toFixed(1)+' 秒',before);else runResult(false,'时间到 · 挑战失败，可在对话中重试',before);replan(true)}
 if(before)$('distance').textContent=keep};
const _startRun=startRun;startRun=function(story){_startRun(story);runResultT=0;replan(true)};
function cancelRun(){if(!runGame)return;const rg=runGame;runGame=null;runResult(false,'已退出挑战 · 回到田径场可重新开始',rg);replan(true)}
$('runQuit').onclick=cancelRun;
// ================= character select (start screen + settings) =================
function drawPreview(cv,g){if(!cv)return;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);const ph=(performance.now()/1000*7)%4;drawCharacter(c,cv.width/2-20,cv.height-6,g,PLAYER_PAL[g],0,false,0,1.25);drawCharacter(c,cv.width/2+20,cv.height-6,g,PLAYER_PAL[g],1,true,ph,1.25)}
let pickGender=S.appearance?.gender||null;
function pickUI(){document.querySelectorAll('.gender-opt').forEach(b=>{const on=b.dataset.g===pickGender;b.classList.toggle('selected',on);b.setAttribute('aria-checked',String(on));b.tabIndex=on||(!pickGender&&b.dataset.g==='male')?0:-1});$('startBtn').disabled=!pickGender;
 $('pickHint').textContent=pickGender?'已选择：'+(pickGender==='male'?'男主角':'女主角')+(S.intro?' · 将继续原有进度':''):(S.intro?'检测到原有存档：选好角色后继续原来的进度':'请先选择你的角色')}
document.querySelectorAll('.gender-opt').forEach(b=>{b.onclick=()=>{pickGender=b.dataset.g;pickUI()};
 b.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();e.stopPropagation();pickGender=b.dataset.g==='male'?'female':'male';pickUI();document.querySelector('.gender-opt[data-g="'+pickGender+'"]').focus()}
  else if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();if(e.key==='Enter'&&pickGender===b.dataset.g)begin();else{pickGender=b.dataset.g;pickUI()}}}});
const _begin=begin;
begin=function(){if(started)return;if(!pickGender){pickUI();notify('请先选择男主角或女主角');document.querySelector('.gender-opt').focus();return}
 if(!S.appearance||S.appearance.gender!==pickGender){S.appearance={gender:pickGender,paletteId:PLAYER_PAL[pickGender]};persist()}_begin();replan(true);rainAudioSync()};
$('startBtn').onclick=begin;
function setGender(g){S.appearance={gender:g,paletteId:PLAYER_PAL[g]};pickGender=g;persist();changeUI();notify('已更换为'+(g==='male'?'男主角':'女主角')+' · 进度不变')}
function changeUI(){document.querySelectorAll('.change-opt').forEach(b=>{const on=b.dataset.g===S.appearance?.gender;b.classList.toggle('selected',on);b.setAttribute('aria-checked',String(on))})}
document.querySelectorAll('.change-opt').forEach(b=>b.onclick=()=>setGender(b.dataset.g));

// ================= 临兵者 cameo (optional; not a landmark, no story impact) =================
const lbz=(()=>{const plaza=L('plaza');const cands=props.filter(p=>p.k==='bench'&&dist(p,plaza)<260).sort((a,b)=>dist(a,plaza)-dist(b,plaza)).map(p=>({x:p.x+16,y:p.y+4}));
 cands.push({x:plaza.x-150,y:plaza.y+30},{x:plaza.x+150,y:plaza.y+30},{x:plaza.x-150,y:plaza.y-60});
 const ok=p=>!blocked(p.x,p.y)&&LANDMARKS.every(l=>dist(p,l)>56)&&!blocked(p.x+8,p.y)&&!blocked(p.x-8,p.y);
 for(const c0 of cands){const p=snap({...c0});if(ok(p)&&!road[gi(p.x,p.y)])return p}
 for(const c0 of cands){const p=snap({...c0});if(ok(p))return p}return snap({x:plaza.x-150,y:plaza.y+30})})();
if(!S.cameos.linbingzhe||typeof S.cameos.linbingzhe!=='object')S.cameos.linbingzhe={met:false,bookmark:false,visits:0};
const lbzRec=S.cameos.linbingzhe;lbzRec.met=!!lbzRec.met;lbzRec.bookmark=!!lbzRec.bookmark;
// No `id` field: base interact() treats objects with an id as landmarks.
const lbzNpc={x:lbz.x,y:lbz.y,name:'临兵者',cameoKey:'linbingzhe',tpl:'linbingzhe',palette:'linbingzhe',dir:0,moving:false,step:0,pause:Infinity,speed:0,bike:false,line:0,road:0};
npcs.push(lbzNpc);
// Give him a bench to sit beside if the chosen spot has none nearby (placed only on free ground).
if(!props.some(p=>p.k==='bench'&&dist(p,lbzNpc)<34)){for(const[dx,dy]of[[-18,-2],[18,-2],[0,-14]]){const b={k:'bench',x:lbzNpc.x+dx,y:lbzNpc.y+dy};if(!blocked(b.x,b.y)&&!blocked(b.x-10,b.y)&&!blocked(b.x+10,b.y)){props.push(b);break}}}
const LBZ_TITLE='临兵者 · 在校园里画地图的人';
function lbzSay(text,choices,title='校园彩蛋 · 临兵者'){say(LBZ_TITLE,text,choices,title);drawPortrait('',{tpl:'linbingzhe',palette:'linbingzhe'})}
function lbzClaim(){if(!lbzRec.bookmark){lbzRec.bookmark=true;persist();chime([523,659,784,1046]);burst(lbzNpc.x,lbzNpc.y);notify('收藏「临兵者的书签」 · 解锁成就「偶遇临兵者」')}
 lbzSay('你收好那枚印着金色叶片的书签。背面只有一行小字：\n\n“愿你每次回来，都能找到自己的路。”\n\n临兵者合上本子，朝你笑了笑：“去吧，下一段故事还在前面。”',[['继续校园旅程',closeModal]],'纪念收藏 · 临兵者的书签')}
function lbzMeet(){lbzRec.met=true;lbzRec.visits=(lbzRec.visits||0)+1;persist();lbzNpc.dir=player.x<lbzNpc.x-6?2:player.x>lbzNpc.x+6?1:player.y<lbzNpc.y?3:0;
 if(lbzRec.bookmark){const line=night?'“夜里的校园更安静。白天错过的灯光，晚上会替你记着。”':S.weather==='rain'?'“下雨天的梧桐道最好看，地上的水洼里也藏着一个校园。”':'“别急着赶路，抬头看看树影。熟悉的校园，也总有第一次发现的风景。”';
  lbzSay(line+'\n\n临兵者把那本没画完的地图翻到了新的一页。',[['继续散步',closeModal],['再看看那枚书签',()=>lbzSay('书签背面写着：\n\n“愿你每次回来，都能找到自己的路。”',[['收好',closeModal]],'纪念收藏 · 临兵者的书签')]]);return}
 lbzSay('长椅旁的同学正低头在本子上画着什么。\n\n你走近时，他推了推眼镜，抬起头：\n“你好，我叫临兵者。你也在校园里找路吗？”',[
  ['你在画什么？',()=>lbzSay('“我在这里画一张校园地图。”\n\n他指了指本子上弯弯绕绕的小路：\n“只是想把熟悉的路，做成一个随时能回来的地方。”\n\n说着，他从本子里抽出一枚书签递给你。',[['收下书签',lbzClaim],['下次再聊',closeModal]])],
  ['这张地图有点眼熟。',()=>lbzSay('临兵者笑了一下：\n\n“有些路走过很多次，换成像素再走一遍，还是会有新发现。”\n\n“送你一枚书签吧。下次回来，就从你喜欢的那一页继续。”',[['收下书签',lbzClaim],['先去逛逛',closeModal]])],
  ['路过打个招呼',closeModal]])}
const _interact=interact;interact=function(){if(started&&!modal&&near&&near.cameoKey==='linbingzhe')return lbzMeet();return _interact()};$('interactBtn').onclick=interact;
const _updateNearby=updateNearby;updateNearby=function(){_updateNearby();if(near?.cameoKey==='linbingzhe'){$('nearName').textContent='临兵者';$('nearHint').textContent=lbzRec.bookmark?'按 E 和他聊两句':'在长椅旁画地图的同学 · 按 E 交谈';$('interactIcon').textContent='✎'}};
const _renderQuest=renderQuest;renderQuest=function(){_renderQuest();const b=document.createElement('span');b.className='reward'+(lbzRec.bookmark?' earned':'');b.textContent=(lbzRec.bookmark?'✓ ':'◇ ')+'偶遇临兵者';b.title=lbzRec.bookmark?'已收藏：临兵者的书签':'广场附近有位画地图的同学';$('rewards').appendChild(b)};
const _renderJournal=renderJournal;renderJournal=function(){_renderJournal();if(lbzRec.bookmark)$('journalStatus').textContent+=' · 纪念：临兵者的书签'};
// ================= hooks into render / loop =================
let frameDt=.016,lastT=performance.now();
const _render=render;
render=function(){_render();
 ctx.save();ctx.scale(zoom,zoom);ctx.translate(-camX,-camY);if(started)drawRouteWorld(ctx);rainWorld(ctx);if(started&&!modal)drawArrow(ctx);ctx.restore();
 rainScreen(ctx,frameDt)};
const _drawMap=drawMap;drawMap=function(c,cw,ch,full){_drawMap(c,cw,ch,full);const s=Math.min(cw/W,ch/H),ox=(cw-W*s)/2,oy=(ch-H*s)/2;c.save();c.translate(ox,oy);c.scale(s,s);
 if(full){c.textAlign='center';c.textBaseline='middle';for(const b of C.buildings){if(!b.n||(b.x1-b.x0)>=70&&!/舍|公寓|水房|面屋|实验室|研究所南楼/.test(b.n))continue;if((b.x1-b.x0)<40&&(b.y1-b.y0)<40)continue;const n=b.n.replace(/^.+书院·/,'').replace(/^(东|西)(\d+)舍$/,'$1$2');c.font='bold 22px Microsoft YaHei';c.fillStyle='#fff8e2';c.fillText(n,b.cx+1,b.cy+1);c.fillStyle='#3d4a3f';c.fillText(n,b.cx,b.cy)}
  for(const[n,q]of[['腾飞塔',C.pois.tengfei],['东田径场',trackPitch&&{x:trackPitch.cx,y:trackPitch.cy}]])if(q){c.font='bold 28px Microsoft YaHei';c.fillStyle='#fff8e2';c.fillText(n,q.x+1,q.y+31);c.fillStyle='#2c3a30';c.fillText(n,q.x,q.y+30)}}
 drawRouteMap(c,full);
 if(nav.target){c.strokeStyle='#ff7a2f';c.lineWidth=full?6:12;c.beginPath();c.arc(nav.target.x,nav.target.y,(full?26:44)+Math.sin(performance.now()/250)*3,0,7);c.stroke()}
 c.fillStyle='#d8392b';c.strokeStyle='#fff';c.lineWidth=full?6:10;c.beginPath();c.arc(player.x,player.y,full?16:30,0,7);c.fill();c.stroke();
 if(full){c.font='bold 30px Microsoft YaHei';c.textAlign='center';c.textBaseline='alphabetic';const tag=(x,y,txt,col)=>{const w=c.measureText(txt).width+20;c.fillStyle=col;c.fillRect(x-w/2,y-62,w,40);c.fillStyle='#fff';c.fillText(txt,x,y-32)};
  if(nav.target)tag(nav.target.x,nav.target.y,'目标 · '+nav.target.name,'#c45a1c');tag(player.x,player.y,'你在这里','#d8392b');
  if(lbzRec.met){c.fillStyle='#344760';c.beginPath();c.arc(lbzNpc.x,lbzNpc.y,9,0,7);c.fill()}}
 c.restore();if(full)$('navMsg').textContent=runGame?'计时跑进行中，导航暂停':!nav.target?'主线已完成，自由探索吧':nav.failed?'暂时找不到可走的路线：请先沿道路走向目标方向，路线会自动重新计算':'黄色线为推荐步行路线 · 约 '+Math.round(pathLen(nav.path)/2)+' 米'};
// Mission panel: walking distance along the route instead of straight-line distance.
const _refreshHUD=refreshHUD;refreshHUD=function(){_refreshHUD();if(runGame)return;if(nav.target&&nav.path&&!nav.failed){const w=nextWaypoint(),d=pathLen([[player.x,player.y],...nav.path.slice(1)]);if(d<60){$('distance').textContent='就在附近';return}const a=Math.atan2(w[1]-player.y,w[0]-player.x)*180/Math.PI;$('distance').textContent=['东 →','东南 ↘','南 ↓','西南 ↙','西 ←','西北 ↖','北 ↑','东北 ↗'][((Math.round(a/45)%8)+8)%8]+' · 步行 '+Math.round(d/2)+'m'}else if(nav.failed&&nav.target)$('distance').textContent='路线未找到'};
const _complete=complete;complete=function(i){_complete(i);replan(true)};
$('homeBtn').onclick=()=>{player.x=L('gate').x;player.y=L('gate').y;setCamera(true);replan(true);notify('回到南门')};
const fm=$('fullmap'),_fmClick=fm.onclick;fm.onclick=e=>{const bx=player.x,by=player.y;_fmClick(e);if(player.x!==bx||player.y!==by)replan(true)};
// Separate rAF for the new systems keeps the base loop untouched.
function extraLoop(now){frameDt=Math.min(.05,(now-lastT)/1000);lastT=now;if(started){navUpdate(frameDt);runHudUpdate(frameDt)}labelT+=frameDt;if(labelT>.1){placeLabels();labelT=0}
 if(!started&&!$('welcome').classList.contains('hidden')){drawPreview($('pv-male'),'male');drawPreview($('pv-female'),'female')}
 if(modal==='helpModal'){drawPreview($('cv-male'),'male');drawPreview($('cv-female'),'female')}requestAnimationFrame(extraLoop)}
requestAnimationFrame(extraLoop);

// ================= settings wiring =================
$('weatherBtn').onclick=()=>setWeather(S.weather==='rain'?'clear':'rain');
$('rainToggle').onclick=()=>{S.rainOn=!S.rainOn;persist();weatherUI();rainAudioSync()};
$('rainVol').oninput=e=>{S.rainVol=e.target.value/100;persist();rainAudioSync()};
$('labelsBtn').onclick=()=>{S.labels=!S.labels;persist();$('labelsBtn').textContent='地点提示：'+(S.labels?'显示':'隐藏')};$('labelsBtn').textContent='地点提示：'+(S.labels!==false?'显示':'隐藏');
const _sfx=$('sfxToggle').onclick;$('sfxToggle').onclick=()=>{_sfx();rainAudioSync()};
addEventListener('keydown',e=>{if(!started||e.repeat)return;const k=e.key.toLowerCase();if(k==='escape'&&runGame&&!modal){cancelRun();return}if(modal)return;if(k==='r')setWeather(S.weather==='rain'?'clear':'rain')});
addEventListener('resize',()=>placeLabels());
weatherUI();changeUI();pickUI();if(S.intro)$('startBtn').textContent='继续旅程 →';
Object.assign(window.campusGame,{nav:()=>({target:nav.target?.name,failed:nav.failed,points:nav.path?.length||0,len:nav.path?Math.round(pathLen(nav.path)):0,path:nav.path}),findPath,
 lbz:()=>({x:lbzNpc.x,y:lbzNpc.y,blocked:blocked(lbzNpc.x,lbzNpc.y),rec:{...lbzRec}}),S:()=>JSON.parse(JSON.stringify(S)),setWeather,startRun,player,
 rain:()=>({paused:rainAudio.paused,vol:rainAudio.volume}),runHud:()=>({hidden:runHud.hidden,time:$('runTime').textContent,cp:$('runCp').textContent,state:$('runState').textContent,cls:runHud.className}),
 labels:()=>labelDefs.filter(d=>d.el.style.display==='block').map(d=>d.n)});


// Full campus map: independent zoom and pan, leaving the walking camera unchanged.
const mapView={zoom:1,x:0,y:0,drag:null,moved:false};
const mapBuffer=document.createElement('canvas');mapBuffer.width=600;mapBuffer.height=780;
const drawMapBase=drawMap;
drawMap=function(c,cw,ch,full){
 if(!full)return drawMapBase(c,cw,ch,full);
 const bc=mapBuffer.getContext('2d');bc.setTransform(1,0,0,1,0,0);bc.clearRect(0,0,600,780);drawMapBase(bc,600,780,true);
 c.save();c.setTransform(1,0,0,1,0,0);c.clearRect(0,0,cw,ch);c.fillStyle='#b1bb82';c.fillRect(0,0,cw,ch);
 c.translate(cw/2+mapView.x,ch/2+mapView.y);c.scale(mapView.zoom,mapView.zoom);c.drawImage(mapBuffer,-300,-390);c.restore();
 $('mapZoomText').textContent=Math.round(mapView.zoom*100)+'%';
};
function mapRedraw(){if(modal==='mapModal')drawMap(fm.getContext('2d'),600,780,true)}
function clampMap(){mapView.x=Math.max(-300*(mapView.zoom-1),Math.min(300*(mapView.zoom-1),mapView.x));mapView.y=Math.max(-390*(mapView.zoom-1),Math.min(390*(mapView.zoom-1),mapView.y))}
function changeMapZoom(next,cx=300,cy=390){const old=mapView.zoom;next=Math.max(1,Math.min(4,next));const r=next/old;mapView.x=(mapView.x-(cx-300))*r+(cx-300);mapView.y=(mapView.y-(cy-390))*r+(cy-390);mapView.zoom=next;clampMap();mapRedraw()}
$('mapZoomIn').onclick=()=>changeMapZoom(mapView.zoom*1.3);
$('mapZoomOut').onclick=()=>changeMapZoom(mapView.zoom/1.3);
$('mapFit').onclick=()=>{mapView.zoom=1;mapView.x=0;mapView.y=0;mapRedraw()};
function mapPoint(e){const r=fm.getBoundingClientRect();return{x:(e.clientX-r.left)*600/r.width,y:(e.clientY-r.top)*780/r.height}}
fm.addEventListener('wheel',e=>{e.preventDefault();const p=mapPoint(e);changeMapZoom(mapView.zoom*(e.deltaY<0?1.2:1/1.2),p.x,p.y)},{passive:false});
fm.addEventListener('pointerdown',e=>{if(e.button!==0)return;mapView.drag={x:e.clientX,y:e.clientY,ox:mapView.x,oy:mapView.y};mapView.moved=false;fm.setPointerCapture(e.pointerId)});
fm.addEventListener('pointermove',e=>{const d=mapView.drag;if(!d)return;const r=fm.getBoundingClientRect(),dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)>4)mapView.moved=true;if(mapView.moved){mapView.x=d.ox+dx*600/r.width;mapView.y=d.oy+dy*780/r.height;clampMap();mapRedraw()}});
fm.addEventListener('pointerup',()=>{mapView.drag=null});fm.addEventListener('pointercancel',()=>{mapView.drag=null;mapView.moved=true});
fm.onclick=e=>{if(mapView.moved){mapView.moved=false;return}const r=fm.getBoundingClientRect(),p=mapPoint(e),x=(p.x-300-mapView.x)/mapView.zoom+300,y=(p.y-390-mapView.y)/mapView.zoom+390;
 const bx=player.x,by=player.y;_fmClick({target:fm,clientX:r.left+x/600*r.width,clientY:r.top+y/780*r.height});if(player.x!==bx||player.y!==by)replan(true)};
// Remove the persistence listener before reloading, otherwise it restores the deleted save on unload.
function restartJourney(){if(!confirm('重新开始会清除当前浏览器中的全部游戏进度，且无法撤销。确定重新开始吗？'))return;removeEventListener('beforeunload',persist);localStorage.removeItem(SAVE);location.reload()}
$('resetBtn').onclick=restartJourney;$('resetSettingsBtn').onclick=restartJourney;

$('restartBtn').onclick=restartJourney;
