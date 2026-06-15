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
// 瓦片源：OpenFreeMap 矢量瓦片
//
// 矢量瓦片缩放无模糊，支持中文标签自动检测（name:zh 优先）
// ================================================================

export const TILE_STYLES: Record<TileLayerStyle, {
  url: string
  attribution: string
}> = {
  light: {
    url: 'https://tiles.openfreemap.org/styles/positron',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  standard: {
    url: 'https://tiles.openfreemap.org/styles/liberty',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  dark: {
    url: 'https://tiles.openfreemap.org/styles/dark',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  terrain: {
    url: 'https://tiles.openfreemap.org/styles/liberty',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
}
