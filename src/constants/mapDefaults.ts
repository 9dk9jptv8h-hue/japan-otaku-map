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
// 问题：workers.dev 在国内被墙，直连 openfreemap.org 也可能被墙
//      但某些网络（如 VPN）下 Vercel 不可达而 OpenFreeMap 直连反而能通
// 方案：启动时自动检测，优先直连 OpenFreeMap（延迟更低），Vercel 做 fallback
//
//   Vercel 部署 → 同源相对路径 /tiles/ → vercel.json rewrites → OpenFreeMap
//   其他部署   → 自动选择可用的代理
//
// vercel.json: /tiles/:path* → https://tiles.openfreemap.org/:path*
// ================================================================

const VERCEL_URL = 'https://japan-otaku-map.vercel.app'
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
 */
async function probeUrl(url: string, timeoutMs: number): Promise<boolean> {
  const { signal, clear } = createTimeoutSignal(timeoutMs)
  try {
    await fetch(url, { method: 'HEAD', mode: 'no-cors', signal })
    return true
  } catch {
    return false
  } finally {
    clear()
  }
}

/** 自动检测最佳瓦片代理：优先直连 OpenFreeMap，不通则用 Vercel */
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

    // Fallback: Vercel Edge 代理
    if (await probeUrl(`${VERCEL_URL}/tiles/styles/positron`, 5000)) {
      _detectedBase = VERCEL_URL
      console.log('[瓦片代理] ⚠️ 使用 Vercel 代理')
      return _detectedBase
    }

    // 全挂了就用 Vercel（让用户至少能看到报错）
    console.warn('[瓦片代理] ❌ 所有代理不可达，默认使用 Vercel')
    _detectedBase = VERCEL_URL
    return _detectedBase
  })()

  return _detectPromise
}

/** 同步版 tileProxyBase（初始化前使用 Vercel 兜底） */
export const tileProxyBase = isVercel ? '' : VERCEL_URL

/** 用检测结果更新用于 transformRequest 的 base URL */
export function getResolvedTileBase(): string {
  return _detectedBase ?? tileProxyBase
}

const resolveStyleUrl = (style: string, base: string): string => {
  if (!base) return `/tiles/styles/${style}`              // Vercel 相对路径
  if (base === DIRECT_TILES) return `${base}/styles/${style}`  // 直连 OpenFreeMap
  return `${base}/tiles/styles/${style}`                  // Vercel 跨域代理
}

// NOTE: TILE_STYLES 在模块初始化时计算（同步），此时 detectTileProxy() 尚未运行，
// tileProxyBase 固定为 Vercel fallback 值。这意味着 TILE_STYLES 的 style URL 始终指向
// Vercel 代理，而非最终检测结果。运行时通过 getResolvedStyleUrl() 获取修正后的 URL。
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
