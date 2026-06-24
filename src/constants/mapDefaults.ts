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
// 瓦片代理策略
//
// 问题：workers.dev 在国内被墙，直连 openfreemap.org 也被墙
// 方案：统一走 Vercel Edge Rewrites 代理（vercel.app 国内可直连）
//
//   Vercel 部署 → 同源相对路径 /tiles/ → vercel.json rewrites → OpenFreeMap
//   GitHub Pages → 跨域请求 Vercel /tiles/ → vercel.json rewrites → OpenFreeMap
//
// vercel.json: /tiles/:path* → https://tiles.openfreemap.org/:path*
// ================================================================

const VERCEL_URL = 'https://japan-otaku-map.vercel.app'

// 运行时检测：是否已在 Vercel 部署上
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')

// tileProxyBase：瓦片代理的根 URL
//   Vercel → 空（用相对路径 /tiles/...）
//   其他   → Vercel 部署 URL（跨域代理）
export const tileProxyBase = isVercel ? '' : VERCEL_URL

const resolveStyleUrl = (style: string): string =>
  `${tileProxyBase}/tiles/styles/${style}`

export const TILE_STYLES: Record<TileLayerStyle, {
  url: string
  attribution: string
}> = {
  light: {
    url: resolveStyleUrl('positron'),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  standard: {
    url: resolveStyleUrl('liberty'),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  dark: {
    url: resolveStyleUrl('dark'),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
}
