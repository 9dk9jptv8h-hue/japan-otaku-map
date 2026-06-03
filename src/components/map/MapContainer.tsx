import { useEffect, useCallback, useRef, type ReactNode } from 'react'
import { MapContainer as LeafletMapContainer, useMap, useMapEvents } from 'react-leaflet'
import { useMapStore } from '@/store/useMapStore'
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM, FLY_DURATION, JAPAN_BOUNDS } from '@/constants/mapDefaults'
import L from 'leaflet'

// 地图事件监听 + viewport 同步
function MapEventBinder() {
  const map = useMap()
  const setBounds = useMapStore((s) => s.setBounds)
  const setFlyToMarker = useMapStore((s) => s.setFlyToMarker)
  const setMapReady = useMapStore((s) => s.setMapReady)
  const setMapInstance = useMapStore((s) => s.setMapInstance)
  const initialized = useRef(false)

  useEffect(() => {
    const container = map.getContainer()
    if (!container) return
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [map])

  useMapEvents({
    moveend: () => {
      const b = map.getBounds()
      setBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    },
    click: () => {
      useMapStore.getState().setSelectedMarkerId(null)
    },
  })

  const flyTo = useCallback(
    (lat: number, lng: number, zoom?: number) => {
      map.flyTo([lat, lng], zoom ?? map.getZoom(), {
        duration: FLY_DURATION / 1000,
      })
    },
    [map]
  )

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    setMapInstance(map)
    setFlyToMarker(() => flyTo)
    setMapReady(true)
    return () => {
      setMapInstance(null)
      setFlyToMarker(null)
      setMapReady(false)
    }
  }, [map, flyTo, setMapInstance, setFlyToMarker, setMapReady])

  return null
}

// MapTiler 中文路网地图
const KEY = 'n1nlGHzCLRC9VuGsFphI'

function MapTileLayer() {
  const map = useMap()
  useEffect(() => {
    const layer = L.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${KEY}&lang=zh`,
      { maxZoom: 20, maxNativeZoom: 18 }
    )
    layer.addTo(map)
    return () => { layer.remove() }
  }, [map])
  return null
}

interface MapViewProps {
  children?: ReactNode
}

export function MapView({ children }: MapViewProps) {
  return (
    <LeafletMapContainer
      center={DEFAULT_VIEWPORT.center}
      zoom={DEFAULT_VIEWPORT.zoom}
      minZoom={MIN_ZOOM}
      maxZoom={MAX_ZOOM}
      zoomControl={false}
      className="h-full w-full"
      attributionControl={false}
      maxBounds={JAPAN_BOUNDS}
      maxBoundsViscosity={0.8}
    >
      <MapTileLayer />
      <MapEventBinder />
      {children}
    </LeafletMapContainer>
  )
}
