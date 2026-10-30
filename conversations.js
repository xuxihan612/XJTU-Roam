'use strict';
// Authored, local conversation trees. Every topic offers four player replies and keeps its place.
if(!plainRecord(S.dialogues))S.dialogues={};
const WALKER_REPLY_SEEDS={
 '学长':[
 ['你现在认路，最在意的是哪一件事？','我想自己慢慢认熟，不怕偶尔走错。','“那就先记住一个常去的地方，再从那里一点点往外走。自己的路线，常常比别人给的口诀更好记。”','我主要是赶时间时容易慌。','“那种时候先停十秒，确认一个路口，比一边着急一边绕圈更有用。也可以找个人一起走。”'],
 ['如果今天多出十分钟，你想怎么走？','我想挑一条以前没走过的小路。','“那就把它当作今天的小发现。走到一半觉得不喜欢，也随时可以换一条。”','我想和熟悉的人再走一遍老路。','“老路也会有新话题。有时候并不需要换风景，只需要换一种不赶时间的心情。”'],
 ['要是你走错路碰见别人求助，会怎么办？','我也不一定认得，但可以一起找。','“就是这样。你不必什么都知道，愿意陪着问一问，就已经能帮上忙了。”','我可能会紧张，怕把人带错。','“直接说还不熟也没关系。一起看地图，比装作知道更让人安心。”'],
 ['你也会留着这种看起来普通的小东西吗？','会，我留着一些不值钱的纪念。','“那你应该懂，重要的不是纸值多少钱，是看到它时，会不会想起当时坐在对面的人。”','我以前没想过，但现在想留一点。','“不用专门找一个盛大的时刻。今天散步时的一张小票，也可以成为以后的入口。”']
 ],
 '学姐':[
 ['你会把哪个季节留给现在的自己？','想留住秋天，走在落叶上很踏实。','“秋天像是允许人慢一点。脚下有声音，就连不说话地走一段，也不觉得空。”','我更想留下夏天漫长的傍晚。','“那种太阳还没完全落下去的时间，好像什么都来得及。以后想起，也容易想起一起等晚饭的人。”'],
 ['如果把这句话送给刚来的自己，你会怎么说？','我会告诉自己，不用急着样样都懂。','“这句话可以早点说给自己听。熟悉一座校园和熟悉一种生活，都需要一点时间。”','我想提醒自己，想尝试的事就去试试。','“可以从很小的一次开始。去坐一会儿、问一句、报个名，都算把门轻轻推开。”'],
 ['有人这样等过你吗？','有，想到那个人就觉得很暖。','“那下次见到，不妨认真说一句谢谢。有些人一直记着，却以为对方早就知道。”','好像没有，但我想成为会等人的人。','“那也是一种开始。下次大家准备出发时，回头多看一眼，就已经是在做这件事了。”'],
 ['如果再过一次那个秋天，你最想改什么？','我想少一点担心，多认识几个人。','“认识人也不一定要很会说话。认真听完一个故事，往往就能接上下一句。”','我不太想改，只想再认真感受一遍。','“这样也很好。有些紧张和笨拙，当时嫌弃，后来才发现也是那段生活的一部分。”']
 ],
 '新生':[
 ['你刚来时，会怎么记这些楼？','我也靠门口的树和台阶认地方。','“原来不只我这样！那下次走到这里，我就会先找那排台阶，再看楼名。”','我习惯先看地图，再试着自己走。','“那你比我有条理。我准备也给自己的小地图补上正式楼名，免得只认得外号。”'],
 ['这几件小事里，你最想先完成哪一件？','先找到一家常去的食堂。','“有一个不用犹豫就能走进去的地方，感觉会让新生活稳定很多。说不定还能慢慢认得窗口的人。”','想先遇到能一起散步的朋友。','“我也是。没有一定要聊的事，只是有人顺路一起走，就已经很好了。”'],
 ['今天有没有一处让你觉得自己已经熟悉一点了？','有，我终于认出了一个走过的路口。','“那个瞬间真的很开心，好像校园忽然少了一点陌生。我想把这种小进步也记下来。”','还没有，不过我不着急。','“那我们就都慢慢认。等下次见面，也许每个人都能多说出一个熟悉的地方。”'],
 ['如果以后回来，你希望自己还记得什么？','还记得现在对什么都好奇。','“那我也把这个写进本子。希望以后再看到，不会觉得现在的自己太傻，而是觉得挺勇敢。”','希望还记得一起走路的人。','“是啊，楼名忘了还能再认，人和人一起度过的时间，就更值得认真记着。”']
 ],
 '研究生':[
 ['遇到卡住的事，你一般怎么给自己留一点空隙？','先出来走走，回来再看。','“我也是这样。不是要求自己散完步就找到答案，而是先让问题不把整个人占满。”','我总想做完再休息，结果很难停下。','“我以前也常这样。后来会先记清楚卡在哪一步，告诉自己，回来还接得上，才比较容易离开桌子。”'],
 ['如果今天只有一点点进展，你会算它是好消息吗？','会，弄明白错在哪里也很重要。','“有人愿意这样听，我还挺高兴。很多进展不适合发很大的庆祝，只适合对朋友说，今天又往前挪了一点。”','我可能还是会觉得不够。','“那先不用急着说服自己满意。把已经弄明白的部分写下来，至少别让它又被下一件事盖过去。”'],
 ['散步的时候，你会刻意不想工作吗？','我想把注意力放到路和树上。','“那就看看今天的影子落在哪儿。很具体的小东西，反而容易把人带回眼前。”','有时还是会想，但没那么紧绷。','“也不必把念头赶走。它愿意跟着走，就让它慢慢走，别要求每一步都得产生结果。”'],
 ['如果今天换你问别人一起回去，你会怎么开口？','就问一句，要不要一起走？','“这句话已经很好了。很多时候，对方需要的也不是一个安排，只是知道有人想到他。”','我怕打扰别人。','“可以留一点选择：我准备回去了，你愿意的话一起。被认真邀请，同时也能自在拒绝，会舒服一些。”']
 ],
 '保洁阿姨':[
 ['同一条路天天走，你会注意到什么？','会看看树叶和路上的人。','“那你一定也见过，同一棵树，晴天和下雨就不是一个样。走熟了以后，还能看见新的东西。”','我以前总顾着赶路。','“赶路也有赶路的时候。哪天不忙，抬头看看，就算给自己添了一段不一样的时间。”'],
 ['如果只做眼前一小段，你会轻松一点吗？','会，比想着一口气做完踏实。','“对，先扫干净这一段，再往前挪一点。回头看，就知道不是没做，只是做得安静。”','我怕慢下来就落后。','“慢不一定是在停。有些事一步一步来，反而不容易把自己绕进去。”'],
 ['如果以后遇见熟悉的人，你想说什么？','想认真说一句，谢谢你一直在这里。','“这话听着就暖。我们平时碰面不一定聊很多，能互相认得，已经是一种很实在的熟悉。”','可能只会笑着打个招呼。','“笑一笑也够了。哪有每次都要讲一大段的话，知道彼此看见了，就很好。”'],
 ['今天有没有看见一点小变化？','好像刚才那片树影已经挪开了。','“你看，停下来才这一会儿，路上就又换了一种样子。明天再来，也还会有新的。”','还没有，我准备接着看看。','“那就带着一点好奇往前走。看见了不用急着告诉谁，自己心里记住也算。”']
 ],
 '保安师傅':[
 ['你会记住每天路过的面孔吗？','会，有些人虽然没说过话，也觉得熟悉。','“就是这种感觉。多见几回，一声招呼就不只是客气，是知道对方今天也好好地走过了这里。”','我不太擅长认人。','“没关系，不用急着记住所有人。先从见面时愿意点个头开始，熟悉会慢慢长出来。”'],
 ['如果毕业后回来，你第一站会去哪里？','先去以前常走的那条路。','“很多人都是这样。并不是那条路多特别，只是走过的时候，过去的日子会自己跟上来。”','想找朋友一起，再慢慢决定。','“那就先把人约上。有人同行，哪怕最后只在门口聊一会儿，也算好好回来了一趟。”'],
 ['你也期待这样一次重逢吗？','期待，想再见见很久没见的人。','“有时不必等一个特别的理由。发一句最近怎么样，也能把很长的时间轻轻接起来。”','会期待，也有点怕没话说。','“先聊眼前的路和树就行。真正熟悉的人，未必需要一句很漂亮的开场。”'],
 ['夜里走熟悉的路，你会想些什么？','会觉得这些灯让人安心。','“记得有几盏认得的灯，就知道路没有那么陌生。以后换了地方，也会慢慢找到新的。”','有时想把今天没说完的事想一想。','“那就给自己留一点路程。想明白最好，暂时想不明白，也可以先回去，明天再接着走。”']
 ],
 '外卖小哥':[
 ['不认得路时，你会更愿意问人还是看图？','我会先问问路过的人。','“一句准确的提醒，能省下好多绕路。有人还会顺手指一下门口，这种小帮忙我都会记着。”','我习惯自己看地图找。','“也好，停稳了看清楚再走。慢那一下，后面的路常常会顺很多。”'],
 ['你觉得一句普通的话也能改变一天吗？','会，我也会被一句谢谢鼓励到。','“是吧。事情不一定因此少了，可知道不是只有自己在忙，就没那么闷。”','以前没在意，之后想多说一点。','“不用专门想很大的话。接过东西时看着对方说一句，就已经不只是随口了。”'],
 ['如果今天不用赶时间，你会在哪里停一下？','想在树荫下坐一会儿。','“那一小段安静，忙的时候会觉得特别难得。我准备收工以后也给自己留一点。”','想和朋友好好吃一顿饭。','“那就别总把见面排到特别空的时候。普通的一顿饭，也值得认真约一下。”'],
 ['你等一顿饭时，最期待的是什么？','有人可以一起吃。','“那送到的就不只是饭，是大家终于能坐下来的那个时刻。想到这里，这趟路也挺有意思。”','想吃到自己熟悉的味道。','“有个不用想太多就知道喜欢的味道，也很好。忙了一天，至少这一口是稳稳当当的。”']
 ],
 '社团同学':[
 ['如果不要求一开始就擅长，你想试什么？','想参加一次表演，但有点紧张。','“紧张可以一起练。第一次能站上去、把一句话说完，就已经有下一次的基础了。”','我更想在幕后帮忙。','“幕后也很重要。有时一场活动最被大家感谢的，就是一直认真收尾的人。”'],
 ['如果来讲一张照片，你会带什么？','想带一张拍糊了但舍不得删的。','“这种往往最有故事。大家不是来评摄影技术，是来认识照片后面的那段日子。”','可能只是一张普通的路口。','“普通也很好。你为什么偏偏在那儿停下，已经足够让人想听下一句了。”'],
 ['如果活动出了意外，你希望别人怎么陪你？','一起想办法，而不是急着找谁的错。','“有人肯说先把这一步做完，真的能让人稳下来。复盘可以慢慢来，眼前先一起扛过去。”','先告诉我，没关系。','“这句话也很有用。知道失误不会让自己被丢下，才比较敢继续往前做。”'],
 ['以后大家忙起来，你会怎么保持联系？','想到对方时，就发一句近况。','“不用每次都等聊很久。哪怕只说今天路过以前的活动室，也会让人觉得那段时间还连着。”','想约一个固定的时间再聚。','“有个可以一起期待的日子，也挺好。地点不必很特别，能坐下来就行。”']
 ],
 '晨跑的同学':[
 ['今天你更想快一点，还是慢一点？','想慢慢走，看看沿途。','“那就走自己的步子。路又不会因为你慢一点，就不算数。”','想跑一段，换换心情。','“可以挑一段自己愿意的距离。不用替今天立一个很大的目标，先动起来看看。”'],
 ['运动结束后，你喜欢怎样的收尾？','想和朋友慢慢走回去。','“那一段不用赶下一圈的时间，反而最容易把想说的话聊出来。”','想找个地方安静坐一会儿。','“也好，给身体和脑子都留个转场，再去做下一件事。”'],
 ['如果今天不想跑，你还会愿意出来吗？','会，走一小段也算。','“对，先来赴约，不要求每次都一样。状态不是固定的，路可以给人留点余地。”','可能会犹豫，但想试试。','“那就先走到下一个路口。到那儿还想回去，也没有关系。”'],
 ['如果同行的人比你慢，你会怎么办？','放慢一点，听他把话说完。','“那就已经不只是在赶路了。有人愿意把步子配到一起，聊天才有地方继续。”','先问他想不想一起走。','“问一句很好。一起走是个邀请，不是要求大家非得踩同一个节奏。”']
 ],
 '图书管理员':[
 ['你会因为什么记住一本书？','某一句话刚好接住了当时的心情。','“那句话以后可能还会换一种意思。同一页隔很久再读，也像和过去的自己碰一次面。”','有人把它推荐给我。','“那读的时候，也会带着一点那个人的声音。人与书之间，有时还夹着另一段关系。”'],
 ['如果今天只读几页，你想怎样开始？','挑一本自己真的好奇的。','“好奇是很好的入口。不必先证明它足够有用，愿意翻开，就已经开始了。”','想先去看看窗边的书架。','“那就先在那里停一会儿。没有立刻找到一本想带走的，也可以只是认识一个愿意再来的地方。”'],
 ['你有特别记得的座位吗？','有，坐在那里会比较安心。','“熟悉的位置会给人一种接得上的感觉。昨天没读完的，今天坐下，好像就又能继续。”','还没有，想慢慢找一个。','“可以从一扇喜欢的窗开始。位置不是选一次就不能改，舒服的地方也会随时间变化。”'],
 ['如果你也写一枚书签，会留下什么？','写一句，读到这里的你也辛苦了。','“这句话很好。它没有催人往下读，只是在这一页等人停一停。”','想写，下次回来从这里继续。','“那就像给未来留一个温柔的入口。不要求什么时候回来，只保证回来时还接得上。”']
 ]
};
const ROLE_CONVERSATION_TURNS={
 '学长':[
 ['如果这段路不用赶时间，你想把它留给什么？','留给自己，安静看看校园。','“那就给今天挑一个自己的记号。以后回来，哪怕楼名一时忘了，也知道曾在这里认真停过。”','留给朋友，一边走一边聊天。','“我喜欢这种散步。不一定要有结论，能把一句话接到下一句，就已经很难得。”'],
 ['你会想把今天的小发现告诉谁？','想先记下来，以后再告诉别人。','“可以。不是每件值得留住的事，都得马上分享。有些话放一放，会更知道要说给谁。”','想到一个人，想今天就告诉他。','“那等会儿就发一句吧。说刚才走到一个地方，忽然想起了你，也很好。”'],
 ['下次见面，要不要接着交换各自认得的路？','好，我会带一个新路口的故事来。','“那我也留一个。下次我们就从今天没走完的地方接着聊。”','可以，不过我可能还是只走熟路。','“熟路也行。认真走过的路，每次都能多认出一点东西。”']
 ],
 '学姐':[
 ['如果今天能对自己宽松一点，你想从哪件事开始？','少催自己一点，先把眼前的事做好。','“这个决定已经很具体了。不是放弃认真，是让认真也有喘口气的地方。”','给一直想尝试的小事留一点时间。','“可以先试一小步，不用立刻决定它会成为怎样的大事。”'],
 ['有没有一句想说给身边人的话？','想说，谢谢你愿意等我。','“这句话说出来，对方大概也会记很久。被需要和被看见，常常是同一回事。”','想说，下次也让我陪你走。','“很好。关系就是这样，轮流给对方留一个位置。”'],
 ['以后想起今天，你希望先记得什么？','记得自己愿意慢一点了。','“那就把这段路当成一个提醒。什么时候再走得太急，都可以回来认一认。”','记得我们在这里认真聊过。','“我也会记着。下次路过，不用准备一个漂亮的开场，打声招呼就能接着说。”']
 ],
 '新生':[
 ['如果今天只多认得一处地方，你想选哪一种？','一个可以安心坐下来的地方。','“我也想有这样的角落。不用解释为什么来，只要知道自己可以待一会儿。”','一个能遇见同伴的路口。','“那以后说在老地方见，就不只是地图上的坐标了。”'],
 ['你觉得熟悉校园，是从记住楼名开始的吗？','也从认得一些人的声音开始。','“是啊。听见有人叫自己，周围好像就不再全是陌生的。”','从知道走错了也能找回来开始。','“这句话让我轻松了一点。原来熟悉不一定是不犯错，也可以是没那么怕走错。”'],
 ['下次见面，愿意再交换一点新发现吗？','愿意，我们都慢慢来。','“那就说好了。今天先记住这个路口，剩下的下次再补。”','好，也许到时我已经认得很多地方。','“我会替你高兴。到时候也别嫌今天的自己笨，是这一点点好奇把路认出来的。”']
 ],
 '研究生':[
 ['今天已经做成的那一小步，你准备怎么留住？','把它认真写下来。','“写下来很好。明天遇到新的问题，也能看见自己并不一直在原地。”','想和一个愿意听的人说说。','“那就说一点具体的进展。被别人认真听完，也会更觉得它确实发生过。”'],
 ['如果朋友今天没什么进展，你想对他说什么？','今天先到这里，明天还接得上。','“我也想听到这样的话。不是要求人马上振作，是替他留住下一次继续的余地。”','要不要一起出来走一段？','“这句最实用。不一定要聊问题，只是一起看见实验室之外还有路和灯。”'],
 ['这一段走完，你准备怎样回到今天？','带着一点清楚，接着做手边的事。','“那就好。散步不用解决一切，帮人把下一步看清一点，已经足够了。”','先好好吃一顿饭，再决定。','“也很好。今天的你不只有任务，还可以有一顿认真吃完的饭。”']
 ],
 '保洁阿姨':[
 ['你愿意为路过的人留一点什么吗？','一个干净、可以停下来的地方。','“这就很好。人不用知道是谁留的，也能在那一刻觉得舒服一点。”','一句简单的招呼。','“招呼很管用。见面认得、愿意问候，路就会走得亲切。”'],
 ['如果明天又走过这里，你会先看什么？','看看今天的树影变到哪里了。','“那你就有了一个自己的小约定。天天一样的路，也能这样慢慢看出不一样。”','看看有没有今天认得的人。','“有就打声招呼，没见到也不用急。大家各忙各的，路还在这里。”'],
 ['那今天这段路，准备怎么接着走？','我想慢一点，看看刚才没注意的。','“去吧，眼睛里多放一点小东西，心里就不全是赶路的事了。”','我先忙去，下次再来打招呼。','“好，忙你的。下次路过再聊，不用每次都特意停很久。”']
 ],
 '保安师傅':[
 ['如果校园里有一个让你安心的记号，会是什么？','一盏熟悉的灯。','“记得那盏灯，路就有了一个好认的拐点。人也是这样慢慢在一个地方站稳的。”','一个每次见面都会点头的人。','“这样的熟悉也很好。话不一定多，知道彼此认得，就已经有些不一样。”'],
 ['下次遇到很久没见的人，你想怎样开口？','就说，好久不见，最近怎么样？','“越普通的话，有时越接得住。先把眼前的人认真看一看，比想一句特别的话重要。”','想邀请他一起再走一遍这里。','“一边走一边说，很多想不起来的事，到了路口就会自己冒出来。”'],
 ['那我替今天的你留一句话，你想听哪一种？','愿你下一个路口顺顺当当。','“好，送给你。下次回来，记得告诉我又走到了哪里。”','愿你不管走多远，都认得回来时的路。','“这句也送给你。认不出来了就再问一问，总能慢慢找回来。”']
 ],
 '外卖小哥':[
 ['今天如果有机会向别人道谢，你想说什么？','谢谢你让我少绕了一段路。','“这句话挺好。有人愿意承认一个小帮忙，帮忙的人也会更高兴。”','谢谢你在忙的时候还认真回应我。','“忙的时候一句回应，真的能让人稳下来。我也想提醒自己多记着这一点。”'],
 ['等会儿你准备把这段路走成什么样？','不太赶，顺便看看周围。','“那就替还在赶路的人，多看一眼树荫吧。等闲下来，我也慢慢补上。”','还有事情要忙，但想少慌一点。','“先认准下一处就好。不用一下把后面所有的弯都想完。”'],
 ['下次路上再碰见，我们怎么打招呼？','互相说一句，今天也辛苦了。','“好，这句就当我们的暗号。路过听见，会觉得这一天有人认得。”','点个头就行，你先忙。','“谢谢。等哪次不赶时间，我们再把今天没说完的接上。”']
 ],
 '社团同学':[
 ['如果有一个小活动让你决定，你想留什么给大家？','留一点可以放心出错的空间。','“那第一次来的人大概会更愿意开口。知道不熟练也不会被笑，就有下一次。”','留一个能认真听别人说话的位置。','“这个位置很重要。有时候不是大家没有故事，只是还没等到愿意听的人。”'],
 ['你愿意为一次相聚做哪件小事？','提前去摆好椅子，等大家来。','“看起来很小，可一走进去有地方坐，人就知道自己是被欢迎的。”','最后再走，陪别人一起收尾。','“那活动结束以后，也不会有人觉得自己被落在后面。”'],
 ['下次我们有活动，要不要来看看？','好，我先从来坐一会儿开始。','“那就这样。来了不用马上证明自己会什么，先认识彼此。”','我还想再想想，但愿意听你讲。','“当然。你愿意问、愿意听，就已经是在靠近了，不必急着决定。”']
 ],
 '晨跑的同学':[
 ['如果今天的步子能自己定，你希望它像什么？','像一段没有人催的散步。','“那就把呼吸和路面配在一起。今天不用追谁，走完自己的这一段就行。”','像和朋友并肩走的一段路。','“那我们都记得，偶尔看看旁边的人，不只盯着前面。”'],
 ['你愿意把等一个人的时间拿来做什么？','听他说完一件小事。','“这时间就不算空着了。等他把话说完，下一段路也许就走得轻一点。”','看看天，先让自己也慢下来。','“很好。等待不一定是被耽误，也可以是一起换一换节奏。”'],
 ['接下来这一段，你准备怎么走？','我想照着自己的速度再走一会儿。','“去吧，不用替今天跑一个漂亮的成绩。愿意和自己待一会儿，就很好。”','我准备找个地方歇一歇。','“那就好好歇。下次再见，我们还可以从这个路口重新出发。”']
 ],
 '图书管理员':[
 ['如果把这段聊天也夹进一本书，你想夹在哪里？','夹在今天刚刚读懂的一页。','“那它以后就会和一种恍然明白的感觉连在一起。隔很久再翻，也容易认得。”','夹在还没有读完的地方。','“也好。没有读完，正好给下次回来留一个位置。”'],
 ['你想把一句话送给之后翻到这一页的人吗？','希望你不用着急，可以慢慢读。','“这句话没有催促，很适合留在书页之间。人知道可以停，就更愿意继续。”','希望这里有一句话，刚好陪到你。','“那就是很好的相遇。作者写下时，也许不知道以后会在什么时候被需要。”'],
 ['那我们把书签留在哪里？','留在这里，下次接着聊。','“好。我替你记着这个话题。下次不必从头介绍，就从今天停下来的地方继续。”','先收好，我还想去看看别处。','“去吧。书和路都不用一次走完，回来时认得这一页就好。”']
 ]
};
const SIDE_REPLY_SEEDS={
 photo:[['如果给今天留一个画面，你想先看见什么？','想看见平时容易忽略的小地方。','“那就别急着找最壮观的景。窗边一小片光，也可以把今天认出来。”','想把同行的人也留在画面里。','“那张照片以后会很有声音。人站在哪里、当时在笑什么，都会一起跟着回来。”'],['如果那张糊掉的照片是你拍的，你会删掉吗？','不会，我想留住当时的感觉。','“我也是。技术可以以后慢慢练，那个正在发生的瞬间却没办法重新摆一遍。”','以前可能会删，现在想再看一眼。','“再看一眼就可能发现，模糊的地方恰好是有人跑起来的证据。”']],
 food:[['如果有人记得你常点的饭，你会是什么感觉？','会觉得自己在这里也有点熟悉了。','“是啊，不一定要聊很多。隔着窗口一问还是老样子吗，就能把生分一点点消掉。”','可能会不好意思，但会很高兴。','“高兴就够了。人愿意回来、能好好吃完一顿饭，我们也跟着踏实。”'],['你最想把哪种普通的饭写进菜单？','和朋友分着吃的那一次。','“那就不只记菜名，再记一记对面坐着谁。以后翻到，味道和说笑声就都有了。”','忙完以后终于坐下来的那一顿。','“那一顿也值得认真留着。不是为了庆祝什么，只是告诉自己，今天也好好走过来了。”']],
 radio:[['如果广播前有十秒空白，你想放进什么？','想放进风吹树叶的声音。','“它很轻，但听见的时候，好像就能知道那天的天气。我想把它放在一句问候之前。”','想留给朋友说一句话。','“那这十秒就有了一个具体的人。哪怕只说我在这里，也比一长段漂亮的话更有回声。”'],['如果你听见播音员说错了，会怎么想？','会觉得有点可爱，也会跟着放松。','“那我以后紧张时就想起你这句话。原来被认真听见，不一定要求每个字都完美。”','会想，他大概也很紧张吧。','“谢谢你先想到这一层。知道听的人也愿意留一点余地，开口就没有那么难了。”']],
 cats:[['如果小猫今天没靠近，你还会觉得这次见面值得吗？','值得，看见它自在就很好。','“我也这样想。相遇不一定要留下一个摸到它的结果，有时远远认得就已经够了。”','会有一点遗憾，但愿意再等下次。','“那就把这点遗憾也留着。没有约好的见面，下次发生时才更像一个小惊喜。”'],['如果观察笔记里只有一句话，你想写哪句？','今天它在自己的节奏里过得很好。','“这句很适合。观察不是替它安排一天，只是认真看见它已经怎样度过了这一天。”','今天没有见到，但我记得它喜欢的树荫。','“没见到也算记录。树荫还在，你愿意记得，这次散步就不算空着。”']],
 bell:[['如果听见熟悉的三声车铃，你希望它在说什么？','在说，等等我，我们一起走。','“那暗号就有了最重要的意思。不是催谁快一点，是告诉后面的人还给他留着位置。”','在说，今天也好好出发吧。','“也很好。普通的一声铃，能把一个人的心情轻轻提起来，就已经有用。”'],['如果同行的人想绕一点路，你会怎么选？','我愿意陪他看看那段树荫。','“那这趟路就不只剩下终点了。多看一点、聊一点，都是一起出来的理由。”','我会先问问大家是不是都方便。','“问一句很好。同行不是把人拴在一起，是互相知道对方愿意怎样走。”']],
 stars:[['如果白天也能给校园画一颗星，你会选什么？','选每天经过的那棵树。','“那它会是一颗会换季节的星。再过一阵来画，同一个位置也能添上新的颜色。”','选一盏晚上会认得的灯。','“那它还会给人指一点方向。并不遥远，却能陪人把最后这一段路走完。”'],['你想把这张星图留给什么时候的自己？','留给偶尔走得很晚的自己。','“那就让它提醒你，路上不只有自己在赶路，还有几处熟悉的光可以认。”','留给很久以后回来看看时。','“那时再画一遍也许会不一样。可以看看哪些光还认得，哪些位置又添了新的故事。”']],
 letter:[['如果不用写得很漂亮，你最想先说什么？','想说，有些小事我一直都记得。','“那就从一件真的发生过的小事开始。等过一次、陪走一段，都比空着的大词更像我们。”','想说，以后也请把近况告诉我。','“这样告别就不是把门关上，而是先给下一次说话留一个口。”'],['如果感谢只能具体到一件事，你想选什么？','选朋友愿意等我的那一次。','“那就把当时的地方也写进去。对方一读，大概就会想起那晚你们怎么一起走回去的。”','选我没开口，他却已经看见的那一次。','“这种被看见的感觉很难忘。你写出来，也是在让对方知道，他的认真没有落空。”']]
};
const SIDE_NEXT_TURNS={
 photo:['如果照片背面还空着一行，你想写什么？','写下，今天也认真看过了校园。','“很好。它不需要证明你走过多少地方，只要能认得今天看见的这一点光。”','写下，下次想和谁一起再来。','“那照片就不只朝着过去，也替以后留了一个可以相约的地方。”'],
 food:['如果给今天这一顿饭留一句话，你想说什么？','再忙也给自己留一顿好好吃的饭。','“我把这句记住。忙起来时容易忘记自己，能认真坐下一会儿，也是在照顾今天。”','希望下次还能和同样的人一起吃。','“那就留个位置。不是非得有什么大事，一句一起吃饭吗，就能再约一回。”'],
 radio:['如果有人听到了这段广播，你希望他带走什么？','觉得今天有人认真问候过自己。','“那我就把开头念慢一点。让赶路的人也有机会听清楚，这句话里有他的位置。”','想起一个很久没联系的人。','“那就给话音后面留一点空隙。也许有人真的会在走到下个路口前，发出那一句近况。”'],
 cats:['如果下次又来这里，你准备怎样打招呼？','轻一点，等它自己决定要不要靠近。','“好，我们都替它留一点选择。它愿意的时候，相遇会自己走过来。”','先看看树荫和天气，记下有什么变化。','“那你已经有一页自己的观察笔记了。下次见面，我们可以把两天摆在一起看。”'],
 bell:['如果给同行的人留一点空间，你想怎样做？','出发前多问一句，要不要一起走。','“这句就是集合。对方愿意就来，不方便也知道自己被想到了。”','回头看看，有没有人还没跟上。','“那你已经懂这个暗号了。有时候比车铃更响的，是有人愿意回头。”'],
 stars:['如果给这组星点起一个名字，你想偏向哪一种？','像回去的路，让人觉得熟悉。','“那线就不用连得太直。有几处认得的弯，反而更像自己真正走过的路。”','像新的出发，让人想看看前面。','“那就给它留一个没连完的点。下次再走到新的地方，还能慢慢补上。”'],
 letter:['如果对方读完信以后也想回你一句，你最想收到什么？','收到一句，我也记得。','“这四个字就能让很多普通的小事重新亮起来。我想这也是写信最想确认的东西。”','收到一句，下次再一起走走。','“那这封信就没有停在告别上。它会变成下一次见面的开头。”']
};
const SHARE_TURN=['如果把刚才这一点心情留给一个人，你会怎样做？','我想先留给自己，等想清楚再说。','“当然可以。有些话先在心里安静放一会儿，不代表它不重要。”','我想今天就找个人认真聊一聊。','“那就从一件具体的小事开始。愿意把话说给谁听，本身已经是一种信任。”'];
const SIDE_LAST_TURN=['下次路过，还愿意把新的发现接着讲给我听吗？','愿意，我们从今天停下的地方继续。','“好，我会记着今天的话题。下次不必重新介绍，就从新看见的那一点说起。”','好，不过我可能只是来打声招呼。','“招呼也很好。不是每次见面都要带着一个故事，知道彼此还愿意回应，就已经够了。”'];
const MOOD_CHOICES=[
 {label:'有一点累，想慢慢走。',reply:'“那今天先不用赶。愿意的话，我们就站在这里聊一会儿，不必急着把心情整理成一句很有道理的话。”',mood:'tired'},
 {label:'想找个安静的地方待一会儿。',reply:'“我明白。有时候不是想把所有事都想通，只是想给自己留一小段没人催的时间。”',mood:'quiet'},
 {label:'今天心情很好，想和人说说。',reply:'“那真好。我愿意听。高兴的事不一定很大，讲出来的时候，常常还会再亮一下。”',mood:'happy'}
];
function conversationInfo(route){
 if(route.kind==='walker'||route.kind==='mood'){const npc=route.npc||npcs.find(p=>p.walkerKey===route.walkerKey);if(!npc?.walkerKey)return null;const topic=Math.max(0,Math.min(3,Number(route.topic)||0)),base=WALKER_TOPICS[npc.name]||WALKER_TOPICS['学长'];return{key:'walker:'+npc.walkerKey,route:{kind:route.kind,walkerKey:npc.walkerKey,topic},npc,name:npc.name,title:route.kind==='mood'?'说说今天的心情':base[topic][0],opening:route.kind==='mood'?'对方放慢了语气，认真看着你。\n\n“刚才一直在说路上的事。你今天怎么样？”':base[topic][1],seed:route.kind==='mood'?null:WALKER_REPLY_SEEDS[npc.name][topic],turns:ROLE_CONVERSATION_TURNS[npc.name],look:{gender:npc.gender,palette:npc.palette}}}
 if(route.kind==='side'){const d=SIDE_STORIES.find(d=>d.key===route.key);if(!d)return null;const topic=route.topic===1?1:0,npc=sideNpcs.find(p=>p.sideKey===d.key);return{key:'side:'+d.key,route:{kind:'side',key:d.key,topic},npc,name:d.name,title:d.topics[topic][0],opening:d.topics[topic][1],seed:SIDE_REPLY_SEEDS[d.key][topic],turns:[SIDE_NEXT_TURNS[d.key],SHARE_TURN,SIDE_LAST_TURN],look:{gender:d.gender,palette:d.palette},side:d}}
 if(route.kind==='cameo'){const topic=route.topic===1?1:0;return{key:'cameo:linbingzhe',route:{kind:'cameo',topic},npc:lbzNpc,name:'临兵者',title:topic?'想留给回来的人什么':'地图上留白的地方',opening:topic?'临兵者把铅笔夹进本子，想了一会儿：\n\n“我想让回来的人知道，今天没走完也没关系。地图不是一张催人完成的清单，而是随时能接着走的地方。”':'临兵者摊开没画完的地图，指着一小块留白：\n\n“最难画的不是楼和路，是每个人心里的路线。同一个路口，有人第一次经过，有人走了很多年，想起的事情却完全不同。”',seed:topic?['如果以后回来，你想先找回什么？','想找回当时一起走路的感觉。','“那就先从认得的人开始。哪怕人不在旁边，走到熟悉的地方，那些话也许还会接回来。”','想带着新的自己，再认一遍校园。','“也很好。地图可以一样，走在上面的人会慢慢有新的目光。”']:['如果地图里有一处留白，你想放进什么？','放进一个自己记得的小路口。','“那就留给你。它不一定是最著名的地方，却可以是你一眼就认得的。”','放进和朋友一起走过的一段路。','“那这块留白就有了声音。以后看到，不只记得去哪里，还会记得和谁一起。”'],turns:[['如果给这块留白起个名字，你想怎么叫它？','叫它，今天认真走过的地方。','“这个名字很好。它不要求你走多远，只认你有没有真的看见脚下这一段。”','叫它，下次还想再来的地方。','“那它还朝着未来开着。等下次回来，说不定你会愿意往里再添一点。”'],SHARE_TURN,SIDE_LAST_TURN],look:{tpl:'linbingzhe',palette:'linbingzhe'}}}
 return null;
}
function nodeChoices(node){return[{label:node[1],reply:node[2]},{label:node[3],reply:node[4]}]}
function conversationChoices(info,state){return state.step===0?(info.route.kind==='mood'?MOOD_CHOICES:nodeChoices(info.seed)):nodeChoices(info.turns[state.step-1])}
function rememberReply(info,state,choice){if(info.route.kind==='walker'||info.route.kind==='mood'){const rec=walkerRec(info.npc);if(choice.mood)rec.mood=choice.mood;rec.lastTalk={topic:info.title,reply:choice.label}}else if(info.side)sideRec(info.side.key).lastTalk={topic:info.title,reply:choice.label};else lbzRec.lastTalk={topic:info.title,reply:choice.label}}
function validConversation(state){return plainRecord(state)&&plainRecord(state.route)&&['walker','mood','side','cameo'].includes(state.route.kind)&&typeof state.ended==='boolean'&&state.ended===(state.step===4)&&Number.isInteger(state.step)&&state.step>=0&&state.step<=4&&Array.isArray(state.history)&&state.history.length<=12&&state.history.every(m=>plainRecord(m)&&['player','npc'].includes(m.who)&&typeof m.text==='string'&&m.text.length<2000)&&Array.isArray(state.path)&&state.path.length<=4}
for(const key of Object.keys(S.dialogues))if(!validConversation(S.dialogues[key]))delete S.dialogues[key];
function openCampusDialogue(route,forceNew=false){const info=conversationInfo(route);if(!info)return;let state=S.dialogues[info.key];const same=validConversation(state)&&JSON.stringify(state.route)===JSON.stringify(info.route);if(forceNew||!same||state.ended){state={route:info.route,step:0,path:[],history:[{who:'npc',text:info.opening+(info.seed?'\n\n“'+info.seed[0]+'”':'')}],ended:false};S.dialogues[info.key]=state;persist()}renderCampusDialogue(info.key)}
function resumeCampusDialogue(key){const state=S.dialogues[key];if(!validConversation(state))return;renderCampusDialogue(key)}
function pickCampusReply(key,index){const state=S.dialogues[key];if(!validConversation(state)||state.ended)return;const info=conversationInfo(state.route);if(!info)return;const choice=conversationChoices(info,state)[index];if(!choice)return;state.history.push({who:'player',text:choice.label});state.path.push(choice.label);state.step++;let text=choice.reply;if(state.step<4)text+='\n\n“'+info.turns[state.step-1][0]+'”';state.history.push({who:'npc',text});state.ended=state.step===4;rememberReply(info,state,choice);persist();renderCampusDialogue(key)}
function conversationBack(info){if(info.route.kind==='walker'||info.route.kind==='mood')meetWalker(info.npc,false);else if(info.side)sideMeet(info.side);else lbzMeet()}
function keepConversation(key){const state=S.dialogues[key],info=state&&conversationInfo(state.route);if(!info)return;if(!Array.isArray(S.preferences.talkNotes))S.preferences.talkNotes=[];const quote=state.history.filter(m=>m.who==='npc').at(-1)?.text||info.opening;if(!S.preferences.talkNotes.some(n=>n.person===info.name&&n.topic===info.title&&n.quote===quote)){S.preferences.talkNotes.push({person:info.name,topic:info.title,quote});S.preferences.talkNotes=S.preferences.talkNotes.slice(-12);persist()}renderCampusDialogue(key);$('conversationHint').textContent='这句话已留在手帐的「散步收藏」里。'}
function renderCampusDialogue(key){const state=S.dialogues[key],info=state&&conversationInfo(state.route);if(!info||!validConversation(state))return;say(info.name,'',[],info.title);drawPortrait('',info.look);$('storyModal').classList.add('conversation-mode');const log=document.createElement('div');log.className='conversation-log';log.setAttribute('role','log');log.setAttribute('aria-label','与'+info.name+'的对话记录');log.setAttribute('aria-live','off');for(const message of state.history){const line=document.createElement('article');line.className='conversation-line '+message.who;const speaker=document.createElement('strong');speaker.textContent=message.who==='player'?'你':info.name;const text=document.createElement('p');text.textContent=message.text;line.append(speaker,text);log.appendChild(line)}$('storyContent').appendChild(log);
 const hint=document.createElement('p');hint.id='conversationHint';hint.className='conversation-hint';hint.textContent=state.ended?'这一段话已经聊完，可以换个话题，也可以留下一句纪念。':'选一句你想回答的话，对方会接着回应。';$('storyContent').appendChild(hint);
 if(!state.ended)conversationChoices(info,state).forEach((choice,index)=>addChoice(choice.label,()=>pickCampusReply(key,index),index===0));else{addChoice('还有一个话题，想接着问你',()=>conversationBack(info),true);addChoice('把刚才的一句话留进手帐',()=>keepConversation(key))}
 const tools=document.createElement('div');tools.className='conversation-tools';for(const [label,fn]of [['换个话题',()=>conversationBack(info)],[state.ended?'那下次见，祝你今天顺利':'先走一会儿，下次接着聊',closeModal]]){const b=document.createElement('button');b.className='close';b.textContent=label;b.onclick=fn;tools.appendChild(b)}$('storyChoices').appendChild(tools);$('storyModal').querySelector('.story-note').textContent='你们聊到的位置会自动保存。再次见面，可以接着刚才的话题。';log.scrollTop=log.scrollHeight;$('storyChoices').querySelector('.choice')?.focus({preventScroll:true})}
walkerMood=function(p){openCampusDialogue({kind:'mood',npc:p,topic:0})};
function addConversationResume(key){const state=S.dialogues[key];if(validConversation(state)&&!state.ended&&state.step>0)addChoice('接着刚才没聊完的话',()=>resumeCampusDialogue(key))}
const conversationalWalker=meetWalker;meetWalker=function(p,enter=true){conversationalWalker(p,enter);addConversationResume('walker:'+p.walkerKey);const memory=walkerRec(p).lastTalk;if(memory){const line=document.createElement('p');line.className='memory-line';line.textContent='对方还记得，你们上次聊到「'+memory.topic+'」。';$('storyContent').appendChild(line)}};
const conversationalSide=sideMeet;sideMeet=function(d){conversationalSide(d);addConversationResume('side:'+d.key)};
const conversationalCameo=lbzMeet;lbzMeet=function(){conversationalCameo();for(const [label,topic]of [['地图上最难画的是什么？',0],['想给未来回来的人留句话吗？',1]]){const button=[...$('storyChoices').querySelectorAll('button')].find(b=>b.textContent===label);if(button)button.onclick=()=>openCampusDialogue({kind:'cameo',topic});else addChoice(label,()=>openCampusDialogue({kind:'cameo',topic}))}addConversationResume('cameo:linbingzhe')};
const conversationJournal=renderJournal;renderJournal=function(){conversationJournal();const notes=S.preferences.talkNotes;if(!Array.isArray(notes)||!notes.length)return;const section=document.createElement('section');section.className='conversation-notes';const title=document.createElement('h3');title.textContent='路上听见的话';section.appendChild(title);for(const note of notes.slice(-12)){if(!plainRecord(note)||typeof note.quote!=='string')continue;const card=document.createElement('article');const head=document.createElement('strong');head.textContent=note.person+' · '+note.topic;const text=document.createElement('p');text.textContent=note.quote;card.append(head,text);section.appendChild(card)}$('livingJournal').appendChild(section)};
Object.assign(window.campusGame,{openCampusDialogue,resumeCampusDialogue,pickCampusReply,meetWalker,dialogues:()=>JSON.parse(JSON.stringify(S.dialogues))});
