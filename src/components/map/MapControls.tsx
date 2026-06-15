import { Plus, Minus, Home } from 'lucide-react'
import { useMapStore } from '@/store/useMapStore'
import { DEFAULT_VIEWPORT } from '@/constants/mapDefaults'
import { cn } from '@/utils/cn'

interface MapControlsProps {
  className?: string
}

export function MapControls({ className }: MapControlsProps) {
  const zoomIn = useMapStore((s) => s.zoomIn)
  const zoomOut = useMapStore((s) => s.zoomOut)
  const flyToMarker = useMapStore((s) => s.flyToMarker)

  const goHome = () => {
    // MapLibre flyTo 使用 [lng, lat] 顺序
    flyToMarker?.(DEFAULT_VIEWPORT.center[1], DEFAULT_VIEWPORT.center[0], DEFAULT_VIEWPORT.zoom)
  }

  const btnClass = cn(
    'flex h-10 w-10 items-center justify-center',
    'bg-white/90 backdrop-blur-md',
    'text-[var(--color-text-dim)] hover:text-[var(--color-accent)]',
    'transition-all duration-300 ease-out',
    'hover:scale-110 active:scale-95',
    'hover:bg-white/95',
  )

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl overflow-hidden',
        'shadow-lg backdrop-blur-md',
        'border border-white/20',
        className
      )}
    >
      <button
        onClick={zoomIn}
        className={cn(btnClass, 'rounded-t-2xl border-b border-gray-100/30')}
        aria-label="放大"
      >
        <Plus className="h-5 w-5" />
      </button>
      <button
        onClick={goHome}
        className={cn(btnClass, 'border-b border-gray-100/30')}
        aria-label="回到初始位置"
      >
        <Home className="h-4 w-4" />
      </button>
      <button
        onClick={zoomOut}
        className={cn(btnClass, 'rounded-b-2xl')}
        aria-label="缩小"
      >
        <Minus className="h-5 w-5" />
      </button>
    </div>
  )
}
