import { useEffect, useRef, memo } from 'react'
import maplibregl from 'maplibre-gl'
import type { LocationData, LocationCategory } from '@/types'
import { CATEGORIES } from '@/constants/theme'
import { useMapStore } from '@/store/useMapStore'
import { getCityPhoto } from '@/utils/city-photo'

function getMarkerColor(category: LocationCategory): string {
  const meta = CATEGORIES.find((c) => c.key === category)
  return meta?.color ?? '#607d8b'
}

function getCategorySvg(category: LocationCategory): string {
  switch (category) {
    case 'animate':
      return `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M3 7v1"/><path d="M21 7v1"/><path d="M12 21V7"/><path d="M3 7l9-4 9 4"/><path d="M8 13v3"/><path d="M16 13v3"/><path d="M12 11v5"/></svg>`
    case 'melonbooks':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="10" y1="8" x2="16" y2="8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`
    case 'mandarake':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    case 'pilgrimage':
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21h16"/><path d="M6 5h12"/><path d="M4 5h3l2-3h6l2 3h3"/><path d="M7 21V5"/><path d="M17 21V5"/></svg>`
    default:
      return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>`
  }
}

interface CustomMarkerProps {
  location: LocationData
  map: maplibregl.Map | null
}

export const CustomMarker = memo(function CustomMarker({ location, map }: CustomMarkerProps) {
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const popupRef = useRef<maplibregl.Popup | null>(null)
  const elementRef = useRef<HTMLDivElement | null>(null)
  // 缓存 DOM 子节点引用，避免更新时重复 querySelector
  const dotRef = useRef<HTMLDivElement | null>(null)
  const pulseRef = useRef<HTMLDivElement | null>(null)

  const isSelected = useMapStore((s) => s.selectedMarkerIds.includes(location.id))
  const isHovered = useMapStore((s) => s.hoveredMarkerId === location.id)
  const setSelected = useMapStore((s) => s.setSelectedMarkerId)
  const removeSelected = useMapStore((s) => s.removeSelectedMarkerId)
  const setHovered = useMapStore((s) => s.setHoveredMarkerId)

  const color = getMarkerColor(location.category)
  const iconSvg = getCategorySvg(location.category)
  const borderRadius = location.category === 'mandarake' ? '50%' : '12px'

  // 创建 marker HTML 元素（仅一次，使用 innerHTML 一次性构建静态结构）
  useEffect(() => {
    const el = document.createElement('div')
    el.className = 'custom-marker-el'
    el.setAttribute('data-marker-id', location.id)

    // 一次性构建 HTML 结构 — 之后的更新通过 classList + style 属性完成
    el.innerHTML = `
      <div class="marker-container" style="display:flex;align-items:center;justify-content:center;">
        <div class="marker-dot" style="
          display:flex;align-items:center;justify-content:center;
          color:white;
        ">
          ${iconSvg}
        </div>
        <div class="marker-pulse-ring" style="
          position:absolute;
          pointer-events:none;
        "></div>
      </div>
    `

    // 缓存关键 DOM 节点
    dotRef.current = el.querySelector('.marker-dot') as HTMLDivElement
    pulseRef.current = el.querySelector('.marker-pulse-ring') as HTMLDivElement

    // 初始化 CSS 变量，避免首帧闪烁
    const initialSize = 30
    const initialRadius = location.category === 'mandarake' ? '50%' : '12px'
    el.style.setProperty('--marker-size', `${initialSize}px`)
    el.style.setProperty('--marker-color', color)
    el.style.setProperty('--marker-radius', initialRadius)
    el.style.setProperty('--marker-border', '2px')
    el.style.setProperty('--marker-shadow', `0 4px 14px ${color}55`)

    elementRef.current = el
    return () => {
      el.remove()
      elementRef.current = null
      dotRef.current = null
      pulseRef.current = null
    }
  }, [])

  // 更新 marker 外观 — 使用 classList + style.setProperty，绝不使用 innerHTML
  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const size = isSelected ? 42 : isHovered ? 36 : 30
    const borderWidth = isSelected ? 3 : 2
    const pulse = isSelected

    // 用 CSS 自定义属性传递动态值，避免逐一设置 inline style
    el.style.setProperty('--marker-size', `${size}px`)
    el.style.setProperty('--marker-color', color)
    el.style.setProperty('--marker-radius', borderRadius)
    el.style.setProperty('--marker-border', `${borderWidth}px`)
    el.style.setProperty('--marker-shadow', isSelected
      ? `0 8px 24px ${color}55`
      : `0 4px 14px ${color}55`
    )

    // 状态切换用 classList — 比 className 赋值更精确
    el.classList.toggle('marker-selected', isSelected)
    el.classList.toggle('marker-hovered', isHovered && !isSelected)

    // 脉冲环显示/隐藏
    if (pulseRef.current) {
      pulseRef.current.style.display = pulse ? 'block' : 'none'
    }

    // 缩放效果（hover 非 selected 时）
    if (dotRef.current) {
      dotRef.current.style.transform = (isHovered && !isSelected) ? 'scale(1.15)' : ''
    }
  }, [isSelected, isHovered, color, borderRadius])

  // 挂载/卸载 marker — 只在 map 实例或 location 坐标变化时触发
  useEffect(() => {
    const el = elementRef.current
    if (!el || !map) return

    // 先清除旧 marker
    if (markerRef.current) {
      markerRef.current.remove()
    }
    if (popupRef.current) {
      popupRef.current.remove()
    }

    const marker = new maplibregl.Marker({
      element: el,
      anchor: 'bottom',
      offset: [0, 4],
    })
      .setLngLat([location.longitude, location.latitude])
      .addTo(map)

    // 创建 popup（空内容，后续按需填充）
    const popup = new maplibregl.Popup({
      offset: [0, -44],
      closeButton: true,
      closeOnClick: false,
      maxWidth: '280px',
      className: 'maplibre-popup-card',
    })

    // 点击 marker → toggle popup + 选中
    el.onclick = (e) => {
      e.stopPropagation()
      if (!popup.isOpen()) {
        const popupContainer = document.createElement('div')
        popupContainer.innerHTML = renderPopupCard(location)
        popup.setLngLat([location.longitude, location.latitude])
        popup.setDOMContent(popupContainer)
        popup.addTo(map)
        setSelected(location.id)
      } else {
        popup.remove()
        removeSelected(location.id)
      }
    }

    // 悬浮效果
    el.onmouseenter = () => setHovered(location.id)
    el.onmouseleave = () => setHovered(null)

    markerRef.current = marker
    popupRef.current = popup

    return () => {
      marker.remove()
      popup.remove()
      markerRef.current = null
      popupRef.current = null
    }
  }, [map, location.longitude, location.latitude, location.id])

  // 选中状态变化时同步 popup 开关
  useEffect(() => {
    if (!popupRef.current || !map) return
    if (isSelected) {
      if (!popupRef.current.isOpen()) {
        const popupContainer = document.createElement('div')
        popupContainer.innerHTML = renderPopupCard(location)
        popupRef.current.setLngLat([location.longitude, location.latitude])
        popupRef.current.setDOMContent(popupContainer)
        popupRef.current.addTo(map)
      }
    } else {
      if (popupRef.current.isOpen()) {
        popupRef.current.remove()
      }
    }
  }, [isSelected])

  return null
})

// 用 HTML 字符串渲染 PopupCard
function renderPopupCard(location: LocationData): string {
  const category = CATEGORIES.find((c) => c.key === location.category)
  const color = category?.color ?? '#607d8b'
  const label = category?.label ?? ''
  const photoUrl = getCityPhoto(location.name, location.address)

  const tagHtml = location.tags.slice(0, 5).map((tag) =>
    `<span style="
      border-radius:6px;padding:2px 8px;font-size:10px;font-weight:500;
      background:${color}15;color:${color};border:1px solid ${color}25;
    ">${tag}</span>`
  ).join('')

  const ratingHtml = location.rating
    ? `<span style="display:flex;align-items:center;gap:4px;border-radius:8px;background:rgba(0,0,0,0.4);padding:2px 8px;font-size:11px;font-weight:600;color:white;backdrop-filter:blur(4px);">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#f2a7b4" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        ${location.rating}
      </span>`
    : ''

  const visitHtml = location.visitCount != null
    ? `<span style="font-size:11px;font-weight:600;color:var(--color-text, #1a1a2e);opacity:0.7;flex-shrink:0;">
        🔥 ${(location.visitCount / 10000).toFixed(1)}万
      </span>`
    : ''

  return `
    <div style="width:280px;overflow:hidden;font-family:'Noto Sans SC','Hiragino Sans GB',system-ui,sans-serif;">
      <div style="position:relative;height:120px;overflow:hidden;background:#f0f0f0;">
        <img src="${photoUrl}" alt="${location.address}" loading="lazy"
          style="width:100%;height:100%;object-fit:cover;"
          onerror="this.style.display='none';this.parentElement.style.background='linear-gradient(135deg, ${color}33, ${color}11)';"/>
        <div style="position:absolute;bottom:0;left:0;right:0;height:40px;pointer-events:none;background:linear-gradient(to top, var(--color-surface, #fff), transparent);"></div>
        ${label ? `<span style="position:absolute;top:12px;left:12px;border-radius:8px;padding:2px 10px;font-size:10px;font-weight:700;color:white;background:${color};letter-spacing:0.05em;box-shadow:0 2px 8px rgba(0,0,0,0.2);">${label}</span>` : ''}
        ${ratingHtml ? `<span style="position:absolute;top:12px;right:12px;">${ratingHtml}</span>` : ''}
      </div>
      <div style="padding:12px 16px 16px;">
        <h3 style="font-size:15px;font-weight:700;color:var(--color-text, #1a1a2e);line-height:1.3;margin:0;">${location.name}</h3>
        ${location.nameJa ? `<p style="font-size:11px;color:var(--color-text-dim, #5c5c7a);opacity:0.6;margin:4px 0 0;">${location.nameJa}</p>` : ''}
        <p style="font-size:12px;color:var(--color-text-dim, #5c5c7a);line-height:1.5;margin:8px 0 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${location.description}</p>
        ${location.tags.length > 0 ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px;">${tagHtml}</div>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:1px solid var(--color-border, rgba(0,0,0,0.06));">
          <span style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--color-text-dim, #5c5c7a);opacity:0.5;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
            ${location.address}
          </span>
          ${visitHtml}
        </div>
      </div>
    </div>
  `
}
