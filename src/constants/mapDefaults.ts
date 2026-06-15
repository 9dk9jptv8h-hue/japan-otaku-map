import type { ViewportState, TileLayerStyle } from '@/types'

// 默认视口：日本
export const DEFAULT_VIEWPORT: ViewportState = {
  center: [37.5, 137.5],
  zoom: 6,
}

export const MIN_ZOOM = 4
export const MAX_ZOOM = 22
export const FLY_DURATION = 1200

// 日本 bounding box [west, south, east, north] — MapLibre 格式
export const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [118.0, 20.0],
  [158.0, 48.0],
]

// ================================================================
// 瓦片源选择说明
//
// 主方案：OpenFreeMap — 完全免费，无需 API Key，全球 CDN，国内可直连
//   基于 OpenMapTiles 矢量瓦片，样式文件托管在 tiles.openfreemap.org
//   中文标签通过 map.on('style.load') 动态将 text-field 改为 name:zh 实现
//
// 备选方案：MapTiler Streets v2 — 矢量渲染 + 原生中文标签 (lang=zh)
//   需要 API Key（免费层10万次/月），但 api.maptiler.com 被墙
//   VPN 用户可用，配合根目录 tile-proxy.js 代理使用
//   获取 Key: https://cloud.maptiler.com
//   本地代理：node tile-proxy.js → 监听 127.0.0.1:15723
//   使用时把 light.url 改为 http://127.0.0.1:15723/style.json?style=streets-v2
// ================================================================

// 矢量瓦片样式配置
// OpenFreeMap 样式基于 OpenMapTiles schema，支持 name:zh 等多语言字段
// terrain 使用 CartoDB GL (全球CDN，无需Key)
// MapTiler 代理：设置 MAPTILER_KEY 后运行 node tile-proxy.js，使用 mt-proxy 样式
export const TILE_STYLES: Record<TileLayerStyle, {
  url: string
  attribution: string
  desc: string
}> = {
  light: {
    // OpenFreeMap Positron (Carto 浅色风格)
    url: 'https://tiles.openfreemap.org/styles/positron',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
    desc: '浅色',
  },
  standard: {
    // OpenFreeMap Liberty (OSM 标准彩色风格)
    url: 'https://tiles.openfreemap.org/styles/liberty',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
    desc: '标准',
  },
  dark: {
    // OpenFreeMap Dark
    url: 'https://tiles.openfreemap.org/styles/dark',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
    desc: '暗色',
  },
  terrain: {
    // CartoDB Positron GL — 地形友好，全球CDN，无需Key
    url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
    desc: '地形',
  },
}

// MapTiler 代理配置（可选，需先获取免费 Key 并启动 node tile-proxy.js）
// 获取 Key: https://cloud.maptiler.com → 免费层 10 万次/月
// 运行代理: node tile-proxy.js → 监听 127.0.0.1:15723
// 使用时将 TILE_STYLES 中对应样式的 url 改为本地代理地址
export const MAPTILER_PROXY = {
  port: 15723,
  baseUrl: 'http://127.0.0.1:15723',
  // 矢量瓦片原生支持 lang=zh-Hans，中文覆盖率远超 OSM 的 name:zh
  styleUrl: 'http://127.0.0.1:15723/style.json?style=streets-v2',
  attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
}

// Prefetch default style JSON at module load time
const defaultStyleUrl = TILE_STYLES.standard.url
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stylePreloadPromise: Promise<any> = fetch(defaultStyleUrl)
  .then(r => r.json())
  .catch(() => null)
