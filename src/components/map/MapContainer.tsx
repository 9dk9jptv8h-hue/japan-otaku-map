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

    // 移动端检测 — 降低 GPU 负载 + 禁用不必要的动画
    const isMobile = window.innerWidth < 768

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleConfig.url,
      center: [DEFAULT_VIEWPORT.center[1], DEFAULT_VIEWPORT.center[0]],
      zoom: DEFAULT_VIEWPORT.zoom,
      minZoom: MIN_ZOOM,
      maxZoom: isMobile ? 18 : MAX_ZOOM,
      maxBounds: JAPAN_BOUNDS,
      attributionControl: false,
      // 性能优化
      pixelRatio: isMobile ? 1 : window.devicePixelRatio,
      fadeDuration: 0,                    // 瓦片切换无淡入，直接显示
      refreshExpiredTiles: false,         // 不刷新过期瓦片，缓存优先
      // CJK 文字本地渲染 — MarkersLayer 的 symbol 图层标签需要此配置
      localIdeographFontFamily: "'Noto Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
      canvasContextAttributes: { antialias: false },
      trackResize: true,
      collectResourceTiming: false,
      crossSourceCollisions: false,
      ...(isMobile ? {
        maxTileCacheSize: 50,
      } : {
        maxTileCacheSize: 200,
      }),
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

    // 矢量瓦片中文标签替换 — name:zh 优先
    map.on('style.load', () => {
      const style = map.getStyle()
      if (!style?.layers) return
      for (const layer of style.layers) {
        if (layer.type === 'symbol' && layer.layout?.['text-field']) {
          const textField = layer.layout['text-field']
          if (typeof textField === 'string' && /\{name\b/.test(textField)) {
            map.setLayoutProperty(layer.id, 'text-field',
              ['coalesce', ['get', 'name:zh'], ['get', 'name']]
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

    // 点击空白取消选中 — 检查是否点击了 WebGL 标记图层，避免误清
    map.on('click', (e) => {
      if (map.getLayer('location-dots')) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['location-dots'] })
        if (features.length > 0) return // 点击了标记，不清除选中
      }
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
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        setMapInstance(null)
        setFlyToMarker(null)
        setMapReady(false)
      }
    }
  }, [])

  // 图层切换 — 矢量瓦片 style URL 直接替换
  useEffect(() => {
    if (!mapRef.current || !initialized.current) return
    mapRef.current.setStyle(TILE_STYLES[tileLayer].url)
  }, [tileLayer])

  return (
    <div ref={mapContainer} className="h-full w-full">
      {children}
    </div>
  )
}
