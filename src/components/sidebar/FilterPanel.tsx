import { useMemo } from 'react'
import { useFilterStore } from '@/store/useFilterStore'
import { CATEGORIES } from '@/constants/theme'
import type { LocationData } from '@/types'
import { cn } from '@/utils/cn'

interface FilterPanelProps {
  locations?: LocationData[]
}

const CHIP_BASE =
  'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-2.5 text-[11px] font-medium ' +
  'transition-[background-color,border-color,color,transform,box-shadow] duration-200 active:scale-95'

export function FilterPanel({ locations }: FilterPanelProps) {
  const selectedCategories = useFilterStore(s => s.selectedCategories)
  const toggleCategory = useFilterStore(s => s.toggleCategory)
  const clearCategories = useFilterStore(s => s.clearCategories)

  const allSelected = selectedCategories.length === CATEGORIES.length
  const partialSelected = selectedCategories.length > 0 && !allSelected

  const counts = useMemo(() => {
    if (!locations || locations.length === 0) return null
    const map = new Map<string, number>()
    for (const loc of locations) {
      map.set(loc.category, (map.get(loc.category) ?? 0) + 1)
    }
    return map
  }, [locations])

  return (
    <div
      className="scrollbar-none -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 py-0.5"
      role="group"
      aria-label="品牌筛选"
    >
      {/* 全部 — 恢复默认 */}
      <button
        type="button"
        onClick={clearCategories}
        aria-pressed={allSelected}
        className={cn(
          CHIP_BASE,
          allSelected
            ? 'border-transparent bg-[var(--color-accent)] text-white shadow-[var(--shadow-glow-accent)]'
            : 'border-[var(--color-border)] bg-white/70 text-[var(--color-text-dim)] hover:border-[var(--color-accent)]/35 hover:bg-white hover:text-[var(--color-text)]'
        )}
      >
        <span className={cn('h-2 w-2 rounded-full', allSelected ? 'bg-white/90' : 'bg-[var(--color-sumi)]/20')} />
        全部
        {locations && <span className="text-[10px] tabular-nums opacity-80">{locations.length}</span>}
      </button>

      {CATEGORIES.map((cat) => {
        // 全选状态下所有品牌均为默认状态，避免初始界面一片彩色。
        // 一旦用户关掉某个品牌，保留的品牌才显示选中态。
        const active = !allSelected && selectedCategories.includes(cat.key)
        const dimmed = partialSelected && !active

        return (
          <button
            key={cat.key}
            type="button"
            onClick={() => toggleCategory(cat.key)}
            aria-pressed={active}
            aria-label={`筛选 ${cat.label}`}
            className={cn(
              CHIP_BASE,
              active
                ? 'border-transparent font-semibold shadow-[var(--shadow-sm)]'
                : dimmed
                  ? 'border-[var(--color-border)] bg-white/40 text-[var(--color-text-dim)] opacity-50 hover:opacity-80'
                  : 'border-[var(--color-border)] bg-white/70 text-[var(--color-text-dim)] hover:border-[var(--color-accent)]/35 hover:bg-white hover:text-[var(--color-text)]'
            )}
            style={active ? { backgroundColor: cat.color + '18', borderColor: cat.color + '55', color: cat.color } : undefined}
          >
            <span
              className="h-2 w-2 shrink-0 rounded-full transition-colors duration-200"
              style={{
                backgroundColor: active ? cat.color : 'transparent',
                border: `2px solid ${cat.color}`,
              }}
            />
            <span className="whitespace-nowrap">{cat.label}</span>
            {counts && <span className="text-[10px] tabular-nums opacity-70">{counts.get(cat.key) ?? 0}</span>}
          </button>
        )
      })}
    </div>
  )
}
