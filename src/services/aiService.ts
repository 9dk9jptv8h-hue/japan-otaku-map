export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const SYSTEM_PROMPT = `你是「日本动漫店铺地图」的AI小助手。你帮助用户了解日本的动漫店铺和旅游信息。

你了解以下7大动漫连锁店：
- Animate（アニメイト）— 日本最大的动漫连锁店，约48家门店，主营动漫周边、CD、手办、漫画
- Melonbooks（メロンブックス）— 同人志专门店，约27家门店
- Mandarake（まんだらけ）— 二手动漫周边、手办、中古商品，约11家门店
- Suruga-ya（駿河屋）— 二手游戏、动漫商品综合店，约37家门店
- GAMERS（ゲーマーズ）— 动漫CD/DVD/周边，约14家门店
- Lashinbang（らしんばん）— 二手动漫商品连锁，约30家门店
- K-Books（ケーブックス）— 动漫/同人专门店，约7家门店

你的网站收录了176家门店，覆盖北海道到九州全日本主要城市。

热门区域推荐：
- 秋叶原：动漫店铺最密集的区域，几乎所有连锁品牌都有门店
- 池袋：animate总店所在地，乙女路（女性向）圣地
- 大阪日本桥：关西最大的动漫街
- 名古屋大须：中部地区动漫商品集散地
- 札幌：北海道动漫店铺中心

回答要简洁友好，用中文回答。如果用户问的不是日本旅游/动漫店铺相关的问题，友好地引导回来。`

// Worker 部署后替换，或通过 .env 文件设置 VITE_AI_WORKER_URL
const WORKER_URL =
  import.meta.env.VITE_AI_WORKER_URL || 'https://japan-map-ai.9dk9jptv8h.workers.dev'

export async function chat(messages: ChatMessage[]): Promise<string> {
  let response: Response

  try {
    response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
  } catch (err) {
    throw new Error(
      '网络连接失败，请检查网络后重试。' +
        (err instanceof Error ? `（${err.message}）` : '')
    )
  }

  if (!response.ok) {
    let errorDetail = ''
    try {
      const errorData = (await response.json()) as { error?: string }
      errorDetail = errorData?.error ?? ''
    } catch {
      errorDetail = await response.text().catch(() => '无法读取错误详情')
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
