// tile-proxy.js — 代理 MapTiler 瓦片请求（可选，VPN 用户用）
// 用法：
//   1. 去 https://cloud.maptiler.com 注册获取免费 API Key
//   2. 设置环境变量: set MAPTILER_KEY=your_key (Windows) 或 export MAPTILER_KEY=your_key (Unix)
//   3. 运行: node tile-proxy.js
//   4. 在 mapDefaults.ts 中把 light.url 改为:
//      http://127.0.0.1:15723/style.json?style=streets-v2
// 注意：不要在此文件中写入真实 API Key，提交前请确认 key 为占位符

const http = require('http')
const https = require('https')

const MAPTILER_KEY = process.env.MAPTILER_KEY || 'get_your_key_at_cloud_maptiler_com'
const PORT = 15723

const server = http.createServer((req, res) => {
  // 代理 style JSON — 返回修改过的样式，tile URL 指向本地代理
  if (req.url.includes('style.json')) {
    const urlParams = new URL(req.url, `http://127.0.0.1:${PORT}`)
    const styleName = urlParams.searchParams.get('style') || 'streets-v2'
    const styleUrl = `https://api.maptiler.com/maps/${styleName}/style.json?key=${MAPTILER_KEY}`

    https.get(styleUrl, (proxyRes) => {
      let body = ''
      proxyRes.on('data', chunk => body += chunk)
      proxyRes.on('end', () => {
        // 把 MapTiler 瓦片 URL 替换为本地代理地址
        const modified = body.replace(
          /https:\/\/api\.maptiler\.com\/tiles[^"]*/g,
          (match) => `http://127.0.0.1:${PORT}/tiles?url=${encodeURIComponent(match)}`
        )
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(modified)
      })
    }).on('error', (err) => {
      res.writeHead(502)
      res.end(`MapTiler API unreachable: ${err.message}`)
    })
    return
  }

  // 代理单张瓦片（PNG/WebP/JSON 等）
  if (req.url.includes('/tiles')) {
    const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
    const targetUrl = url.searchParams.get('url')
    if (!targetUrl) {
      res.writeHead(400)
      res.end()
      return
    }

    https.get(targetUrl, (proxyRes) => {
      res.writeHead(200, {
        'Content-Type': proxyRes.headers['content-type'] || 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      })
      proxyRes.pipe(res)
    }).on('error', (err) => {
      res.writeHead(502)
      res.end()
    })
    return
  }

  res.writeHead(404)
  res.end()
})

server.listen(PORT, () => {
  console.log(`Tile proxy running on http://127.0.0.1:${PORT}`)
  console.log(`MapTiler Key: ${MAPTILER_KEY === 'get_your_key_at_cloud_maptiler_com' ? 'NOT SET (占位符)' : 'SET'}`)
})
