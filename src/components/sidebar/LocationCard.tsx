import { useRef, useEffect } from 'react'
import type { LocationData } from '@/types'
import { useMapStore } from '@/store/useMapStore'
import { cn } from '@/utils/cn'

function getAccentColor(rating?: number): string {
  if (!rating) return '#607d8b'
  if (rating >= 4.7) return '#e91e63'
  if (rating >= 4.5) return '#ff5722'
  if (rating >= 4.3) return '#ff9800'
  if (rating >= 4.1) return '#2196f3'
  return '#607d8b'
}

function getCardGradient(rating?: number): string {
  if (!rating) return 'linear-gradient(135deg, #f5f5f5, #e8e8e8)'
  if (rating >= 4.7) return 'linear-gradient(135deg, #fce4ec, #fff3e0)'
  if (rating >= 4.5) return 'linear-gradient(135deg, #fce4ec, #fff8e1)'
  if (rating >= 4.3) return 'linear-gradient(135deg, #e3f2fd, #e0f7fa)'
  if (rating >= 4.1) return 'linear-gradient(135deg, #e8eaf6, #e3f2fd)'
  return 'linear-gradient(135deg, #f5f5f5, #eceff1)'
}

interface LocationCardProps {
  location: LocationData
}

export function LocationCard({ location }: LocationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isSelected = useMapStore((s) => s.selectedMarkerIds.includes(location.id))
  const isHovered = useMapStore((s) => s.hoveredMarkerId === location.id)
  const setSelected = useMapStore((s) => s.setSelectedMarkerId)
  const setHovered = useMapStore((s) => s.setHoveredMarkerId)
  const flyToMarker = useMapStore((s) => s.flyToMarker)

  const accent = getAccentColor(location.rating)

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  const handleClick = () => {
    setSelected(location.id)
    flyToMarker?.(location.latitude, location.longitude, 16)
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={() => setHovered(location.id)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'group flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ease-out mb-1',
        'hover:scale-[1.02] active:scale-[0.98]',
        'border border-transparent',
        isSelected ? 'border-2 scale-[1.01]' : 'hover:border-[var(--color-border)]',
      )}
      style={{
        background: getCardGradient(location.rating),
        borderColor: isSelected ? accent : undefined,
        boxShadow: isSelected ? `0 4px 20px ${accent}33` : isHovered ? '0 2px 12px rgba(0,0,0,0.06)' : undefined,
      }}
    >
      {/* 内容 */}
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="text-sm font-bold text-[var(--color-text)] truncate mb-1">
          {location.name}
        </h3>
        {location.nameJa && (
          <span className="text-[11px] text-[var(--color-text-dim)]/50 block mb-1">
            {location.nameJa}
          </span>
        )}
        <p className="text-[11px] text-[var(--color-text-dim)] line-clamp-2 mb-1 leading-relaxed">
          {location.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-1">
          {location.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ background: accent + '99' }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-dim)]/50">
          <span className="truncate">{location.address}</span>
          {location.visitCount && (
            <span className="shrink-0 font-medium" style={{ color: accent }}>
              🔥 {(location.visitCount / 10000).toFixed(1)}万
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
