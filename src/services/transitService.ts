// ─── 公共交通服务 ───
// OpenStreetMap Overpass API + Google Maps 公交路线

export interface TransitStation {
  id: number
  name: string
  lat: number
  lng: number
  railway: string // 'station' | 'subway' | 'tram_stop' | 'halt'
  distance: number // meters from the search point
  lines?: string[] // transit lines serving this station
}

// ─── Haversine 距离计算 ───
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371000 // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ─── 缓存 ───
interface CacheEntry {
  stations: TransitStation[]
  timestamp: number
}

const stationCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(lat: number, lng: number, radius: number): string {
  // Round to 3 decimal places (~111m precision) for cache key
  return `${lat.toFixed(3)},${lng.toFixed(3)},${radius}`
}

// ─── 提取线路信息 ───
function extractLines(tags: Record<string, string>): string[] {
  const lines = new Set<string>()

  // Overpass returns semicolon-separated values for some tags
  const rawFields = [tags.line, tags.route, tags.train, tags.network]
  for (const field of rawFields) {
    if (!field) continue
    field.split(';').forEach(part => {
      const trimmed = part.trim()
      if (trimmed) lines.add(trimmed)
    })
  }

  return Array.from(lines).slice(0, 5) // Max 5 lines
}

// ─── 名称提取：优先中文/日文 ───
function extractName(tags: Record<string, string>): string {
  return tags['name:zh'] || tags['name:ja'] || tags['name:en'] || tags.name || '未知站点'
}

// ─── 获取 railway 类型 ───
function getRailwayType(tags: Record<string, string>): string {
  if (tags.station) return tags.station // 'subway', 'light_rail', etc.
  if (tags.railway) return tags.railway
  return 'station'
}

// ─── Overpass API 响应类型 ───
interface OverpassElement {
  type: string
  id: number
  lat: number
  lon: number
  tags?: Record<string, string>
}

interface OverpassResponse {
  elements: OverpassElement[]
}

// ═══════════════════════════════════════════
// 核心函数：获取附近站点
// ═══════════════════════════════════════════
export async function fetchNearbyStations(
  lat: number,
  lng: number,
  radiusMeters: number = 2000,
): Promise<TransitStation[]> {
  // 检查缓存
  const cacheKey = getCacheKey(lat, lng, radiusMeters)
  const cached = stationCache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.stations
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

  try {
    const query = `[out:json];(node[railway=station](around:${radiusMeters},${lat},${lng});node[railway=subway_entrance](around:${radiusMeters},${lat},${lng});node[public_transport=station](around:${radiusMeters},${lat},${lng}););out center 20;`

    const response = await fetch(
      `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`,
      { signal: controller.signal },
    )

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`)
    }

    const data: OverpassResponse = await response.json()

    const stations: TransitStation[] = data.elements
      .filter(el => el.tags?.name || el.tags?.['name:en'] || el.tags?.['name:ja'] || el.tags?.['name:zh'])
      .map(el => ({
        id: el.id,
        name: extractName(el.tags || {}),
        lat: el.lat,
        lng: el.lon,
        railway: getRailwayType(el.tags || {}),
        distance: haversineDistance(lat, lng, el.lat, el.lon),
        lines: extractLines(el.tags || {}),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10) // Max 10 stations

    // 写入缓存
    stationCache.set(cacheKey, { stations, timestamp: Date.now() })

    return stations
  } catch (err) {
    // 如果是 AbortError（超时），静默返回空数组
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn('[transitService] Overpass API 请求超时')
      return []
    }
    console.error('[transitService] 获取站点失败:', err)
    return []
  } finally {
    clearTimeout(timeoutId)
  }
}

// ═══════════════════════════════════════════
// Google Maps 公交路线 URL
// ═══════════════════════════════════════════
export function getGoogleMapsTransitUrl(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${originLat},${originLng}` +
    `&destination=${destLat},${destLng}` +
    `&travelmode=transit`
  )
}
