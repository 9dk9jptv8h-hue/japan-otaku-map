const TILE_CACHE = 'map-tiles-v3'
const TILE_HOSTS = ['tiles.openfreemap.org']
const MAX_CACHE_ENTRIES = 2000
let putCount = 0

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

async function trimCache(cache) {
  const keys = await cache.keys()
  if (keys.length > MAX_CACHE_ENTRIES) {
    const toDelete = keys.slice(0, keys.length - MAX_CACHE_ENTRIES)
    await Promise.all(toDelete.map(k => cache.delete(k)))
  }
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)

  // Only cache tile requests from OpenFreeMap
  if (!TILE_HOSTS.some(h => url.hostname === h)) return

  e.respondWith(
    caches.open(TILE_CACHE).then(cache =>
      cache.match(e.request).then(cached => {
        // Background update regardless
        const fetchPromise = fetch(e.request).then(response => {
          if (response.ok) {
            cache.put(e.request, response.clone())
            putCount++
            if (putCount % 10 === 0) {
              trimCache(cache)
            }
          }
          return response
        }).catch(() => new Response('', { status: 503, statusText: 'Offline' }))

        // Return cache immediately if available, otherwise wait for network
        return cached || fetchPromise
      })
    )
  )
})
