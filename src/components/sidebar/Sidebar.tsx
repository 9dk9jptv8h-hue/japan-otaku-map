import { useMemo } from 'react'
import type { LocationData } from '@/types'
import { useUIStore } from '@/store/useUIStore'
import { useFilterStore } from '@/store/useFilterStore'
import { useDebounce } from '@/hooks/useDebounce'
import { SearchBar } from './SearchBar'
import { FilterPanel } from './FilterPanel'
import { SortControl } from './SortControl'
import { CardList } from './CardList'
import { SidebarToggle } from './SidebarToggle'
import { cn } from '@/utils/cn'

interface SidebarProps {
  locations: LocationData[]
  className?: string
}

export function Sidebar({ locations, className }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { searchQuery, selectedCategories, sortBy } = useFilterStore()
  const debouncedSearch = useDebounce(searchQuery, 300)

  const filtered = useMemo(() => {
    let result = [...locations]
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase()
      result = result.filter(
        (loc) =>
          loc.name.toLowerCase().includes(q) ||
          loc.nameJa?.toLowerCase().includes(q) ||
          loc.description.toLowerCase().includes(q) ||
          loc.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    if (selectedCategories.length > 0) {
      result = result.filter((loc) => selectedCategories.includes(loc.category))
    }
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      case 'visits':
        result.sort((a, b) => (b.visitCount ?? 0) - (a.visitCount ?? 0))
        break
      case 'recent':
        result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'zh'))
        break
    }
    return result
  }, [locations, debouncedSearch, selectedCategories, sortBy])

  return (
    <>
      {sidebarCollapsed && (
        <SidebarToggle collapsed onClick={toggleSidebar} />
      )}

      <aside
        className={cn(
          'sidebar-gradient relative flex flex-col h-full border-r border-[var(--color-border)] overflow-hidden',
          'transition-all duration-300 ease-out',
          sidebarCollapsed
            ? 'w-0 min-w-0 opacity-0 pointer-events-none'
            : 'w-[var(--sidebar-width)] min-w-[280px] opacity-100',
          className
        )}
      >
        {/* Header - 彩色渐变 */}
        <div className="header-gradient shrink-0 px-5 pt-6 pb-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                🗾 日本オタクショップマップ
              </h1>
              <p className="text-sm text-white/70 mt-1">
                Animate  ·  Melonbooks  ·  Mandarake  — 全国店舗一覧
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur-sm">
                  📍 {locations.length} 店舗
                </span>
              </div>
            </div>
            <SidebarToggle collapsed={false} onClick={toggleSidebar} className="relative top-0 !border-white/20 !text-white" />
          </div>
        </div>

        {/* 搜索+筛选 */}
        <div className="shrink-0 space-y-3 px-4 py-4 glass">
          <SearchBar />
          <FilterPanel />
          <SortControl />
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
          <CardList locations={filtered} total={locations.length} />
        </div>
      </aside>
    </>
  )
}
