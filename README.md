# 🗾 日本旅游地图

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![MapLibre](https://img.shields.io/badge/MapLibre_GL-5-396CB2?logo=maplibre)](https://maplibre.org)

**收录 176+ 个动漫店铺的交互式地图，基于 MapLibre 矢量瓦片渲染，支持地区筛选、分类筛选、搜索与排序。**

[🐛 报告 Bug](https://github.com/9dk9jptv8h-hue/japan-otaku-map/issues) &nbsp;|&nbsp; [✨ 功能建议](https://github.com/9dk9jptv8h-hue/japan-otaku-map/issues)

</div>

---

## 简介

一张专为中国动漫迷打造的日本旅行地图。标注了全日本 176+ 个动漫店铺，全中文 UI 与地点描述，使用 MapLibre GL JS 矢量瓦片实现丝滑的地图交互体验。

---

## 截图

<div align="center">

### 欢迎屏
<img src="https://raw.githubusercontent.com/9dk9jptv8h-hue/japan-otaku-map/master/public/screenshots/welcome-screen.png" alt="欢迎屏" width="640">

### 地图界面
<img src="https://raw.githubusercontent.com/9dk9jptv8h-hue/japan-otaku-map/master/public/screenshots/map-interface.png" alt="地图界面" width="640">

</div>

---

## 功能

| 功能 | 说明 |
|------|------|
| 🗺️ **矢量瓦片地图** | MapLibre GL JS 渲染，OpenFreeMap 全球 CDN 瓦片源 |
| 📍 **176+ 个地点** | 176+ 个动漫店铺，覆盖北海道到九州 |
| 🏷️ **7 类分色标记** | Animate（粉色）/ Melonbooks（绿色）/ Mandarake（橙色）/ Suruga-ya（蓝色）/ GAMERS（黄色）/ Lashinbang（紫色）/ K-Books（深红） |
| 🔍 **搜索与筛选** | 全文搜索（名称/描述/标签/地址）、地区筛选（都道府県）、分类筛选 |
| 📊 **排序** | 按评分、名称、更新时间、访问量排序 |
| 📱 **响应式布局** | 桌面端侧边栏 + 移动端抽屉，全尺寸适配 |
| ⚡ **性能优化** | 代码分割 3 chunk、CSS 变量驱动 marker、content-visibility 懒加载、Service Worker 瓦片缓存 |

---

## 技术栈

| 层级 | 技术 |
|------|------|
| **框架** | [React 19](https://react.dev) + Hooks |
| **语言** | [TypeScript 6](https://www.typescriptlang.org) — 严格模式 |
| **构建** | [Vite 8](https://vite.dev) — 亚秒级 HMR |
| **样式** | [TailwindCSS 4](https://tailwindcss.com) — CSS 变量 |
| **地图引擎** | [MapLibre GL JS 5](https://maplibre.org) — 矢量瓦片渲染 |
| **瓦片源** | [OpenFreeMap](https://openfreemap.org) — 免费、无 Key、全球 CDN |
| **状态管理** | [Zustand 5](https://zustand.docs.pmnd.rs) — 轻量、持久化 |
| **图标** | [Lucide React](https://lucide.dev) |
| **字体** | Microsoft YaHei / PingFang SC (系统字体) |

---

## 快速开始

**前置要求**: Node.js >= 18, npm >= 9

```bash
# 克隆仓库
git clone git@github.com:9dk9jptv8h-hue/japan-otaku-map.git
cd japan-otaku-map

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

打开 [http://localhost:5173](http://localhost:5173) 即可使用。

### 生产构建

```bash
npm run build
npm run preview
```

---

## 项目结构

```
src/
├── components/
│   ├── layout/          # AppShell、DesktopLayout、MobileLayout
│   ├── map/             # MapContainer、MarkersLayer、MapControls
│   ├── sidebar/         # Sidebar、FilterPanel、SearchBar、CardList、LocationCard、SortControl、SidebarToggle
│   └── ui/              # Badge、EmptyState、ErrorBoundary、Input
├── constants/
│   ├── mockData.ts      # 176+ 个地点数据
│   ├── mapDefaults.ts   # 视口、瓦片样式配置
│   └── theme.ts         # 分类颜色与元数据
├── hooks/               # useDebounce、useFilteredLocations、useMediaQuery
├── store/               # Zustand stores (UI / Filter / Map)
├── types/               # TypeScript 类型定义
├── utils/               # cn、city-photo
├── App.tsx              # 根组件 + 欢迎屏
├── main.tsx             # 入口
└── index.css            # 全局样式 + 动画
```

---

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解各版本的详细变更记录。

---

## License

MIT © [9dk9jptv8h-hue](https://github.com/9dk9jptv8h-hue)
