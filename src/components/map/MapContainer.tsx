import { useEffect, useRef, type ReactNode } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '@/store/useMapStore'
import { DEFAULT_VIEWPORT, MIN_ZOOM, MAX_ZOOM, JAPAN_BOUNDS, detectTileProxy, getResolvedTileBase, getResolvedStyleUrl } from '@/constants/mapDefaults'

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

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return

    let cancelled = false

    const initMap = async () => {
      // 🔍 自动检测最佳瓦片代理（直连 vs Vercel 代理）
      await detectTileProxy()
      if (cancelled) return

      const styleUrl = getResolvedStyleUrl('standard')
      const resolvedBase = getResolvedTileBase()
      const isDirect = resolvedBase === 'https://tiles.openfreemap.org'
      const isMobile = window.innerWidth < 768

      const map = new maplibregl.Map({
        container: mapContainer.current!,
        style: styleUrl,
        center: [DEFAULT_VIEWPORT.center[1], DEFAULT_VIEWPORT.center[0]],
        zoom: DEFAULT_VIEWPORT.zoom,
        minZoom: MIN_ZOOM,
        maxZoom: isMobile ? 18 : MAX_ZOOM,
        maxBounds: JAPAN_BOUNDS,
        attributionControl: false,
        pixelRatio: isMobile ? 1 : window.devicePixelRatio,
        fadeDuration: 0,
        refreshExpiredTiles: false,
        // NOTE: localIdeographFontFamily depends on locally-installed CJK fonts.
        // PBF glyph fallback (localIdeographFontFamily: false) is disabled,
        // so missing CJK glyphs will render as tofu (□) on systems without
        // the specified fonts installed.
        localIdeographFontFamily: "'Noto Sans SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
        canvasContextAttributes: { antialias: false },
        trackResize: true,
        collectResourceTiming: false,
        crossSourceCollisions: false,
        maxTileCacheSize: isMobile ? 50 : 200,
        pitch: 0,
        maxPitch: 0,
        bearing: 0,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        transformRequest: (url, _resourceType) => {
          if (isDirect) return { url }
          if (url.includes('tiles.openfreemap.org')) {
            return { url: url.replace('https://tiles.openfreemap.org', resolvedBase + '/tiles') }
          }
          if (url.includes('workers.dev') && url.includes('/tiles')) {
            return { url: url.replace(/https:\/\/[^/]+\/tiles/, resolvedBase + '/tiles') }
          }
          return { url }
        },
      })

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
        }),
        'bottom-right'
      )

      // 超时保护：15 秒后强制跳过加载页
      const LOAD_TIMEOUT = 15000
      const loadTimeout = setTimeout(() => {
        if (cancelled || initialized.current) return
        console.warn('[Map] 地图加载超时（>15s），强制跳过加载页')
        mapRef.current = map
        setMapInstance(map)
        setMapReady(true)
        initialized.current = true
      }, LOAD_TIMEOUT)

      map.on('load', () => {
        clearTimeout(loadTimeout)
        mapRef.current = map
        setMapInstance(map)
        setMapReady(true)
        initialized.current = true
      })

      map.on('error', (e) => {
        console.error('[Map] MapLibre 错误:', e.error?.status, e.error?.message)
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

      // styledata：style 加载完成后作为 fallback 信号
      let styleLoaded = false
      map.on('styledata', () => {
        if (!styleLoaded) {
          styleLoaded = true
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

      // 中文标签 + 移除3D建筑
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
          if (layer.type === 'fill-extrusion') {
            map.removeLayer(layer.id)
          }
        }
      })

      let lastBoundsUpdate = 0
      map.on('moveend', () => {
        const now = Date.now()
        if (now - lastBoundsUpdate < 150) return
        lastBoundsUpdate = now
        const b = map.getBounds()
        setBounds({
          north: b.getNorth(),
          south: b.getSouth(),
          east: b.getEast(),
          west: b.getWest(),
        })
      })

      map.on('click', (e) => {
        if (map.getLayer('location-dots')) {
          const features = map.queryRenderedFeatures(e.point, { layers: ['location-dots'] })
          if (features.length > 0) return
        }
        setSelectedMarkerId(null)
      })

      const flyTo = (lng: number, lat: number, zoom?: number) => {
        map.flyTo({
          center: [lng, lat],
          zoom: zoom ?? map.getZoom(),
          duration: 1200,
        })
      }
      setFlyToMarker(flyTo)
    }

    initMap()

    return () => {
      cancelled = true
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
