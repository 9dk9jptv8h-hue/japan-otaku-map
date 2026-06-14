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
export const TILE_LAYERS: Record<TileLayerStyle, { url: string; attribution: string }> = {
  standard: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png',
    attribution: '<a href="https://maps.gsi.go.jp/">国土地理院</a>',
  },
  light: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png',
    attribution: '<a href="https://maps.gsi.go.jp/">国土地理院</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  terrain: {
    url: 'https://cyberjapandata.gsi.go.jp/xyz/relief/{z}/{x}/{y}.png',
    attribution: '<a href="https://maps.gsi.go.jp/">国土地理院</a>',
  },
}
