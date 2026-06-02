import { useEffect, useCallback, useRef, type ReactNode } from 'react'
import { MapContainer as LeafletMapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useMapStore } from '@/store/useMapStore'
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM, FLY_DURATION, JAPAN_BOUNDS } from '@/constants/mapDefaults'

// 地图事件监听 + viewport 同步
function MapEventBinder() {
  const map = useMap()
  const setBounds = useMapStore((s) => s.setBounds)
  const setFlyToMarker = useMapStore((s) => s.setFlyToMarker)
  const setMapReady = useMapStore((s) => s.setMapReady)
  const setMapInstance = useMapStore((s) => s.setMapInstance)
  const initialized = useRef(false)
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useMapEvents({
    moveend: () => {
      // 防抖：autoPan 动画中不立即更新，等动画结束再同步一次
      if (moveTimer.current) clearTimeout(moveTimer.current)
      moveTimer.current = setTimeout(() => {
        const b = map.getBounds()
        setBounds({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        })
      }, 200)
    },
    click: () => {
      useMapStore.getState().setSelectedMarkerId(null)
    },
  })

  // 暴露飞到功能给 store
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

// 动态瓦片图层
function DynamicTileLayer() {
  const tileLayer = useMapStore((s) => s.tileLayer)
  const getTileConfig = useMapStore((s) => s.getTileConfig)
  const config = getTileConfig()

  return (
    <TileLayer
      key={tileLayer}
      url={config.url}
      attribution={config.attribution}
      maxZoom={MAX_ZOOM}
    />
  )
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
      <DynamicTileLayer />
      <MapEventBinder />
      {children}
    </LeafletMapContainer>
  )
}
