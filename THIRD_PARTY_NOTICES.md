# 第三方内容与来源边界

## 本次源码包

本包未附真实校园地图几何、地标坐标表、原始地图提取数据、第三方地图图片或照片，也未附 BGM 或雨声音频。界面和角色使用浏览器系统字体及程序绘制，不附字体安装包。程序生成的互动提示音代码仍保留。

源码中保留校园名称、剧情说明和地图接口名称，不表示已附真实地图，也不表示第三方对相关文字事实、学校名称或标志授予了独占权利。自定义 LICENSE 仅适用于发布者能够授权的部分。

## OpenStreetMap

原完整版的校园布局使用过 OpenStreetMap 数据，本源码分享版已剥离相应地图文件与地标坐标表。剥离不改变原数据的许可，也不表示原地图资料可以改按本项目非商业条款发布。

今后自行接入 OSM 数据时，应独立遵守其 ODbL 许可和署名要求；数据、衍生数据库和地图展示的具体义务须根据实际使用方式判断。不能仅放一行“本项目禁止商用”代替数据许可。原数据许可允许的权利不能被本项目 LICENSE 收回。

权威来源：
- [OpenStreetMap Copyright and License](https://www.openstreetmap.org/copyright)
- [Open Data Commons Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/)
- [OSMF Attribution Guidelines](https://osmfoundation.org/wiki/Licence/Attribution_Guidelines)

地图接口中的 `source` 字段只用于说明来源，不会自动完成全部署名义务。接入者应在适当可见的界面和随附资料中展示相应署名、许可链接，并履行其他适用要求。

## 音乐、雨声、照片及地图平台

公开听到音乐、持有本地文件或在网页使用过，不等于具有再分发权。这个仓库不提供原音乐或雨声文件，也不授予对它们的使用权。自行添加时需确认可用于对应的公开展示或发布方式。

高德、天地图、Google 等地图平台的接口、数据、图片和服务各有条款。请勿因为能浏览就复制到仓库，也不要把访问密钥提交到前端公开代码。

## 新贡献

新增第三方依赖或素材时，必须记录来源与许可，保留要求保留的通知。对权属有疑问时，请先停止加入对应材料并向维护者说明。当前源码包没有捆绑 npm 第三方运行库。

## 关于“开源”名称

由于作者要求禁止商业用途，本项目使用“源码公开、非商业分享”的表述，而不宣称符合标准开源定义。参见 [OSI Open Source Definition](https://opensource.org/osd) 和 [GitHub 仓库许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。
