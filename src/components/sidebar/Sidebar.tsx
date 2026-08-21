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
  const sidebarCollapsed = useUIStore(s => s.sidebarCollapsed)
  const toggleSidebar = useUIStore(s => s.toggleSidebar)
  const { filteredLocations, regionList } = useFilteredLocations()

  return (
    <>
      {sidebarCollapsed && (
        <SidebarToggle collapsed onClick={toggleSidebar} />
      )}

      {/* 浮动玻璃侧栏 — 与地图边缘留出呼吸空间 */}
      <aside
        className={cn(
          'sidebar-gradient fixed left-3 top-3 bottom-3 z-30 flex w-[var(--sidebar-width)] flex-col',
          'overflow-hidden rounded-[26px] border border-white/80 shadow-elevated gpu-layer',
          'transition-transform duration-400',
          sidebarCollapsed ? '-translate-x-[calc(100%+24px)]' : 'translate-x-0',
          className
        )}
        style={{
          transitionTimingFunction: sidebarCollapsed
            ? 'cubic-bezier(0.4, 0, 0.2, 1)'
            : 'var(--ease-spring)',
        }}
      >
        {/* 品牌头部 */}
        <div className="header-gradient relative shrink-0 px-4 pb-3.5 pt-4 text-white">
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-[17px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] backdrop-blur-sm">
                🗾
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-[15px] font-extrabold tracking-tight">
                    日本动漫店铺地图
                  </h1>
                  <span className="shrink-0 rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                    {locations.length}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">
                  Otaku Store Map · Japan
                </p>
              </div>
            </div>
            <SidebarToggle
              collapsed={false}
              onClick={toggleSidebar}
              className="!h-8 !w-8 !bg-white/20 hover:!bg-white/30 !border-transparent !text-white"
            />
          </div>
        </div>

        {/* 搜索 + 排序 */}
        <div className="shrink-0 px-3 pt-3">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchBar />
            </div>
            <SortPopover />
          </div>
        </div>

        {/* 品牌胶囊 + 地区 — 单行横向滑动 */}
        <div className="shrink-0 flex items-center gap-2 px-3 pb-3 pt-2.5">
          <div className="min-w-0 flex-1">
            <FilterPanel locations={locations} />
          </div>
          <RegionSelect regionList={regionList} />
        </div>

        {/* 地点列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-6">
          <CardList locations={filteredLocations} total={locations.length} />
        </div>
      </aside>
    </>
  )
}
