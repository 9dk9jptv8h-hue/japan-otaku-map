const TILE_CACHE = 'map-tiles-v3'
const TILE_HOSTS = ['tiles.openfreemap.org']

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  // 清除旧版缓存
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all([
        self.clients.claim(),
        ...keys.filter(k => k !== TILE_CACHE).map(k => caches.delete(k)),
      ])
    )
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Only cache tile requests from OpenFreeMap
  if (!TILE_HOSTS.some(h => url.hostname === h)) return

  e.respondWith(
    caches.open(TILE_CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        if (cached) return cached
        return fetch(e.request).then(response => {
          if (response.ok) {
            cache.put(e.request, response.clone())
          }
          return response
        })
      })
    )
  )
})
