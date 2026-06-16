# AI助手后端代理 (Cloudflare Worker)

DeepSeek API 代理，让前端用户无需输入 API Key 即可使用AI小助手。

## 架构

```
用户浏览器 → Cloudflare Worker（持有API Key）→ DeepSeek API
```

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

### 4. 部署

```bash
wrangler deploy
```

### 5. 获取 Worker URL

部署成功后会输出类似 `https://japan-map-ai.你的用户名.workers.dev` 的地址。

### 6. 配置前端

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

## 安全说明

- API Key 通过 `wrangler secret` 加密存储，不在代码中暴露
- Worker 限制请求体大小（10KB），防止滥用
- 限制 `max_tokens: 800`，控制单次调用成本
- 仅允许 POST 方法
