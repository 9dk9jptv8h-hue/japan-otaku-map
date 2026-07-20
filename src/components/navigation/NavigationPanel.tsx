import { useState, useEffect, useRef } from 'react'
import {
  Navigation,
  Footprints,
  Bus,
  X,
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock,
  Route,
  ExternalLink,
  Loader2,
  LocateFixed,
  AlertCircle,
} from 'lucide-react'
import { useNavigationStore } from '@/store/useNavigationStore'
import { useMapStore } from '@/store/useMapStore'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { getGoogleMapsUrl } from '@/services/routingService'
import { cn } from '@/utils/cn'
import { fetchNearbyStations, getGoogleMapsTransitUrl } from '@/services/transitService'
import type { TransitStation } from '@/services/transitService'
import type { RouteStep } from '@/types/navigation'

// ─── 格式化工具 ───

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} 米`
  return `${(m / 1000).toFixed(1)} 公里`
}

function formatDuration(s: number): string {
  if (s < 60) return `${Math.ceil(s)} 秒`
  return `约 ${Math.ceil(s / 60)} 分钟`
}

// ─── 站点行组件 ───
function StationRow({
  station, isSelected, onClick, color,
}: {
  station: TransitStation
  isSelected: boolean
  onClick: () => void
  color: 'blue' | 'red'
}) {
  const dotColor = color === 'blue' ? 'bg-blue-500' : 'bg-red-500'
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 py-2 px-2 rounded-lg text-left transition-colors',
        isSelected ? 'bg-indigo-50' : 'hover:bg-gray-50',
      )}
    >
      <span className={cn('flex h-2.5 w-2.5 shrink-0 rounded-full', dotColor)} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--color-text)] truncate">{station.name}</p>
        {station.lines && station.lines.length > 0 && (
          <p className="text-[10px] text-[var(--color-text-dim)] truncate">
            {station.lines.slice(0, 3).join(' · ')}
          </p>
        )}
      </div>
      <span className="text-[10px] text-[var(--color-text-dim)] shrink-0">
        {station.distance < 1000 ? `${Math.round(station.distance)}m` : `${(station.distance / 1000).toFixed(1)}km`}
      </span>
    </button>
  )
}

// ─── 步行到站卡片 ───
function StationWalkCard({
  station, label, prefix,
}: {
  station: TransitStation
  label: string
  prefix: string
}) {
  return (
    <div className="rounded-xl bg-indigo-50 p-3 mt-1.5 space-y-2">
      <p className="text-xs font-medium text-indigo-700">
        {prefix} · {station.name}
      </p>
      <p className="text-[10px] text-indigo-500">
        距离约 {station.distance < 1000
          ? `${Math.round(station.distance)} 米`
          : `${(station.distance / 1000).toFixed(1)} 公里`}，步行约 {Math.ceil(station.distance / 80)} 分钟
      </p>
      <button
        onClick={() => {
          useNavigationStore.getState().setTransportMode('walking')
          useMapStore.getState().flyToMarker?.(station.lng, station.lat, 16)
        }}
        className="w-full rounded-lg bg-indigo-500 py-1.5 text-[10px] font-semibold text-white active:scale-95 transition-transform"
      >
        {label}
      </button>
    </div>
  )
}

// ─── 玻璃拟态样式 ───
const glassPanel =
  'bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/20'
const glassSheet =
  'bg-white/90 backdrop-blur-md shadow-lg border border-white/20'

export function NavigationPanel() {
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [stepsExpanded, setStepsExpanded] = useState(true)
  const [nearbyStations, setNearbyStations] = useState<TransitStation[]>([])
  const [loadingStations, setLoadingStations] = useState(false)
  const [selectedStation, setSelectedStation] = useState<TransitStation | null>(null)
  const [originStations, setOriginStations] = useState<TransitStation[]>([])
  const [loadingOriginStations, setLoadingOriginStations] = useState(false)
  const [selectedOriginStation, setSelectedOriginStation] = useState<TransitStation | null>(null)

  const {
    origin,
    destination,
    route,
    transportMode,
    isRouting,
    error,
    isPanelOpen,
    setTransportMode,
    setPanelOpen,
    clearNavigation,
  } = useNavigationStore()

  const activeStepIndex = useNavigationStore(s => s.activeStepIndex)
  const isTracking = useNavigationStore(s => s.isTracking)
  const isDeviated = useNavigationStore(s => s.isDeviated)
  const userPosition = useNavigationStore(s => s.userPosition)

  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    if (activeStepIndex >= 0 && stepRefs.current[activeStepIndex]) {
      stepRefs.current[activeStepIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeStepIndex])

  // ─── 公交模式：获取附近站点 ───
  useEffect(() => {
    if (transportMode === 'transit' && destination) {
      setLoadingStations(true)
      setSelectedStation(null)
      fetchNearbyStations(destination.latitude, destination.longitude, 2000)
        .then(setNearbyStations)
        .catch(() => setNearbyStations([]))
        .finally(() => setLoadingStations(false))
    } else {
      setNearbyStations([])
      setSelectedStation(null)
    }
  }, [transportMode, destination])

  // ─── 公交模式：获取起点附近站点 ───
  useEffect(() => {
    if (transportMode === 'transit' && origin) {
      setLoadingOriginStations(true)
      setSelectedOriginStation(null)
      fetchNearbyStations(origin.lat, origin.lng, 2000)
        .then(setOriginStations)
        .catch(() => setOriginStations([]))
        .finally(() => setLoadingOriginStations(false))
    } else {
      setOriginStations([])
      setSelectedOriginStation(null)
    }
  }, [transportMode, origin])

  // ─── 辅助函数 ───

  const handleStepClick = (step: RouteStep) => {
    if (step.coordinates) {
      useMapStore.getState().flyToMarker?.(
        step.coordinates[0],
        step.coordinates[1],
        17,
      )
    }
  }

  const handleRetry = () => {
    if (destination) {
      useNavigationStore.getState().startNavigation(destination)
    }
  }

  const handleOpenGoogleMaps = () => {
    if (destination) {
      window.open(
        getGoogleMapsUrl(
          { lat: destination.latitude, lng: destination.longitude },
          transportMode,
        ),
        '_blank',
      )
    }
  }

  // ═══════════════════════════════════════════
  // State 1: Error
  // ═══════════════════════════════════════════
  if (error) {
    const errorContent = (
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <p className="text-sm font-medium text-red-600">导航出错</p>
            <p className="mt-1 text-xs text-[var(--color-text-dim)]">
              {error}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRetry}
            className="flex-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-600"
          >
            重试
          </button>
          <button
            onClick={handleOpenGoogleMaps}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-500 transition-colors hover:bg-indigo-100"
          >
            Google Maps 导航
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    )

    if (isDesktop) {
      return (
        <div className="pointer-events-auto absolute right-4 top-[200px] z-[999] w-[340px]">
          <div className={glassPanel}>{errorContent}</div>
        </div>
      )
    }

    return (
      <div className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[1000] rounded-t-2xl bg-white/90 shadow-lg backdrop-blur-md border border-white/20">
        {errorContent}
      </div>
    )
  }

  // ═══════════════════════════════════════════
  // State 2: Loading
  // ═══════════════════════════════════════════
  if (isRouting) {
    const loadingContent = (
      <div className="flex items-center gap-3 p-4">
        <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-indigo-500" />
        <p className="text-sm text-[var(--color-text-dim)]">
          {origin ? '正在计算路线...' : '正在获取位置...'}
        </p>
      </div>
    )

    if (isDesktop) {
      return (
        <div className="pointer-events-auto absolute right-4 top-[200px] z-[999] w-[340px]">
          <div className={glassPanel}>{loadingContent}</div>
        </div>
      )
    }

    return (
      <div className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[1000] rounded-t-2xl bg-white/90 shadow-lg backdrop-blur-md border border-white/20">
        {loadingContent}
      </div>
    )
  }

  // ═══════════════════════════════════════════
  // State 3/4: No route → render nothing
  // ═══════════════════════════════════════════
  if (!route) return null

  // ═══════════════════════════════════════════
  // State 3: Mini badge / Collapsed mobile
  // ═══════════════════════════════════════════
  if (!isPanelOpen) {
    if (isDesktop) {
      return (
        <div className="pointer-events-auto absolute right-4 top-[200px] z-[999]">
          <button
            onClick={() => setPanelOpen(true)}
            className={cn(
              'flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm',
              glassPanel,
              'text-[var(--color-text)] transition-all duration-300 ease-out hover:scale-105 active:scale-95',
            )}
          >
            <Navigation className="h-4 w-4 text-indigo-500" />
            {transportMode === 'transit' ? (
              <>
                <span>公交方案</span>
                <span className="text-[var(--color-text-dim)]">&middot;</span>
                <span>步行到站约 {originStations[0] ? Math.ceil(originStations[0].distance / 80) : '?'} 分钟</span>
              </>
            ) : (
              <>
                <span>{formatDuration(route.duration)}</span>
                <span className="text-[var(--color-text-dim)]">&middot;</span>
                <span>{formatDistance(route.distance)}</span>
              </>
            )}
          </button>
        </div>
      )
    }

    // Mobile collapsed: thin bottom bar
    return (
      <div className="pointer-events-auto fixed bottom-0 left-0 right-0 z-[1000]">
        <button
          onClick={() => setPanelOpen(true)}
          className={cn(
            'flex h-14 w-full items-center justify-between px-4',
            'border-t border-white/20 bg-white/90 shadow-lg backdrop-blur-md',
            'text-[var(--color-text)] transition-all duration-300 ease-out',
          )}
        >
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="h-4 w-4 text-indigo-500" />
            {transportMode === 'transit' ? (
              <>
                <span>公交方案</span>
                <span className="text-[var(--color-text-dim)]">&middot;</span>
                <span>步行到站约 {originStations[0] ? Math.ceil(originStations[0].distance / 80) : '?'} 分钟</span>
              </>
            ) : (
              <>
                <span>{formatDuration(route.duration)}</span>
                <span className="text-[var(--color-text-dim)]">&middot;</span>
                <span>{formatDistance(route.distance)}</span>
              </>
            )}
          </div>
          <ChevronUp className="h-5 w-5 text-[var(--color-text-dim)]" />
        </button>
      </div>
    )
  }

  // ═══════════════════════════════════════════
  // State 4: Full panel content
  // ═══════════════════════════════════════════

  const isLastStep = (index: number) => index === route.steps.length - 1
  const destName = destination?.name ?? '目的地'

  const panelContent = (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <button
          onClick={clearNavigation}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          aria-label="关闭导航"
        >
          <X className="h-4 w-4 text-[var(--color-text-dim)]" />
        </button>

        {/* Transport mode toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-0.5">
          <button
            onClick={() => setTransportMode('walking')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
              transportMode === 'walking'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]',
            )}
          >
            <Footprints className="h-3.5 w-3.5" />
            步行
          </button>
          <button
            onClick={() => setTransportMode('transit')}
            className={cn(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all duration-200',
              transportMode === 'transit'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-[var(--color-text-dim)] hover:text-[var(--color-text)]',
            )}
          >
            <Bus className="h-3.5 w-3.5" />
            公交
          </button>
        </div>
      </div>

      {/* ── Tracking status indicator ── */}
      {isTracking && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-blue-50 border-b border-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span className="text-xs font-medium text-blue-600">
            正在追踪 · 第 {activeStepIndex + 1}/{route.steps.length} 步
          </span>
        </div>
      )}

      {/* ── Deviation warning ── */}
      {isDeviated && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-100">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-medium text-amber-700">已偏离路线，正在重新规划...</span>
        </div>
      )}

      {/* ── Mode indicator ── */}
      <div className="flex items-center gap-2 px-4 py-2.5 text-sm">
        {transportMode === 'walking' ? (
          <>
            <Footprints className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-[var(--color-text)]">
              步行模式
            </span>
          </>
        ) : (
          <>
            <Bus className="h-4 w-4 text-indigo-500" />
            <span className="font-medium text-[var(--color-text)]">
              公共交通模式
            </span>
          </>
        )}
      </div>

      {/* ── Origin / Destination ── */}
      <div className="flex flex-col gap-1.5 px-4 py-2">
        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 flex-shrink-0 text-blue-500" />
          <span
            className={cn(
              'text-sm',
              origin
                ? 'text-[var(--color-text)]'
                : 'text-[var(--color-text-dim)]',
            )}
          >
            我的位置
          </span>
        </div>

        {/* Connector line */}
        <div className="ml-[7px] flex items-center gap-2.5 pl-[7px]">
          <div className="h-4 w-0.5 bg-gray-300" />
          <ChevronDown className="-ml-1 h-3 w-3 text-[var(--color-text-dim)]" />
        </div>

        <div className="flex items-center gap-2.5">
          <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" />
          <span className="text-sm font-medium text-[var(--color-text)]">
            {destName}
          </span>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center gap-4 border-b border-gray-100 px-4 py-2">
        {transportMode === 'transit' ? (
          <>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-dim)]">
              <Footprints className="h-4 w-4 text-blue-400" />
              <span>步行到站约 {originStations[0] ? Math.ceil(originStations[0].distance / 80) : '?'} 分钟</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-dim)]">
              <Bus className="h-4 w-4 text-indigo-500" />
              <span>乘车</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-dim)]">
              <Footprints className="h-4 w-4 text-red-400" />
              <span>步行到店约 {nearbyStations[0] ? Math.ceil(nearbyStations[0].distance / 80) : '?'} 分钟</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-dim)]">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>{formatDuration(route.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-dim)]">
              <Route className="h-4 w-4 text-indigo-500" />
              <span>{formatDistance(route.distance)}</span>
            </div>
          </>
        )}
        {isTracking && userPosition && (
          <button
            onClick={() => {
              const pos = useNavigationStore.getState().userPosition
              if (pos) useMapStore.getState().flyToMarker?.(pos.lng, pos.lat, 17)
            }}
            className="ml-auto flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600 active:scale-95 transition-transform"
          >
            <LocateFixed className="h-3 w-3" /> 居中
          </button>
        )}
      </div>

      {/* ── Transit: 出发站点 → 到达站点 ── */}
      {transportMode === 'transit' ? (
        <div className="px-4 py-3 space-y-3">
          {/* ── 出发站点 ── */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text)] mb-2 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-100 text-[10px]">🚶</span>
              出发站点
              {loadingOriginStations && <Loader2 className="inline h-3 w-3 animate-spin text-indigo-400" />}
            </p>
            {!loadingOriginStations && originStations.length === 0 && (
              <p className="text-xs text-[var(--color-text-dim)] pl-5.5">
                {origin ? '未找到附近站点' : '请先获取定位'}
              </p>
            )}
            {originStations.slice(0, 4).map((station) => (
              <StationRow
                key={'o' + station.id}
                station={station}
                isSelected={selectedOriginStation?.id === station.id}
                onClick={() => setSelectedOriginStation(
                  selectedOriginStation?.id === station.id ? null : station
                )}
                color="blue"
              />
            ))}
            {/* 选中出发站 → 步行到站卡片 */}
            {selectedOriginStation && (
              <StationWalkCard
                station={selectedOriginStation}
                label="步行到车站"
                prefix="出发"
              />
            )}
          </div>

          {/* ── 连接线 ── */}
          <div className="flex items-center gap-2 pl-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] text-[var(--color-text-dim)] flex items-center gap-1">
              <Bus className="h-3 w-3" /> 乘车
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* ── 到达站点 ── */}
          <div>
            <p className="text-xs font-semibold text-[var(--color-text)] mb-2 flex items-center gap-1.5">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-[10px]">📍</span>
              到达站点
              {loadingStations && <Loader2 className="inline h-3 w-3 animate-spin text-indigo-400" />}
            </p>
            {!loadingStations && nearbyStations.length === 0 && (
              <p className="text-xs text-[var(--color-text-dim)] pl-5.5">未找到附近站点</p>
            )}
            {nearbyStations.slice(0, 4).map((station) => (
              <StationRow
                key={'d' + station.id}
                station={station}
                isSelected={selectedStation?.id === station.id}
                onClick={() => setSelectedStation(
                  selectedStation?.id === station.id ? null : station
                )}
                color="red"
              />
            ))}
            {/* 选中到达站 → 步行到店卡片 */}
            {selectedStation && (
              <StationWalkCard
                station={selectedStation}
                label={`步行到 ${destName}`}
                prefix="到达"
              />
            )}
          </div>

          {/* ── Google Maps 完整方案 ── */}
          <button
            onClick={() => {
              if (destination && origin) {
                window.open(
                  getGoogleMapsTransitUrl(origin.lat, origin.lng, destination.latitude, destination.longitude),
                  '_blank'
                )
              } else if (destination) {
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=transit`,
                  '_blank'
                )
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 py-2.5 text-sm font-semibold text-white active:scale-[0.98] transition-transform"
          >
            查看完整公交方案
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {/* Steps section header (collapsible toggle) */}
          <button
            onClick={() => setStepsExpanded(!stepsExpanded)}
            className="flex w-full items-center justify-between px-4 py-2.5 transition-colors hover:bg-gray-50"
          >
            <span className="text-sm font-medium text-[var(--color-text)]">
              路线步骤
            </span>
            {stepsExpanded ? (
              <ChevronUp className="h-4 w-4 text-[var(--color-text-dim)]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[var(--color-text-dim)]" />
            )}
          </button>

          {/* Steps list */}
          {stepsExpanded && (
            <div className="overflow-y-auto px-4 pb-2 max-h-[240px]">
              {route.steps.length === 0 ? (
                <p className="py-4 text-center text-sm text-[var(--color-text-dim)]">
                  暂无步骤信息
                </p>
              ) : (
                <div className="flex flex-col">
                  {route.steps.map((step, index) => {
                    const isFirst = index === 0
                    const isLast = isLastStep(index)
                    const hasCoords = !!step.coordinates

                    return (
                      <div
                        key={index}
                        ref={el => { stepRefs.current[index] = el }}
                        className={cn(
                          'flex gap-3 py-1.5',
                          index === activeStepIndex && 'bg-indigo-50 rounded-lg px-1',
                          hasCoords && 'cursor-pointer transition-colors hover:bg-indigo-50/50',
                        )}
                        onClick={() => {
                          if (hasCoords) handleStepClick(step)
                        }}
                      >
                        {/* Timeline connector */}
                        <div className="flex w-6 flex-shrink-0 flex-col items-center">
                          {index < activeStepIndex ? (
                            // Completed step
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            </div>
                          ) : index === activeStepIndex ? (
                            // Current step - indigo highlighted
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 ring-2 ring-indigo-200">
                              <div className="h-1.5 w-1.5 rounded-full bg-white" />
                            </div>
                          ) : isLast ? (
                            // Last step (destination) - future
                            <div className="flex h-4 w-4 items-center justify-center text-[10px] font-bold text-indigo-500">
                              &#9670;
                            </div>
                          ) : (
                            // Future step - default
                            <div
                              className={cn(
                                'h-3 w-3 flex-shrink-0 rounded-full border-2',
                                isFirst
                                  ? 'border-indigo-400 bg-white'
                                  : 'border-gray-300 bg-gray-200',
                              )}
                            />
                          )}
                          {!isLast && (
                            <div className="min-h-[16px] w-0.5 flex-1 bg-gray-200" />
                          )}
                        </div>

                        {/* Step content */}
                        <div className="min-w-0 flex-1 pb-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                'min-w-0 flex-1 text-sm',
                                index < activeStepIndex ? 'text-gray-400' :
                                index === activeStepIndex ? 'font-semibold text-indigo-700' :
                                isFirst ? 'font-medium text-indigo-600' :
                                'text-[var(--color-text)]',
                              )}
                            >
                              {isFirst
                                ? '出发'
                                : isLast
                                  ? `到达 ${destName}`
                                  : step.instruction}
                            </p>
                            {step.distance > 0 && (
                              <span className="mt-0.5 flex-shrink-0 text-xs text-[var(--color-text-dim)]">
                                {formatDistance(step.distance)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Action buttons ── */}
      <div className="flex gap-2 border-t border-gray-100 px-4 py-3">
        <button
          onClick={clearNavigation}
          className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-[var(--color-text-dim)] transition-colors hover:bg-gray-200"
        >
          清除路线
        </button>
        <button
          onClick={handleOpenGoogleMaps}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-indigo-500 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-600"
        >
          <ExternalLink className="h-3 w-3" />
          外部导航
        </button>
      </div>
    </>
  )

  // ── Desktop: floating right panel ──
  if (isDesktop) {
    return (
      <div
        className={cn(
          'pointer-events-auto absolute right-4 top-[200px] z-[999] w-[340px]',
          'flex max-h-[calc(100vh-240px)] flex-col overflow-hidden',
          glassPanel,
        )}
      >
        <div className="flex-1 overflow-y-auto">{panelContent}</div>
      </div>
    )
  }

  // ── Mobile: bottom sheet ──
  return (
    <div
      className={cn(
        'pointer-events-auto fixed bottom-0 left-0 right-0 z-[1000]',
        'flex max-h-[55vh] flex-col overflow-hidden',
        'rounded-t-2xl',
        glassSheet,
        'transition-transform duration-300 ease-out',
      )}
    >
      <div className="flex-1 overflow-y-auto">{panelContent}</div>
    </div>
  )
}
