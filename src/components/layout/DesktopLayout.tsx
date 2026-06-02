import { useMemo } from 'react'
import type { LocationData } from '@/types'
import { useFilterStore } from '@/store/useFilterStore'
import { Sidebar } from '@/components/sidebar/Sidebar'
import { MapView } from '@/components/map/MapContainer'
import { MarkersLayer } from '@/components/map/MarkersLayer'
import { MapControls } from '@/components/map/MapControls'
import { TileLayerSwitch } from '@/components/map/TileLayerSwitch'

interface DesktopLayoutProps {
  locations: LocationData[]
}

export function DesktopLayout({ locations }: DesktopLayoutProps) {
  const selectedCategories = useFilterStore((s) => s.selectedCategories)

  // 地图上的标记：没勾选任何分类 → 不显示任何标记；勾选了 → 只显示勾选的
  const mapLocations = useMemo(() => {
    if (selectedCategories.length === 0) return []
    return locations.filter((loc) => selectedCategories.includes(loc.category))
  }, [locations, selectedCategories])

  return (
    <div className="flex h-full w-full">
      <Sidebar locations={locations} />
      <div className="relative flex-1 h-full">
        <MapView>
          <MarkersLayer locations={mapLocations} />
        </MapView>
        {/* 悬浮控件（现在通过 store 访问地图，不需要在 MapContainer 内） */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <MapControls />
          <TileLayerSwitch />
        </div>
      </div>
    </div>
  )
}
