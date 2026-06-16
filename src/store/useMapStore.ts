import type { MapInstance } from '@/types'
import { create } from 'zustand'
import type { ViewportState, MapBounds } from '@/types'
import { DEFAULT_VIEWPORT } from '@/constants/mapDefaults'

interface MapStore {
  // 地图实例引用 — MapLibre Map
  mapInstance: MapInstance | null
  setMapInstance: (map: MapInstance | null) => void

  // 视口状态
  viewport: ViewportState
  setViewport: (v: Partial<ViewportState>) => void

  // 地图边界
  bounds: MapBounds | null
  setBounds: (b: MapBounds | null) => void

  // 选中标记（最多2个）
  selectedMarkerIds: string[]
  setSelectedMarkerId: (id: string | null) => void
  removeSelectedMarkerId: (id: string) => void

  // 悬停
  hoveredMarkerId: string | null
  setHoveredMarkerId: (id: string | null) => void

  // 地图就绪
  isMapReady: boolean
  setMapReady: (ready: boolean) => void

  // 飞向标记 — MapLibre 使用 [lng, lat] 顺序
  flyToMarker: ((lng: number, lat: number, zoom?: number) => void) | null
  setFlyToMarker: (fn: ((lng: number, lat: number, zoom?: number) => void) | null) => void

  // 便捷方法
  zoomIn: () => void
  zoomOut: () => void
}

export const useMapStore = create<MapStore>((set, get) => ({
  mapInstance: null,
  setMapInstance: (map) => set({ mapInstance: map }),

  viewport: DEFAULT_VIEWPORT,
  setViewport: (v) => set((s) => ({ viewport: { ...s.viewport, ...v } })),

  bounds: null,
  setBounds: (bounds) => set({ bounds }),

  selectedMarkerIds: [],
  hoveredMarkerId: null as string | null,
  setSelectedMarkerId: (id) => set((s) => {
    if (id === null) return { selectedMarkerIds: [] }
    if (s.selectedMarkerIds.includes(id)) {
      return { selectedMarkerIds: s.selectedMarkerIds.filter((x) => x !== id) }
    }
    const next = s.selectedMarkerIds.length >= 2
      ? [...s.selectedMarkerIds.slice(1), id]
      : [...s.selectedMarkerIds, id]
    return { selectedMarkerIds: next }
  }),
  removeSelectedMarkerId: (id) => set((s) => ({
    selectedMarkerIds: s.selectedMarkerIds.filter((x) => x !== id)
  })),
  setHoveredMarkerId: (id) => set({ hoveredMarkerId: id }),

  isMapReady: false,
  setMapReady: (ready) => set({ isMapReady: ready }),

  flyToMarker: null,
  setFlyToMarker: (fn) => set({ flyToMarker: fn }),

  zoomIn: () => {
    const map = get().mapInstance
    if (map) map.zoomIn()
  },
  zoomOut: () => {
    const map = get().mapInstance
    if (map) map.zoomOut()
  },
}))
