import type { LocationData } from '@/types'
import { MapView } from '@/components/map/MapContainer'
import { MarkersLayer } from '@/components/map/MarkersLayer'
import { MapControls } from '@/components/map/MapControls'
import { RouteLayer } from '@/components/navigation/RouteLayer'
import { NavigationPanel } from '@/components/navigation/NavigationPanel'
import { SearchBar } from '@/components/sidebar/SearchBar'
import { FilterPanel } from '@/components/sidebar/FilterPanel'
import { SortPopover } from '@/components/sidebar/SortPopover'
import { RegionSelect } from '@/components/sidebar/RegionSelect'
import { CardList } from '@/components/sidebar/CardList'
import { useUIStore } from '@/store/useUIStore'
import { useFilteredLocations } from '@/hooks/useFilteredLocations'
import { Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MobileLayoutProps {
  locations: LocationData[]
}

export function MobileLayout({ locations }: MobileLayoutProps) {
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const { filteredLocations, regionList } = useFilteredLocations()

  return (
    <div className="relative h-full w-full">
      {/* 地图全屏 */}
      <MapView>
        <MarkersLayer locations={filteredLocations} />
        <RouteLayer />
      </MapView>

      {/* 地图控件 */}
      <MapControls className="absolute top-16 right-3 z-[999]" />

      {/* 顶部搜索栏 — 侧边栏打开时不渲染 */}
      {!sidebarOpen && (
        <div className="absolute top-0 left-0 right-0 z-[1000] p-2 pt-safe pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl glass shadow-soft border border-[var(--color-border)] active:scale-95 transition-transform"
              aria-label="打开菜单"
            >
              <Menu className="h-5 w-5 text-[var(--color-text-dim)]" />
            </button>
            <div className="flex-1 glass rounded-xl shadow-soft border border-[var(--color-border)] pointer-events-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      )}

      {/* 遮罩 — 点击关闭抽屉 */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 左侧滑出抽屉 — 弹簧动画 */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50 w-[85vw] max-w-[360px]',
          'sidebar-gradient flex flex-col',
          'shadow-xl'
        )}
        style={{
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* Header — compact single line */}
        <div className="header-gradient shrink-0 px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">🗾 日本动漫店铺地图</h1>
            <span className="inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-xs">
              📍 {locations.length}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 active:scale-90 transition-all"
            aria-label="关闭"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 搜索 + 筛选 + 地区 */}
        <div className="shrink-0 space-y-3 px-3 py-3 glass border-b border-[var(--color-border)]">
          {/* SearchBar + SortPopover 同行 */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchBar />
            </div>
            <SortPopover />
          </div>

          {/* FilterPanel — compact dots */}
          <FilterPanel />

          {/* RegionSelect — 地区下拉 */}
          <RegionSelect regionList={regionList} />
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-3 pt-2 pb-safe">
          <CardList locations={filteredLocations} total={locations.length} />
        </div>
      </div>

      {/* 导航面板 — 底部 Sheet */}
      <NavigationPanel />
    </div>
  )
}
