import type { ViewportState, TileLayerStyle } from '@/types'

// 默认视口：日本
export const DEFAULT_VIEWPORT: ViewportState = {
  center: [37.5, 137.5],
  zoom: 6,
}

export const MIN_ZOOM = 4
export const MAX_ZOOM = 22
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

// Cloudflare Worker 瓦片代理（解决国内直连 OpenFreeMap 慢/被墙的问题）
export const TILE_PROXY_BASE = 'https://japan-map-ai.9dk9jptv8h.workers.dev'
export const USE_TILE_PROXY = true

// 根据代理开关动态生成 style URL
const styleUrl = (style: string) =>
  USE_TILE_PROXY
    ? `${TILE_PROXY_BASE}/tiles/styles/${style}`
    : `https://tiles.openfreemap.org/styles/${style}`

export const TILE_STYLES: Record<TileLayerStyle, {
  url: string
  attribution: string
}> = {
  light: {
    url: styleUrl('positron'),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  standard: {
    url: styleUrl('liberty'),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  dark: {
    url: styleUrl('dark'),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
}
