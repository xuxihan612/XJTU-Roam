'use strict';
// Optional campus encounters. Progress is separate from the main story and landmark stamps.
if(!S.sideStories||typeof S.sideStories!=='object'||Array.isArray(S.sideStories))S.sideStories={};
const SIDE_STORIES=[
 {key:'photo',name:'林岚 · 校园摄影社',gender:'female',palette:'female-npc-mauve',place:'sakura',dx:-65,dy:45,title:'把树影装进口袋',reward:'树影明信片',hint:'樱花道附近，有人正对着空枝取景。',objectives:[['garden','东花园的水面'],['plaza','四大发明广场的光影'],['main','教学主楼的轮廓']],
 intro:'樱花道旁，一位同学举着相机，镜头却没有对准花。\n\n“别动——刚才那片叶子的影子，正好落在你脚边。”\n她放下相机，有点不好意思地笑了：“我叫林岚，摄影社的。今天在拍一组《没有花开的日子》。”',
 topics:[['没有花也能拍吗？','“当然。开花的时候大家都抬头，花落以后，反而更容易看见树枝的线条。”\n\n她翻给你看刚拍的照片：车铃旁的一小块阳光，石阶上半干的雨痕，还有一扇没关严的窗。\n\n“我以前总想拍一张最像校园的照片，后来发现，校园根本装不进一张照片里。”'],['你最喜欢哪一张照片？','“一张拍糊了的。”\n\n林岚笑着把相机转过来。照片里只有奔跑的人影和长长的树荫。\n\n“那天社团活动结束得很晚，朋友喊我快点跟上。我边跑边按了快门。技术上完全不合格，可每次看到，我都会想起当时的笑声。”']],
 request:'“帮我选三个取景地吧：东花园、四大发明广场、教学主楼。不用操作相机，走近看看就好。”\n\n“回来告诉我，你会把怎样的校园留给未来的自己？”',
 finish:'你把沿途看到的水光、广场和楼影讲给她听。林岚认真记在相机背带挂着的小本子上。\n\n“原来同一条路，换个人走，就会长出另一组照片。”\n\n她递来一张空白明信片：“正面留给你看到的风景，背面留给你想寄的人。没有想好也没关系，先收着。”',
 after:'“照片不一定要马上洗出来，故事也不一定要今天讲完。下次见面，带一张你最舍不得删的照片来吧。”'},
 {key:'food',name:'周师傅 · 食堂窗口',gender:'male',palette:'male-npc-brown',place:'wutong',dx:-65,dy:45,title:'一碗热气里的校园',reward:'手写菜单',hint:'梧桐苑附近，一位师傅拿着写满字的小本子。',objectives:[['wutong','梧桐苑'],['kangqiao','康桥苑']],
 intro:'食堂旁的树荫里，一位师傅正用铅笔改菜单。看到你，他把本子往旁边挪了挪。\n\n“同学，刚下课？我姓周，今天想写一份特别的菜单。菜名不难，难的是写出大家为什么会记得这一顿饭。”',
 topics:[['你记得学生爱吃什么吗？','“常来的人，多少记得一点。这个不吃香菜，那个多要半勺汤，还有人每次都先问今天有没有茄子。”\n\n他停了一下，笑着说：“有时候几个月没见，再来时就变成了‘师傅，我毕业了，回来看看’。这时候我反倒不知道说什么，只能问一句，还和以前一样？”'],['这份菜单为什么特别？','他把本子翻到最后一页，上面不是菜名，而是几句话：‘考完试的晚饭’、‘和室友分着吃的一份面’、‘雨天端回去的热汤’。\n\n“吃的其实都普通。可是有人记得，那就不普通了。”']],
 request:'“帮我去梧桐苑和康桥苑各走一趟，看看你喜欢哪里的气氛。回来不用评高低，告诉我一顿饭里最想留住什么就行。”',
 finish:'你把两处食堂的见闻告诉周师傅。他听得很慢，最后在本子上写下：\n\n“菜单之外，还有相聚。”\n\n他撕下一张抄好的菜单递给你：“收着。这张不点菜，就当提醒自己——再忙，也要好好吃饭。”',
 after:'“今天也记得按时吃饭。有空和朋友一起，没空自己慢慢吃，也是一顿值得认真对待的饭。”'},
 {key:'radio',name:'小夏 · 校园广播站',gender:'female',palette:'female-npc-terracotta',place:'siyuan',dx:70,dy:55,title:'寄给傍晚的一段声音',reward:'傍晚点歌单',hint:'思源活动中心附近，有位戴着耳机整理稿子的同学。',objectives:[['xianzi','宪梓堂外'],['track','东田径场旁']],
 intro:'思源活动中心旁，小夏摘下一边耳机，手里的稿纸被风吹得哗啦响。\n\n“你有听过校园里的声音吗？我是说，除了上课铃和手机提示音以外的。”\n\n她指了指录音笔：“我想做一期《兴庆的傍晚》，可是稿子写着写着，就只剩下漂亮的形容词了。”',
 topics:[['为什么不直接放一首歌？','“歌当然要放，但我想在歌前面留十秒钟。”\n\n她按下录音笔。短短一段声音里，有单车经过，有人笑着喊同伴，远处还有球落地的回响。\n\n“十秒钟很短，可听见熟悉的声音，离开很久的人也许一下就回来了。”'],['你会紧张吗？','“会。第一次播音，我把‘傍晚好’说成了‘早上好’。”\n\n她捂着脸笑了一会儿，又认真起来：“后来有人留言说，那天特别累，听到说错反而笑了。原来不够完美，也可以陪到别人。”']],
 request:'“能不能替我去宪梓堂外和东田径场旁听一听？不用带回录音，走近停一停，回来讲讲你会在那十秒钟里留下什么。”',
 finish:'你讲起路上的脚步和球场边的声音。小夏把原稿划掉了一大段，重新写下开头：\n\n“傍晚好，正在兴庆散步的你。今天的第一首歌，送给认真走过这一天的人。”\n\n她把一张点歌单递给你：“先留着。等你想起要送给谁，再写上名字。”',
 after:'“今晚的开场白已经有了。谢谢你提醒我，写校园之前，要先走进校园。”'},
 {key:'cats',name:'程同学 · 校园猫观察员',gender:'male',palette:'male-npc-sage',place:'garden',dx:65,dy:65,title:'猫咪有自己的路线',reward:'猫爪观察卡',hint:'东花园附近，有人拿着本子观察草丛。',objectives:[['cat0','和橘座打招呼'],['cat2','和雪球打招呼']],
 intro:'草丛边的同学朝你做了个轻一点的手势。你以为他发现了什么秘密，低头才看见本子上歪歪扭扭的猫爪。\n\n“我姓程，在做校园猫观察笔记。不是给它们安排路线，是怕自己又认错猫。”',
 topics:[['它们认识你吗？','“也许认识，也许只是认识这个每天绕远路的人。”\n\n他说着把本子合上：“看见不等于一定要靠近，愿意让你摸也不等于今天就想被打扰。保持一点距离，反而能看见它们最自在的样子。”'],['观察笔记里都写什么？','“橘座喜欢图书馆附近，雪球常在东花园一带。天气不同，藏身的地方也不同。”\n\n你翻开本子，发现最后一页写着：‘没有见到，也算一次观察。’\n\n“它们又不用每天来上班，”他认真地说，“散步的人应该有耐心。”']],
 request:'“如果路上碰到橘座和雪球，就分别和它们打个招呼吧。图书馆附近找橘座，东花园一带找雪球。回来我们把观察卡补齐；以前已经认识的猫也算。”',
 finish:'程同学听完你的见闻，在两只猫的名字后面各画了一枚小爪印。\n\n“今天它们也按自己的节奏过得很好。”\n\n他把一张观察卡递给你，背面写着：‘愿意停下来的人，总会遇见一点温柔。’\n\n“下次不用特意找我，路过时轻轻打个招呼就好。”',
 after:'“今天有没有遇见它们？没有也不要紧。校园里总还有一片树荫，替它们留着午睡的位置。”'}
];
function sideRec(key){let r=S.sideStories[key];if(!r||typeof r!=='object'||Array.isArray(r))r=S.sideStories[key]={};r.met=!!r.met;r.active=!!r.active;r.done=!!r.done;if(!Array.isArray(r.seen))r.seen=[];return r}
function sideSpawn(d){const l=L(d.place),origin={x:l.x+d.dx,y:l.y+d.dy};for(let r=0;r<=96;r+=12)for(let i=0;i<(r?16:1);i++){const a=i*Math.PI/8,p={x:Math.round(origin.x+Math.cos(a)*r),y:Math.round(origin.y+Math.sin(a)*r)};if(!blocked(p.x,p.y)&&!blocked(p.x-8,p.y)&&!blocked(p.x+8,p.y)&&LANDMARKS.every(q=>dist(p,q)>58)&&npcs.every(q=>dist(p,q)>24))return p}return snap(origin)}
const sideNpcs=SIDE_STORIES.map(d=>{const p={...sideSpawn(d),name:d.name,gender:d.gender,palette:d.palette,sideKey:d.key,pause:Infinity,speed:0,bike:false,dir:0,step:0,moving:false};npcs.push(p);sideRec(d.key);return p});
function sideSay(d,text,choices){say(d.name,text,choices,'校园支线 · '+d.title);drawPortrait('',{gender:d.gender,palette:d.palette});$('storyModal').querySelector('.story-note').textContent='可随时离开；回来与这位同学交谈即可继续。支线不影响主线。'}
function sideProgress(d){const r=sideRec(d.key);return d.objectives.map(([key,name])=>(r.seen.includes(key)?'✓ ':'○ ')+name).join('\n')}
function sideAccept(d){const r=sideRec(d.key);r.active=true;persist();sideSay(d,d.request+'\n\n'+sideProgress(d),[['出发，沿途看看',closeModal],['再听听你的故事',()=>sideMeet(d)]]);notify('接到校园支线「'+d.title+'」 · 手帐中可查看')}
function sideClaim(d){const r=sideRec(d.key);if(r.seen.length<d.objectives.length)return sideMeet(d);if(!r.done){r.done=true;persist();chime();notify('收藏「'+d.reward+'」')}sideSay(d,d.finish,[['收好纪念，继续漫游',closeModal],['再聊一会儿',()=>sideMeet(d)]])}
function sideMeet(d){const r=sideRec(d.key);r.met=true;persist();const p=sideNpcs.find(p=>p.sideKey===d.key);p.dir=player.x<p.x-8?2:player.x>p.x+8?1:player.y<p.y?3:0;
 const environmental=S.weather==='rain'?'\n\n雨点落在一旁的树叶上，你们把声音放轻了一些。':night?'\n\n路灯亮了起来，对话在安静的夜色里慢慢展开。':'';
 const choices=d.topics.map(([q,text],topic)=>[q,()=>openCampusDialogue({kind:'side',key:d.key,topic})]);
 let text=r.done?d.after:r.active?'你再次找到'+d.name.split(' · ')[0]+'。\n\n'+d.request+'\n\n'+sideProgress(d):d.intro;
 if(r.done)text+='\n\n你已经收藏了「'+d.reward+'」。';else if(r.active){if(r.seen.length===d.objectives.length)choices.unshift(['分享沿途见闻，领取纪念',()=>sideClaim(d)]);else choices.unshift(['看看还要去哪里',()=>sideSay(d,sideProgress(d)+'\n\n不必赶路，回来的时候我还在这里。',[['明白了，继续探索',closeModal]])])}else choices.unshift(['有什么我能帮忙的吗？',()=>sideAccept(d)]);
 choices.push(['下次再聊',closeModal]);sideSay(d,text+environmental,choices)}
const sidePreviousInteract=interact;interact=function(){if(started&&!modal&&near?.sideKey){const d=SIDE_STORIES.find(d=>d.key===near.sideKey);return sideMeet(d)}return sidePreviousInteract()};$('interactBtn').onclick=interact;
const sidePreviousNearby=updateNearby;updateNearby=function(){sidePreviousNearby();if(near?.sideKey){const d=SIDE_STORIES.find(d=>d.key===near.sideKey),r=sideRec(d.key);$('nearName').textContent=d.name;$('nearHint').textContent=(r.done?'纪念已收藏 · ':r.active?'支线 '+r.seen.length+'/'+d.objectives.length+' · ':'校园故事 · ')+'按 E 交谈';$('interactBtn').textContent='交谈 E';$('interactIcon').textContent=r.done?'✓':'…'}};
let sideTimer=0;function sideTick(now){if(started&&!modal&&now-sideTimer>350){sideTimer=now;let changed=false;for(const d of SIDE_STORIES){const r=sideRec(d.key);if(!r.active||r.done||d.manualExplore)continue;for(const [key,name] of d.objectives){if(r.seen.includes(key))continue;const met=key.startsWith('cat')?S.cats.includes(Number(key.slice(3))):dist(player,L(key))<78;if(met){r.seen.push(key);changed=true;notify('「'+d.title+'」 '+r.seen.length+'/'+d.objectives.length+' · '+name+(r.seen.length===d.objectives.length?'，回去分享见闻吧':''))}}}if(changed)persist()}requestAnimationFrame(sideTick)}requestAnimationFrame(sideTick);
const sideJournal=renderJournal;renderJournal=function(){sideJournal();let section=$('sideJournal');if(!section){section=document.createElement('section');section.id='sideJournal';$('journalModal').querySelector('.stamp-grid').after(section)}section.replaceChildren();const h=document.createElement('h3');h.textContent='校园里的人与故事';section.appendChild(h);for(const d of SIDE_STORIES){const r=sideRec(d.key),card=document.createElement('article');card.className='side-card'+(r.done?' completed':'');const title=document.createElement('strong');title.textContent=(r.done?'✓ ':r.active?'◇ ':'○ ')+d.title;const body=document.createElement('p');body.textContent=r.done?'纪念收藏：'+d.reward:r.active?sideProgress(d)+'\n回到'+d.name.split(' · ')[0]+'身边分享见闻。':d.hint;card.append(title,body);section.appendChild(card)}const note=document.createElement('p');note.className='quiet';note.textContent='支线纪念独立保存，不计入20枚地标印章。人物和故事为虚构。';section.appendChild(note)};
const sideRender=render;render=function(){sideRender();if(!started||modal)return;ctx.save();ctx.scale(zoom,zoom);ctx.translate(-camX,-camY);for(const p of sideNpcs){if(!inView(p.x,p.y,20)||dist(player,p)>220)continue;const r=sideRec(p.sideKey);ctx.textAlign='center';ctx.font='bold 9px Microsoft YaHei';ctx.fillStyle=r.done?'#e1edc6':'#f5d478';ctx.strokeStyle='#385246';ctx.lineWidth=2;const mark=r.done?'✓':r.active?'…':'?';ctx.strokeText(mark,p.x,p.y-25);ctx.fillText(mark,p.x,p.y-25)}ctx.restore()};
const oldLbzMeet=lbzMeet;lbzMeet=function(){oldLbzMeet();addChoice('地图上最难画的是什么？',()=>lbzSay('临兵者想了一会儿，指着本子上一块空白。\n\n“是大家自己的路线。地图上画的是同一条路，有人第一次去上课，有人刚和朋友告别，也有人只是想绕远一点。”\n\n他推了推眼镜：“所以我把一些地方留白。等你走过去，才知道那里应该放什么。”',[['回到刚才的话题',lbzMeet],['我也去走一走',closeModal]]));addChoice('想给未来回来的人留句话吗？',()=>lbzSay('“不用急着把所有地方都走完。”\n\n临兵者把铅笔夹进本子里。\n“今天没能完成的任务，下次还可以继续。忘了楼名，就重新认一遍；走错了路，也许正好遇见一段支线。”\n\n“重要的是，你愿意回来。”',[['谢谢，下次见',closeModal],['再聊聊校园地图',lbzMeet]]))};
Object.assign(window.campusGame,{sideStories:()=>SIDE_STORIES.map(d=>({key:d.key,title:d.title,reward:d.reward,npc:{...sideNpcs.find(p=>p.sideKey===d.key)},progress:JSON.parse(JSON.stringify(sideRec(d.key)))}))});
