import { useRef, useEffect, memo } from 'react'
import { Star, MapPin, Navigation } from 'lucide-react'
import type { LocationData } from '@/types'
import { useMapStore } from '@/store/useMapStore'
import { useNavigationStore } from '@/store/useNavigationStore'
import { CATEGORIES } from '@/constants/theme'
import { cn } from '@/utils/cn'

const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map(c => [c.key, c])
)

interface LocationCardProps {
  location: LocationData
  index: number
}

export const LocationCard = memo(function LocationCard({ location, index }: LocationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isSelected = useMapStore((s) => s.selectedMarkerIds.includes(location.id))
  const isHovered = useMapStore((s) => s.hoveredMarkerId === location.id)
  const setSelected = useMapStore((s) => s.setSelectedMarkerId)
  const setHovered = useMapStore((s) => s.setHoveredMarkerId)
  const flyToMarker = useMapStore((s) => s.flyToMarker)
  const startNavigation = useNavigationStore((s) => s.startNavigation)

  const catMeta = CATEGORY_MAP[location.category] || { label: location.category, color: '#607d8b' }

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
        'location-card rounded-[16px] bg-white p-3',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-card',
        'active:scale-[0.98]',
        isSelected && 'ring-2 ring-offset-1',
        isHovered && !isSelected && 'shadow-card',
        flyToMarker ? 'cursor-pointer' : 'cursor-default'
      )}
      style={{
        boxShadow: isSelected
          ? `0 4px 20px ${catMeta.color}25`
          : undefined,
        '--tw-ring-color': isSelected ? catMeta.color : undefined,
        animationDelay: `${index * 30}ms`,
      } as React.CSSProperties}
      aria-label={`${location.name} - ${catMeta.label}`}
    >
      {/* Top row: brand dot + label + rating */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: catMeta.color }}
          />
          <span className="text-[11px] font-medium text-[var(--color-text-dim)]">
            {catMeta.label}
          </span>
        </div>
        {location.rating != null && (
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-[var(--color-text)]">
              {location.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Store name */}
      <h3 className="text-sm font-bold text-[var(--color-text)] truncate mb-1">
        {location.name}
      </h3>

      {/* Address */}
      {location.address && (
        <div className="flex items-center gap-1 mb-2">
          <MapPin className="h-3 w-3 shrink-0 text-[var(--color-text-dim)]" />
          <span className="text-xs text-[var(--color-text-dim)] truncate">
            {location.address}
          </span>
        </div>
      )}

      {/* Tags — max 3 */}
      {location.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {location.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: catMeta.color + '15',
                color: catMeta.color,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Navigate button — only show when selected */}
      {isSelected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            startNavigation(location)
          }}
          aria-label={`导航到${location.name}`}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold
            transition-all duration-200 active:scale-[0.97]"
          style={{
            background: catMeta.color + '18',
            color: catMeta.color,
          }}
        >
          <Navigation className="h-3.5 w-3.5" />
          导航到这里
        </button>
      )}

    </div>
  )
})
