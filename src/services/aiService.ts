export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const SYSTEM_PROMPT = `你是「日本动漫店铺地图」网站的AI助手。你帮助用户了解日本的动漫店铺和旅游信息。

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

// Worker 部署后替换，或通过 .env 文件设置 VITE_AI_WORKER_URL
const WORKER_URL =
  import.meta.env.VITE_AI_WORKER_URL || 'https://japan-map-ai.9dk9jptv8h.workers.dev'

export async function chat(messages: ChatMessage[]): Promise<string> {
  // 输入校验
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    throw new Error('消息不能为空')
  }

  // AbortController 30秒超时
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  let response: Response

  try {
    response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
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
  try {
    data = await response.json()
  } catch {
    throw new Error('无法解析响应，请稍后重试')
  }

  const content = (data as Record<string, unknown[]>)?.choices?.[0] as
    | { message?: { content?: string } }
    | undefined

  if (!content?.message?.content) {
    throw new Error('AI返回了空的响应内容')
  }

  return content.message.content
}
