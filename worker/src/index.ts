/**
 * Cloudflare Worker — DeepSeek API 代理 + OpenFreeMap 瓦片缓存代理
 *
 * 路由:
 *   POST /         → DeepSeek AI Chat（API Key 服务端注入）
 *   GET  /tiles/*  → OpenFreeMap 瓦片代理（Cloudflare Edge CDN 缓存）
 */

export interface Env {
  DEEPSEEK_API_KEY: string
}

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
}

// ---- AI Chat CORS（仅限指定 Origin）----
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': 'https://9dk9jptv8h-hue.github.io',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

// ---- Tile 代理常量 ----
const TILE_ORIGIN = 'https://tiles.openfreemap.org'
const TILE_CACHE_SECONDS = 604800 // 7 days
const STYLE_CACHE_SECONDS = 86400 // 1 day

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

/**
 * 处理 /tiles/* 请求：代理 OpenFreeMap 并利用 Cloudflare Cache API 缓存
 */
async function handleTileRequest(request: Request, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url)
  const workerOrigin = url.origin

  // 去掉 /tiles 前缀，拼接到 OpenFreeMap origin
  const tilePath = url.pathname.replace(/^\/tiles/, '')
  const tileUrl = TILE_ORIGIN + tilePath + url.search

  // 使用原始请求 URL 作为缓存 key
  const cacheKey = new Request(request.url, { method: 'GET' })
  const cache = caches.default

  // 1. 查询缓存
  const cachedResponse = await cache.match(cacheKey)
  if (cachedResponse) {
    return cachedResponse
  }

  // 2. 缓存未命中，从 origin 拉取
  let originResponse: Response
  try {
    originResponse = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'CloudflareWorker/TileProxy',
        Accept: request.headers.get('Accept') || '*/*',
      },
    })
  } catch (e) {
    console.error('Tile fetch failed:', e)
    return new Response('Tile fetch failed', {
      status: 502,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      },
    })
  }

  if (!originResponse.ok) {
    return new Response(`Tile fetch failed: ${originResponse.status}`, {
      status: originResponse.status,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }

  // 3. 判断是否为 style JSON（路径含 /styles/）
  const isStyleJson = tilePath.includes('/styles/')

  let responseBody: ArrayBuffer | string
  let contentType = originResponse.headers.get('Content-Type') || 'application/octet-stream'
  let cacheDuration: number

  if (isStyleJson) {
    // Style JSON: 重写 URL，将 openfreemap origin 替换为 Worker 自身 origin + /tiles
    let text = await originResponse.text()
    text = text.replaceAll(TILE_ORIGIN, workerOrigin + '/tiles')
    responseBody = text
    cacheDuration = STYLE_CACHE_SECONDS
  } else {
    // PBF tiles, fonts, sprites 等：直接透传 binary
    responseBody = await originResponse.arrayBuffer()
    cacheDuration = TILE_CACHE_SECONDS
  }

  // 4. 构建响应
  // 注意：不复制 Content-Encoding，因为 .text()/.arrayBuffer() 已自动解压
  const responseHeaders = new Headers({
    'Content-Type': contentType,
    'Cache-Control': `public, max-age=${cacheDuration}, s-maxage=${cacheDuration}`,
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  })

  const response = new Response(responseBody, {
    status: 200,
    headers: responseHeaders,
  })

  // 5. 异步写入缓存（不阻塞响应）
  ctx.waitUntil(cache.put(cacheKey, response.clone()))

  return response
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // ---- CORS preflight ----
    if (request.method === 'OPTIONS') {
      // 瓦片路由：宽松 CORS（任何 origin 都能加载地图）
      if (url.pathname.startsWith('/tiles')) {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
          },
        })
      }
      // AI Chat 路由：限制 origin
      return new Response(null, { headers: CORS_HEADERS })
    }

    // ---- Tile 代理路由: GET /tiles/* ----
    if (request.method === 'GET' && url.pathname.startsWith('/tiles')) {
      return handleTileRequest(request, ctx)
    }

    // ---- AI Chat 路由: POST / ----
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    try {
      // 先检查请求体大小（避免解析超大 JSON）
      const contentLength = request.headers.get('Content-Length')
      if (contentLength && parseInt(contentLength, 10) > 10000) {
        return jsonResponse({ error: '消息太长' }, 400)
      }

      const body = (await request.json()) as ChatRequest

      // 基本校验
      if (!body.messages || !Array.isArray(body.messages)) {
        return jsonResponse({ error: '无效的请求格式' }, 400)
      }

      // 转发到 DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: body.messages,
          temperature: 0.7,
          max_tokens: 800, // 限制回复长度控制成本
        }),
      })

      let data: unknown
      try {
        data = await response.json()
      } catch {
        const textBody = await response.text().catch(() => '无法读取响应')
        console.error('DeepSeek non-JSON response:', textBody)
        return jsonResponse({ error: 'AI 服务返回了异常的响应格式' }, 502)
      }

      if (!response.ok) {
        // 透传 DeepSeek 错误但隐藏敏感信息
        const status = response.status
        if (status === 429) return jsonResponse({ error: '请求过于频繁，请稍后再试' }, 429)
        if (status === 402) return jsonResponse({ error: 'API 配额已用尽，请联系管理员' }, 402)
        return jsonResponse({ error: '服务暂时不可用' }, 503)
      }

      return jsonResponse(data)
    } catch (e) {
      console.error('AI API error:', e)
      return jsonResponse({ error: '服务暂时不可用' }, 500)
    }
  },
}
