import { useMemo } from 'react'
import type { LocationData } from '@/types'
import { useFilterStore } from '@/store/useFilterStore'
import { useUIStore } from '@/store/useUIStore'
import { useDebounce } from '@/hooks/useDebounce'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MapView } from '@/components/map/MapContainer'
import { MarkersLayer } from '@/components/map/MarkersLayer'
import { MapControls } from '@/components/map/MapControls'
import { cn } from '@/utils/cn'

interface DesktopLayoutProps {
  locations: LocationData[]
}

export function DesktopLayout({ locations }: DesktopLayoutProps) {
  const selectedCategories = useFilterStore((s) => s.selectedCategories)
  const searchQuery = useFilterStore((s) => s.searchQuery)
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)
  const debouncedSearch = useDebounce(searchQuery, 300)

  // 同时按分类和搜索词过滤地图标记
  const mapLocations = useMemo(() => {
    let result = selectedCategories.length === 0 ? [] : locations.filter((loc) => selectedCategories.includes(loc.category))
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
    return result
  }, [locations, selectedCategories, debouncedSearch])

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* 地图全屏 — 永远不因侧边栏重绘 */}
      <div className="absolute inset-0">
        <MapView>
          <MarkersLayer locations={mapLocations} />
        </MapView>
        {/* 地图控件 */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <MapControls />
        </div>
      </div>

      {/* 侧边栏打开时显示轻薄遮罩 — 点击关闭侧边栏 */}
      <div
        className={cn(
          'absolute inset-0 z-20 bg-black/10 transition-opacity duration-300 cursor-pointer',
          sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => toggleSidebar()}
      />

      {/* 侧边栏浮在地图上方 */}
      <Sidebar locations={locations} />
    </div>
  )
}
