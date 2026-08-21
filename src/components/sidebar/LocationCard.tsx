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

const STORE_ZOOM_LEVEL = 16

interface LocationCardProps {
  location: LocationData
  index: number
}

export const LocationCard = memo(function LocationCard({ location, index }: LocationCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInitialRender = useRef(true)
  const isSelected = useMapStore((s) => s.selectedMarkerIds.includes(location.id))
  const isHovered = useMapStore((s) => s.hoveredMarkerId === location.id)
  const setSelected = useMapStore((s) => s.setSelectedMarkerId)
  const setHovered = useMapStore((s) => s.setHoveredMarkerId)
  const flyToMarker = useMapStore((s) => s.flyToMarker)
  const startNavigation = useNavigationStore((s) => s.startNavigation)

  const catMeta = CATEGORY_MAP[location.category] || { label: location.category, color: '#607d8b' }

  useEffect(() => {
    // 跳过首次挂载时的 scrollIntoView（首次渲染不应滚动）
    if (isInitialRender.current) {
      isInitialRender.current = false
      return
    }
    if (isSelected && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isSelected])

  const handleClick = () => {
    setSelected(location.id)
    flyToMarker?.(location.longitude, location.latitude, STORE_ZOOM_LEVEL)
  }

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      onMouseEnter={() => setHovered(location.id)}
      onMouseLeave={() => setHovered(null)}
      aria-label={`${location.name} - ${catMeta.label}`}
      aria-pressed={isSelected}
      className={cn(
        'location-card group relative rounded-2xl bg-white/95 p-3',
        'transition-[transform,box-shadow,border-color,background-color] duration-300 ease-out',
        'hover:-translate-y-0.5 hover:shadow-card',
        'active:scale-[0.98]',
        isSelected && 'ring-2 ring-offset-1 ring-offset-white',
        isHovered && !isSelected && 'shadow-card',
        flyToMarker ? 'cursor-pointer' : 'cursor-default'
      )}
      style={{
        animationDelay: `${Math.min(index, 12) * 30}ms`,
          // 只让首屏卡片播放入场动画，屏幕外 160+ 张卡片保持零动画开销
          animation: index < 14 ? undefined : 'none',
        boxShadow: isSelected
          ? `0 10px 32px ${catMeta.color}30`
          : undefined,
        borderColor: isSelected ? `${catMeta.color}66` : undefined,
        '--tw-ring-color': isSelected ? catMeta.color : undefined,
      } as React.CSSProperties}
      data-selected={isSelected || undefined}
    >
      {/* 选中态左侧品牌色条 */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 rounded-r-full transition-opacity duration-300"
        style={{
          background: `linear-gradient(180deg, ${catMeta.color}, ${catMeta.color}22)`,
          opacity: isSelected ? 1 : 0,
        }}
      />

      {/* 品牌 + 评分 */}
      <div className="relative mb-1.5 flex items-center justify-between gap-2">
        <span
          className="inline-flex min-w-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
          style={{ backgroundColor: catMeta.color + '14', color: catMeta.color }}
        >
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: catMeta.color }} />
          <span className="truncate">{catMeta.label}</span>
        </span>
        {location.rating != null && (
          <span className="flex shrink-0 items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-[var(--color-text)]">
              {location.rating.toFixed(1)}
            </span>
          </span>
        )}
      </div>

      {/* 店名 */}
      <h3 className="relative mb-1 truncate text-[13.5px] font-bold leading-snug text-[var(--color-text)]">
        {location.name}
      </h3>

      {/* 地址 */}
      {location.address && (
        <div className="relative mb-2 flex items-center gap-1">
          <MapPin className="h-3 w-3 shrink-0 text-[var(--color-text-dim)]/70" />
          <span className="truncate text-[11.5px] text-[var(--color-text-dim)]">
            {location.address}
          </span>
        </div>
      )}

      {/* 标签 */}
      {location.tags.length > 0 && (
        <div className="relative flex flex-wrap gap-1">
          {location.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: catMeta.color + '12',
                color: catMeta.color,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 导航按钮 — 选中后展开 */}
      {isSelected && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            startNavigation(location)
          }}
          aria-label={`导航到${location.name}`}
          className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition-[transform,background-color,box-shadow] duration-200 active:scale-[0.97]"
          style={{
            background: catMeta.color + '16',
            color: catMeta.color,
            animation: 'cardSlideIn 0.3s var(--ease-smooth) both',
          }}
        >
          <Navigation className="h-3.5 w-3.5" />
          导航到这里
        </button>
      )}
    </div>
  )
})
