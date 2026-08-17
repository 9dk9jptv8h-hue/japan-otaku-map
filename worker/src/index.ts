/**
 * Cloudflare Worker — DeepSeek API 代理 + OpenFreeMap 瓦片缓存代理
 *
 * 路由:
 *   POST /         → DeepSeek AI Chat（API Key 服务端注入）
 *   GET  /tiles/*  → OpenFreeMap 瓦片代理（Cloudflare Edge CDN 缓存）
 *
 * 安全加固（2026-08）:
 *   - 系统提示词服务端注入，客户端传来的 system 消息一律丢弃
 *   - Origin 校验：仅允许本站域名调用 AI 路由
 *   - 限流：KV 滑动窗口（绑定 RATE_LIMIT_KV 时启用），无 KV 时回退内存计数
 */

export interface Env {
  DEEPSEEK_API_KEY: string
  /** 可选：绑定后启用持久化限流；未绑定时使用单 isolate 内存计数 */
  RATE_LIMIT_KV?: KVNamespace
}

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
}

// ---- AI 系统提示词（服务端唯一权威，客户端不可篡改）----
const SYSTEM_PROMPT = `你是「日本动漫店铺地图」网站的AI助手。你帮助用户了解日本的动漫店铺和旅游信息。

回答规则：
1. 使用中文回答，语句通顺，必须使用正确的标点符号（逗号、句号、问号等）。
2. 回答要分段，每个要点之间换行，不要把所有内容挤在一起。
3. 不要滥用表情符号，最多在回答末尾用一个，大部分回答不需要表情。
4. 回答简洁实用，每次回答控制在200字以内。
5. 如果推荐店铺，用列表格式，每家店一行，写清楚店名和地址。

你了解以下7大动漫连锁店的信息：
- Animate（アニメイト）：日本最大的动漫连锁店，48家门店，主营动漫周边、CD、手办。
- Melonbooks（メロンブックス）：同人志专门店，29家门店。
- Mandarake（まんだらけ）：二手动漫周边、手办、中古商品，11家门店。
- Suruga-ya（駿河屋）：二手游戏、动漫商品综合店，37家门店。
- GAMERS（ゲーマーズ）：动漫CD/DVD/周边，14家门店。
- Lashinbang（らしんばん）：二手动漫商品连锁，30家门店。
- K-Books（ケーブックス）：动漫/同人专门店，7家门店。

热门地区推荐：
- 秋叶原（东京）：animate、Melonbooks、Mandarake、Suruga-ya、GAMERS、Lashinbang、K-Books全覆盖，动漫迷天堂。
- 池袋（东京）：animate总店（吉尼斯世界纪录最大动漫店）、乙女路（女性向）。
- 大阪日本桥：关西最大动漫街。
- 名古屋大须：中部地区动漫聚集地。

如果用户问的不是日本旅游/动漫店铺相关的问题，礼貌地引导回来。`

// ---- AI Chat 允许的来源（含本地开发）----
const ALLOWED_ORIGINS = new Set([
  'https://9dk9jptv8h-hue.github.io',
  'https://japan-otaku-map.vercel.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

function corsHeaders(origin: string | null): Record<string, string> {
  // 仅回显受信任的 Origin，避免 CORS 头被第三方站点利用
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://9dk9jptv8h-hue.github.io'
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

// ---- Tile 代理常量 ----
const TILE_ORIGIN = 'https://tiles.openfreemap.org'
const TILE_CACHE_SECONDS = 604800 // 7 days
const STYLE_CACHE_SECONDS = 86400 // 1 day

function jsonResponse(data: unknown, status = 200, extraHeaders?: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  })
}

// ---- 限流：滑动窗口（10 分钟 / 20 次）----
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX = 20
const rateLimitKey = (ip: string) => `rl:chat:${ip}`

// 内存兜底（无 KV 绑定时）：仅当前 isolate 生效，隔离区重启后清零
const memoryWindow = new Map<string, number[]>()

async function isRateLimited(ip: string, env: Env): Promise<boolean> {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS

  if (env.RATE_LIMIT_KV) {
    try {
      const raw = await env.RATE_LIMIT_KV.get(rateLimitKey(ip))
      const hits: number[] = raw ? JSON.parse(raw) : []
      const recent = hits.filter((t) => typeof t === 'number' && t > cutoff)
      if (recent.length >= RATE_LIMIT_MAX) return true
      recent.push(now)
      // NOTE: KV 最终一致，极端并发下可能漏计；如需强一致请换 Durable Object
      await env.RATE_LIMIT_KV.put(rateLimitKey(ip), JSON.stringify(recent), {
        expirationTtl: RATE_LIMIT_WINDOW_MS / 1000,
      })
      return false
    } catch (e) {
      console.error('Rate limit KV error, falling back to memory:', e)
    }
  }

  const recent = (memoryWindow.get(ip) ?? []).filter((t) => t > cutoff)
  if (recent.length >= RATE_LIMIT_MAX) return true
  recent.push(now)
  memoryWindow.set(ip, recent)
  if (memoryWindow.size > 1000) {
    // 防止内存膨胀：清理过期条目
    for (const [k, v] of memoryWindow) {
      if (v.every((t) => t <= cutoff)) memoryWindow.delete(k)
    }
  }
  return false
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
  const contentType = originResponse.headers.get('Content-Type') || 'application/octet-stream'
  let cacheDuration: number

  if (isStyleJson) {
    // Style JSON: 重写 URL — 将 openfreemap origin 替换为 Worker 自身 origin + /tiles
    // NOTE: replaceAll matches substrings. Since TILE_ORIGIN is a full origin
    // (https://tiles.openfreemap.org) and style JSON URLs are absolute, this is
    // safe in practice. If TILE_ORIGIN is ever changed to a shorter/shared domain,
    // switch to a URL-parsing approach (parse + rebuild) instead.
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
    const origin = request.headers.get('Origin')

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
      return new Response(null, { headers: corsHeaders(origin) })
    }

    // ---- Tile 代理路由: GET /tiles/* ----
    if (request.method === 'GET' && url.pathname.startsWith('/tiles')) {
      return handleTileRequest(request, ctx)
    }

    // ---- AI Chat 路由: POST / ----
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders(origin))
    }

    // Origin 校验：非浏览器（curl/脚本）或第三方站点一律拒绝
    // NOTE: CORS 只拦浏览器读取，这里拦截的是对 DeepSeek 账单的滥用
    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
      return jsonResponse({ error: 'Forbidden' }, 403, corsHeaders(origin))
    }

    // 限流：滑动窗口
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown'
    if (await isRateLimited(ip, env)) {
      return jsonResponse(
        { error: '请求过于频繁，请稍后再试' },
        429,
        { ...corsHeaders(origin), 'Retry-After': '300' }
      )
    }

    try {
      // 读取原始请求体，检查实际大小（Content-Length 可能被省略）
      const buf = await request.arrayBuffer()
      if (buf.byteLength > 10000) {
        return jsonResponse({ error: '消息太长' }, 413, corsHeaders(origin))
      }
      const body = JSON.parse(new TextDecoder().decode(buf)) as ChatRequest

      // 基本校验
      if (!body.messages || !Array.isArray(body.messages)) {
        return jsonResponse({ error: '无效的请求格式' }, 400, corsHeaders(origin))
      }

      // 丢弃客户端提供的 system 消息（提示词以服务端为准），只保留 user/assistant
      const cleanMessages = body.messages
        .filter(
          (m): m is { role: 'user' | 'assistant'; content: string } =>
            m && typeof m.role === 'string' && typeof m.content === 'string' &&
            (m.role === 'user' || m.role === 'assistant')
        )
        .slice(-20)

      if (cleanMessages.length === 0) {
        return jsonResponse({ error: '无效的请求格式' }, 400, corsHeaders(origin))
      }

      // 服务端注入系统提示词（放在最前）
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...cleanMessages,
      ]

      // 转发到 DeepSeek API（25s 超时）
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 25000)
      let response: Response
      try {
        response = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages,
            temperature: 0.7,
            max_tokens: 800, // 限制回复长度控制成本
          }),
          signal: controller.signal,
        })
      } finally {
        clearTimeout(timeout)
      }

      let data: unknown
      try {
        data = await response.json()
      } catch {
        const textBody = await response.text().catch(() => '无法读取响应')
        console.error('DeepSeek non-JSON response:', textBody)
        return jsonResponse({ error: 'AI 服务返回了异常的响应格式' }, 502, corsHeaders(origin))
      }

      if (!response.ok) {
        // 透传 DeepSeek 错误但隐藏敏感信息
        const status = response.status
        if (status === 429) return jsonResponse({ error: '请求过于频繁，请稍后再试' }, 429, corsHeaders(origin))
        if (status === 402) return jsonResponse({ error: 'API 配额已用尽，请联系管理员' }, 402, corsHeaders(origin))
        return jsonResponse({ error: '服务暂时不可用' }, 503, corsHeaders(origin))
      }

      return jsonResponse(data, 200, corsHeaders(origin))
    } catch (e) {
      console.error('AI API error:', e)
      return jsonResponse({ error: '服务暂时不可用' }, 500, corsHeaders(origin))
    }
  },
}
