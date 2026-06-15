const TILE_CACHE = 'map-tiles-v1'
const TILE_HOSTS = ['tiles.openfreemap.org', 'basemaps.cartocdn.com']

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Only cache tile and style requests from tile hosts
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
