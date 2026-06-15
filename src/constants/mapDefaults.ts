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
// 瓦片源：CartoDB Raster Tiles
//
// Fastly CDN 全球加速（亚洲节点：香港/新加坡/东京），国内延迟低
// 浏览器只需渲染 PNG 图片，零 protobuf 解码 + 零 WebGL 矢量开销
// 每张瓦片 ~20-40KB，比矢量瓦片轻量
// {s} = 子域 (a/b/c/d) 并行下载，{z}/{x}/{y} = 标准瓦片坐标
// ================================================================

export const TILE_STYLES: Record<TileLayerStyle, {
  url: string
  attribution: string
}> = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  standard: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
  terrain: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  },
}
