# 将这份源码发布到 GitHub

## 上传前确认

本目录是一份独立分享版，原完整版和原部署 ZIP 不在其中。上传的是本目录里的源文件与说明文档，不是完整游戏部署包。读者缺少地图资源时看到说明页，属于预期行为。

先通读根目录 `LICENSE`。它按作者已经确定的“允许学习、修改和分享，禁止商用和盈利”写成，是自定义许可；不要再加 MIT、Apache 或 GPL。GitHub 可能无法识别其类型，不代表许可文件丢失。正式授权安排可请专业人士核验。

确认 `source-settings.js` 四项均为 `null`，本目录没有 `private/`、`campus-data.js`、真实坐标表、音频、地图截图、完整游戏 ZIP、存档或密钥。

## 在网页创建仓库

1. 登录 GitHub，点击右上角“＋”，选择 New repository。
2. 仓库名建议 `xingqing-roam`，也可以自行取名。
3. Description 可填：“兴庆漫游：西安交通大学兴庆校区像素校园探索游戏。源码公开，仅限非商业使用；本仓库不附地图数据和音乐。”
4. 选择 Public。
5. 不勾选自动添加 README；`.gitignore` 和 License 下拉选 None / 不添加，因为本文件夹已准备相应文件。
6. 点击 Create repository。

## 上传文件

1. 在新仓库页面点击 uploading an existing file；如果已经有内容，则点 Add file → Upload files。
2. 打开这份干净的源码目录，把其中所有文件以及 `docs/`、`examples/` 文件夹拖入上传区域。
3. 也要上传 `.gitignore`。如果系统不显示它，开启显示隐藏文件后确认。
4. 检查待上传清单：仓库根目录应直接有 `README.md`、`LICENSE`、`index.html`、`source-settings.js` 等，不要多套一层中文目录。
5. Commit changes 的说明可写“发布兴庆漫游非商业源码分享版”。点击提交。

不要只上传整个 ZIP；那样网页不能直接浏览代码。ZIP 是方便你下载、搬运和备份的，网页上传前先解压。GitHub 网页拖拽不会根据 `.gitignore` 自动排除资源，所以只使用这一份已检查的文件夹。

## 提交后检查

- 首页是否显示中文 README。
- LICENSE 是否位于仓库根目录，非商业限制是否清楚。
- `docs/` 和 `examples/` 是否上传完整。
- 是否没有地图数据、音频、个人文件及完整部署包。
- About 里的项目网站可填写你愿意公开的现有游戏链接；这个源码仓库本身不会自动更新 Netlify 网站。

不要立即把本源码仓库当成完整游戏部署源。缺少本地地图时，即使部署到 Pages/Netlify，也只会显示资源说明页。完整游玩版需另外提供有权公开的地图与音频，不能靠把音乐路径改为本机磁盘地址实现。

## 后续合作

让校友通过 Issues 提建议，通过 Fork + Pull Request 提交代码。README 和 CONTRIBUTING 已说明贡献方式。请提醒贡献者不要把自己的地图或音乐顺手提交进来。

如果以后使用 Git 命令推送，先检查待提交文件列表。`.gitignore` 只忽略未跟踪文件；已经提交过的敏感内容需要处理历史，单纯删除工作目录里的文件不能撤回过去的公开副本。

官方参考：[GitHub 上传文件说明](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)、[GitHub 仓库许可说明](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)。
