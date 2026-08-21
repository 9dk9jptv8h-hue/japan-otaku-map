import { useState, useRef, useEffect } from 'react'
import { ArrowUpDown, Check } from 'lucide-react'
import { useFilterStore } from '@/store/useFilterStore'
import { cn } from '@/utils/cn'
import type { SortOption } from '@/types'

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'rating', label: '评分最高' },
  { key: 'visits', label: '最受欢迎' },
  { key: 'recent', label: '最近更新' },
  { key: 'name', label: '名称排序' },
]

export function SortPopover() {
  const sortBy = useFilterStore(s => s.sortBy)
  const setSortBy = useFilterStore(s => s.setSortBy)
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

  const handleSelect = (key: SortOption) => {
    setSortBy(key)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border shadow-soft',
          'transition-[border-color,background-color,transform] duration-200',
          'active:scale-95',
          open
            ? 'border-[var(--color-accent)]/35 bg-white text-[var(--color-accent)]'
            : 'border-[var(--color-border)] bg-white/80 text-[var(--color-text-dim)] hover:border-[var(--color-accent)]/35 hover:bg-white hover:text-[var(--color-text)]'
        )}
        aria-label="排序方式"
        aria-expanded={open}
      >
        <ArrowUpDown className="h-4 w-4" />
      </button>

      {open && (
        <div className="popover-panel absolute right-0 top-full z-50 mt-1.5 w-[148px] rounded-2xl glass border border-[var(--color-border)] py-1 shadow-elevated">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => handleSelect(opt.key)}
              aria-label={opt.label}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2.5 text-[12px] transition-colors',
                'hover:bg-[var(--color-accent)]/6',
                sortBy === opt.key
                  ? 'font-bold text-[var(--color-accent)]'
                  : 'text-[var(--color-text-dim)]'
              )}
            >
              <span>{opt.label}</span>
              {sortBy === opt.key && (
                <Check className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
