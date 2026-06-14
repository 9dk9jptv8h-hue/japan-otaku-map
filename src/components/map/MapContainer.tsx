import { useEffect, useRef, type ReactNode } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '@/store/useMapStore'
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM, JAPAN_BOUNDS, TILE_STYLES } from '@/constants/mapDefaults'

interface MapViewProps {
  children?: ReactNode
}

export function MapView({ children }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const initialized = useRef(false)

  const setBounds = useMapStore((s) => s.setBounds)
  const setFlyToMarker = useMapStore((s) => s.setFlyToMarker)
  const setMapReady = useMapStore((s) => s.setMapReady)
  const setMapInstance = useMapStore((s) => s.setMapInstance)
  const tileLayer = useMapStore((s) => s.tileLayer)
  const setSelectedMarkerId = useMapStore((s) => s.setSelectedMarkerId)

  // 初始化地图
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const styleConfig = TILE_STYLES[tileLayer]

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleConfig.url,
      center: [DEFAULT_VIEWPORT.center[1], DEFAULT_VIEWPORT.center[0]],
      zoom: DEFAULT_VIEWPORT.zoom,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: JAPAN_BOUNDS,
      attributionControl: false,
      // 性能优化
      fadeDuration: 300,
      // 本地表意文字字体回退 — 确保中日文字符能正确渲染
      localIdeographFontFamily: "'Noto Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    })

    // 添加地图归因（精简版）
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: styleConfig.attribution,
      }),
      'bottom-right'
    )

    map.on('load', () => {
      mapRef.current = map
      setMapInstance(map)
      setMapReady(true)
      initialized.current = true
    })

    // 中文标签自动检测：遍历 symbol 图层，将 text-field 改为优先使用 name:zh
    // 适用于 OpenFreeMap / OpenMapTiles 等包含多语言字段的矢量瓦片
    map.on('style.load', () => {
      const style = map.getStyle()
      if (!style?.layers) return

      for (const layer of style.layers) {
        if (layer.type === 'symbol' && layer.layout?.['text-field']) {
          const textField = layer.layout['text-field']
          if (typeof textField === 'string' && /\{name\b/.test(textField)) {
            // 优先使用中文名 (name:zh)，回退到本地名 (name)
            map.setLayoutProperty(
              layer.id,
              'text-field',
              ['coalesce', ['get', 'name:zh'], ['get', 'name']],
            )
          }
        }
      }
    })

    // moveend：同步边界到 store
    map.on('moveend', () => {
      const b = map.getBounds()
      setBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      })
    })

    // 点击空白取消选中
    map.on('click', () => {
      setSelectedMarkerId(null)
    })

    // flyTo 注册
    const flyTo = (lng: number, lat: number, zoom?: number) => {
      map.flyTo({
        center: [lng, lat],
        zoom: zoom ?? map.getZoom(),
        duration: 1200,
      })
    }
    setFlyToMarker(flyTo)

    return () => {
      map.remove()
      mapRef.current = null
      setMapInstance(null)
      setFlyToMarker(null)
      setMapReady(false)
    }
  }, [])

  // 图层切换 — 平滑 setStyle
  useEffect(() => {
    if (!mapRef.current || !initialized.current) return
    const styleConfig = TILE_STYLES[tileLayer]
    mapRef.current.setStyle(styleConfig.url)
  }, [tileLayer])

  return (
    <div ref={mapContainer} className="h-full w-full">
      {children}
    </div>
  )
}
