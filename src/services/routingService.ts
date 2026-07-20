import type { GeoPoint, RouteData, RouteStep } from '@/types/navigation'

// ─── 机动方向中译 ───
const MODIFIER_CN: Record<string, string> = {
  uturn: '调头',
  'sharp right': '急右转',
  'sharp left': '急左转',
  right: '右转',
  left: '左转',
  'slight right': '稍向右转',
  'slight left': '稍向左转',
  straight: '直行',
}

// ─── 构建详细中文指令 ───
function buildInstruction(
  maneuverType: string,
  modifier: string,
  roadName: string,
  distance: number,
  isFirst: boolean,
  isLast: boolean,
): string {
  const distStr = formatDistanceCN(distance)
  const mod = MODIFIER_CN[modifier] ?? ''
  const road = roadName || '无名路'

  // 出发
  if (maneuverType === 'depart' || isFirst) {
    return roadName ? `从${roadName}出发，步行${distStr}` : `从当前位置出发，步行${distStr}`
  }

  // 到达
  if (maneuverType === 'arrive' || isLast) {
    return '到达目的地'
  }

  // 转向 + 路名
  if (mod && roadName) {
    // 转弯类：类型 + 路名匹配
    switch (maneuverType) {
      case 'turn':
      case 'new name':
        return `转入${road}，${mod}步行${distStr}`
      case 'roundabout':
      case 'exit roundabout':
      case 'rotary':
        return distance > 0 ? `${mod}，沿${road}步行${distStr}` : mod
      case 'fork':
        return `在分岔口${mod}进入${road}，步行${distStr}`
      case 'merge':
        return `汇入${road}，步行${distStr}`
      case 'end of road':
        return `道路尽头${mod}进入${road}，步行${distStr}`
      default:
        // straight / continue 等直行
        return `沿${road}${mod}${distStr}`
    }
  }

  // 有路名但无明确转弯 → 直行
  if (roadName) {
    return `沿${road}直行${distStr}`
  }

  // 有转弯但无路名
  if (mod) {
    return `${mod}步行${distStr}`
  }

  // 都没 → 兜底
  return `继续步行${distStr}`
}

function formatDistanceCN(m: number): string {
  if (m < 10) return '一小段'
  if (m < 1000) return `${Math.round(m)} 米`
  return `${(m / 1000).toFixed(1)} 公里`
}

// ─── 保留旧的翻译函数作为 fallback ───
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
  const keys = Object.keys(INSTRUCTION_TRANSLATIONS).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (lowered.includes(key)) {
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

  const steps: RouteStep[] = rawSteps.map((step, index) => {
    // 提取步骤起点坐标：优先取 intersections[0].location，其次取 geometry.coordinates[0]
    let coord: [number, number] | undefined
    const intersections = step.intersections as Array<{ location: [number, number] }> | undefined
    if (intersections?.[0]?.location) {
      coord = intersections[0].location
    } else {
      const geom = step.geometry as { coordinates: [number, number][] } | undefined
      coord = geom?.coordinates?.[0]
    }

    const maneuver = step.maneuver as Record<string, string> | undefined
    const maneuverType = maneuver?.type ?? 'straight'
    const modifier = maneuver?.modifier ?? ''
    const roadName = (step.name as string) ?? ''
    const dist = Math.round((step.distance as number) ?? 0)
    const dur = Math.round((step.duration as number) ?? 0)
    const isFirst = index === 0
    const isLast = index === rawSteps.length - 1

    // 优先用新构建器生成详细中文指令；无 modifier/roadName 时回退到旧翻译
    const instruction = (modifier || roadName)
      ? buildInstruction(maneuverType, modifier, roadName, dist, isFirst, isLast)
      : translateInstruction(maneuver?.instruction ?? '继续前行')

    return {
      maneuver: maneuverType,
      instruction,
      distance: dist,
      duration: dur,
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
