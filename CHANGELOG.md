# 更新日志

本项目的所有重要更改都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [3.3.1] - 2026-06-17

### Fixed（修复）
- SYSTEM_PROMPT Animate门店数修正 — 从错误的53家更正为实际的48家（与mockData一致）
- SYSTEM_PROMPT Melonbooks门店数修正 — 从错误的25家更正为实际的29家（与mockData一致）
- APK versionName从"3.1"升至"3.3"，versionCode从1升至2 — 与当前app版本同步
- CHANGELOG补全 [3.3.0]/[3.2.0]/[3.1.2] 版本比较链接

---

## [3.3.0] - 2026-06-16

### Changed（变更）
- 缩放键移到右上角 — 桌面端top-4/移动端top-16，不再和归因文字重叠
- AI聊天按钮回到右下角 — bottom-6，聊天面板跟随调整

---

## [3.2.0] - 2026-06-16

### Changed（变更）
- AI聊天面板打开/关闭动画优化 — 从条件渲染改为CSS transition，scale+opacity从右下角展开，250ms ease-out
- AI聊天面板尺寸缩小 — 桌面端400×500→360×440，移动端全屏不变

---

## [3.1.2] - 2026-06-16

### Fixed（修复）

#### High
- **BUG-10** APK版本号更新 — `versionName` 从 `2.7` 升至 `3.1`
- **BUG-12** 移除地理位置权限自动授予 — 删除 `onGeolocationPermissionsShowPrompt` 重写，恢复系统默认弹窗确认
- **BUG-14** Worker CORS通配符安全加固 — `Access-Control-Allow-Origin` 从 `*` 锁定为 `https://9dk9jptv8h-hue.github.io`

#### Medium
- **BUG-01** SYSTEM_PROMPT Mandarake门店数修正 — 从错误的9家更正为实际的11家
- **BUG-04** city-photo.ts 35个日文键名改为中文简体 — 与mockData的name字段统一（秋葉原→秋叶原、渋谷→涩谷等）
- **BUG-11** Android targetSdk/compileSdk 从34升至35
- **BUG-13** WebView混合内容策略 — `MIXED_CONTENT_COMPATIBILITY_MODE` 改为 `MIXED_CONTENT_NEVER_ALLOW`

#### Low
- **BUG-02** 安全规则数描述从"35+"更正为"40+"
- **BUG-05** 删除两处死CSS选择器 `.absolute.bottom-4.right-4`
- **BUG-06** 删除无效的 `/planet` preload link
- **BUG-07** types/index.ts 分类注释从"四大分类"更正为"七大分类"
- **BUG-08** Service Worker trimCache优化 — 改为每10次cache.put执行一次，减少性能开销

---

## [3.1.1] - 2026-06-16

### Fixed（修复）
- AI小助手回复格式优化 — Markdown渲染改为纯文本，消除多余换行和格式符号
- 修复聊天面板重复消息问题 — 防止同一请求触发多次发送
- 归因文字「Powered by DeepSeek」位置调整，不再遮挡缩放控件
- 缩放按钮（+/-）在聊天面板展开时自动上移避让

---

## [3.1.0] - 2026-06-16

### Changed（变更）
- AI小助手改为Cloudflare Worker代理架构 — 用户无需输入API Key即可使用
- 删除前端API Key输入面板、localStorage存储逻辑
- 新增 `worker/` 目录 — Cloudflare Worker项目，代理转发DeepSeek API请求
- Worker服务端注入API Key，前端零敏感信息暴露
- 支持通过环境变量 `VITE_AI_WORKER_URL` 配置Worker地址
- Worker限制请求体10KB + max_tokens 800，防滥用控成本

---

## [3.0.0] - 2026-06-16

### Added（新增）
- AI小助手聊天功能 — 右下角浮动按钮，点击展开聊天面板，接入DeepSeek API
- AutoSec-QC提示词注入检测 — 用户输入发送前经过40+条安全规则扫描（10个攻击类别）
- 支持自定义API Key — 用户自行输入DeepSeek API Key，localStorage本地存储
- 系统提示词内置176家店铺知识 — AI了解7大连锁品牌及热门区域推荐
- 聊天面板移动端全屏适配 — 桌面端400x500浮动面板，移动端全屏聊天
- 消息安全拦截 — HIGH/CRITICAL级别注入攻击自动拦截并提示用户

---

## [2.8.0] - 2026-06-16

### Fixed（修复）
- 欢迎页计数器目标值175→176，与实际数据一致
- Android弃用API替换（WindowInsetsController/OnBackPressedCallback）
- 删除30行死CSS（旧DOM Marker移动端样式）
- sitemap日期更新至2026-06-16

### Changed（变更）
- 删除tileLayer/setTileLayer死代码，地图样式硬编码standard
- 删除未使用的FilterState接口、icon字段、tile-proxy.js
- APK版本号2.5→2.7
- CHANGELOG补全版本比较链接

---

## [2.7.0] - 2026-06-16

### Added（新增）
- 新增animate高冈店（2026年3月新开，富山县イオンモール内），总计176家门店
- 地图改为2D平面模式，禁止倾斜旋转，移除3D建筑物层

### Performance（性能优化）
- 预加载矢量瓦片style JSON和TileJSON元数据

---

## [2.6.0] - 2026-06-16

### Added（新增）
- Android APK安装包 — WebView全屏应用，加载GitHub Pages在线地址
- GitHub Actions自动构建APK（workflow_dispatch手动触发）
- 网站更新后App自动获取最新内容，无需重新安装

---

## [2.5.1] - 2026-06-16

### Changed（变更）
- 回退移动端raster瓦片，统一使用OpenFreeMap矢量瓦片

---

## [2.5.0] - 2026-06-16

### Performance（性能优化）
- 移动端地图切换为CartoDB raster瓦片 — 零GPU渲染开销，加载更快
- 桌面端保持OpenFreeMap矢量瓦片不变

---

## [2.4.0] - 2026-06-16

### Added（新增）
- 地图标记hover放大效果 — 鼠标悬停圆点放大1.6倍+描边加粗，侧边栏卡片hover联动地图标记

---

## [2.3.0] - 2026-06-15

### Fixed（修复）
- 消除欢迎页入场闪白 — body初始暗色背景+退出时恢复
- 去除侧边栏CSS入场动画，防止欢迎页期间侧边栏闪现
- 点击地图空白处关闭弹窗
- 修复20项审查问题 — SEO meta/requestAnimationFrame/死代码清理/SW缓存上限/筛选Hook提取

### Refactored（重构）
- 提取共享筛选Hook（useFilteredLocations）+ LocationCard颜色从theme常量导入

### Style（视觉）
- 欢迎界面入场淡入过渡
- 侧边栏关闭按钮改为半透明融入header

---

## [2.2.0] - 2026-06-15

### Changed（变更）
- 欢迎界面全新设计 — 暗色霓虹风格，动态粒子背景，日本地图城市光点，数字递增动画，进度条加载指示

---

## [2.1.0] - 2026-06-15

### Changed（变更）
- 欢迎界面重新设计 — 印章改为品牌圆点列表，适配7大连锁

---

## [2.0.0] - 2026-06-15

### Added（新增）
- 新增GAMERS(ゲーマーズ)约14家门店 — 黄色标记
- 新增Lashinbang(らしんばん)约30家门店 — 紫色标记
- 新增K-Books(ケーブックス)约7家门店 — 深红标记
- 7大连锁店铺全覆盖，地点总数突破170+

### Removed（移除）
- 移除地图样式切换控件 — 固定使用标准样式

---

## [1.9.0] - 2026-06-15

### Fixed（修复）
- 修复桌面/移动端全不选分类时行为不一致
- 修复切换地图风格时事件处理器重复注册（内存泄漏）
- 修复terrain和light瓦片风格相同
- 修复SEO描述缺少骏河屋
- 修复Service Worker无缓存上限和离线错误处理
- 移除过时的no-cache强制刷新meta标签
- 清理百度推送脚本HTTP不安全分支

### Added（新增）
- 侧边栏添加地图风格切换控件（浅色/标准/暗色/地形）

### Changed（变更）
- README更新：删除已移除的深色模式描述，更新项目结构
- 清理4个未使用的组件文件

---

## [1.8.1] - 2026-06-15

### Fixed（修复）
- 校准全部124家门店经纬度坐标，修正5处定位偏差
  - animate新千岁机场(ani-hkd-4): 坐标偏离航站楼约1.5km，修正至正确位置
  - Melonbooks秋叶原(mel-knt-1): 与骏河屋秋叶原游戏店坐标完全重复，按外神田1丁目实际位置南移
  - 骏河屋大宫丸井店(sur-knt-4): 与Melonbooks大宫坐标完全重复，按大宫丸井实际位置修正
  - animate静冈(ani-cbu-3): 与骏河屋静冈紺屋町店坐标完全重复，微调区分
  - 骏河屋名古屋大须总店(sur-cbu-6): 与Mandarake名古屋店坐标完全重复，微调区分
- 确认其余119家门店坐标均与地址匹配，无需修正

---

## [1.8.0] - 2026-06-15

### Added（新增）
- 新增骏河屋(駿河屋/Suruga-ya)分类 — 37家门店，覆盖北海道到九州
- 骏河屋蓝色标记(#1565c0)，与现有三类颜色区分明确
- 包含6家秋叶原专门店（总店、模型店、游戏店、站前店、卡牌店、动漫周边店）
- 包含BOOK MARKET / ENTERKING骏河屋支援店
- 地点总数从87增至124

---

## [1.7.0] - 2026-06-15

### Changed（变更）
- 瓦片恢复为OpenFreeMap矢量瓦片 — 缩放无模糊，支持中文标签自动检测

---

## [1.6.0] - 2026-06-15

### Performance（性能优化）
- 瓦片从 OpenFreeMap 矢量切换为 CartoDB raster — 加载速度提升数倍，渲染零 GPU 开销
- Fastly CDN 亚洲节点（香港/新加坡/东京），国内延迟显著降低
- 删除矢量瓦片中文标签替换逻辑（raster 瓦片自带标签）
- 删除样式 JSON 预取（raster style 本地构建，零网络依赖）
- Service Worker 缓存覆盖 CartoDB 全部子域（a/b/c/d），旧缓存自动清除
- 启用 512px @2x retina 瓦片 — 同等视口 HTTP 请求数减少 75%，文字更锐利
- MapLibre 渲染参数深度优化 — fadeDuration=0 瓦片直接显示、refreshExpiredTiles=false 缓存优先、桌面端瓦片内存缓存扩大至 200
- 瓦片加载状态指示器 — 加载中显示轻量提示，idle 后自动消失
- Service Worker 缓存升级至 v3 — 自动清除旧版 256px 瓦片缓存

---

## [1.5.0] - 2026-06-15

### Performance（性能优化）
- 欢迎页与地图并行加载 — 不再串行等待，欢迎动画期间地图已在后台初始化渲染
- 添加瓦片 Service Worker 缓存 — 二次访问瓦片直接从本地 Cache API 读取
- 预连接瓦片服务器（preconnect/dns-prefetch）— 减少 DNS + TLS 握手延迟
- 样式 JSON 模块级预取 — 默认样式在 import 时即开始 fetch，地图初始化时直接使用
- MapLibre 渲染优化 — 关闭抗锯齿/跨源碰撞检测/资源计时收集，移动端限制瓦片缓存

---

## [1.4.0] - 2026-06-15

### Removed（移除）
- 移除深色模式 — 删除ThemeToggle组件、暗色CSS变量、主题切换逻辑

---

## [1.3.0] - 2026-06-15

### Fixed（修复）
- 修复侧边栏点击地点后地图飞到错误坐标（lat/lng参数顺序反了）
- 修复ErrorBoundary无背景色（--color-washi未定义）
- 修复地区筛选滚动条不隐藏（scrollbar-hide未定义）
- 修复Popup字体栈不一致
- 清除残留日文aria-label和"店舗"
- 清除mockData中残留的"圣地巡礼"用词

### Added（新增）
- 侧边栏添加主题切换按钮（深色/浅色模式）
- 移动端添加地图缩放控件

### Changed（变更）
- 清理未使用的组件文件（CustomMarker.tsx、PopupCard.tsx）
- 删除无关文件deepseek-balance.html
- README字体描述更新

---

## [1.2.0] - 2026-06-15

### Changed（变更）
- **网站改版** — 从"圣地巡礼地图"转型为"日本旅游地图"
- **删除圣地巡礼分类** — 移除16个圣地巡礼地点和pilgrimage分类
- **全站标题更新** — 统一改为「日本旅游地图」

---

## [1.1.0] - 2026-06-15

### Performance（性能优化）

- **Marker从DOM改为WebGL原生图层** — 100+个DOM元素替换为1个GeoJSON Source + 2个WebGL图层（circle+symbol），拖拽地图时标记零延迟
- **移动端欢迎页优化** — 花瓣20→8个，加载时间2.5s→1.8s，标题/印章自适应小屏
- **移动端GPU减负** — pixelRatio降为1x，最大缩放18级，关闭fade动画
- **移动端CSS全面降级** — backdrop-blur 20px→4px，阴影简化，装饰动画禁用，transition缩短

### Style（视觉恢复）

- **恢复移动端欢迎页视觉效果，保持桌面端质感** — 花瓣8→14个、inkBloom水墨晕染动画恢复（blur降为8px）、地图呼吸动画恢复（频率减半）、毛玻璃blur恢复至12px、加载时间1.8s→2.2s

### Fixed（修复）

- 修复移动端欢迎页布局溢出
- 修复地图标记在移动端拖拽时延迟跟随
- 修复切换瓦片图层后标记消失（styledata事件自动重建图层）
- 修复移动端侧边栏打开时顶部搜索栏层级冲突（z-index重叠）
- 修复移动端残留日文文字（店舗→地点、閉じる→关闭）

---

## [1.0.4] - 2026-06-15

### Added（新增）
- **SEO优化** — meta标签、sitemap、robots.txt、结构化数据，支持百度/Google搜索引擎收录

---

## [1.0.3] - 2026-06-15

### Added（新增）

- **GitHub Pages 自动部署** — 每次push到master自动构建发布，无需本地跑服务器即可访问
- 访问地址: https://9dk9jptv8h-hue.github.io/japan-otaku-map/

---

## [1.0.2] - 2026-06-15

### Fixed（修复）

- **移除Google Fonts外部依赖** — `fonts.googleapis.com` 在国内被墙导致页面无法加载，改用系统本地字体
- **字体栈优化** — `Noto Sans SC`(需CDN) → `Microsoft YaHei`(本地)，零网络依赖，不开VPN也能正常显示

---

## [1.0.1] - 2026-06-14

### Changed（变更）

- **README 全面重写** — 反映当前实际状态：MapLibre GL、103地点、全中文、4分类、地区筛选
- **GitHub仓库描述更新** — 新描述：「日本旅游——圣地巡礼地图 | 103个动漫圣地+店铺 | MapLibre矢量瓦片」
- **GitHub Topics更新** — react, typescript, maplibre, anime, japan, pilgrimage, vite, tailwindcss, zustand, vector-tiles, otaku, travel
- **Badges更新** — Leaflet badge → MapLibre GL 5 badge

### Added（新增）

- **CHANGELOG.md** — 添加更新日志，记录所有历史更新

---

## [1.0.0] - 2026-06-14

### Added（新增）

- **圣地巡礼数据扩充** — 新增 17 个圣地巡礼地点（君の名は。、鬼滅の刃、ラブライブ！、千与千寻等），共计 103 个地点（87 店铺 + 16 圣地）
- **pilgrimage 分类** — 新增圣地巡礼分类，使用赤红鸟居图标
- **侧边栏地区筛选** — 支持按都道府県过滤地点
- **三重筛选** — 地区 / 分类 / 搜索三重筛选（AND 关系）
- **地图与侧边栏联动** — 地图标记点击与侧边栏卡片高亮联动
- **四种地图风格** — 浅色 / 标准 / 暗色 / 地形可选切换

### Changed（变更）

- **网站中文化** — 所有地点名称、描述、标签翻译为中文；欢迎界面标题改为「日本动漫圣地巡礼地图」；侧边栏、移动端 UI 文字全部中文化；浏览器标签页标题中文化
- **网站改名** — 网站名称改为「日本旅游——圣地巡礼地图」
- **地图引擎升级** — Leaflet → MapLibre GL JS（矢量瓦片渲染）；缩放不再模糊，支持到 22 级
- **瓦片源切换** — 切换为 OpenFreeMap（全球 CDN，国内可直连）；中文标签自动检测（name:zh 优先）
- **默认地图风格** — 改为彩色标准风格

### Performance（性能优化）

- **瓦片性能优化** — 从 GSI 日本 → CartoDB Fastly 全球 CDN；缩放时预加载周边 10 格瓦片；缩放过程中实时更新瓦片；瓦片加载失败显示占位图
- **Marker 渲染优化** — 从 innerHTML 改为 CSS 变量驱动（零 DOM 重建）
- **卡片列表虚拟化** — 添加 `content-visibility: auto`（屏幕外不渲染）
- **CSS 过渡精确化** — `transition-all` → 精确属性，移除不必要的 `backdrop-blur`（减少 GPU 合成层）
- **修复 useMemo 依赖缺失 bug**
- **代码分割** — maplibre / React 生态 / 业务代码拆为 3 个独立 chunk

### Fixed（修复）

- 去除侧边栏打开时的地图模糊遮罩
- 去除遮罩层，侧边栏打开时地图可交互（拖拽、点击标记）

---

## [0.1.1] - 2026-06-14

### Fixed（修复）

- 修复 GitHub README 截图显示空白问题
- 截图引用改为 GitHub raw URL

---

## [0.1.0] - 2026-06-14

### Added（新增）

- **项目初始化** — React 19 + TypeScript + Vite + TailwindCSS 4 + Zustand
- **地图引擎** — Leaflet 地图（后续版本升级为 MapLibre GL）
- **店铺数据** — 87 个动漫店铺数据（animate / melonbooks / mandarake）
- **Sakura 主题欢迎界面** — 水墨 + 樱花花瓣 + 判子印章动画
- **深色/浅色主题切换**
- **响应式布局** — 桌面侧边栏 + 移动端抽屉
- **GitHub Pages 部署**

---

[3.3.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.1.2...v3.2.0
[3.1.2]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.8.0...v3.0.0
[2.8.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.7.0...v2.8.0
[2.7.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.5.1...v2.6.0
[2.5.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.5.0...v2.5.1
[2.5.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.9.0...v2.0.0
[1.9.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.8.1...v1.9.0
[1.8.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.1...v1.0.0
[0.1.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/releases/tag/v0.1.0
