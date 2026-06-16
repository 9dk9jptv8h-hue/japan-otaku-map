/**
 * Cloudflare Worker — DeepSeek API 代理
 *
 * 架构: 用户浏览器 → 本Worker（持有API Key）→ DeepSeek API
 * 用户无需输入API Key，Worker在服务端注入。
 */

export interface Env {
  DEEPSEEK_API_KEY: string
}

interface ChatRequest {
  messages: Array<{ role: string; content: string }>
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // ---- CORS preflight ----
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS })
    }

    // ---- Only POST ----
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405)
    }

    try {
      const body = (await request.json()) as ChatRequest

      // 基本校验
      if (!body.messages || !Array.isArray(body.messages)) {
        return jsonResponse({ error: '无效的请求格式' }, 400)
      }

      // 限制请求体大小（防滥用）
      if (JSON.stringify(body).length > 10000) {
        return jsonResponse({ error: '消息太长' }, 400)
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

      const data = await response.json()

      if (!response.ok) {
        // 透传 DeepSeek 错误但隐藏敏感信息
        const status = response.status
        if (status === 429) return jsonResponse({ error: '请求过于频繁，请稍后再试' }, 429)
        if (status === 402) return jsonResponse({ error: '服务暂时不可用' }, 503)
        return jsonResponse({ error: '服务暂时不可用' }, 503)
      }

      return jsonResponse(data)
    } catch {
      return jsonResponse({ error: '服务暂时不可用' }, 500)
    }
  },
}
