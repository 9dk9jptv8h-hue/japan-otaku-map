import type { LocationData } from '@/types'
import { MapView } from '@/components/map/MapContainer'
import { MarkersLayer } from '@/components/map/MarkersLayer'
import { MapControls } from '@/components/map/MapControls'
import { SearchBar } from '@/components/sidebar/SearchBar'
import { FilterPanel } from '@/components/sidebar/FilterPanel'
import { SortControl } from '@/components/sidebar/SortControl'
import { CardList } from '@/components/sidebar/CardList'
import { useUIStore } from '@/store/useUIStore'
import { useFilterStore } from '@/store/useFilterStore'
import { useFilteredLocations } from '@/hooks/useFilteredLocations'
import { Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MobileLayoutProps {
  locations: LocationData[]
}

export function MobileLayout({ locations }: MobileLayoutProps) {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { selectedRegion, setSelectedRegion } = useFilterStore()
  const { filteredLocations, regionList } = useFilteredLocations()

  return (
    <div className="relative h-full w-full" style={{ touchAction: 'pan-x pan-y pinch-zoom' }}>
      {/* 地图全屏 */}
      <MapView>
        <MarkersLayer locations={filteredLocations} />
      </MapView>

      {/* 地图控件 */}
      <MapControls className="absolute bottom-6 right-3 z-[999]" />

      {/* 顶部搜索栏 — 侧边栏打开时完全不渲染 */}
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
        {/* Header */}
        <div className="header-gradient shrink-0 px-4 pt-4 pb-3 text-white flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">🗾 日本旅游地图</h1>
            <p className="text-xs text-white/70 mt-0.5">7大连锁 — 全国地点一览</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-xs mt-2">
              📍 {locations.length} 地点
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

        {/* 搜索 + 筛选 */}
        <div className="shrink-0 space-y-3 px-3 py-3 glass border-b border-[var(--color-border)]">
          <SearchBar />
          <FilterPanel />
          <SortControl />
        </div>

        {/* 地区筛选 — 横向滚动 chips */}
        {regionList.length > 1 && (
          <div className="shrink-0 px-3 py-3 border-b border-[var(--color-border)]">
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

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto px-3 pt-2 pb-safe">
          <CardList locations={filteredLocations} total={locations.length} />
        </div>
      </div>
    </div>
  )
}
