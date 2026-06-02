import L from 'leaflet'
import type { LocationCategory } from '@/types'
import { CATEGORIES } from '@/constants/theme'

// 创建自定义 divIcon
export function createCustomIcon(
  category: LocationCategory,
  isSelected: boolean = false,
  isHovered: boolean = false
): L.DivIcon {
  const meta = CATEGORIES.find((c) => c.key === category)
  const color = meta?.color ?? '#f2a7b4'

  const size = isSelected ? 40 : isHovered ? 34 : 30
  const borderWidth = isSelected ? 3 : 2
  const shadowSize = isSelected ? 12 : 6

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: white;
      border: ${borderWidth}px solid ${color};
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 ${shadowSize}px ${shadowSize * 2}px rgba(0,0,0,0.15);
      transition: all 0.3s ease-out;
      cursor: pointer;
    ">
      <div style="
        width: ${size * 0.5}px;
        height: ${size * 0.5}px;
        background: ${color};
        border-radius: 50%;
        opacity: ${isSelected ? 1 : 0.8};
      "></div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

// 创建默认标记（用于 Marker 组件方式）
export function createColoredIcon(color: string, size: number = 30): L.DivIcon {
  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: all 0.3s ease-out;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="${size * 0.4}" height="${size * 0.4}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L2 22h20L12 2z" fill="white" opacity="0.5"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    </div>
  `

  return L.divIcon({
    html,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 4],
  })
}

// 从 bounds 判断点是否在视野内
export function isInBounds(
  lat: number,
  lng: number,
  bounds: { north: number; south: number; east: number; west: number } | null
): boolean {
  if (!bounds) return true
  return lat <= bounds.north && lat >= bounds.south && lng <= bounds.east && lng >= bounds.west
}

// 计算两点距离 (km)
export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
