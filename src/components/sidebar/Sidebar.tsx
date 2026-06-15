import type { LocationData } from '@/types'
import { useUIStore } from '@/store/useUIStore'
import { useFilterStore } from '@/store/useFilterStore'
import { useFilteredLocations } from '@/hooks/useFilteredLocations'
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
  const { selectedRegion, setSelectedRegion } = useFilterStore()
  const { filteredLocations, regionList } = useFilteredLocations()

  return (
    <>
      {/* 折叠状态下的展开按钮 */}
      {sidebarCollapsed && (
        <SidebarToggle collapsed onClick={toggleSidebar} />
      )}

      {/* 侧边栏 — GPU 加速的 transform 动画 */}
      <aside
        className={cn(
          'sidebar-gradient fixed top-0 left-0 bottom-0 z-30 flex flex-col',
          'gpu-layer',
          'shadow-elevated',
          'transition-transform duration-400',
          sidebarCollapsed
            ? '-translate-x-full'
            : 'translate-x-0',
          'w-[var(--sidebar-width)]',
          className
        )}
        style={{
          transitionTimingFunction: sidebarCollapsed
            ? 'cubic-bezier(0.4, 0, 0.2, 1)'
            : 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* Header — 彩色渐变 */}
        <div className="header-gradient shrink-0 px-5 pt-6 pb-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                🗾 日本旅游地图
              </h1>
              <p className="text-sm text-white/70 mt-1">
                7大连锁 — 全国地点一览
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs backdrop-blur-sm">
                  📍 {locations.length} 地点
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SidebarToggle collapsed={false} onClick={toggleSidebar} className="relative top-0 !bg-white/20 hover:!bg-white/30 !border-transparent !text-white !backdrop-blur-none" />
            </div>
          </div>
        </div>

        {/* 搜索 + 筛选 — 玻璃面板 */}
        <div className="shrink-0 space-y-3 px-4 py-4 glass border-b border-[var(--color-border)]">
          <SearchBar />
          <FilterPanel />
          <SortControl />
        </div>

        {/* 地区筛选 — 横向滚动 chips */}
        {regionList.length > 1 && (
          <div className="shrink-0 px-4 py-3 border-b border-[var(--color-border)]">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
              <button
                onClick={() => setSelectedRegion(null)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                  'border border-[var(--color-border)]',
                  'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                  'active:scale-95',
                  selectedRegion === null
                    ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                    : 'bg-white/10 text-[var(--color-text-dim)]'
                )}
              >
                全部
              </button>
              {regionList.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region === selectedRegion ? null : region)}
                  className={cn(
                    'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                    'border border-[var(--color-border)]',
                    'hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]',
                    'active:scale-95',
                    selectedRegion === region
                      ? 'bg-[var(--color-accent)] text-white border-[var(--color-accent)]'
                      : 'bg-white/10 text-[var(--color-text-dim)]'
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 卡片列表 */}
        <div className="flex-1 overflow-y-auto px-3 pb-6 pt-2">
          <CardList locations={filteredLocations} total={locations.length} />
        </div>
      </aside>
    </>
  )
}
