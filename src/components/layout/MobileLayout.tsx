import { useEffect } from 'react'
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
import { ChevronRight, List, Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface MobileLayoutProps {
  locations: LocationData[]
}

export function MobileLayout({ locations }: MobileLayoutProps) {
  const sidebarOpen = useUIStore(s => s.sidebarOpen)
  const setSidebarOpen = useUIStore(s => s.setSidebarOpen)
  const { filteredLocations, regionList } = useFilteredLocations()

  // 抽屉打开时锁定背景滚动
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [sidebarOpen])

  // Esc 关闭抽屉
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, setSidebarOpen])

  return (
    <div className="relative h-full w-full">
      {/* 地图全屏 */}
      <MapView>
        <MarkersLayer locations={filteredLocations} />
        <RouteLayer />
      </MapView>

      {/* 地图控件 */}
        <MapControls
          className="absolute right-3 z-[999]"
          style={{ top: 'calc(env(safe-area-inset-top, 0px) + 64px)' }}
        />
      {!sidebarOpen && (
        <div className="absolute top-0 left-0 right-0 z-[1000] p-2 pt-safe pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl glass border border-[var(--color-border)] shadow-soft transition-[transform,box-shadow] duration-200 active:scale-95"
              aria-label="打开菜单"
            >
              <Menu className="h-5 w-5 text-[var(--color-text-dim)]" />
            </button>
            <div className="min-w-0 flex-1 rounded-2xl glass border border-[var(--color-border)] shadow-soft pointer-events-auto">
              <SearchBar />
            </div>
          </div>
        </div>
      )}

      {/* 遮罩 */}
      <div
        role="dialog"
        aria-label="关闭菜单"
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/45 backdrop-blur-[2px] transition-opacity duration-300',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 左侧滑出抽屉 */}
      <div
        className={cn(
          'sidebar-gradient fixed top-0 left-0 bottom-0 z-50 flex w-[88vw] max-w-[400px] flex-col',
          'overflow-hidden rounded-r-[28px] border-r border-white/80 shadow-xl'
        )}
        style={{
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-104%)',
          transition: 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
          willChange: 'transform',
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {/* 品牌头部 */}
        <div className="header-gradient relative shrink-0 px-4 pb-3.5 pt-4 text-white">
          <div className="relative z-10 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/20 text-[17px] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                🗾
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-[15px] font-extrabold tracking-tight">
                  日本动漫店铺地图
                </h1>
                <p className="mt-0.5 truncate text-[9px] font-semibold uppercase tracking-[0.16em] text-white/60">
                  Otaku Store Map · {locations.length} stores
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20 transition-[background-color,transform] duration-200 hover:bg-white/35 active:scale-90"
              aria-label="关闭"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 搜索 + 筛选 + 地区 */}
        <div className="shrink-0 space-y-2.5 border-b border-[var(--color-border)] bg-white/55 px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <SearchBar />
            </div>
            <SortPopover />
          </div>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <FilterPanel locations={locations} />
            </div>
            <RegionSelect regionList={regionList} />
          </div>
        </div>

        {/* 列表 */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-3 pt-3 pb-safe">
          <CardList locations={filteredLocations} total={locations.length} />
        </div>
      </div>

      {/* 底部结果栏 — 提升列表入口的可见性 */}
      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className={cn(
            'absolute left-3 right-[92px] z-[998] flex h-12 items-center justify-center gap-1.5',
            'rounded-2xl glass border border-[var(--color-border)] shadow-elevated',
            'text-[12.5px] font-semibold text-[var(--color-text)]',
            'transition-[transform,box-shadow] duration-200 active:scale-[0.97]'
          )}
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)' }}
        >
          <List className="h-4 w-4 text-[var(--color-accent)]" />
          {filteredLocations.length}/{locations.length} 个地点
          <ChevronRight className="h-3.5 w-3.5 text-[var(--color-text-dim)]" />
        </button>
      )}

      {/* 导航面板 — 底部 Sheet */}
      <NavigationPanel />
    </div>
  )
}
