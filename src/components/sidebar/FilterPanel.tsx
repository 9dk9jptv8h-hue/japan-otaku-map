import { useFilterStore } from '@/store/useFilterStore'
import { CATEGORIES } from '@/constants/theme'
import { cn } from '@/utils/cn'

export function FilterPanel() {
  const selectedCategories = useFilterStore(s => s.selectedCategories)
  const toggleCategory = useFilterStore(s => s.toggleCategory)
  const clearCategories = useFilterStore(s => s.clearCategories)
  const hasFilters = selectedCategories.length > 0

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {hasFilters && (
        <button
          onClick={clearCategories}
          className="text-[11px] font-medium text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-colors"
          aria-label="清除筛选"
        >
          全部
        </button>
      )}
      {CATEGORIES.map((cat) => {
        const isActive = selectedCategories.includes(cat.key)
        return (
          <button
            key={cat.key}
            onClick={() => toggleCategory(cat.key)}
            className={cn(
              'flex items-center gap-1.5 py-0.5 transition-all duration-200',
              'hover:opacity-80 active:scale-95'
            )}
            aria-label={`筛选 ${cat.label}`}
            aria-pressed={isActive}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0 transition-all duration-200"
              style={{
                backgroundColor: isActive ? cat.color : 'transparent',
                border: `2px solid ${cat.color}`,
              }}
            />
            <span
              className={cn(
                'text-[11px] transition-all duration-200',
                isActive
                  ? 'font-bold'
                  : 'text-[var(--color-text-dim)]'
              )}
              style={isActive ? { color: cat.color } : undefined}
            >
              {cat.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
