'use strict';
// Game content: landmarks, story, NPCs and collectibles.
// Map positions come from local configuration (north up); no coordinate table is bundled.
const LANDMARKS=[
 {id:'gate',name:'南门',seal:'初见',desc:'从南门走进兴庆校区。北边是思源活动中心和主楼，沿中轴线一路向北就能走到北门。'},
 {id:'siyuan',name:'思源学生活动中心',seal:'青春',desc:'思源活动中心面朝南门，门前是圆形喷泉。社团招新、晚会和展览常在这里举办。'},
 {id:'xianzi',name:'宪梓堂',seal:'弦歌',desc:'宪梓堂由曾宪梓先生捐资兴建，是校园里举办报告会和演出的礼堂。'},
 {id:'yanzhi',name:'胭脂坡',seal:'树影',desc:'主楼南侧的小坡地，树木成荫。课间在这里坐一会儿，能听见很多鸟叫。'},
 {id:'main',name:'教学主楼',seal:'求索',desc:'主楼由 A、B、C、D 四座围绕中央的 E 座组成，E 座高耸在校园中轴线上。'},
 {id:'plaza',name:'四大发明广场',seal:'灵感',desc:'图书馆南面的广场，立着指南针、造纸术、印刷术和火药的主题雕塑。'},
 {id:'library',name:'钱学森图书馆',seal:'书香',desc:'以校友钱学森命名的图书馆。屋顶层层退台，从高处看还铺着绿色屋顶花园。'},
 {id:'tengfei',name:'腾飞塔',seal:'腾飞',desc:'腾飞塔立在校园中轴线的水池中，南望图书馆，北接中心楼群。'},
 {id:'sakura',name:'樱花道',seal:'樱落',desc:'樱花东道与樱花西道夹着腾飞塔。每年春天花开时，这里是全校最热闹的地方。'},
 {id:'yinshui',name:'饮水思源纪念碑',seal:'思源',desc:'北门内的饮水思源纪念碑，四个字提醒每一位交大人不忘来处。'},
 {id:'zhongyi',name:'中一楼',seal:'红瓦',desc:'中一、中二、中三楼是校园早期的红瓦坡顶建筑，砖墙、红窗框，很有年代感。'},
 {id:'memorial',name:'西迁纪念馆',seal:'初心',desc:'1956 年起，交通大学主体由上海迁往西安。纪念馆记录了这段西迁历史。'},
 {id:'track',name:'东田径场',seal:'奔跑',desc:'红色跑道围着绿茵场。傍晚这里总有人在夜跑。'},
 {id:'kangqiao',name:'康桥苑',seal:'烟火',desc:'东区的食堂康桥苑，一日三餐都很热闹。'},
 {id:'baijuyi',name:'白居易故居遗址',seal:'长安',desc:'据记载，唐代长安新昌坊一带曾是诗人白居易的居所，如今这里是校园东区的一角。'},
 {id:'football',name:'东南足球场',seal:'绿茵',desc:'东区的足球场，周末常有院系联赛。'},
 {id:'basket',name:'西篮球场',seal:'三分',desc:'西区的篮球场，一到下午就站满了打球的人。'},
 {id:'wenti',name:'文体中心',seal:'活力',desc:'大学生文体活动中心，室内场馆可以打羽毛球、游泳和上体育课。'},
 {id:'wutong',name:'梧桐苑',seal:'人间',desc:'西区的梧桐苑食堂。秋天门外的梧桐叶落满一地。'},
 {id:'garden',name:'东花园',seal:'池畔',desc:'腾飞塔东侧的东花园，有一汪弯曲的小池塘。'}
];
// Coordinates are provided separately by the local map owner; none are bundled.
for(const landmark of LANDMARKS)Object.assign(landmark,window.CAMPUS_LANDMARKS[landmark.id]);

const CHAPTERS=[
 {place:'library',title:'书页里的第一站',task:'去钱学森图书馆找馆员，答对三道校史题',reward:'书香书页'},
 {place:'plaza',title:'四大发明的暗号',task:'在四大发明广场解开配对谜题',reward:'灵感书页'},
 {place:'main',title:'寄给明天的信',task:'把信送到教学主楼前的同学手中',reward:'求索书页'},
 {place:'kangqiao',title:'记住校园的味道',task:'在康桥苑完成记忆点餐',reward:'烟火书页'},
 {place:'track',title:'田径场上的风',task:'在东田径场限时跑过四个打卡点',reward:'奔跑书页'},
 {place:'tengfei',title:'风吹散的三页',task:'在腾飞塔两侧的花园与樱花道找齐三张散页',reward:'花影书页'},
 {place:'memorial',title:'西迁的来信',task:'去西迁纪念馆听一段校史',reward:'初心书页'},
 {place:'yinshui',title:'饮水思源',task:'到北门内的饮水思源纪念碑写下最后一页',reward:'兴庆拾光人'}
];
