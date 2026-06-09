import { useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react'
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
    let timer: ReturnType<typeof setTimeout>
    const observer = new ResizeObserver(() => {
      clearTimeout(timer)
      timer = setTimeout(() => map.invalidateSize(), 150)
    })
    observer.observe(container)
    return () => { observer.disconnect(); clearTimeout(timer) }
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

// MapTiler 中文路网 — 使用 WebP 格式减少瓦片体积
const KEY = 'n1nlGHzCLRC9VuGsFphI'

function MapTileLayer() {
  const map = useMap()
  useEffect(() => {
    const layer = L.tileLayer(
      `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${KEY}&lang=zh`,
      {
        maxZoom: 20,
        maxNativeZoom: 18,
        updateWhenZooming: false,
        keepBuffer: 6,
        updateInterval: 150,
      }
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
  // Canvas 渲染器 — 大量 Marker 时比 SVG 快 4-8x
  const canvasRenderer = useMemo(() => L.canvas({ padding: 0.5 }), [])

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
      // 🚀 Canvas 渲染器取代默认 SVG
      preferCanvas={true}
      renderer={canvasRenderer}
      // 惯性优化
      inertia={true}
      inertiaDeceleration={3000}
      inertiaMaxSpeed={1500}
      easeLinearity={0.2}
      worldCopyJump={false}
      // 性能微调
      fadeAnimation={true}
      zoomAnimation={true}
      markerZoomAnimation={true}
    >
      <MapTileLayer />
      <MapEventBinder />
      {children}
    </LeafletMapContainer>
  )
}
