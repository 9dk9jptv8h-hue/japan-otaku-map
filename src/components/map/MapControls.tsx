import type { CSSProperties } from 'react'
import { Plus, Minus, Home } from 'lucide-react'
import { useMapStore } from '@/store/useMapStore'
import { DEFAULT_VIEWPORT } from '@/constants/mapDefaults'
import { cn } from '@/utils/cn'

interface MapControlsProps {
  className?: string
  style?: CSSProperties
}

export function MapControls({ className, style }: MapControlsProps) {
  const isMapReady = useMapStore((s) => s.isMapReady)
  const zoomIn = useMapStore((s) => s.zoomIn)
  const zoomOut = useMapStore((s) => s.zoomOut)
  const flyToMarker = useMapStore((s) => s.flyToMarker)

  const goHome = () => {
    // MapLibre flyTo 使用 [lng, lat] 顺序
    flyToMarker?.(DEFAULT_VIEWPORT.center[1], DEFAULT_VIEWPORT.center[0], DEFAULT_VIEWPORT.zoom)
  }

  const btnClass = cn(
    'flex h-10 w-10 items-center justify-center',
    'bg-white/90 text-[var(--color-text-dim)]',
    'transition-[color,background-color,transform] duration-200 ease-out',
    'hover:bg-white hover:text-[var(--color-accent)]',
    'hover:scale-105 active:scale-95',
    !isMapReady && 'opacity-50 cursor-not-allowed'
  )

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden rounded-2xl border border-white/80',
        'bg-white/30 shadow-elevated backdrop-blur-md',
        className
      )}
        style={style}
    >
      <button
        type="button"
        onClick={zoomIn}
        disabled={!isMapReady}
        className={cn(btnClass, 'rounded-t-2xl border-b border-black/5')}
        aria-label="放大"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={goHome}
        disabled={!isMapReady}
        className={cn(btnClass, 'border-b border-black/5')}
        aria-label="回到初始位置"
      >
        <Home className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={zoomOut}
        disabled={!isMapReady}
        className={cn(btnClass, 'rounded-b-2xl')}
        aria-label="缩小"
      >
        <Minus className="h-5 w-5" />
      </button>
    </div>
  )
}
