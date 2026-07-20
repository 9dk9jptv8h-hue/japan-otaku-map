import { create } from 'zustand'
import type { GeoPoint, RouteData, TransportMode } from '@/types/navigation'
import type { LocationData } from '@/types'
import { fetchWalkingRoute } from '@/services/routingService'

interface NavigationStore {
  // State
  origin: GeoPoint | null
  destination: LocationData | null
  route: RouteData | null
  transportMode: TransportMode
  isRouting: boolean
  error: string | null
  isPanelOpen: boolean

  // Actions
  setOrigin: (p: GeoPoint | null) => void
  setDestination: (loc: LocationData | null) => void
  setRoute: (r: RouteData | null) => void
  setTransportMode: (m: TransportMode) => void
  setIsRouting: (v: boolean) => void
  setError: (e: string | null) => void
  setPanelOpen: (v: boolean) => void
  clearNavigation: () => void

  // Core flow: destination → route
  startNavigation: (dest: LocationData) => Promise<void>
}

export const useNavigationStore = create<NavigationStore>()((set) => ({
  origin: null,
  destination: null,
  route: null,
  transportMode: 'walking',
  isRouting: false,
  error: null,
  isPanelOpen: false,

  setOrigin: (p) => set({ origin: p }),
  setDestination: (loc) => set({ destination: loc }),
  setRoute: (r) => set({ route: r }),
  setTransportMode: (m) => set({ transportMode: m }),
  setIsRouting: (v) => set({ isRouting: v }),
  setError: (e) => set({ error: e }),
  setPanelOpen: (v) => set({ isPanelOpen: v }),

  clearNavigation: () =>
    set({
      origin: null,
      destination: null,
      route: null,
      isRouting: false,
      error: null,
      isPanelOpen: false,
    }),

  startNavigation: async (dest) => {
    set({ destination: dest, isRouting: true, error: null, isPanelOpen: true })

    // Step 1: 获取 GPS 位置
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

    // Step 2: 获取路线
    try {
      const route = await fetchWalkingRoute(origin, {
        lat: dest.latitude,
        lng: dest.longitude,
      })
      set({ route, isRouting: false, error: null })
    } catch (err) {
      set({
        isRouting: false,
        error: err instanceof Error ? err.message : '路线计算失败',
      })
    }
  },
}))
