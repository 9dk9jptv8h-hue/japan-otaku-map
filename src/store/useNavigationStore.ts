import { create } from 'zustand'
import type { GeoPoint, RouteData, TransportMode } from '@/types/navigation'
import type { LocationData } from '@/types'
import { fetchWalkingRoute } from '@/services/routingService'

// ─── Module-level non-serializable handles ───
let watchId: number | null = null
let deviationTimer: ReturnType<typeof setTimeout> | null = null

interface NavigationStore {
  // ─── Existing state ───
  origin: GeoPoint | null
  destination: LocationData | null
  route: RouteData | null
  transportMode: TransportMode
  isRouting: boolean
  error: string | null
  isPanelOpen: boolean

  // ─── New: real-time GPS tracking state ───
  /** Current live GPS position */
  userPosition: GeoPoint | null
  /** Compass heading in degrees */
  userBearing: number | null
  /** Which step the user is currently on (-1 = not started) */
  activeStepIndex: number
  /** Whether navigator.geolocation.watchPosition is active */
  isTracking: boolean
  /** Whether user has deviated from route (>50m segment distance) */
  isDeviated: boolean
  /** GPS tracking error message */
  trackingError: string | null
  /** Original destination saved when navigating to a station waypoint */
  finalDestination: LocationData | null
  /** Whether user has arrived at the transit station waypoint */
  hasArrivedAtWaypoint: boolean

  // ─── Existing actions ───
  setOrigin: (p: GeoPoint | null) => void
  setDestination: (loc: LocationData | null) => void
  setRoute: (r: RouteData | null) => void
  setTransportMode: (m: TransportMode) => void
  setIsRouting: (v: boolean) => void
  setError: (e: string | null) => void
  setPanelOpen: (v: boolean) => void
  clearNavigation: () => void
  startNavigation: (dest: LocationData) => Promise<void>

  // ─── New: GPS tracking actions ───
  /** Start navigator.geolocation.watchPosition */
  startTracking: () => void
  /** Stop watchPosition and clean up */
  stopTracking: () => void
  /** Called by watchPosition callback — updates position, checks step advance & deviation */
  updateUserPosition: (pos: GeolocationPosition) => void
  /** Manually jump to a specific step */
  advanceToStep: (index: number) => void
  /** Re-calculate route from current position to destination */
  reRoute: () => Promise<void>
  /** Start walking navigation to a transit station, saving the real destination */
  navigateToStation: (station: { id: number; name: string; lat: number; lng: number }) => Promise<void>
  /** Continue navigation from waypoint to the final destination */
  continueToFinalDestination: () => Promise<void>
  /** Start walking navigation from current position to the store */
  navigateToStore: () => Promise<void>
}

export const useNavigationStore = create<NavigationStore>()((set, get) => ({
  // ─── Initial state ───
  origin: null,
  destination: null,
  route: null,
  transportMode: 'walking',
  isRouting: false,
  error: null,
  isPanelOpen: false,

  userPosition: null,
  userBearing: null,
  activeStepIndex: -1,
  isTracking: false,
  isDeviated: false,
  trackingError: null,
  finalDestination: null,
  hasArrivedAtWaypoint: false,

  // ─── Existing simple setters ───
  setOrigin: (p) => set({ origin: p }),
  setDestination: (loc) => set({ destination: loc }),
  setRoute: (r) => set({ route: r }),
  setTransportMode: (m) => set({ transportMode: m }),
  setIsRouting: (v) => set({ isRouting: v }),
  setError: (e) => set({ error: e }),
  setPanelOpen: (v) => set({ isPanelOpen: v }),

  // ─── clearNavigation (updated: also stops tracking) ───
  clearNavigation: () => {
    get().stopTracking()
    set({
      origin: null,
      destination: null,
      route: null,
      isRouting: false,
      error: null,
      isPanelOpen: false,
      userPosition: null,
      userBearing: null,
      activeStepIndex: -1,
      isTracking: false,
      isDeviated: false,
      trackingError: null,
      finalDestination: null,
      hasArrivedAtWaypoint: false,
    })
  },

  // ─── startNavigation (updated: starts tracking after route) ───
  startNavigation: async (dest) => {
    set({ destination: dest, isRouting: true, error: null, isPanelOpen: true })

    // Step 1: get GPS position
    let origin: GeoPoint
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('geolocation_unavailable'))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        })
      })
      origin = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      }
      set({ origin })
    } catch (err) {
      const msg =
        err instanceof GeolocationPositionError
          ? err.code === err.PERMISSION_DENIED
            ? 'GPS 权限被拒绝，请允许定位后重试，或在地图上点击设定起点'
            : err.code === err.TIMEOUT
              ? 'GPS 定位超时，请检查设备定位设置'
              : 'GPS 定位失败，请在地图上点击设定起点'
          : '浏览器不支持定位功能'
      set({ isRouting: false, error: msg })
      return
    }

    // Step 2: fetch route
    try {
      const route = await fetchWalkingRoute(origin, {
        lat: dest.latitude,
        lng: dest.longitude,
      })
      set({ route, isRouting: false, error: null, activeStepIndex: 0 })
      // Start real-time GPS tracking after successful route fetch
      get().startTracking()
    } catch (err) {
      set({
        isRouting: false,
        error: err instanceof Error ? err.message : '路线计算失败',
      })
    }
  },

  // ─── navigateToStore: 从当前位置直接导航到店铺（到达站用） ───
  navigateToStore: async () => {
    const { userPosition, finalDestination, destination } = get()
    const target = finalDestination || destination
    if (!target) return
    if (!userPosition) {
      set({ error: '无法获取当前位置' })
      return
    }

    set({
      destination: target,
      origin: userPosition,
      transportMode: 'walking',
      finalDestination: null,
      hasArrivedAtWaypoint: false,
      isRouting: true,
      error: null,
      isPanelOpen: true,
    })
    try {
      const route = await fetchWalkingRoute(userPosition, {
        lat: target.latitude,
        lng: target.longitude,
      })
      set({ route, isRouting: false, error: null, activeStepIndex: 0 })
    } catch (err) {
      set({
        isRouting: false,
        error: err instanceof Error ? err.message : '路线计算失败',
      })
    }
  },

  // ─── startTracking ───
  startTracking: () => {
    if (watchId != null) return // already tracking

    if (!navigator.geolocation) {
      set({ trackingError: '浏览器不支持持续定位' })
      return
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => get().updateUserPosition(pos),
      (err) => {
        set({
          trackingError:
            (err as GeolocationPositionError).code ===
            (err as GeolocationPositionError).PERMISSION_DENIED
              ? '位置权限被拒绝'
              : '定位失败',
        })
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 },
    )

    watchId = id
    set({ isTracking: true, trackingError: null })
  },

  // ─── stopTracking ───
  stopTracking: () => {
    if (watchId != null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    if (deviationTimer != null) {
      clearTimeout(deviationTimer)
      deviationTimer = null
    }
    set({ isTracking: false })
  },

  // ─── updateUserPosition (core GPS tracking logic) ───
  updateUserPosition: (pos) => {
    const newPos: GeoPoint = {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
    }
    set({
      userPosition: newPos,
      userBearing: pos.coords.heading ?? null,
    })

    // 1. Step advancement — check if user is close to the start of the NEXT step
    const { route, activeStepIndex } = get()
    if (route && activeStepIndex < route.steps.length - 1) {
      const nextStep = route.steps[activeStepIndex + 1]
      if (nextStep.coordinates) {
        const dist = haversineDistance(newPos, {
          lat: nextStep.coordinates[1],
          lng: nextStep.coordinates[0],
        })
        if (dist < 15) {
          set({ activeStepIndex: activeStepIndex + 1 })
        }
      }
    }

    // 2. Route deviation — check distance to nearest point on route
    if (route) {
      const minDist = findMinDistanceToRouteSegments(newPos, route.geometry.coordinates)
      const deviated = minDist > 50 // raised from 30m — segment distance is more accurate
      const prevDeviated = get().isDeviated
      if (deviated !== prevDeviated) {
        set({ isDeviated: deviated })
        if (deviated) {
          // Clear any existing deviation timer
          if (deviationTimer != null) clearTimeout(deviationTimer)
          // Auto re-route after 8 seconds of deviation
          deviationTimer = setTimeout(() => {
            if (get().isDeviated) get().reRoute()
          }, 8000)
        } else {
          // User is back on route — cancel the pending re-route
          if (deviationTimer != null) {
            clearTimeout(deviationTimer)
            deviationTimer = null
          }
        }
      }
    }

    // 3. Waypoint arrival detection
    const { finalDestination, hasArrivedAtWaypoint, destination } = get()
    if (finalDestination && !hasArrivedAtWaypoint && destination) {
      const distToDest = haversineDistance(newPos, {
        lat: destination.latitude,
        lng: destination.longitude,
      })
      if (distToDest < 30) {
        set({ hasArrivedAtWaypoint: true })
      }
    }
  },

  // ─── advanceToStep ───
  advanceToStep: (index) => set({ activeStepIndex: index }),

  // ─── reRoute ───
  reRoute: async () => {
    const { userPosition, destination } = get()
    if (!userPosition || !destination) return
    set({ isRouting: true, error: null, isDeviated: false })
    try {
      const route = await fetchWalkingRoute(userPosition, {
        lat: destination.latitude,
        lng: destination.longitude,
      })
      set({
        route,
        origin: userPosition,
        activeStepIndex: 0,
        isRouting: false,
      })
    } catch (err) {
      set({
        isRouting: false,
        error: err instanceof Error ? err.message : '重新规划路线失败',
      })
    }
  },

  // ─── navigateToStation ───
  navigateToStation: async (station) => {
    const { destination: currentDest, userPosition } = get()
    if (!currentDest) return
    if (!userPosition) {
      set({ error: '无法获取当前位置，请确保 GPS 已开启' })
      return
    }

    // Save the real destination as final
    set({ finalDestination: { ...currentDest }, hasArrivedAtWaypoint: false })

    // Build a virtual destination for the station
    const stationAsDest: LocationData = {
      id: `station-${station.id}`,
      name: station.name,
      description: '',
      category: 'animate',
      latitude: station.lat,
      longitude: station.lng,
      imageUrl: '',
      address: station.name,
      tags: [],
      updatedAt: new Date().toISOString(),
    }

    // Use existing userPosition, fetch route directly (skip GPS re-acquire)
    set({ destination: stationAsDest, origin: userPosition, transportMode: 'walking', isRouting: true, error: null, isPanelOpen: true })
    try {
      const route = await fetchWalkingRoute(userPosition, {
        lat: station.lat,
        lng: station.lng,
      })
      set({ route, isRouting: false, error: null, activeStepIndex: 0 })
    } catch (err) {
      set({
        isRouting: false,
        error: err instanceof Error ? err.message : '路线计算失败',
      })
    }
  },

  // ─── continueToFinalDestination ───
  continueToFinalDestination: async () => {
    const { finalDestination, userPosition } = get()
    if (!finalDestination) return
    if (!userPosition) {
      set({ error: '无法获取当前位置' })
      return
    }
    set({ hasArrivedAtWaypoint: false, destination: finalDestination, origin: userPosition, isRouting: true, error: null, isPanelOpen: true })
    try {
      const route = await fetchWalkingRoute(userPosition, {
        lat: finalDestination.latitude,
        lng: finalDestination.longitude,
      })
      set({ route, finalDestination: null, isRouting: false, error: null, activeStepIndex: 0 })
    } catch (err) {
      set({
        isRouting: false,
        finalDestination: null,
        error: err instanceof Error ? err.message : '路线计算失败',
      })
    }
  },
}))

// ─── Haversine distance helpers ───

function haversineDistance(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function findMinDistanceToRouteSegments(
  pos: { lat: number; lng: number },
  coords: [number, number][],
): number {
  if (coords.length < 2) return findMinDistanceToRoute(pos, coords)

  let minDist = Infinity
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i]
    const [lng2, lat2] = coords[i + 1]
    const d = pointToSegmentDistance(pos.lat, pos.lng, lat1, lng1, lat2, lng2)
    if (d < minDist) minDist = d
  }
  return minDist
}

function pointToSegmentDistance(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number,
): number {
  const latToM = 111320
  const lngToM = 111320 * Math.cos((px * Math.PI) / 180)

  const dx = (x2 - x1) * latToM
  const dy = (y2 - y1) * lngToM
  const segLenSq = dx * dx + dy * dy

  if (segLenSq === 0) {
    return haversineDistance({ lat: px, lng: py }, { lat: x1, lng: y1 })
  }

  let t =
    ((px - x1) * latToM * dx + (py - y1) * lngToM * dy) / segLenSq
  t = Math.max(0, Math.min(1, t))

  const projLat = x1 + t * (x2 - x1)
  const projLng = y1 + t * (y2 - y1)

  return haversineDistance(
    { lat: px, lng: py },
    { lat: projLat, lng: projLng },
  )
}

function findMinDistanceToRoute(
  pos: { lat: number; lng: number },
  coords: [number, number][],
): number {
  let minDist = Infinity
  for (const [lng, lat] of coords) {
    const d = haversineDistance(pos, { lat, lng })
    if (d < minDist) minDist = d
  }
  return minDist
}
