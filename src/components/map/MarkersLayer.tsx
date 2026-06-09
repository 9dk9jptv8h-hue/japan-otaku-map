import { useMemo, memo } from 'react'
import type { LocationData } from '@/types'
import { useMapStore } from '@/store/useMapStore'
import { isInBounds } from '@/utils/markers'
import { CustomMarker } from './CustomMarker'

interface MarkersLayerProps {
  locations: LocationData[]
}

export const MarkersLayer = memo(function MarkersLayer({ locations }: MarkersLayerProps) {
  const bounds = useMapStore((s) => s.bounds)

  // 🚀 Viewport culling — 仅渲染可视区域内的标记
  const visibleLocations = useMemo(() => {
    return locations.filter((loc) =>
      isInBounds(loc.latitude, loc.longitude, bounds)
    )
  }, [locations, bounds])

  return (
    <>
      {visibleLocations.map((location) => (
        <CustomMarker key={location.id} location={location} />
      ))}
    </>
  )
})
