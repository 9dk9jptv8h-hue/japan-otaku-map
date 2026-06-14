import { memo } from 'react'
import type { LocationData } from '@/types'
import { LocationCard } from './LocationCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Search } from 'lucide-react'

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

  return (
    <div className="space-y-0.5">
      <div className="px-1 mb-2">
        <span className="text-[10px] text-[var(--color-sumi)]/35">
          共 {locations.length} 个地点（总计 {total} 个）
        </span>
      </div>
      {locations.map((location) => (
        <LocationCard key={location.id} location={location} />
      ))}
    </div>
  )
})
