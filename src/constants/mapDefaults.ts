import type { ViewportState, TileLayerStyle } from '@/types'

// 默认视口：日本
// NOTE: center uses [lat, lng] order (ViewportState convention for store/persistence).
// MapLibre GL expects [lng, lat] — see MapContainer.tsx where it's destructured as
// [DEFAULT_VIEWPORT.center[1], DEFAULT_VIEWPORT.center[0]].
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
// 瓦片代理策略（自动检测）
//
// 问题：直连 openfreemap.org 在某些网络（尤其中国大陆）不可达。
// 方案：启动时自动检测，优先直连 OpenFreeMap（延迟最低），
//       不可达时回退到 Cloudflare Worker 瓦片代理（/tiles/* 路由）。
//
// 注意：曾经的 Vercel 代理（japan-otaku-map.vercel.app）已下线（404），
//       2026-08 起改用 Worker 代理。workers.dev 在大陆同样可能被墙，
//       若要彻底覆盖大陆用户，建议为 Worker 绑定自定义域名。
//
//   Vercel 部署 → 同源相对路径 /tiles/ → vercel.json rewrites → OpenFreeMap
//   其他部署   → 自动选择可用的代理
//
// vercel.json: /tiles/:path* → https://tiles.openfreemap.org/:path*
// ================================================================

const WORKER_TILE_BASE = 'https://japan-map-ai.9dk9jptv8h-hue.workers.dev'
const DIRECT_TILES = 'https://tiles.openfreemap.org'

// 运行时检测：是否已在 Vercel 部署上
const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')

// 缓存自动检测结果
let _detectedBase: string | null = null
let _detectPromise: Promise<string> | null = null

/** 创建带超时的 AbortSignal（兼容不支持 AbortSignal.timeout 的旧浏览器） */
function createTimeoutSignal(ms: number): { signal: AbortSignal; clear: () => void } {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new DOMException('timeout', 'TimeoutError')), ms)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

/**
 * 探测 URL 是否可达（仅判断服务器是否有响应，不关心响应内容）
 *
 * NOTE: mode: 'no-cors' produces an opaque response (status=0, no headers).
 * We cannot distinguish HTTP 200 from 503 — we only know the server is
 * "reachable at the TCP/TLS level". A server that accepts connections but
 * returns errors will still pass this probe.
 * 使用 GET（而非 HEAD）：Worker 瓦片路由只注册了 GET。
 */
async function probeUrl(url: string, timeoutMs: number): Promise<boolean> {
  const { signal, clear } = createTimeoutSignal(timeoutMs)
  try {
    await fetch(url, { method: 'GET', mode: 'no-cors', signal })
    return true
  } catch {
    return false
  } finally {
    clear()
  }
}

/** 自动检测最佳瓦片代理：优先直连 OpenFreeMap，不通则用 Cloudflare Worker */
export async function detectTileProxy(): Promise<string> {
  if (_detectedBase !== null) return _detectedBase
  if (_detectPromise) return _detectPromise

  // Vercel 部署直接用相对路径
  if (isVercel) {
    _detectedBase = ''
    return ''
  }

  _detectPromise = (async () => {
    // 优先尝试直连 OpenFreeMap（延迟更低，少一跳代理）
    if (await probeUrl(`${DIRECT_TILES}/styles/positron`, 5000)) {
      _detectedBase = DIRECT_TILES
      console.log('[瓦片代理] ✅ 直连 OpenFreeMap')
      return _detectedBase
    }

    // Fallback: Cloudflare Worker 瓦片代理
    if (await probeUrl(`${WORKER_TILE_BASE}/tiles/styles/positron`, 5000)) {
      _detectedBase = WORKER_TILE_BASE
      console.log('[瓦片代理] ⚠️ 使用 Cloudflare Worker 代理')
      return _detectedBase
    }

    // 全挂了就用 Worker 代理（让用户至少能看到报错）
    console.warn('[瓦片代理] ❌ 所有代理不可达，默认使用 Worker 代理')
    _detectedBase = WORKER_TILE_BASE
    return _detectedBase
  })()

  return _detectPromise
}

/** 同步版 tileProxyBase（初始化前使用 Worker 代理兜底） */
export const tileProxyBase = isVercel ? '' : WORKER_TILE_BASE

/** 用检测结果更新用于 transformRequest 的 base URL */
export function getResolvedTileBase(): string {
  return _detectedBase ?? tileProxyBase
}

const resolveStyleUrl = (style: string, base: string): string => {
  if (!base) return `/tiles/styles/${style}`              // Vercel 相对路径
  if (base === DIRECT_TILES) return `${base}/styles/${style}`  // 直连 OpenFreeMap
  return `${base}/tiles/styles/${style}`                  // Worker 跨域代理
}

// NOTE: TILE_STYLES 在模块初始化时计算（同步），此时 detectTileProxy() 尚未运行，
// tileProxyBase 固定为 Worker 代理兜底值。这意味着 TILE_STYLES 的 style URL 始终指向
// Worker 代理，而非最终检测结果。运行时通过 getResolvedStyleUrl() 获取修正后的 URL。
// 如果未来需要静态使用 TILE_STYLES 中的 URL（如 SSR 预渲染），需先 await detectTileProxy()。
export const TILE_STYLES: Record<TileLayerStyle, {
  url: string
  attribution: string
}> = {
  light: {
    url: resolveStyleUrl('positron', tileProxyBase),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  standard: {
    url: resolveStyleUrl('liberty', tileProxyBase),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
  dark: {
    url: resolveStyleUrl('dark', tileProxyBase),
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
  },
}

/** 根据检测结果重建 style URL（初始化后调用） */
export function getResolvedStyleUrl(style: TileLayerStyle): string {
  const base = getResolvedTileBase()
  return resolveStyleUrl(
    style === 'light' ? 'positron' : style === 'standard' ? 'liberty' : 'dark',
    base
  )
}
