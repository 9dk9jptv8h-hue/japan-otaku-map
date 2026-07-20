import type { LocationData } from '@/types'
import { useFilteredLocations } from '@/hooks/useFilteredLocations'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MapView } from '@/components/map/MapContainer'
import { MarkersLayer } from '@/components/map/MarkersLayer'
import { MapControls } from '@/components/map/MapControls'
import { RouteLayer } from '@/components/navigation/RouteLayer'
import { NavigationPanel } from '@/components/navigation/NavigationPanel'

interface DesktopLayoutProps {
  locations: LocationData[]
}

export function DesktopLayout({ locations }: DesktopLayoutProps) {
  const { filteredLocations } = useFilteredLocations()

  return (
    <div className="relative flex h-full w-full overflow-hidden">
      {/* 地图全屏 — 永远不因侧边栏重绘 */}
      <div className="absolute inset-0">
        <MapView>
          <MarkersLayer locations={filteredLocations} />
          <RouteLayer />
        </MapView>
        {/* 地图控件 */}
        <div className="absolute top-4 right-4 z-[1000]">
          <MapControls />
        </div>
      </div>

      {/* 侧边栏浮在地图上方 */}
      <Sidebar locations={locations} />

      {/* 导航面板 — 浮动在右侧，MapControls 下方 */}
      <NavigationPanel />
    </div>
  )
}
