# 更新日志

本项目的所有重要更改都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

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

[1.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.1...v1.0.0
[0.1.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/releases/tag/v0.1.0
