import type { LocationData } from '@/types'
import { useFilteredLocations } from '@/hooks/useFilteredLocations'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MapView } from '@/components/map/MapContainer'
import { MarkersLayer } from '@/components/map/MarkersLayer'
import { MapControls } from '@/components/map/MapControls'

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
        </MapView>
        {/* 地图控件 */}
        <div className="absolute bottom-4 right-4 z-[1000]">
          <MapControls />
        </div>
      </div>

      {/* 侧边栏浮在地图上方 */}
      <Sidebar locations={locations} />
    </div>
  )
}
