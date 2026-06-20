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

  return (
    <div className="space-y-2">
      <div className="px-1 pb-1">
        <span className="text-[11px] text-[var(--color-text-dim)]">
          显示 {locations.length}/{total} 个地点
        </span>
      </div>
      {locations.map((location, index) => (
        <LocationCard key={location.id} location={location} index={index} />
      ))}
    </div>
  )
})
