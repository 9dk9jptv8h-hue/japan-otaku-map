import type { Map as LeafletMap } from 'leaflet'
import { create } from 'zustand'
import type { ViewportState, MapBounds, TileLayerStyle } from '@/types'
import { DEFAULT_VIEWPORT, TILE_LAYERS } from '@/constants/mapDefaults'

interface MapStore {
  // 地图实例引用
  mapInstance: LeafletMap | null
  setMapInstance: (map: LeafletMap | null) => void

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

  // 瓦片图层
  tileLayer: TileLayerStyle
  setTileLayer: (layer: TileLayerStyle) => void

  // 飞向标记
  flyToMarker: ((lat: number, lng: number, zoom?: number) => void) | null
  setFlyToMarker: (fn: ((lat: number, lng: number, zoom?: number) => void) | null) => void

  // 获取瓦片配置
  getTileConfig: () => { url: string; attribution: string }

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
    // 已选中则取消
    if (s.selectedMarkerIds.includes(id)) {
      return { selectedMarkerIds: s.selectedMarkerIds.filter((x) => x !== id) }
    }
    // 最多2个，超过则移除最早的
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

  tileLayer: 'light',
  setTileLayer: (layer) => set({ tileLayer: layer }),

  flyToMarker: null,
  setFlyToMarker: (fn) => set({ flyToMarker: fn }),

  getTileConfig: () => {
    return TILE_LAYERS[get().tileLayer]
  },

  zoomIn: () => get().mapInstance?.zoomIn(),
  zoomOut: () => get().mapInstance?.zoomOut(),
}))
