import { Plus, Minus, LocateFixed } from 'lucide-react'
import { useMapStore } from '@/store/useMapStore'
import { cn } from '@/utils/cn'

interface MapControlsProps {
  className?: string
}

export function MapControls({ className }: MapControlsProps) {
  const zoomIn = useMapStore((s) => s.zoomIn)
  const zoomOut = useMapStore((s) => s.zoomOut)

  const btnClass = cn(
    'flex h-9 w-9 items-center justify-center',
    'bg-white/85 dark:bg-[#1a1a2e]/85 backdrop-blur-md',
    'text-[var(--color-sumi)]/70 hover:text-[var(--color-sumi)]',
    'transition-all duration-200 ease-out hover:scale-105 active:scale-95',
    'border border-[var(--color-sumi)]/10'
  )

  return (
    <div className={cn('flex flex-col gap-0.5 shadow-soft rounded-xl overflow-hidden', className)}>
      <button onClick={zoomIn} className={cn(btnClass, 'rounded-t-xl')} aria-label="放大">
        <Plus className="h-4 w-4" />
      </button>
      <button onClick={zoomOut} className={btnClass} aria-label="缩小">
        <Minus className="h-4 w-4" />
      </button>
      <button onClick={() => {}} className={cn(btnClass, 'rounded-b-xl')} aria-label="定位当前位置">
        <LocateFixed className="h-4 w-4" />
      </button>
    </div>
  )
}
