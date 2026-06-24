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
// 瓦片代理策略（按部署环境自适应）
//
// Vercel 部署 → 走 Vercel Edge Rewrites 代理（国内直连可用）
//              vercel.json: /tiles/* → https://tiles.openfreemap.org/*
//
// GitHub Pages / 其他 → 走 Cloudflare Worker 代理或直连 OpenFreeMap
// ================================================================

// Cloudflare Worker 瓦片代理（GitHub Pages 等非 Vercel 环境使用）
export const TILE_PROXY_BASE = 'https://japan-map-ai.9dk9jptv8h.workers.dev'
export const USE_TILE_PROXY = true

// 运行时检测部署环境
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')

// 根据部署环境自动选择代理策略
const resolveStyleUrl = (style: string): string => {
  // Vercel: 用相对路径走 Vercel Edge Rewrites 代理
  if (isVercel) {
    return `/tiles/styles/${style}`
  }
  // GitHub Pages / 其他: 走 Cloudflare Worker 或直连
  return USE_TILE_PROXY
    ? `${TILE_PROXY_BASE}/tiles/styles/${style}`
    : `https://tiles.openfreemap.org/styles/${style}`
}

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
