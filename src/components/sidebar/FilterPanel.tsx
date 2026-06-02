import { useFilterStore } from '@/store/useFilterStore'
import { Badge } from '@/components/ui/Badge'
import { CATEGORIES } from '@/constants/theme'

export function FilterPanel() {
  const { selectedCategories, toggleCategory, clearCategories } = useFilterStore()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--color-sumi)]/50 uppercase tracking-wider">
          分类筛选
        </span>
        {selectedCategories.length > 0 && (
          <button
            onClick={clearCategories}
            className="text-[10px] text-[var(--color-sakura)] hover:text-[var(--color-koi)] transition-colors"
          >
            清除全部
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <Badge
            key={cat.key}
            label={cat.label}
            color={cat.color}
            active={selectedCategories.includes(cat.key)}
            onClick={() => toggleCategory(cat.key)}
          />
        ))}
      </div>
    </div>
  )
}
