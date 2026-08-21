import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
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
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-8 items-center gap-1 rounded-full border px-2.5',
          'text-[11px] font-medium',
          'transition-[border-color,background-color,color,transform] duration-200',
          'active:scale-95',
          selectedRegion
            ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/8 text-[var(--color-accent)]'
            : 'border-[var(--color-border)] bg-white/70 text-[var(--color-text-dim)] hover:border-[var(--color-accent)]/35 hover:bg-white hover:text-[var(--color-text)]'
        )}
        aria-label="选择地区"
        aria-expanded={open}
      >
        <span className="max-w-[74px] truncate">
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
        <div className="popover-panel absolute right-0 top-full z-50 mt-1.5 max-h-[260px] w-[148px] overflow-y-auto rounded-2xl glass border border-[var(--color-border)] py-1 shadow-elevated">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            aria-label="全部地区"
            className={cn(
              'flex w-full items-center justify-between px-3 py-2 text-left text-[11px] transition-colors',
              'hover:bg-[var(--color-accent)]/6',
              selectedRegion === null
                ? 'font-bold text-[var(--color-accent)]'
                : 'text-[var(--color-text-dim)]'
            )}
          >
            全部地区
            {selectedRegion === null && <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" />}
          </button>
          {regionList.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => handleSelect(region)}
              aria-label={region}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-[11px] transition-colors',
                'hover:bg-[var(--color-accent)]/6',
                selectedRegion === region
                  ? 'font-bold text-[var(--color-accent)]'
                  : 'text-[var(--color-text-dim)]'
              )}
            >
              <span className="truncate">{region}</span>
              {selectedRegion === region && <Check className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
