import { Layers } from 'lucide-react'
import { useMapStore } from '@/store/useMapStore'
import { cn } from '@/utils/cn'
import type { TileLayerStyle } from '@/types'

const LAYERS: { key: TileLayerStyle; label: string; color: string }[] = [
  { key: 'light',       label: '浅色',   color: '#f5f5f0' },
  { key: 'standard',    label: '标准',   color: '#c8d6a0' },
  { key: 'dark',        label: '暗色',   color: '#2c2c3a' },
  { key: 'terrain',     label: '地形',   color: '#8bba7a' },
]

interface TileLayerSwitchProps {
  className?: string
}

export function TileLayerSwitch({ className }: TileLayerSwitchProps) {
  const { tileLayer, setTileLayer } = useMapStore()

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-1 rounded-xl glass p-1.5 shadow-soft',
        'border border-[var(--color-border)]',
        className
      )}
    >
      <div className="col-span-2 flex items-center gap-1.5 px-1.5 py-0.5 mb-0.5">
        <Layers className="h-3.5 w-3.5 text-[var(--color-text-dim)]/60" />
        <span className="text-[10px] font-semibold text-[var(--color-text-dim)]/60 uppercase tracking-wider">
          地图风格
        </span>
      </div>
      {LAYERS.map((layer) => (
        <button
          key={layer.key}
          onClick={() => setTileLayer(layer.key)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-all duration-200',
            tileLayer === layer.key
              ? 'bg-[var(--color-accent)] text-white shadow-md scale-[1.02]'
              : 'text-[var(--color-text-dim)]/60 hover:text-[var(--color-text)] hover:bg-[var(--color-text)]/5'
          )}
        >
          <span
            className="h-3 w-3 rounded-full border border-white/30 shrink-0"
            style={{ backgroundColor: layer.color }}
          />
          <span className="text-[10px] font-medium">{layer.label}</span>
        </button>
      ))}
    </div>
  )
}
