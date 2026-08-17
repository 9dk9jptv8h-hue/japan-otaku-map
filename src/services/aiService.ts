export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// NOTE: 系统提示词已移至 Cloudflare Worker 服务端注入（worker/src/index.ts），
// 客户端不再发送 system 消息，防止提示词被用户/第三方篡改。
// 此处保留 role 联合类型仅为兼容展示层。

// Worker 部署后替换，或通过 .env 文件设置 VITE_AI_WORKER_URL
const WORKER_URL =
  import.meta.env.VITE_AI_WORKER_URL || 'https://japan-map-ai.9dk9jptv8h.workers.dev'

export async function chat(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  // 输入校验
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('消息不能为空')
  }

  // AbortController 30秒超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  // 合并外部 signal 和内部超时 signal
  const combinedSignal = signal
    ? AbortSignal.any([controller.signal, signal])
    : controller.signal

  let response: Response

  try {
    response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: combinedSignal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试')
    }
    throw new Error(
      '网络连接失败，请检查网络后重试。' +
        (err instanceof Error ? `（${err.message}）` : '')
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (!response.ok) {
    let errorDetail = ''
    try {
      const errorData = (await response.json()) as { error?: string }
      errorDetail = errorData?.error || `HTTP ${response.status}`
    } catch {
      errorDetail = await response.text().catch(() => `HTTP ${response.status}`)
    }

    switch (response.status) {
      case 429:
        throw new Error('请求过于频繁，请稍后再试')
      case 503:
        throw new Error('AI服务暂时不可用，请稍后再试')
      default:
        throw new Error(errorDetail || `请求失败（状态码 ${response.status}）`)
    }
  }

  let data: unknown
  const text = await response.text()
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error(text ? `无法解析响应: ${text.slice(0, 100)}` : '无法解析响应，请稍后重试')
  }

  const content = (data as Record<string, unknown[]>)?.choices?.[0] as
    | { message?: { content?: string } }
    | undefined

  if (!content?.message?.content) {
    throw new Error('AI返回了空的响应内容')
  }

  return content.message.content
}
