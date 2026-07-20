import type { GeoPoint, RouteData, RouteStep } from '@/types/navigation'

// ─── OSRM 指令中译映射表 ───
const INSTRUCTION_TRANSLATIONS: Record<string, string> = {
  depart: '出发',
  'turn right': '右转',
  'turn left': '左转',
  'turn slight right': '稍向右转',
  'turn slight left': '稍向左转',
  'turn sharp right': '急右转',
  'turn sharp left': '急左转',
  continue: '继续直行',
  straight: '继续直行',
  arrive: '到达目的地',
  'new name': '进入',
  roundabout: '环岛',
  'exit roundabout': '离开环岛',
  merge: '汇入',
  fork: '分叉',
  'end of road': '道路尽头',
  'use lane': '选择车道',
  rotary: '进入环岛',
  notification: '继续前行',
}

function translateInstruction(english: string): string {
  const lowered = english.toLowerCase()
  // 按最长匹配优先
  const keys = Object.keys(INSTRUCTION_TRANSLATIONS).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (lowered.includes(key)) {
      // 保留 OSRM 指令中的路名部分（如 "turn right onto 中央通り"）
      return english.replace(new RegExp(key, 'i'), INSTRUCTION_TRANSLATIONS[key])
    }
  }
  return english
}

const OSRM_BASE = 'https://router.project-osrm.org'

export async function fetchWalkingRoute(
  origin: GeoPoint,
  dest: GeoPoint
): Promise<RouteData> {
  const url = `${OSRM_BASE}/route/v1/foot/${origin.lng},${origin.lat};${dest.lng},${dest.lat}?steps=true&geometries=geojson&overview=full&alternatives=false`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000)

  let response: Response

  try {
    response = await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('路线服务响应超时')
    }
    throw new Error('网络连接失败，请检查网络')
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    throw new Error(`路线服务请求失败（状态码 ${response.status}）`)
  }

  let data: Record<string, unknown>
  try {
    data = (await response.json()) as Record<string, unknown>
  } catch {
    throw new Error('无法解析路线数据')
  }

  if (data.code !== 'Ok') {
    throw new Error('无法计算该路线')
  }

  const routes = data.routes as Array<Record<string, unknown>> | undefined
  if (!routes || routes.length === 0) {
    throw new Error('未找到可行路线')
  }

  const route = routes[0]

  // ─── 解析步骤 ───
  const rawSteps = ((route.legs as Array<Record<string, unknown>>)?.[0]?.steps ??
    []) as Array<Record<string, unknown>>

  const steps: RouteStep[] = rawSteps.map((step) => {
    // 提取步骤起点坐标：优先取 intersections[0].location，其次取 geometry.coordinates[0]
    let coord: [number, number] | undefined
    const intersections = step.intersections as Array<{ location: [number, number] }> | undefined
    if (intersections?.[0]?.location) {
      coord = intersections[0].location
    } else {
      const geom = step.geometry as { coordinates: [number, number][] } | undefined
      coord = geom?.coordinates?.[0]
    }

    return {
      maneuver: (step.maneuver as Record<string, string>)?.type ?? 'straight',
      instruction: translateInstruction(
        (step.maneuver as Record<string, string>)?.instruction ?? '继续前行'
      ),
      distance: Math.round((step.distance as number) ?? 0),
      duration: Math.round((step.duration as number) ?? 0),
      coordinates: coord,
    }
  })

  const routeData: RouteData = {
    distance: Math.round((route.distance as number) ?? 0),
    duration: Math.round((route.duration as number) ?? 0),
    geometry: route.geometry
      ? (route.geometry as { type: 'LineString'; coordinates: [number, number][] })
      : { type: 'LineString' as const, coordinates: [] },
    steps,
  }

  return routeData
}

/**
 * 生成 Google Maps 导航链接
 */
export function getGoogleMapsUrl(
  dest: GeoPoint,
  mode: 'walking' | 'transit' = 'walking'
): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${dest.lat},${dest.lng}&travelmode=${mode}`
}

/**
 * 生成 Apple Maps 导航链接
 */
export function getAppleMapsUrl(dest: GeoPoint): string {
  return `https://maps.apple.com/?daddr=${dest.lat},${dest.lng}&dirflg=w`
}
