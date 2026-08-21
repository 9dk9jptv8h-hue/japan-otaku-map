import { memo } from 'react'
import { Search } from 'lucide-react'
import type { LocationData } from '@/types'
import { LocationCard } from './LocationCard'
import { EmptyState } from '@/components/ui/EmptyState'

interface CardListProps {
  locations: LocationData[]
  total: number
}

export const CardList = memo(function CardList({ locations, total }: CardListProps) {
  if (locations.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-10 w-10" />}
        title="没有找到匹配的地点"
        description="尝试调整搜索关键词或筛选条件"
      />
    )
  }

  const isFiltered = locations.length !== total

  return (
    <div className="space-y-2">
      {/* 吸顶结果统计 */}
      <div className="sticky top-0 z-10 -mx-1 px-1 pb-1.5 pt-0.5">
        <div className="flex items-center justify-between rounded-full border border-[var(--color-border)] bg-white/80 px-3 py-1.5 shadow-soft backdrop-blur-md">
          <span className="text-[11px] font-medium text-[var(--color-text-dim)]">
            显示 <span className="font-bold text-[var(--color-text)]">{locations.length}</span>
            <span className="text-[var(--color-text-dim)]/60">/{total}</span> 个地点
          </span>
          {isFiltered && (
            <span className="text-[10px] font-semibold text-[var(--color-accent)]">已筛选</span>
          )}
        </div>
      </div>

      {locations.map((location, index) => (
        <LocationCard key={location.id} location={location} index={index} />
      ))}
    </div>
  )
})
