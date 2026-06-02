import { useFilterStore } from '@/store/useFilterStore'
import type { SortOption } from '@/types'
import { cn } from '@/utils/cn'

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'rating', label: '评分最高' },
  { key: 'visits', label: '最受欢迎' },
  { key: 'recent', label: '最近更新' },
  { key: 'name', label: '名称排序' },
]

export function SortControl() {
  const { sortBy, setSortBy } = useFilterStore()

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium text-[var(--color-sumi)]/40 uppercase tracking-wider shrink-0">
        排序
      </span>
      <div className="flex flex-1 gap-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={cn(
              'flex-1 rounded-lg px-2 py-1 text-[11px] font-medium transition-all duration-200',
              sortBy === opt.key
                ? 'bg-[var(--color-indigo)]/10 text-[var(--color-indigo)]'
                : 'text-[var(--color-sumi)]/40 hover:text-[var(--color-sumi)]/60 hover:bg-[var(--color-sumi)]/5'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
