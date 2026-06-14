import type { ViewportState, TileLayerStyle } from '@/types'

// 默认视口：日本
export const DEFAULT_VIEWPORT: ViewportState = {
  center: [37.5, 137.5],
  zoom: 6,
}

export const MIN_ZOOM = 4
export const MAX_ZOOM = 20
export const FLY_DURATION = 1200

// 日本本州 bounding box 用于限制地图不能拖出日本
export const JAPAN_BOUNDS: [[number, number], [number, number]] = [
  [20.0, 118.0],
  [48.0, 158.0],
]

// 多彩瓦片图层配置
// 主瓦片源：CartoDB (Fastly全球CDN，亚洲有节点，国内访问快)
// 备用瓦片源：GSI日本 (地形图层保留)
export const TILE_LAYERS: Record<TileLayerStyle, {
  url: string
  attribution: string
  maxNativeZoom?: number
  subdomains?: string[]
}> = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxNativeZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  standard: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxNativeZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    maxNativeZoom: 19,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  terrain: {
    // 地形图层：GSI日本地形（CDN缓存效果有限，保留官方源）
    url: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
    attribution: '<a href="https://maps.gsi.go.jp/">国土地理院</a>',
    maxNativeZoom: 18,
  },
}
