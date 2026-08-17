# AI助手后端代理 (Cloudflare Worker)

DeepSeek API 代理，让前端用户无需输入 API Key 即可使用AI小助手。
同时提供 `/tiles/*` 瓦片代理路由（OpenFreeMap → Cloudflare Edge 缓存），
是前端地图加载失败时的 fallback 瓦片源。

## 架构

```
用户浏览器 → Cloudflare Worker（持有API Key）→ DeepSeek API
用户浏览器 → Cloudflare Worker /tiles/* → OpenFreeMap（Edge 缓存 7 天）
```

## 安全机制

- **API Key 服务端注入**：`wrangler secret` 加密存储，代码中不出现
- **系统提示词服务端注入**：客户端传来的 `system` 消息一律丢弃，提示词不可被篡改
- **Origin 校验**：仅允许本站域名（github.io / vercel.app / localhost）调用 AI 路由，
  curl/脚本等无 Origin 请求直接 403
- **限流**：每 IP 10 分钟 20 次滑动窗口。绑定 KV（见下）时跨 isolate 持久化；
  未绑定 KV 时自动回退为单 isolate 内存计数（重启清零）
- **请求体校验**：≤10KB、≤20 条消息、role/content 必填
- **成本控制**：`max_tokens: 800`、DeepSeek 25s 超时

## 部署步骤

### 1. 安装 wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 设置 API Key（密钥不会出现在代码中）

```bash
cd worker
wrangler secret put DEEPSEEK_API_KEY
# 按提示输入你的 DeepSeek API Key
```

### 4.（推荐）绑定 KV 启用持久化限流

```bash
wrangler kv namespace create RATE_LIMIT_KV
```

把输出的 namespace id 填入 `wrangler.toml` 的 `[[kv_namespaces]]` 段（取消注释）。
不绑定也能部署，限流自动回退为内存模式。

### 5. 部署

```bash
wrangler deploy
```

### 6. 获取 Worker URL

部署成功后会输出类似 `https://japan-map-ai.你的用户名.workers.dev` 的地址。

### 7. 配置前端

在项目根目录创建 `.env` 文件：

```env
VITE_AI_WORKER_URL=https://japan-map-ai.你的用户名.workers.dev
```

## 本地开发

```bash
cd worker
npm install
wrangler secret put DEEPSEEK_API_KEY  # 本地也需要设置
npm run dev                            # 启动本地Worker
```

本地开发时允许 `http://localhost:5173` 的 Origin 调用。

## 中国大陆可用性提示

`*.workers.dev` 域名在大陆可能被墙。若要彻底覆盖大陆用户（瓦片代理 + AI），
建议为 Worker 绑定自定义域名（Cloudflare 控制台 → Worker → Triggers → Custom Domains）。
