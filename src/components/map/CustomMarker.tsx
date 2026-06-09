import { useRef, useEffect, useMemo, memo } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { LocationData, LocationCategory } from '@/types'
import { CATEGORIES } from '@/constants/theme'
import { useMapStore } from '@/store/useMapStore'
import { PopupCard } from './PopupCard'

function getMarkerColor(category: LocationCategory): string {
  const meta = CATEGORIES.find((c) => c.key === category)
  return meta?.color ?? '#607d8b'
}

// 分类图标 SVG — 提取到组件外避免每次渲染重建
function getCategoryIcon(category: LocationCategory): string {
  switch (category) {
    case 'animate':
      return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v1"/><path d="M21 7v1"/><path d="M12 21V7"/><path d="M3 7l9-4 9 4"/><path d="M8 13v3"/><path d="M16 13v3"/><path d="M12 11v5"/></svg>`
    case 'melonbooks':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="10" y1="8" x2="16" y2="8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
    case 'mandarake':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
  }
}

interface CustomMarkerProps {
  location: LocationData
}

export const CustomMarker = memo(function CustomMarker({ location }: CustomMarkerProps) {
  const markerRef = useRef<L.Marker>(null)
  const isSelected = useMapStore((s) => s.selectedMarkerIds.includes(location.id))
  const isHovered = useMapStore((s) => s.hoveredMarkerId === location.id)
  const setSelected = useMapStore((s) => s.setSelectedMarkerId)
  const removeSelected = useMapStore((s) => s.removeSelectedMarkerId)
  const setHovered = useMapStore((s) => s.setHoveredMarkerId)

  const color = getMarkerColor(location.category)
  const iconSvg = getCategoryIcon(location.category)
  const size = isSelected ? 42 : isHovered ? 36 : 30
  const borderWidth = isSelected ? 3 : 2
  const pulse = isSelected

  // 悬浮 z-index 提升
  useEffect(() => {
    const el = markerRef.current?.getElement()
    if (!el) return
    el.style.zIndex = (isHovered || isSelected) ? '1000' : ''
  }, [isHovered, isSelected])

  // 🚀 仅在依赖变化时重建 icon — 关键性能优化
  const icon = useMemo(() => L.divIcon({
    html: `
      <div class="${pulse ? 'marker-pulse' : ''}" style="
        width:${size}px;height:${size + 8}px;
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:${borderWidth}px solid white;
          border-radius:${location.category === 'mandarake' ? '50%' : '12px'};
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 ${isSelected ? 8 : 4}px ${isSelected ? 24 : 14}px ${color}55;
          transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1);
          cursor:pointer;
          ${isHovered && !isSelected ? 'transform:scale(1.15);' : ''}
        ">
          ${iconSvg}
        </div>
        ${pulse ? `<div style="
          position:absolute;width:${size}px;height:${size}px;
          border-radius:${location.category === 'mandarake' ? '50%' : '12px'};
          border:2.5px solid ${color};animation:pulse 1.6s ease-out infinite;
        "></div>` : ''}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 4],
    popupAnchor: [0, -size - 6],
  }), [size, color, borderWidth, pulse, iconSvg, isHovered, isSelected, location.category])

  return (
    <Marker
      ref={markerRef}
      position={[location.latitude, location.longitude]}
      icon={icon}
      eventHandlers={{
        click: (e) => { L.DomEvent.stopPropagation(e); setSelected(location.id); },
        popupclose: () => removeSelected(location.id),
        mouseover: () => setHovered(location.id),
        mouseout: () => setHovered(null),
      }}
    >
      <Popup maxWidth={280} minWidth={280} closeButton autoPan={false}>
        <PopupCard location={location} />
      </Popup>
    </Marker>
  )
})
