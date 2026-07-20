import { memo, useEffect, useRef, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import { useMapStore } from '@/store/useMapStore'
import { useNavigationStore } from '@/store/useNavigationStore'
import { CATEGORIES } from '@/constants/theme'
import { getCityPhoto } from '@/utils/city-photo'
import type { LocationData } from '@/types'

function escapeHTML(str: string): string {
  return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]!))
}

interface MarkersLayerProps {
  locations: LocationData[]
}

/**
 * WebGL 原生标记图层 — 使用 GeoJSON Source + Circle/Symbol Layer
 *
 * 替代旧版 DOM Marker 方案（每个 marker 一个 DOM 元素）。
 * WebGL 图层与地图瓦片同步渲染，消除 pan/zoom 时标记拖尾。
 * 100+ 标记零延迟，GPU 合批绘制。
 *
 * Hover 放大使用 feature-state + interpolate(顶层) + case(内层) 写法。
 */
function MarkersLayerInner({ locations }: MarkersLayerProps) {
  const mapInstance = useMapStore((s) => s.mapInstance)
  const setSelectedMarkerId = useMapStore((s) => s.setSelectedMarkerId)
  const hoveredMarkerId = useMapStore((s) => s.hoveredMarkerId)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const hoveredFeatureIdRef = useRef<number | null>(null)
  const settingUpRef = useRef(false)
  const willUnmountRef = useRef(false)

  // Track actual unmount so we only tear down layers/source on final unmount,
  // not on every dependency change (e.g. locations data update).
  // MUST be declared BEFORE the main effect so its cleanup runs first on unmount.
  useEffect(() => {
    return () => {
      willUnmountRef.current = true
    }
  }, [])

  // 字符串 location.id → 数字 feature index 映射
  const idToIndexMap = useMemo(() => {
    const m = new Map<string, number>()
    locations.forEach((loc, i) => m.set(loc.id, i))
    return m
  }, [locations])

  useEffect(() => {
    if (!mapInstance) return

    const map = mapInstance

    // 构建 GeoJSON FeatureCollection — 每个 feature 必须有数字顶层 id
    const buildGeoJSON = () => ({
      type: 'FeatureCollection',
      features: locations.map((loc, index) => ({
        type: 'Feature' as const,
        id: index, // 数字顶层 ID，feature-state 必须
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.longitude, loc.latitude],
        },
        properties: {
          id: loc.id,
          name: loc.name,
          nameJa: loc.nameJa || '',
          category: loc.category,
          description: loc.description || '',
          rating: loc.rating || 0,
          address: loc.address || '',
          visitCount: loc.visitCount || 0,
          tags: JSON.stringify(loc.tags || []),
          imageUrl: loc.imageUrl || '',
        },
      })),
    })

    // ─── 点击标记 → 弹出 Popup + 同步 store ───
    const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
      if (!e.features || !e.features[0]) return
      const feature = e.features[0]
      const coords = (feature.geometry as { type: 'Point'; coordinates: number[] }).coordinates.slice() as [number, number]
      const props = feature.properties!

      // 检查当前选中状态（toggle 逻辑）
      const currentSelected = useMapStore.getState().selectedMarkerIds
      const isCurrentlySelected = currentSelected.includes(props.id)

      // 调用 store toggle
      setSelectedMarkerId(props.id)

      if (isCurrentlySelected) {
        // 取消选中 → 关闭 popup
        if (popupRef.current) {
          popupRef.current.remove()
          popupRef.current = null
        }
        return
      }

      // 选中 → 打开 popup
      if (popupRef.current) {
        popupRef.current.remove()
      }

      const popupHTML = renderPopupHTML(props)

      popupRef.current = new maplibregl.Popup({
        offset: 15,
        maxWidth: '300px',
        closeButton: true,
        closeOnClick: true,
        className: 'maplibre-popup-card',
      })
        .setLngLat(coords)
        .setHTML(popupHTML)
        .addTo(map)

      popupRef.current.on('close', () => {
        popupRef.current = null
        // popup 关闭时同步取消选中
        const stillSelected = useMapStore.getState().selectedMarkerIds
        if (stillSelected.includes(props.id)) {
          useMapStore.getState().removeSelectedMarkerId(props.id)
        }
      })
    }

    // ─── 鼠标 hover → feature-state 驱动放大 + 光标 ───
    const handleMouseMove = (e: maplibregl.MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = 'pointer'
      if (e.features && e.features[0]) {
        const fid = e.features[0].id as number
        if (hoveredFeatureIdRef.current === fid) return
        // 清除上一个（try-catch 防止 source 在检查和调用之间被移除）
        if (hoveredFeatureIdRef.current !== null) {
          try {
            map.setFeatureState(
              { source: 'locations', id: hoveredFeatureIdRef.current },
              { hover: false }
            )
          } catch (e) { if (e instanceof Error && !e.message.includes('does not exist')) console.warn('Feature state error:', e) }
        }
        // 设置新的
        hoveredFeatureIdRef.current = fid
        try {
          map.setFeatureState(
            { source: 'locations', id: fid },
            { hover: true }
          )
        } catch (e) { if (e instanceof Error && !e.message.includes('does not exist')) console.warn('Feature state error:', e) }
        // 同步 store（侧边栏卡片高亮）
        const locId = e.features[0].properties?.id as string
        if (locId) {
          useMapStore.getState().setHoveredMarkerId(locId)
        }
      }
    }

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = ''
      const currentHovered = useMapStore.getState().hoveredMarkerId
      if (!currentHovered) {
        if (hoveredFeatureIdRef.current !== null) {
          map.setFeatureState(
            { source: 'locations', id: hoveredFeatureIdRef.current },
            { hover: false }
          )
          hoveredFeatureIdRef.current = null
        }
        useMapStore.getState().setHoveredMarkerId(null)
      }
    }

    // 事件绑定
    map.on('click', 'location-dots', handleClick)
    map.on('mousemove', 'location-dots', handleMouseMove)
    map.on('mouseleave', 'location-dots', handleMouseLeave)

    // Register global navigation handler for popup buttons
    ;(window as any).__navigateToStore = (id: string) => {
      const loc = locations.find(l => l.id === id)
      if (loc) {
        useNavigationStore.getState().startNavigation(loc)
      }
    }

    const setupLayers = () => {
      const geojson = buildGeoJSON()

      // 数据源已存在 → 仅更新数据
      if (map.getSource('locations')) {
        ;(map.getSource('locations') as maplibregl.GeoJSONSource).setData(geojson)
        return
      }

      // 添加 GeoJSON 数据源
      map.addSource('locations', {
        type: 'geojson',
        data: geojson,
      })

      // ─── Circle Layer（标记圆点）— interpolate 顶层 + case 内层（feature-state hover）───
      map.addLayer({
        id: 'location-dots',
        type: 'circle',
        source: 'locations',
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            4, ['case', ['boolean', ['feature-state', 'hover'], false], 5, 3],
            8, ['case', ['boolean', ['feature-state', 'hover'], false], 8, 5],
            12, ['case', ['boolean', ['feature-state', 'hover'], false], 11, 7],
            16, ['case', ['boolean', ['feature-state', 'hover'], false], 14, 9],
          ],
          'circle-color': ([
            'match', ['get', 'category'],
            ...CATEGORIES.flatMap(c => [c.key, c.color]),
            '#607d8b'
          ] as any),
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': [
            'interpolate', ['linear'], ['zoom'],
            4, ['case', ['boolean', ['feature-state', 'hover'], false], 2, 1],
            12, ['case', ['boolean', ['feature-state', 'hover'], false], 3, 2],
          ],
          'circle-opacity': 0.9,
        },
      })

      // ─── Symbol Layer（文字标签，高缩放级别可见）───
      map.addLayer({
        id: 'location-labels',
        type: 'symbol',
        source: 'locations',
        minzoom: 10,
        layout: {
          'text-field': ['get', 'name'],
          'text-size': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 10,
            14, 13,
          ],
          'text-offset': [0, 1.5],
          'text-anchor': 'top',
          'text-max-width': 8,
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 1.5,
        },
      })
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
      if (!map.getSource('locations')) {
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
      map.off('click', 'location-dots', handleClick)
      map.off('mousemove', 'location-dots', handleMouseMove)
      map.off('mouseleave', 'location-dots', handleMouseLeave)
      map.off('style.load', setupLayers)
      map.off('styledata', handleStyleData)
      delete (window as any).__navigateToStore
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
      // Only remove layers/source on actual unmount, not on dependency changes.
      // On data updates, setupLayers() handles incremental updates via setData().
      if (!willUnmountRef.current) return
      try {
        if (map.getLayer('location-labels')) map.removeLayer('location-labels')
        if (map.getLayer('location-dots')) map.removeLayer('location-dots')
        if (map.getSource('locations')) map.removeSource('locations')
      } catch (e) {
        if (e instanceof Error && !e.message.includes('does not exist')) console.warn('Cleanup error:', e)
      }
    }
  }, [mapInstance, locations, setSelectedMarkerId])

  // ─── 侧边栏 hover 联动：监听 store.hoveredMarkerId → 设置 feature-state ───
  useEffect(() => {
    if (!mapInstance) return
    // 确保 source 已存在
    if (!mapInstance.getSource('locations')) return

    // 清除之前由侧边栏触发的 hover 状态
    // 注意：如果是地图 mousemove 触发的，hoveredFeatureIdRef 已经由事件处理器管理
    // 这里只处理侧边栏发起的变更
    if (hoveredMarkerId) {
      const targetIdx = idToIndexMap.get(hoveredMarkerId)
      if (targetIdx !== undefined && hoveredFeatureIdRef.current !== targetIdx) {
        // 清除旧的
        if (hoveredFeatureIdRef.current !== null) {
          try {
            mapInstance.setFeatureState(
              { source: 'locations', id: hoveredFeatureIdRef.current },
              { hover: false }
            )
          } catch (e) { if (e instanceof Error && !e.message.includes('does not exist')) console.warn('Feature state error:', e) }
        }
        // 设置新的
        try {
          mapInstance.setFeatureState(
            { source: 'locations', id: targetIdx },
            { hover: true }
          )
        } catch (e) { if (e instanceof Error && !e.message.includes('does not exist')) console.warn('Feature state error:', e) }
        hoveredFeatureIdRef.current = targetIdx
      }
    } else {
      // hoveredMarkerId 为 null → 清除所有 hover
      if (hoveredFeatureIdRef.current !== null) {
        try {
          mapInstance.setFeatureState(
            { source: 'locations', id: hoveredFeatureIdRef.current },
            { hover: false }
          )
        } catch (e) { if (e instanceof Error && !e.message.includes('does not exist')) console.warn('Feature state error:', e) }
        hoveredFeatureIdRef.current = null
      }
    }
  }, [hoveredMarkerId, mapInstance, idToIndexMap])

  // 纯 WebGL 渲染 — 无 DOM 输出
  return null
}

export const MarkersLayer = memo(MarkersLayerInner)

// ─── Popup HTML 渲染（匹配 CustomMarker 原有样式）───
function renderPopupHTML(props: Record<string, unknown>): string {
  const name = props.name as string
  const nameJa = props.nameJa as string
  const category = props.category as string
  const description = props.description as string
  const rating = props.rating as number
  const address = props.address as string
  const visitCount = props.visitCount as number
  const tagsRaw = props.tags as string

  const categoryMeta = CATEGORIES.find((c) => c.key === category)
  const color = categoryMeta?.color ?? '#607d8b'
  const label = categoryMeta?.label ?? ''
  const photoUrl = getCityPhoto(name, address)

  // 解析标签
  let tags: string[] = []
  try {
    tags = JSON.parse(tagsRaw || '[]')
  } catch (e) {
    if (e instanceof Error) console.warn('Tag parse error:', e)
  }

  const tagHtml = tags
    .slice(0, 5)
    .map(
      (tag) =>
        `<span style="
          border-radius:6px;padding:2px 8px;font-size:10px;font-weight:500;
          background:${color}15;color:${color};border:1px solid ${color}25;
        ">${escapeHTML(tag)}</span>`
    )
    .join('')

  const ratingHtml = rating
    ? `<span style="display:flex;align-items:center;gap:4px;border-radius:8px;background:rgba(0,0,0,0.4);padding:2px 8px;font-size:11px;font-weight:600;color:white;backdrop-filter:blur(4px);">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#f2a7b4" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${rating}
      </span>`
    : ''

  const visitHtml =
    visitCount != null && visitCount > 0
      ? `<span style="font-size:11px;font-weight:600;color:var(--color-text, #1a1a2e);opacity:0.7;flex-shrink:0;">
          🔥 ${visitCount >= 10000 ? `${(visitCount / 10000).toFixed(1)}万` : visitCount}
        </span>`
      : ''

  return `
    <div style="width:280px;overflow:hidden;font-family:'Microsoft YaHei','PingFang SC','Hiragino Sans GB',system-ui,sans-serif;">
      <div style="position:relative;height:120px;overflow:hidden;background:#f0f0f0;">
        <img src="${photoUrl}" alt="${escapeHTML(address)}" loading="lazy"
          style="width:100%;height:100%;object-fit:cover;"
          onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg, ${color}33, ${color}11)';"/>
        <div style="position:absolute;bottom:0;left:0;right:0;height:40px;pointer-events:none;background:linear-gradient(to top, var(--color-surface, #fff), transparent);"></div>
        ${label ? `<span style="position:absolute;top:12px;left:12px;border-radius:8px;padding:2px 10px;font-size:10px;font-weight:700;color:white;background:${color};letter-spacing:0.05em;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${label}</span>` : ''}
        ${ratingHtml ? `<span style="position:absolute;top:12px;right:12px;">${ratingHtml}</span>` : ''}
      </div>
      <div style="padding:12px 16px 16px;">
        <h3 style="font-size:15px;font-weight:700;color:var(--color-text, #1a1a2e);line-height:1.3;margin:0;">${escapeHTML(name)}</h3>
        ${nameJa ? `<p style="font-size:11px;color:var(--color-text-dim, #5c5c7a);opacity:0.6;margin:4px 0 0;">${escapeHTML(nameJa)}</p>` : ''}
        <p style="font-size:12px;color:var(--color-text-dim, #5c5c7a);line-height:1.5;margin:8px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escapeHTML(description)}</p>
        ${tags.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${tagHtml}</div>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--color-border, rgba(0,0,0,0.06));">
          <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--color-text-dim, #5c5c7a);opacity:0.5;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            ${escapeHTML(address)}
          ${visitHtml}
        </div>

<button onclick="window.__navigateToStore && window.__navigateToStore('${(props.id as string).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}')"
  style="
    display:flex;align-items:center;justify-content:center;gap:6px;
    width:100%;margin-top:12px;padding:8px 0;
    border:none;border-radius:12px;
    background:${color}18;color:${color};
    font-size:12px;font-weight:600;font-family:inherit;
    cursor:pointer;transition:all 0.2s;
  "
  onmousedown="this.style.transform='scale(0.97)'"
  onmouseup="this.style.transform='scale(1)'"
  onmouseleave="this.style.transform='scale(1)'"
>
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="3 11 22 2 13 21 11 13 3 11"/>
  </svg>
  导航到这里
</button>

      </div>
    </div>
  `
}
