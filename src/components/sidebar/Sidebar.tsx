import type { LocationData } from '@/types'
import { useUIStore } from '@/store/useUIStore'
import { useFilteredLocations } from '@/hooks/useFilteredLocations'
import { SearchBar } from './SearchBar'
import { FilterPanel } from './FilterPanel'
import { CardList } from './CardList'
import { SidebarToggle } from './SidebarToggle'
import { SortPopover } from './SortPopover'
import { RegionSelect } from './RegionSelect'
import { cn } from '@/utils/cn'

interface SidebarProps {
  locations: LocationData[]
  className?: string
}

export function Sidebar({ locations, className }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { filteredLocations, regionList } = useFilteredLocations()

  return (
    <>
      {sidebarCollapsed && (
        <SidebarToggle collapsed onClick={toggleSidebar} />
      )}

      <aside
        className={cn(
          'sidebar-gradient fixed top-0 left-0 bottom-0 z-30 flex flex-col',
          'gpu-layer shadow-elevated',
          'transition-transform duration-400',
          sidebarCollapsed ? '-translate-x-full' : 'translate-x-0',
          'w-[var(--sidebar-width)]',
          className
        )}
        style={{
          transitionTimingFunction: sidebarCollapsed
            ? 'cubic-bezier(0.4, 0, 0.2, 1)'
            : 'var(--ease-spring)',
        }}
      >
        {/* Header — compact one line */}
        <div className="header-gradient shrink-0 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">🗾 日本动漫店铺地图</h1>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] backdrop-blur-sm">
                {locations.length}
              </span>
            </div>
            <SidebarToggle
              collapsed={false}
              onClick={toggleSidebar}
              className="!bg-white/20 hover:!bg-white/30 !border-transparent !text-white"
            />
          </div>
        </div>

        {/* Search + Sort — same row */}
        <div className="shrink-0 px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar />
            </div>
            <SortPopover />
          </div>
        </div>

        {/* Filter area — compact horizontal */}
        <div className="shrink-0 px-4 pb-3 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <FilterPanel />
          </div>
          <RegionSelect regionList={regionList} />
        </div>

        {/* Card list — scrollable */}
        <div className="flex-1 overflow-y-auto px-3 pb-6">
          <CardList locations={filteredLocations} total={locations.length} />
        </div>
      </aside>
    </>
  )
}
