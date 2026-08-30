const TILE_CACHE = 'map-tiles-v4'
// app-shell 缓存（HTML/JS/CSS），仅运行时填充，离线刷新兜底用
const APP_SHELL_CACHE = 'app-shell-v1'
const KEEP_CACHES = [TILE_CACHE, APP_SHELL_CACHE]
// 直连 OpenFreeMap 的瓦片（无 /tiles 前缀）
const TILE_HOSTS = ['tiles.openfreemap.org']
// 走 Cloudflare Worker 代理的瓦片（hostname + /tiles 前缀）
const TILE_PROXY_HOSTS = ['japan-map-ai.9dk9jptv8h-hue.workers.dev']
const MAX_CACHE_ENTRIES = 2000
let putCount = 0
let tileCache = null

// C8: 导航请求离线兜底——回退 app-shell 缓存，再回退首页，都没有则 503
async function offlineNavFallback(request) {
  const cache = await caches.open(APP_SHELL_CACHE)
  const cached = await cache.match(request)
  return cached || (await caches.match('/')) || new Response('离线', { status: 503 })
}

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  // 清除旧版缓存，同时打开 tileCache 供 fetch 复用
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all([
        self.clients.claim(),
        // 只清理不属于白名单的缓存，避免误删 app-shell 等重要缓存
        ...keys.filter(k => !KEEP_CACHES.includes(k)).map(k => caches.delete(k)),
        caches.open(TILE_CACHE).then(cache => { tileCache = cache }),
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

  // C8: 导航请求 network-first，离线回退 app-shell 缓存（离线刷新兜底）
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then((r) => {
        if (r.ok) caches.open(APP_SHELL_CACHE).then((c) => c.put(e.request, r.clone()))
        return r
      })
      .catch(() => offlineNavFallback(e.request))
    )
    return
  }
  // C8: 同源静态资源 stale-while-revalidate（打包后的 JS/CSS 等）
  if (e.request.method === 'GET' && url.origin === self.location.origin) {
    e.respondWith(caches.open(APP_SHELL_CACHE).then(async (cache) => {
      const cached = await cache.match(e.request)
      const f = fetch(e.request).then((r) => {
        if (r.ok) cache.put(e.request, r.clone())
        return r
      }).catch(() => cached || new Response('', { status: 503 }))
      return cached || f
    }))
  }
  // 只缓存 GET 瓦片请求：
  // 1) 直连 OpenFreeMap（任意路径，hostname 精确匹配）
  // 2) Worker 代理 /tiles/*（避免误拦截同域 AI Chat POST）
  const isTile =
    e.request.method === 'GET' &&
    (TILE_HOSTS.some(h => url.hostname === h) ||
      (TILE_PROXY_HOSTS.some(h => url.hostname === h) && url.pathname.startsWith('/tiles')))
  if (!isTile) return

  e.respondWith(
    (tileCache ? Promise.resolve(tileCache) : caches.open(TILE_CACHE)).then(cache =>
      cache.match(e.request).then(cached => {
        // Background update regardless
        const fetchPromise = fetch(e.request).then(response => {
          if (response.ok) {
            cache.put(e.request, response.clone())
            putCount++
            if (putCount % 10 === 0) {
              trimCache(cache).then(() => { putCount = 0 })
            }
          }
          return response
        }).catch(() => new Response('', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Access-Control-Allow-Origin': '*' }
        }))

        // Return cache immediately if available, otherwise wait for network
        return cached || fetchPromise
      })
    )
  )
})
