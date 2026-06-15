import { useRef, useEffect, memo } from 'react'
import type { LocationData } from '@/types'
import { useMapStore } from '@/store/useMapStore'
import { CATEGORIES } from '@/constants/theme'
import { cn } from '@/utils/cn'

// Issue 7: 从 theme.ts 的 CATEGORIES 派生颜色，不再硬编码
const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c.color])
)

const CATEGORY_GRADIENTS: Record<string, string> = {
  animate: 'linear-gradient(135deg, #fce4ec, #fff5f5)',
  melonbooks: 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
  mandarake: 'linear-gradient(135deg, #fff3e0, #fff8e1)',
  surugaya: 'linear-gradient(135deg, #e3f2fd, #e8eaf6)',
  gamers: 'linear-gradient(135deg, #fff9c4, #fff176)',
  lashinbang: 'linear-gradient(135deg, #f3e5f5, #e1bee7)',
  kbooks: 'linear-gradient(135deg, #ffebee, #ffcdd2)',
}

function getAccent(category: string): string {
  return CATEGORY_COLORS[category] || '#607d8b'
}

function getGradient(category: string): string {
  return CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.animate
}

interface LocationCardProps {
  location: LocationData
}

export const LocationCard = memo(function LocationCard({ location }: LocationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isSelected = useMapStore((s) => s.selectedMarkerIds.includes(location.id))
  const isHovered = useMapStore((s) => s.hoveredMarkerId === location.id)
  const setSelected = useMapStore((s) => s.setSelectedMarkerId)
  const setHovered = useMapStore((s) => s.setHoveredMarkerId)
  const flyToMarker = useMapStore((s) => s.flyToMarker)

  const accent = getAccent(location.category)
  const gradient = getGradient(location.category)

  useEffect(() => {
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  const handleClick = () => {
    setSelected(location.id)
    flyToMarker?.(location.longitude, location.latitude, 16)
  }

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      onMouseEnter={() => setHovered(location.id)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        'location-card group flex gap-3 p-3 rounded-xl cursor-pointer mb-1',
        'transition-[transform,box-shadow,background-color] duration-300 ease-out',
        'hover:scale-[1.02] active:scale-[0.98]',
        isSelected
          ? 'ring-2 ring-offset-1 scale-[1.01]'
          : 'hover:shadow-card',
      )}
      style={{
        background: gradient,
        boxShadow: isSelected
          ? `0 4px 24px ${accent}33, var(--shadow-sm)`
          : isHovered
            ? 'var(--shadow-md)'
            : 'var(--shadow-xs)',
        borderLeft: `3px solid ${accent}${isSelected ? '' : '80'}`,
      }}
    >
      {/* 内容 */}
      <div className="flex-1 min-w-0 py-0.5 relative z-[2]">
        <h3 className="text-sm font-bold text-[var(--color-text)] truncate mb-1">
          {location.name}
        </h3>
        {location.nameJa && (
          <span className="text-[11px] text-[var(--color-text-dim)]/50 block mb-1">
            {location.nameJa}
          </span>
        )}
        <p className="text-[11px] text-[var(--color-text-dim)] line-clamp-2 mb-1.5 leading-relaxed">
          {location.description}
        </p>
        <div className="flex flex-wrap gap-1 mb-1.5">
          {location.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white shadow-sm"
              style={{ background: accent + 'cc' }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--color-text-dim)]/50">
          <span className="truncate">{location.address}</span>
          {location.visitCount != null && (
            <span className="shrink-0 font-semibold" style={{ color: accent }}>
              🔥 {location.visitCount < 1000
                    ? location.visitCount
                    : `${(location.visitCount / 10000).toFixed(1)}万`}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})
