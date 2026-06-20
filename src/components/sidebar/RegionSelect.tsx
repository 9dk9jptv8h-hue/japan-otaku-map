import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { useFilterStore } from '@/store/useFilterStore'
import { cn } from '@/utils/cn'

interface RegionSelectProps {
  regionList: string[]
}

export function RegionSelect({ regionList }: RegionSelectProps) {
  const selectedRegion = useFilterStore(s => s.selectedRegion)
  const setSelectedRegion = useFilterStore(s => s.setSelectedRegion)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleSelect = (region: string | null) => {
    setSelectedRegion(region)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1 rounded-lg px-2.5 py-1.5',
          'text-[11px] font-medium transition-all duration-200',
          'border border-[var(--color-border)]',
          'hover:border-[var(--color-accent)]/40',
          'active:scale-95',
          selectedRegion
            ? 'text-[var(--color-accent)] bg-[var(--color-accent)]/5'
            : 'text-[var(--color-text-dim)] bg-white/50'
        )}
        aria-label="选择地区"
        aria-expanded={open}
      >
        <span className="truncate max-w-[72px]">
          {selectedRegion || '全部地区'}
        </span>
        <ChevronDown
          className={cn(
            'h-3 w-3 shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 min-w-[120px] max-h-[240px] overflow-y-auto rounded-xl glass border border-[var(--color-border)] shadow-elevated py-1">
          <button
            onClick={() => handleSelect(null)}
            className={cn(
              'w-full text-left px-3 py-1.5 text-[11px] transition-colors',
              'hover:bg-[var(--color-accent)]/5',
              selectedRegion === null
                ? 'font-bold text-[var(--color-accent)]'
                : 'text-[var(--color-text-dim)]'
            )}
          >
            全部地区
          </button>
          {regionList.map((region) => (
            <button
              key={region}
              onClick={() => handleSelect(region)}
              className={cn(
                'w-full text-left px-3 py-1.5 text-[11px] transition-colors',
                'hover:bg-[var(--color-accent)]/5',
                selectedRegion === region
                  ? 'font-bold text-[var(--color-accent)]'
                  : 'text-[var(--color-text-dim)]'
              )}
            >
              {region}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
