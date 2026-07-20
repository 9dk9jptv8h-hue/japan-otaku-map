import type { LocationData } from './index'

// ─── 出行方式 ───
export type TransportMode = 'walking' | 'transit'

// ─── 地理坐标 ───
export interface GeoPoint {
  lat: number
  lng: number
}

// ─── 路线步骤 ───
export interface RouteStep {
  maneuver: string
  instruction: string
  distance: number // 米
  duration: number // 秒
  coordinates?: [number, number] // 步骤起点坐标，用于 flyTo
}

// ─── 完整路线数据 ───
export interface RouteData {
  distance: number // 总距离（米）
  duration: number // 总时间（秒）
  geometry: { type: 'LineString'; coordinates: [number, number][] } // 完整路线几何
  steps: RouteStep[]
}

// ─── 导航状态 ───
export interface NavigationState {
  origin: GeoPoint | null
  destination: LocationData | null
  route: RouteData | null
  transportMode: TransportMode
  isRouting: boolean
  error: string | null
  isPanelOpen: boolean
}
