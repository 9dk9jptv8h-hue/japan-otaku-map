# 更新日志

本项目的所有重要更改都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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

[1.0.4]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.1...v1.0.0
[0.1.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/releases/tag/v0.1.0
