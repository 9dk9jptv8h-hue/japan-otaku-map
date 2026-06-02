import { useMemo } from 'react'
import type { LocationData } from '@/types'
import { useMapStore } from '@/store/useMapStore'
import { isInBounds } from '@/utils/markers'
import { CustomMarker } from './CustomMarker'

interface MarkersLayerProps {
  locations: LocationData[]
}

export function MarkersLayer({ locations }: MarkersLayerProps) {
  const bounds = useMapStore((s) => s.bounds)

  // 只在视野内渲染（视野外跳过以优化性能）
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
}
