'use strict';
(async function bootSourcePackage(){
 const cfg=window.XQ_SOURCE_CONFIG||{},status=document.getElementById('sourceSetup'),title=document.getElementById('sourceSetupTitle'),message=document.getElementById('sourceSetupText');
 const required=['gate','siyuan','xianzi','yanzhi','main','plaza','library','tengfei','sakura','yinshui','zhongyi','memorial','track','kangqiao','baijuyi','football','basket','wenti','wutong','garden'];
 const point=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.async=false;script.onload=resolve;script.onerror=()=>reject(Error('无法加载本地资源：'+src));document.body.appendChild(script)})}
 function validateMap(c){if(!c||!Number.isFinite(c.W)||!Number.isFinite(c.H)||c.W<=0||c.H<=0)throw Error('地图缺少有效的 W、H 尺寸。');for(const key of ['buildings','roads','streets','pitches','parks','water','woods','gates','plaza'])if(!Array.isArray(c[key]))throw Error('地图缺少数组字段：'+key);if(!c.wall||['x0','y0','x1','y1'].some(k=>!Number.isFinite(c.wall[k])))throw Error('地图缺少有效的 wall 边界。');if(c.wall.x0>=c.wall.x1||c.wall.y0>=c.wall.y1)throw Error('地图 wall 边界顺序不正确。');if(!point(c.pois?.tengfei))throw Error('地图缺少 pois.tengfei 位置。');if(c.gates.length<2||c.gates.some(p=>!point(p)))throw Error('地图至少需要两个有效校门，且南门应为第二项。');if(c.plaza.length<3)throw Error('地图 plaza 需要有效广场多边形。');if(!c.roads.some(r=>['unclassified','service'].includes(r.k)))throw Error('地图需要可供人物活动的主路或支路。');if(!c.roads.some(r=>/梧桐|文治|学森/.test(r.n)))throw Error('当前剧情需要至少一条名称含梧桐、文治或学森的道路。');if(!c.pitches.some(p=>/田径/.test(p.n)))throw Error('当前剧情需要一处名称含田径的运动场。')}
 if(!cfg.mapScript)return;
 try{
  title.textContent='正在加载本地地图';message.textContent='读取你自行配置的资源，不会自动联网获取地图。';
  await loadScript(cfg.mapScript);validateMap(window.CAMPUS);
  if(cfg.positionsScript)await loadScript(cfg.positionsScript);
  const positions=window.CAMPUS_LANDMARKS||window.CAMPUS.landmarks;if(!positions||required.some(id=>!point(positions[id])))throw Error('缺少完整的地标坐标，请配置 positionsScript 或在地图中提供 landmarks。');
  for(const id of required){const p=positions[id];if(p.x<0||p.y<0||p.x>window.CAMPUS.W||p.y>window.CAMPUS.H)throw Error('地标超出地图尺寸：'+id)}window.CAMPUS_LANDMARKS=positions;
  const bgm=document.getElementById('bgm');if(cfg.bgmSrc)bgm.src=cfg.bgmSrc;
  let runtimeFailure=null;const capture=e=>{runtimeFailure=e.message||'游戏代码初始化失败'};window.addEventListener('error',capture);
  for(const src of ['content.js','sprites.js','architecture.js','game.js','features.js','encounters.js','campus-life.js','people.js','exploration.js','conversations.js']){await loadScript(src);if(runtimeFailure)throw Error(runtimeFailure)}
  window.removeEventListener('error',capture);
  if(!cfg.bgmSrc){const sound=document.getElementById('soundBtn');sound.disabled=true;sound.textContent='♫ 无音源';sound.title='在 source-settings.js 配置有授权的音乐后启用';document.getElementById('volume').disabled=true}
  if(!cfg.rainSrc){document.getElementById('rainToggle').disabled=true;document.getElementById('rainToggle').textContent='雨声：未配置';document.getElementById('rainVol').disabled=true}
  status.hidden=true;document.body.classList.remove('source-pending');
 }catch(error){title.textContent='资源配置尚未完成';message.textContent=error.message+'。请参考 docs/资源接入.md。'}
})();
