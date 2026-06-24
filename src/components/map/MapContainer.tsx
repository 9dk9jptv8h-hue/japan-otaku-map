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
  const setSelectedMarkerId = useMapStore((s) => s.setSelectedMarkerId)

  // 初始化地图
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    const styleConfig = TILE_STYLES.standard

    // 移动端检测 — 降低 GPU 负载
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
      maxTileCacheSize: isMobile ? 50 : 200,
      // 2D平面模式 — 禁止倾斜和旋转，降低GPU负担
      pitch: 0,
      maxPitch: 0,
      bearing: 0,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      // Vercel 环境：所有瓦片/字体/精灵图请求走 Edge Rewrites 代理
      transformRequest: (url, _resourceType) => {
        const isVercel = window.location.hostname.includes('vercel.app')
        if (!isVercel) return { url }
        // 所有 OpenFreeMap 请求统一走 Vercel /tiles/ 代理
        if (url.includes('tiles.openfreemap.org')) {
          return { url: url.replace('https://tiles.openfreemap.org', '/tiles') }
        }
        // Cloudflare Worker 请求也走代理
        if (url.includes('workers.dev') && url.includes('/tiles')) {
          return { url: url.replace(/https:\/\/[^/]+\/tiles/, '/tiles') }
        }
        return { url }
      },
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
      clearTimeout(loadTimeout)
      mapRef.current = map
      setMapInstance(map)
      setMapReady(true)
      initialized.current = true
    })

    // 超时保护：15 秒后无论如何显示地图容器
    const LOAD_TIMEOUT = 15000
    const loadTimeout = setTimeout(() => {
      if (!initialized.current) {
        console.warn('[Map] 地图加载超时（>15s），强制跳过加载页')
        mapRef.current = map
        setMapInstance(map)
        setMapReady(true)
        initialized.current = true
      }
    }, LOAD_TIMEOUT)

    // 错误处理：关键资源加载失败时也跳过加载页
    map.on('error', (e) => {
      console.error('[Map] MapLibre 错误:', e.error?.status, e.error?.message)
      // 404/502/503 说明 style 或瓦片不可达，强制跳过加载页让用户看到界面
      if (
        e.error?.status === 404 ||
        e.error?.status === 502 ||
        e.error?.status === 503 ||
        e.error?.status === 403
      ) {
        if (!initialized.current) {
          console.warn('[Map] 关键资源加载失败（' + e.error.status + '），强制跳过加载页')
          mapRef.current = map
          setMapInstance(map)
          setMapReady(true)
          initialized.current = true
        }
      }
    })

    // styledata 事件：style 加载完成后也作为 fallback 信号
    // 如果 'load' 事件因为个别瓦片失败而不触发，至少 style 加载完就能看到地图框架
    let styleLoaded = false
    map.on('styledata', () => {
      if (!styleLoaded) {
        styleLoaded = true
        // 给瓦片 8 秒时间加载，之后强制解锁
        setTimeout(() => {
          if (!initialized.current) {
            console.warn('[Map] style 已加载但 load 事件超时，强制跳过加载页')
            mapRef.current = map
            setMapInstance(map)
            setMapReady(true)
            initialized.current = true
          }
        }, 8000)
      }
    })

    // 矢量瓦片中文标签替换 + 移除3D建筑层
    map.on('style.load', () => {
      const style = map.getStyle()
      if (!style?.layers) return
      for (const layer of style.layers) {
        // 中文标签替换：name优先中文，回退本地名
        if (layer.type === 'symbol' && layer.layout?.['text-field']) {
          const textField = layer.layout['text-field']
          if (typeof textField === 'string' && /\{name\b/.test(textField)) {
            map.setLayoutProperty(layer.id, 'text-field',
              ['coalesce', ['get', 'name:zh'], ['get', 'name']]
            )
          }
        }
        // 移除3D建筑物层
        if (layer.type === 'fill-extrusion') {
          map.removeLayer(layer.id)
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

  return (
    <div ref={mapContainer} className="h-full w-full">
      {children}
    </div>
  )
}
