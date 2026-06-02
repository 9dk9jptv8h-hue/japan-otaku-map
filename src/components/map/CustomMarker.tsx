import { useRef, useEffect } from 'react'
import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import type { LocationData, LocationCategory } from '@/types'
import { CATEGORIES } from '@/constants/theme'
import { useMapStore } from '@/store/useMapStore'
import { PopupCard } from './PopupCard'

// 按分类给颜色
function getMarkerColor(category: LocationCategory): string {
  const meta = CATEGORIES.find((c) => c.key === category)
  return meta?.color ?? '#607d8b'
}

// 按分类给文字标签
function getCategoryLabel(category: LocationCategory): string {
  switch (category) {
    case 'animate': return 'A'
    case 'melonbooks': return 'M'
    case 'mandarake': return 'ま'
  }
}

interface CustomMarkerProps {
  location: LocationData
}

export function CustomMarker({ location }: CustomMarkerProps) {
  const markerRef = useRef<L.Marker>(null)
  const isSelected = useMapStore((s) => s.selectedMarkerIds.includes(location.id))
  const isHovered = useMapStore((s) => s.hoveredMarkerId === location.id)
  const setSelected = useMapStore((s) => s.setSelectedMarkerId)
  const removeSelected = useMapStore((s) => s.removeSelectedMarkerId)
  const setHovered = useMapStore((s) => s.setHoveredMarkerId)

  const color = getMarkerColor(location.category)
  const label = getCategoryLabel(location.category)
  const size = isSelected ? 40 : isHovered ? 34 : 28
  const borderWidth = isSelected ? 3 : 2.5
  const pulse = isSelected

  // 悬浮 z-index
  useEffect(() => {
    const el = markerRef.current?.getElement()
    if (!el) return
    el.style.zIndex = (isHovered || isSelected) ? '1000' : ''
  }, [isHovered, isSelected])

  const icon = L.divIcon({
    html: `
      <div class="${pulse ? 'marker-pulse' : ''}" style="
        width:${size}px;height:${size + 6}px;
        display:flex;align-items:center;justify-content:center;
      ">
        <div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:${borderWidth}px solid white;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 ${isSelected ? 8 : 4}px ${isSelected ? 20 : 12}px ${color}66;
          transition:all 0.3s ease-out;
          cursor:pointer;
          ${isHovered && !isSelected ? 'transform:scale(1.1);' : ''}
        ">
          <span style="color:white;font-weight:800;font-size:${size * 0.42}px;line-height:1;font-family:sans-serif;">${label}</span>
        </div>
        ${pulse ? `<div style="
          position:absolute;width:${size}px;height:${size}px;
          border-radius:50%;border:2.5px solid ${color};
          animation:pulse 1.8s ease-out infinite;
        "></div>` : ''}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [size, size + 6],
    iconAnchor: [size / 2, size + 3],
    popupAnchor: [0, -size - 8],
  })

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
}
