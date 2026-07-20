import { memo, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/store/useMapStore'
import { useNavigationStore } from '@/store/useNavigationStore'

/**
 * WebGL 原生路线渲染图层 — 使用单 GeoJSON Source + 多 Layer（filter 分流）
 *
 * 替代 DOM overlay 方案，与地图瓦片同步渲染。
 * 一个 source('nav-route') 包含三种 feature：route 线、start 点、end 点。
 * 每种 feature 通过 layer filter 独立设置样式。
 */
function RouteLayerInner() {
  const mapInstance = useMapStore((s) => s.mapInstance)
  const route = useNavigationStore((s) => s.route)
  const origin = useNavigationStore((s) => s.origin)
  const destination = useNavigationStore((s) => s.destination)
  const settingUpRef = useRef(false)

  useEffect(() => {
    if (!mapInstance) return

    const map = mapInstance
    const hasData = !!(route && origin && destination)

    // 构建 GeoJSON FeatureCollection — 三种 feature 合并到单一 source
    const buildRouteGeoJSON = () => ({
      type: 'FeatureCollection' as const,
      features: [
        ...(route
          ? [
              {
                type: 'Feature' as const,
                geometry: route.geometry,
                properties: { type: 'route' },
              },
            ]
          : []),
        ...(origin
          ? [
              {
                type: 'Feature' as const,
                geometry: {
                  type: 'Point' as const,
                  coordinates: [origin.lng, origin.lat],
                },
                properties: { type: 'start' },
              },
            ]
          : []),
        ...(destination
          ? [
              {
                type: 'Feature' as const,
                geometry: {
                  type: 'Point' as const,
                  coordinates: [destination.longitude, destination.latitude],
                },
                properties: { type: 'end' },
              },
            ]
          : []),
      ],
    })

    const setupLayers = () => {
      if (!hasData) {
        // 导航已清除 → 清理所有图层和 source
        try {
          if (map.getLayer('nav-route-line')) map.removeLayer('nav-route-line')
          if (map.getLayer('nav-route-outline')) map.removeLayer('nav-route-outline')
          if (map.getLayer('nav-route-end')) map.removeLayer('nav-route-end')
          if (map.getLayer('nav-route-start')) map.removeLayer('nav-route-start')
          if (map.getSource('nav-route')) map.removeSource('nav-route')
        } catch (e) {
          // ignore "does not exist" errors
        }
        return
      }

      const geojson = buildRouteGeoJSON()

      // 数据源已存在 → 仅更新数据
      if (map.getSource('nav-route')) {
        ;(map.getSource('nav-route') as maplibregl.GeoJSONSource).setData(geojson as any)
        return
      }

      // 添加 GeoJSON 数据源
      map.addSource('nav-route', {
        type: 'geojson',
        data: geojson as any,
      })

      // Outline layer（白色边框，提升对比度）
      map.addLayer({
        id: 'nav-route-outline',
        type: 'line',
        source: 'nav-route',
        filter: ['==', ['get', 'type'], 'route'],
        paint: {
          'line-color': '#ffffff',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 16, 8],
          'line-opacity': 0.7,
        },
      })

      // 主线（indigo-500）
      map.addLayer({
        id: 'nav-route-line',
        type: 'line',
        source: 'nav-route',
        filter: ['==', ['get', 'type'], 'route'],
        paint: {
          'line-color': '#6366f1',
          'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 16, 5],
          'line-opacity': 0.9,
        },
      })

      // 终点标记（红色，目的地）
      map.addLayer({
        id: 'nav-route-end',
        type: 'circle',
        source: 'nav-route',
        filter: ['==', ['get', 'type'], 'end'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 8, 16, 14],
          'circle-color': '#ef4444',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-opacity': 0.95,
        },
      })

      // 起点标记（蓝色，用户 GPS 位置）
      map.addLayer({
        id: 'nav-route-start',
        type: 'circle',
        source: 'nav-route',
        filter: ['==', ['get', 'type'], 'start'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 7, 16, 12],
          'circle-color': '#3b82f6',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-opacity': 0.95,
        },
      })

      // 自动 fitBounds 展示完整路线
      if (route && origin && destination) {
        const bounds = new maplibregl.LngLatBounds()
        route.geometry.coordinates.forEach((coord: [number, number]) => bounds.extend(coord))
        bounds.extend([origin.lng, origin.lat])
        bounds.extend([destination.longitude, destination.latitude])

        map.fitBounds(bounds, {
          padding: { top: 60, bottom: 60, left: 60, right: 360 },
          maxZoom: 16,
          duration: 800,
        })
      }
    }

    // 地图样式已加载 → 立即初始化；否则等待
    if (map.isStyleLoaded()) {
      setupLayers()
    } else {
      map.on('style.load', setupLayers)
    }

    // 瓦片图层切换后，MapLibre 会替换整个 style，所有自定义 source/layer 丢失
    // 监听 styledata 事件，检测到 source 丢失后自动重建
    const handleStyleData = () => {
      if (settingUpRef.current) return
      if (!map.getSource('nav-route') && hasData) {
        settingUpRef.current = true
        try {
          setupLayers()
        } finally {
          settingUpRef.current = false
        }
      }
    }
    map.on('styledata', handleStyleData)

    return () => {
      map.off('style.load', setupLayers)
      map.off('styledata', handleStyleData)
      // 清除图层和数据源（如果还存在）
      try {
        if (map.getLayer('nav-route-line')) map.removeLayer('nav-route-line')
        if (map.getLayer('nav-route-outline')) map.removeLayer('nav-route-outline')
        if (map.getLayer('nav-route-end')) map.removeLayer('nav-route-end')
        if (map.getLayer('nav-route-start')) map.removeLayer('nav-route-start')
        if (map.getSource('nav-route')) map.removeSource('nav-route')
      } catch (e) {
        if (e instanceof Error && !e.message.includes('does not exist')) console.warn('Cleanup error:', e)
      }
    }
  }, [mapInstance, route, origin, destination])

  // 纯 WebGL 渲染 — 无 DOM 输出
  return null
}

export const RouteLayer = memo(RouteLayerInner)
