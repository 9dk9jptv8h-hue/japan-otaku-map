import { useEffect, useRef, type ReactNode } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '@/store/useMapStore'
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM, JAPAN_BOUNDS, TILE_STYLES } from '@/constants/mapDefaults'

interface MapViewProps {
  children?: ReactNode
}

// 构建 MapLibre raster 样式对象 — 替代矢量瓦片 style JSON URL
function buildRasterStyle(config: { url: string; attribution: string }) {
  return {
    version: 8 as const,
    sources: {
      'carto-tiles': {
        type: 'raster' as const,
        tiles: [
          config.url.replace('{s}', 'a'),
          config.url.replace('{s}', 'b'),
          config.url.replace('{s}', 'c'),
          config.url.replace('{s}', 'd'),
        ],
        tileSize: 256,
        attribution: config.attribution,
        maxzoom: 19,
      },
    },
    // MarkersLayer 的 location-labels symbol 图层需要字体渲染
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    layers: [
      {
        id: 'carto-layer',
        type: 'raster' as const,
        source: 'carto-tiles',
        minzoom: 0,
        maxzoom: 22,
      },
    ],
  }
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
      style: buildRasterStyle(styleConfig),
      center: [DEFAULT_VIEWPORT.center[1], DEFAULT_VIEWPORT.center[0]],
      zoom: DEFAULT_VIEWPORT.zoom,
      minZoom: MIN_ZOOM,
      maxZoom: isMobile ? 18 : MAX_ZOOM,
      maxBounds: JAPAN_BOUNDS,
      attributionControl: false,
      // 性能优化
      pixelRatio: isMobile ? 1 : window.devicePixelRatio,
      fadeDuration: isMobile ? 0 : 300,
      // CJK 文字本地渲染 — MarkersLayer 的 symbol 图层标签需要此配置
      localIdeographFontFamily: "'Noto Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
      canvasContextAttributes: { antialias: false },
      trackResize: true,
      collectResourceTiming: false,
      crossSourceCollisions: false,
      ...(isMobile ? {
        maxTileCacheSize: 50,
      } : {}),
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

    // Raster 瓦片自带标签渲染，无需矢量瓦片的中文标签替换逻辑

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

  // 图层切换 — raster style 即时替换
  useEffect(() => {
    if (!mapRef.current || !initialized.current) return
    const styleConfig = TILE_STYLES[tileLayer]
    mapRef.current.setStyle(buildRasterStyle(styleConfig))
  }, [tileLayer])

  return (
    <div ref={mapContainer} className="h-full w-full">
      {children}
    </div>
  )
}
