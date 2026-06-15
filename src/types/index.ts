import type { Map as MapLibreMap } from 'maplibre-gl'

// 地点数据类型
export interface LocationData {
  id: string
  name: string
  nameJa?: string
  description: string
  category: LocationCategory
  latitude: number
  longitude: number
  imageUrl: string
  address: string
  tags: string[]
  rating?: number
  visitCount?: number
  updatedAt: string
}

// 四大分类
export type LocationCategory = 'animate' | 'melonbooks' | 'mandarake' | 'surugaya'

// 分类元信息
export interface CategoryMeta {
  key: LocationCategory
  label: string
  color: string
  icon: string
}

// 地图视口状态
export interface ViewportState {
  center: [number, number]
  zoom: number
}

// 筛选状态
export interface FilterState {
  searchQuery: string
  selectedCategories: LocationCategory[]
  sortBy: SortOption
}

// 排序选项
export type SortOption = 'name' | 'rating' | 'recent' | 'visits'

// 瓦片图层
export type TileLayerStyle = 'standard' | 'light' | 'dark' | 'terrain'

// 地图边界
export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

// MapLibre Map 实例类型别名
export type MapInstance = MapLibreMap
