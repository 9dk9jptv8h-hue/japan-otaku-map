# 更新日志

本项目的所有重要更改都记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [4.5.0] - 2026-07-20

> 代码审查共发现 92 个问题：72 个修复、20 个验证后确认已修复无需改动。

### Security（安全）
- **紧急修复**：Worker URL throw Error 导致网站崩溃 → 恢复 fallback
- **XSS 修复**：Marker 弹窗 onclick 改用 JS 转义，防止 ID 注入
- **Worker URL 隐藏**：移除前端 bundle 硬编码，仅从环境变量读取
- **promptShield 空输入误报**：空字符串不再标记为 CRITICAL
- **Worker body 校验**：`arrayBuffer` 替代可被省略的 `Content-Length`
- **DeepSeek 超时**：Worker 添加 25s `AbortController`
- **Worker 消息校验**：最大 20 条 + role/content 必填 + 400 拒绝

### Fixed（修复）

**导航系统：**
- 邮编破坏区域筛选：跳过 `〒XXX-XXXX` + `startsWith` 改 `includes`
- AI 错误 body 双重消费：`text()`→`JSON.parse`
- rAF 内存泄漏：`cancelAnimationFrame`
- 地图加载超时：20s 安全强制退出
- Chat 请求不取消：`AbortController` + unmount
- touch-action 破坏移动地图：移除容器触摸拦截
- 移动抽屉锁滚动：`body overflow hidden`
- 欢迎消息时间戳固化→动态生成
- Chat 输入 `maxLength={500}`
- Esc 关闭抽屉：键盘无障碍
- Input "0" 值 bug：falsy→`!= null && !== ''`
- moveend 节流：150ms
- MarkersLayer 过度重建→仅卸载时销毁
- clearCategories→全选
- visitCount 阈值 1000→10000
- city-photo 长键优先匹配
- AI 空响应不加空气泡
- ErrorBoundary 3 次重试限制 + functional setState
- 切换店铺竞态：`navSeq` 序列号防旧请求覆盖
- 路线/定位图层 styledata 丢失→`ensureLayers` 自动补建
- X→折叠箭头 `>` / `v`

**无障碍（7 处）：**
- SortPopover/RegionSelect/Input/LocationCard/MobileLayout 补 `aria-label`
- 按钮加 `type="button"` 防误提交
- EmptyState 空标题不渲染 + `role="status"`
- MapControls 未就绪 `disabled` 态

**UX/UI：**
- Chat 桌面加关闭按钮 + safe-area + FAB safe-area
- Sidebar safe-area insets
- LocationCard `flyToMarker` null 时 `cursor-default`
- 清除按钮重聚焦
- LocationCard 跳过首次 `scrollIntoView`

**代码质量：**
- MarkersLayer `as any`/`setFeatureState`/`photoUrl`/popupProps 注释和修复
- mockData 坐标精度 3 位小数注释 + IMG 占位注释
- mapDefaults `probeUrl`/`DEFAULT_VIEWPORT`/`TILE_STYLES` 注释
- MapContainer CJK 字体/mobile maxZoom 注释
- useFilteredLocations ISO8601 排序/useMemo 空依赖注释
- useFilterStore `ALL_CATEGORIES` 常量
- useMapStore 第 3 标记/`setSelectedMarkerId` 注释
- Worker `replaceAll` 子域名注释
- promptShield 零宽字符注释
- AppShell SSR hydration flash 注释
- city-photo 共享照片注释
- index.css `scrollbar`/`color-scheme` 注释
- SidebarToggle `z-50`

**HTML/构建：**
- `index.html`：canonical + JSON-LD priceCurrency + noscript 降级
- main.tsx：SW 注册错误日志

---

## [4.4.3] - 2026-07-20

### Fixed（修复）
- **ETA 不准**：`toLocaleTimeString` 时区计算错误导致预计时间偏差 → 已删除
- **Overpass 间歇无站点**：三端点共享 8s 超时 → 每端点独立 5s + 总预算 15s
- **路线间歇不显示**：styledata 清掉 layers 但 source 还在 → `ensureRouteLayers` 自动补建
- **切换店铺报定位错**：`startNavigation` 不清旧追踪 → 开头先 `stopTracking` + 清状态
- **X 按钮改为折叠箭头**：桌面 `>` / 移动 `v` 替代 X，行为不变

---

## [4.4.2] - 2026-07-20

### Fixed（修复）
- **navigateToStation 失败不回滚**：路线获取失败时 destination 被永久改为车站坐标 → 现在恢复原值
- **destination 被覆盖**：navigateToStation 改写 destination 导致公交面板查询偏移 → 新增独立 waypointTarget
- **continueToFinalDestination 缺 transportMode**：公交模式下继续导航面板状态异常
- **死代码 navigateToStore**：33 行无人调用的函数 → 已删除
- **中转导航无 GPS 追踪**：navigateToStation/continueToFinalDestination 未启动 watchPosition
- **空 geometry 无限重规划**：坐标数组为空时偏差永远 >50m → 加长度检查
- **reRoute 延迟更新 origin**：失败时 origin 停留旧值
- **公交面板双层动画**：内外层 nav-fade-in 叠加 → 去重
- **重规划重播动画**：偏离自动重规划触发全场滑入 → 仅首次加载播放入场动画
- **中转导航面板名不对**：步行到站后面板仍显示店铺名 → 改为显示站名
- **X 与清除路线行为相同**：现在 X 关闭面板保留导航，清除路线彻底结束

---

## [4.4.1] - 2026-07-20

### Fixed（修复）
- **退出动画不生效**：`exiting` 检查被 `!isPanelOpen` 迷你条截胡 → 重组代码结构使 exit 检查优先
- **面板动画仅首次播放**：关闭重开后 `animating` 不重置 → `isPanelOpen` 变化时自动重置入场动画
- **加载/错误窗口无动画**：直接闪现 → 加入滑入/淡入动画
- **加载→就绪无过渡**：`isRouting` 变化时重新触发入场动画
- **动画时长过短**：300ms → 400ms + `cubic-bezier(0.4,0,0.2,1)` 缓动
- **退出超时与 CSS 不同步**：250ms → 400ms
- **加载窗口过大**：大卡片 → 紧凑单行 `⟳ 正在计算路线...`
- **到达站按钮行为修正**：恢复为导航到车站（与出发站一致），到达后弹窗继续去店铺
- **公交站点查询失败**：`overpass-api.de` 国内被墙 → 三端点自动 fallback + 新增 bus_stop/tram_stop/halt 查询

---

## [4.4.0] - 2026-07-20

### Added（新增）
- **方位箭头修复**：自绘 SVG 三角箭头注册为 MapLibre 图像，替代不存在的 sprite icon
- **公交时间估算优化**：步行 + 地铁（~30km/h）+ 步行三段合计，迷你条显示总预估时间
- **ETA 预计到达**：步行统计行和迷你条显示「预计 14:35」到达时间
- **导航 UI 美化**：拖拽手柄 + 进度条 + 脉冲动画 + 面板滑入/滑出 + 模式切换 fade + 步骤展开动画 + 站点渐入 + 加载窗口动画 + 重开动画重置

### Fixed（修复）
- **偏离检测改进**：从顶点距离改为线段垂直距离，阈值提至 50m，避免平行街道误触发重规划
- 修复退出动画竞态条件：关闭面板后立即再点导航不再被延迟 clear 清除

---

## [4.3.0] - 2026-07-20

### Added（新增）
- **实时 GPS 追踪**：`watchPosition` 持续定位 → 步骤自动推进（<15m）→ 偏离路线检测 → 8 秒自动重规划
- **实时位置标记**：蓝色 pulsating 圆点 + 精度圈 + 方位角箭头
- **步骤自动高亮**：已完成绿色 ✓ / 当前 indigo 高亮 / 剩余灰色，自动滚动跟随
- **站点中转导航**：「步行到车站」→ 自动导航至站点 → GPS 检测到达 → 绿色提示「继续去店」
- **公交模式增强**：双列站点（出发→到达）+ 选中步行时间 + 一键跳转 Google Maps

### Fixed（修复）
- navigateToStation/continueToFinalDestination 复用追踪中的 userPosition，不再重复请求 GPS 导致超时
- 「步行到车站」点击后自动切换至步行模式
- 到达站「步行到店」与出发站行为分离
- 公交面板移除重复的「查看完整方案」按钮
- 公交模式迷你条独立显示时间，不再套用步行路线的时长
- 展开面板公交模式精简仅显示站点列表

---

## [4.2.0] - 2026-07-20

### Added（新增）
- **站内独立步行导航系统**：点击店铺即可获取步行路线，无需跳转外部地图 App
  - OSRM 步行路线 API 集成（`router.project-osrm.org`），免费无需 Key
  - **详细中文指令**：提取路名 + 转向方向 + 距离，格式「沿{路名}直行{距离}」「转入{路名}，右转步行{距离}」
  - 机动方向完整中译：uturn/sharp right/slight left/straight/merge/fork 等 9 种方向
  - 中文指令翻译：英文 maneuver 自动转为中文转向提示
  - WebGL 路线渲染（RouteLayer）：靛蓝主线 + 白色描边 + 起终点标记
  - 导航面板（NavigationPanel）：桌面端浮动右侧 / 移动端底部 Sheet，玻璃拟态风格
  - 步行步骤列表：时间线样式展示，点击步骤地图 flyTo
  - GPS 自动定位：浏览器 Geolocation API
  - 四状态处理：加载中 / 错误重试 / 完整面板 / 折叠迷你条
  - GPS 权限拒绝 / 超时 / 不可用的分类错误提示
- 店铺卡片和 Popup 新增「🧭 导航到这里」按钮

### Changed（变更）
- DesktopLayout / MobileLayout 集成 RouteLayer + NavigationPanel
- useMapStore 的 selectedMarkerIds 最多支持 2 个

### Fixed（修复）
- **校准 100 家店铺坐标**（Animate 48 + Melonbooks 29 + Mandarake 11 + Suruga-ya 12）：修正偏差超 300 米的标记，涩谷等店不再偏到铁轨上

---

## [4.1.1] - 2026-06-24

### Fixed（修复）
- 修复不开 VPN 时地图永久卡在加载页的问题：MapContainer 新增 15 秒超时 + error 事件监听 + styledata 双重兜底机制
- 修复 index.html preconnect/preload 直连被墙的 openfreemap.org，改为指向 Worker 代理地址
- **Vercel Edge Rewrites 瓦片代理**：利用 vercel.json 边缘重写 /tiles/* → OpenFreeMap，绕开 workers.dev 域名在国内被墙的问题；MapContainer 新增 transformRequest 统一拦截瓦片 URL（含 sprite/glyph）；支持 GitHub Pages 跨域请求 Vercel 做代理
- **瓦片代理自动检测**：启动时自动检测直连 OpenFreeMap vs Vercel 代理的连通性。优先直连（延迟更低），Vercel 做 fallback。解决 VPN 环境下 Vercel 不可达但 OpenFreeMap 直连可用的问题。手动 AbortController 替代 AbortSignal.timeout 保证旧浏览器兼容；no-cors 探测避免 CORS 头缺失导致误判

---

## [4.1.0] - 2026-06-22

### Added（新增）
- 支持 Vercel 部署，国内无需 VPN 可直连访问（vercel.app 域名）
- 新增 vercel.json（Vite 框架检测 + SPA 路由 rewrites）

### Changed（变更）
- vite.config base 改用 VERCEL 环境变量区分：Vercel 构建用根路径 `/`，GitHub Pages 保持 `/japan-otaku-map/`
- manifest.json 改用相对路径（start_url / scope / icon），同时兼容两个部署平台的 PWA 安装

### 说明
- GitHub Pages 部署不受影响，两平台并行运行

---

## [4.0.0] - 2026-06-20

### Fixed（修复）
- 修复 promptShield 非字符串输入绕过漏洞
- 修复 ChatAssistant 中文输入法 Enter 键误发送
- 修复 Zustand store 缺少 selector 导致大量不必要重渲染
- 修复 MarkersLayer 弹窗 HTML 注入风险
- 修复 AI Service 缺少请求超时和中断机制
- 修复 Worker 错误静默吞没、缺少日志
- 修复 Android API 24-29 WindowInsets 崩溃
- 修复 Service Worker 不缓存代理后瓦片
- 修复 CSS 死代码和冗余变量
- 修复 viewport-fit=cover 缺失导致安全区域失效
- 修复 App.tsx isMobile 不响应窗口大小变化
- 修复 README 虚高版本号、CHANGELOG 缺失比较链接
- 修复 Badge 组件死代码

---

## [3.10.0] - 2026-06-20

### Changed（变更）
- **网站改名：日本旅游地图 → 日本动漫店铺地图**
- 欢迎页标题8字不换行 — 字号适配（clamp(22px,5.5vw,48px) + whitespace-nowrap）
- 删除欢迎页底部进度条 — 避免与加载过渡页重复
- 侧边栏标题统一为"日本动漫店铺地图"
- AI聊天面板去除右上角关闭按钮 — 底部浮动按钮已可开关
- 重新截图（欢迎页+地图界面）+ README同步
- 从生产构建重新截图

---

## [3.9.0] - 2026-06-20

### Changed（变更）
- **清除地图英文标签，只保留中文**
- **回退英文标签清理至温和方案 — 保留所有文字图层，仅替换name为中文优先** — 增强矢量瓦片标签清理逻辑，删除纯英文图层（_en/-en/english/latin），名称字段优先 name:zh → name:ja → name，数组表达式中的英文字段引用也被清空

---

## [3.8.0] - 2026-06-20

### Added（新增）
- **Cloudflare Worker 瓦片CDN缓存** — 扩展现有Worker添加 `/tiles/*` 代理路由，利用Cloudflare边缘节点（香港/新加坡/东京）加速OpenFreeMap瓦片加载
- 瓦片PBF文件缓存7天，样式JSON缓存1天，自动利用全球CDN
- Worker服务端重写样式JSON内部URL，字体/精灵图/瓦片全部自动走代理，前端零改动
- 前端 `USE_TILE_PROXY` 开关，可一键切回直连模式

### Performance（性能）
- 国内地图瓦片加载从200-500ms降至50-100ms（边缘节点命中后）
- 首次加载后瓦片全部边缘缓存，后续访问近乎即时

---

## [3.7.0] - 2026-06-20

### Fixed（修复）
- **彻底消除地图闪现** — 地图延迟到加载页完全就绪(opacity=1)后才开始渲染DOM，之前的300ms延迟方案仍有短暂暴露风险
- 新时序保证：欢迎页淡出→加载页淡入完成→等500ms→`mapRender=true`→地图加载→`isMapReady`→等1s→加载页淡出

### Changed（变更）
- 移除`mapRender`的300ms固定延迟，改为依赖`loadingOpacity`状态驱动
- 移除`willChange: 'opacity'`（非必要的GPU提升）
- 地图就绪后等待时间从0.8s调整为1s，让进度条动画完整走完
- 简化Phase 2→3逻辑：移除轮询检查`isMapReady`的定时器，改为直接响应state变化

---

## [3.6.0] - 2026-06-20

### Fixed（修复）
- **彻底修复地图闪现** — 重写启动过渡为零React卸载方案：所有覆盖层始终在DOM中，纯CSS `opacity` + `transition` 控制可见性，消除了条件渲染导致的帧间隙闪烁
- **欢迎→加载→地图全流程平滑过渡** — 欢迎页淡出(`opacity 0.6s`)与加载页淡入(`opacity 0.5s`)同时进行，实现真正的交叉溶解(cross-dissolve)

### Changed（变更）
- App三层架构重写：地图层(底)、加载层(z-9998)、欢迎层(z-9999)始终存在DOM
- WelcomeScreen移除`exiting`参数和`welcomeExit`动画（外部opacity已处理）
- LoadingTransition移除内部`exiting`状态和退出动画（外部opacity已处理）
- 各覆盖层添加`willChange: 'opacity'`提升至GPU合成层，确保60fps过渡
- `pointerEvents`随opacity联动：透明层不阻挡交互

### Removed（移除）
- 移除所有基于React条件渲染的phase切换逻辑
- 移除WelcomeScreen/LoadingTransition内部的exiting动画状态

---

## [3.5.0] - 2026-06-20

### Fixed（修复）
- 加载过渡页时序修复 — 欢迎页和加载页同步切换，彻底消除地图闪现
- 加载页最低显示时间保证 — 硬性2秒+地图必须ready才退出
- 进度条动画延长至2.5秒匀速，视觉节奏更舒适
- 加载页添加淡入动画 — 欢迎→加载→地图全流程交叉过渡（overlayFadeIn 0.4s + welcomeExit 0.5s）
- 加载页提前60ms渲染，欢迎页退出前确保加载完全就位

### Changed（变更）
- 加载过渡页背景从暗色(`#0a0a12`)改为暖色浅背景(`#f7f3ee`)
- 加载页重设计为毛玻璃卡片风格 — `rgba(255,255,255,0.85)` + `backdrop-filter: blur(20px)` + 圆角24px
- 加载页新增7品牌呼吸灯圆点动画，模拟"正在连接各品牌数据"
- 加载页进度条地图就绪后冲刺100%再退出，而非直接消失
- AppShell改为条件渲染(mapRender state) — 300ms延迟后才挂载地图组件

---

## [3.4.0] - 2026-06-20

### Changed（变更）
- 侧边栏全面重新设计 — 布局从上到下：紧凑Header → 搜索+排序一行 → 分类+地区筛选 → 卡片列表
- 分类筛选改为彩色圆点横排 — 选中实心+加粗，未选空心+灰色，占空间大幅减少
- 地区筛选改为下拉选择器(RegionSelect) — 替代原来的横滚chips，节省垂直空间
- 排序改为图标弹出菜单(SortPopover) — 搜索栏右侧小按钮，点击弹出选项列表
- 卡片重新设计 — 白底圆角16px，品牌色圆点+评分+店名加粗+地址截断+标签badge
- 卡片悬浮动画 — hover上浮2px+阴影加深，入场stagger动画(每张延迟30ms)
- 移动端抽屉同步更新 — 使用新组件结构，紧凑单行Header

### Added（新增）
- `RegionSelect` 组件 — 地区下拉选择器，带click-outside关闭
- `SortPopover` 组件 — 排序弹出菜单，带勾选标记
- 地图加载过渡页 — 欢迎页退出后显示渐变进度条加载动画，地图就绪后平滑过渡

### Removed（移除）
- `SortControl` 组件 — 功能已合并至SortPopover

---

## [3.3.1] - 2026-06-17

### Fixed（修复）
- SYSTEM_PROMPT Animate门店数修正 — 从错误的53家更正为实际的48家（与mockData一致）
- SYSTEM_PROMPT Melonbooks门店数修正 — 从错误的25家更正为实际的29家（与mockData一致）
- APK versionName从"3.1"升至"3.3"，versionCode从1升至2 — 与当前app版本同步
- CHANGELOG补全 [3.3.0]/[3.2.0]/[3.1.2] 版本比较链接

---

## [3.3.0] - 2026-06-16

### Changed（变更）
- 缩放键移到右上角 — 桌面端top-4/移动端top-16，不再和归因文字重叠
- AI聊天按钮回到右下角 — bottom-6，聊天面板跟随调整

---

## [3.2.0] - 2026-06-16

### Changed（变更）
- AI聊天面板打开/关闭动画优化 — 从条件渲染改为CSS transition，scale+opacity从右下角展开，250ms ease-out
- AI聊天面板尺寸缩小 — 桌面端400×500→360×440，移动端全屏不变

---

## [3.1.2] - 2026-06-16

### Fixed（修复）

#### High
- **BUG-10** APK版本号更新 — `versionName` 从 `2.7` 升至 `3.1`
- **BUG-12** 移除地理位置权限自动授予 — 删除 `onGeolocationPermissionsShowPrompt` 重写，恢复系统默认弹窗确认
- **BUG-14** Worker CORS通配符安全加固 — `Access-Control-Allow-Origin` 从 `*` 锁定为 `https://9dk9jptv8h-hue.github.io`

#### Medium
- **BUG-01** SYSTEM_PROMPT Mandarake门店数修正 — 从错误的9家更正为实际的11家
- **BUG-04** city-photo.ts 35个日文键名改为中文简体 — 与mockData的name字段统一（秋葉原→秋叶原、渋谷→涩谷等）
- **BUG-11** Android targetSdk/compileSdk 从34升至35
- **BUG-13** WebView混合内容策略 — `MIXED_CONTENT_COMPATIBILITY_MODE` 改为 `MIXED_CONTENT_NEVER_ALLOW`

#### Low
- **BUG-02** 安全规则数描述从"35+"更正为"40+"
- **BUG-05** 删除两处死CSS选择器 `.absolute.bottom-4.right-4`
- **BUG-06** 删除无效的 `/planet` preload link
- **BUG-07** types/index.ts 分类注释从"四大分类"更正为"七大分类"
- **BUG-08** Service Worker trimCache优化 — 改为每10次cache.put执行一次，减少性能开销

---

## [3.1.1] - 2026-06-16

### Fixed（修复）
- AI小助手回复格式优化 — Markdown渲染改为纯文本，消除多余换行和格式符号
- 修复聊天面板重复消息问题 — 防止同一请求触发多次发送
- 归因文字「Powered by DeepSeek」位置调整，不再遮挡缩放控件
- 缩放按钮（+/-）在聊天面板展开时自动上移避让

---

## [3.1.0] - 2026-06-16

### Changed（变更）
- AI小助手改为Cloudflare Worker代理架构 — 用户无需输入API Key即可使用
- 删除前端API Key输入面板、localStorage存储逻辑
- 新增 `worker/` 目录 — Cloudflare Worker项目，代理转发DeepSeek API请求
- Worker服务端注入API Key，前端零敏感信息暴露
- 支持通过环境变量 `VITE_AI_WORKER_URL` 配置Worker地址
- Worker限制请求体10KB + max_tokens 800，防滥用控成本

---

## [3.0.0] - 2026-06-16

### Added（新增）
- AI小助手聊天功能 — 右下角浮动按钮，点击展开聊天面板，接入DeepSeek API
- AutoSec-QC提示词注入检测 — 用户输入发送前经过40+条安全规则扫描（10个攻击类别）
- 支持自定义API Key — 用户自行输入DeepSeek API Key，localStorage本地存储
- 系统提示词内置176家店铺知识 — AI了解7大连锁品牌及热门区域推荐
- 聊天面板移动端全屏适配 — 桌面端400x500浮动面板，移动端全屏聊天
- 消息安全拦截 — HIGH/CRITICAL级别注入攻击自动拦截并提示用户

---

## [2.8.0] - 2026-06-16

### Fixed（修复）
- 欢迎页计数器目标值175→176，与实际数据一致
- Android弃用API替换（WindowInsetsController/OnBackPressedCallback）
- 删除30行死CSS（旧DOM Marker移动端样式）
- sitemap日期更新至2026-06-16

### Changed（变更）
- 删除tileLayer/setTileLayer死代码，地图样式硬编码standard
- 删除未使用的FilterState接口、icon字段、tile-proxy.js
- APK版本号2.5→2.7
- CHANGELOG补全版本比较链接

---

## [2.7.0] - 2026-06-16

### Added（新增）
- 新增animate高冈店（2026年3月新开，富山县イオンモール内），总计176家门店
- 地图改为2D平面模式，禁止倾斜旋转，移除3D建筑物层

### Performance（性能优化）
- 预加载矢量瓦片style JSON和TileJSON元数据

---

## [2.6.0] - 2026-06-16

### Added（新增）
- Android APK安装包 — WebView全屏应用，加载GitHub Pages在线地址
- GitHub Actions自动构建APK（workflow_dispatch手动触发）
- 网站更新后App自动获取最新内容，无需重新安装

---

## [2.5.1] - 2026-06-16

### Changed（变更）
- 回退移动端raster瓦片，统一使用OpenFreeMap矢量瓦片

---

## [2.5.0] - 2026-06-16

### Performance（性能优化）
- 移动端地图切换为CartoDB raster瓦片 — 零GPU渲染开销，加载更快
- 桌面端保持OpenFreeMap矢量瓦片不变

---

## [2.4.0] - 2026-06-16

### Added（新增）
- 地图标记hover放大效果 — 鼠标悬停圆点放大1.6倍+描边加粗，侧边栏卡片hover联动地图标记

---

## [2.3.0] - 2026-06-15

### Fixed（修复）
- 消除欢迎页入场闪白 — body初始暗色背景+退出时恢复
- 去除侧边栏CSS入场动画，防止欢迎页期间侧边栏闪现
- 点击地图空白处关闭弹窗
- 修复20项审查问题 — SEO meta/requestAnimationFrame/死代码清理/SW缓存上限/筛选Hook提取

### Refactored（重构）
- 提取共享筛选Hook（useFilteredLocations）+ LocationCard颜色从theme常量导入

### Style（视觉）
- 欢迎界面入场淡入过渡
- 侧边栏关闭按钮改为半透明融入header

---

## [2.2.0] - 2026-06-15

### Changed（变更）
- 欢迎界面全新设计 — 暗色霓虹风格，动态粒子背景，日本地图城市光点，数字递增动画，进度条加载指示

---

## [2.1.0] - 2026-06-15

### Changed（变更）
- 欢迎界面重新设计 — 印章改为品牌圆点列表，适配7大连锁

---

## [2.0.0] - 2026-06-15

### Added（新增）
- 新增GAMERS(ゲーマーズ)约14家门店 — 黄色标记
- 新增Lashinbang(らしんばん)约30家门店 — 紫色标记
- 新增K-Books(ケーブックス)约7家门店 — 深红标记
- 7大连锁店铺全覆盖，地点总数突破170+

### Removed（移除）
- 移除地图样式切换控件 — 固定使用标准样式

---

## [1.9.0] - 2026-06-15

### Fixed（修复）
- 修复桌面/移动端全不选分类时行为不一致
- 修复切换地图风格时事件处理器重复注册（内存泄漏）
- 修复terrain和light瓦片风格相同
- 修复SEO描述缺少骏河屋
- 修复Service Worker无缓存上限和离线错误处理
- 移除过时的no-cache强制刷新meta标签
- 清理百度推送脚本HTTP不安全分支

### Added（新增）
- 侧边栏添加地图风格切换控件（浅色/标准/暗色/地形）

### Changed（变更）
- README更新：删除已移除的深色模式描述，更新项目结构
- 清理4个未使用的组件文件

---

## [1.8.1] - 2026-06-15

### Fixed（修复）
- 校准全部124家门店经纬度坐标，修正5处定位偏差
  - animate新千岁机场(ani-hkd-4): 坐标偏离航站楼约1.5km，修正至正确位置
  - Melonbooks秋叶原(mel-knt-1): 与骏河屋秋叶原游戏店坐标完全重复，按外神田1丁目实际位置南移
  - 骏河屋大宫丸井店(sur-knt-4): 与Melonbooks大宫坐标完全重复，按大宫丸井实际位置修正
  - animate静冈(ani-cbu-3): 与骏河屋静冈紺屋町店坐标完全重复，微调区分
  - 骏河屋名古屋大须总店(sur-cbu-6): 与Mandarake名古屋店坐标完全重复，微调区分
- 确认其余119家门店坐标均与地址匹配，无需修正

---

## [1.8.0] - 2026-06-15

### Added（新增）
- 新增骏河屋(駿河屋/Suruga-ya)分类 — 37家门店，覆盖北海道到九州
- 骏河屋蓝色标记(#1565c0)，与现有三类颜色区分明确
- 包含6家秋叶原专门店（总店、模型店、游戏店、站前店、卡牌店、动漫周边店）
- 包含BOOK MARKET / ENTERKING骏河屋支援店
- 地点总数从87增至124

---

## [1.7.0] - 2026-06-15

### Changed（变更）
- 瓦片恢复为OpenFreeMap矢量瓦片 — 缩放无模糊，支持中文标签自动检测

---

## [1.6.0] - 2026-06-15

### Performance（性能优化）
- 瓦片从 OpenFreeMap 矢量切换为 CartoDB raster — 加载速度提升数倍，渲染零 GPU 开销
- Fastly CDN 亚洲节点（香港/新加坡/东京），国内延迟显著降低
- 删除矢量瓦片中文标签替换逻辑（raster 瓦片自带标签）
- 删除样式 JSON 预取（raster style 本地构建，零网络依赖）
- Service Worker 缓存覆盖 CartoDB 全部子域（a/b/c/d），旧缓存自动清除
- 启用 512px @2x retina 瓦片 — 同等视口 HTTP 请求数减少 75%，文字更锐利
- MapLibre 渲染参数深度优化 — fadeDuration=0 瓦片直接显示、refreshExpiredTiles=false 缓存优先、桌面端瓦片内存缓存扩大至 200
- 瓦片加载状态指示器 — 加载中显示轻量提示，idle 后自动消失
- Service Worker 缓存升级至 v3 — 自动清除旧版 256px 瓦片缓存

---

## [1.5.0] - 2026-06-15

### Performance（性能优化）
- 欢迎页与地图并行加载 — 不再串行等待，欢迎动画期间地图已在后台初始化渲染
- 添加瓦片 Service Worker 缓存 — 二次访问瓦片直接从本地 Cache API 读取
- 预连接瓦片服务器（preconnect/dns-prefetch）— 减少 DNS + TLS 握手延迟
- 样式 JSON 模块级预取 — 默认样式在 import 时即开始 fetch，地图初始化时直接使用
- MapLibre 渲染优化 — 关闭抗锯齿/跨源碰撞检测/资源计时收集，移动端限制瓦片缓存

---

## [1.4.0] - 2026-06-15

### Removed（移除）
- 移除深色模式 — 删除ThemeToggle组件、暗色CSS变量、主题切换逻辑

---

## [1.3.0] - 2026-06-15

### Fixed（修复）
- 修复侧边栏点击地点后地图飞到错误坐标（lat/lng参数顺序反了）
- 修复ErrorBoundary无背景色（--color-washi未定义）
- 修复地区筛选滚动条不隐藏（scrollbar-hide未定义）
- 修复Popup字体栈不一致
- 清除残留日文aria-label和"店舗"
- 清除mockData中残留的"圣地巡礼"用词

### Added（新增）
- 侧边栏添加主题切换按钮（深色/浅色模式）
- 移动端添加地图缩放控件

### Changed（变更）
- 清理未使用的组件文件（CustomMarker.tsx、PopupCard.tsx）
- 删除无关文件deepseek-balance.html
- README字体描述更新

---

## [1.2.0] - 2026-06-15

### Changed（变更）
- **网站改版** — 从"圣地巡礼地图"转型为"日本旅游地图"
- **删除圣地巡礼分类** — 移除16个圣地巡礼地点和pilgrimage分类
- **全站标题更新** — 统一改为「日本旅游地图」

---

## [1.1.0] - 2026-06-15

### Performance（性能优化）

- **Marker从DOM改为WebGL原生图层** — 100+个DOM元素替换为1个GeoJSON Source + 2个WebGL图层（circle+symbol），拖拽地图时标记零延迟
- **移动端欢迎页优化** — 花瓣20→8个，加载时间2.5s→1.8s，标题/印章自适应小屏
- **移动端GPU减负** — pixelRatio降为1x，最大缩放18级，关闭fade动画
- **移动端CSS全面降级** — backdrop-blur 20px→4px，阴影简化，装饰动画禁用，transition缩短

### Style（视觉恢复）

- **恢复移动端欢迎页视觉效果，保持桌面端质感** — 花瓣8→14个、inkBloom水墨晕染动画恢复（blur降为8px）、地图呼吸动画恢复（频率减半）、毛玻璃blur恢复至12px、加载时间1.8s→2.2s

### Fixed（修复）

- 修复移动端欢迎页布局溢出
- 修复地图标记在移动端拖拽时延迟跟随
- 修复切换瓦片图层后标记消失（styledata事件自动重建图层）
- 修复移动端侧边栏打开时顶部搜索栏层级冲突（z-index重叠）
- 修复移动端残留日文文字（店舗→地点、閉じる→关闭）

---

## [1.0.4] - 2026-06-15

### Added（新增）
- **SEO优化** — meta标签、sitemap、robots.txt、结构化数据，支持百度/Google搜索引擎收录

---

## [1.0.3] - 2026-06-15

### Added（新增）

- **GitHub Pages 自动部署** — 每次push到master自动构建发布，无需本地跑服务器即可访问
- 访问地址: https://9dk9jptv8h-hue.github.io/japan-otaku-map/

---

## [1.0.2] - 2026-06-15

### Fixed（修复）

- **移除Google Fonts外部依赖** — `fonts.googleapis.com` 在国内被墙导致页面无法加载，改用系统本地字体
- **字体栈优化** — `Noto Sans SC`(需CDN) → `Microsoft YaHei`(本地)，零网络依赖，不开VPN也能正常显示

---

## [1.0.1] - 2026-06-14

### Changed（变更）

- **README 全面重写** — 反映当前实际状态：MapLibre GL、103地点、全中文、4分类、地区筛选
- **GitHub仓库描述更新** — 新描述：「日本旅游——圣地巡礼地图 | 103个动漫圣地+店铺 | MapLibre矢量瓦片」
- **GitHub Topics更新** — react, typescript, maplibre, anime, japan, pilgrimage, vite, tailwindcss, zustand, vector-tiles, otaku, travel
- **Badges更新** — Leaflet badge → MapLibre GL 5 badge

### Added（新增）

- **CHANGELOG.md** — 添加更新日志，记录所有历史更新

---

## [1.0.0] - 2026-06-14

### Added（新增）

- **圣地巡礼数据扩充** — 新增 17 个圣地巡礼地点（君の名は。、鬼滅の刃、ラブライブ！、千与千寻等），共计 103 个地点（87 店铺 + 16 圣地）
- **pilgrimage 分类** — 新增圣地巡礼分类，使用赤红鸟居图标
- **侧边栏地区筛选** — 支持按都道府県过滤地点
- **三重筛选** — 地区 / 分类 / 搜索三重筛选（AND 关系）
- **地图与侧边栏联动** — 地图标记点击与侧边栏卡片高亮联动
- **四种地图风格** — 浅色 / 标准 / 暗色 / 地形可选切换

### Changed（变更）

- **网站中文化** — 所有地点名称、描述、标签翻译为中文；欢迎界面标题改为「日本动漫圣地巡礼地图」；侧边栏、移动端 UI 文字全部中文化；浏览器标签页标题中文化
- **网站改名** — 网站名称改为「日本旅游——圣地巡礼地图」
- **地图引擎升级** — Leaflet → MapLibre GL JS（矢量瓦片渲染）；缩放不再模糊，支持到 22 级
- **瓦片源切换** — 切换为 OpenFreeMap（全球 CDN，国内可直连）；中文标签自动检测（name:zh 优先）
- **默认地图风格** — 改为彩色标准风格

### Performance（性能优化）

- **瓦片性能优化** — 从 GSI 日本 → CartoDB Fastly 全球 CDN；缩放时预加载周边 10 格瓦片；缩放过程中实时更新瓦片；瓦片加载失败显示占位图
- **Marker 渲染优化** — 从 innerHTML 改为 CSS 变量驱动（零 DOM 重建）
- **卡片列表虚拟化** — 添加 `content-visibility: auto`（屏幕外不渲染）
- **CSS 过渡精确化** — `transition-all` → 精确属性，移除不必要的 `backdrop-blur`（减少 GPU 合成层）
- **修复 useMemo 依赖缺失 bug**
- **代码分割** — maplibre / React 生态 / 业务代码拆为 3 个独立 chunk

### Fixed（修复）

- 去除侧边栏打开时的地图模糊遮罩
- 去除遮罩层，侧边栏打开时地图可交互（拖拽、点击标记）

---

## [0.1.1] - 2026-06-14

### Fixed（修复）

- 修复 GitHub README 截图显示空白问题
- 截图引用改为 GitHub raw URL

---

## [0.1.0] - 2026-06-14

### Added（新增）

- **项目初始化** — React 19 + TypeScript + Vite + TailwindCSS 4 + Zustand
- **地图引擎** — Leaflet 地图（后续版本升级为 MapLibre GL）
- **店铺数据** — 87 个动漫店铺数据（animate / melonbooks / mandarake）
- **Sakura 主题欢迎界面** — 水墨 + 樱花花瓣 + 判子印章动画
- **深色/浅色主题切换**
- **响应式布局** — 桌面侧边栏 + 移动端抽屉
- **GitHub Pages 部署**

---

[4.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.10.0...v4.0.0
[3.10.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.9.0...v3.10.0
[3.9.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.8.0...v3.9.0
[3.8.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.7.0...v3.8.0
[3.7.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.6.0...v3.7.0
[3.6.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.5.0...v3.6.0
[3.5.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.4.0...v3.5.0
[3.4.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.3.1...v3.4.0
[3.3.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.3.0...v3.3.1
[3.3.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.2.0...v3.3.0
[3.2.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.1.2...v3.2.0
[3.1.2]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.1.1...v3.1.2
[3.1.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.8.0...v3.0.0
[2.8.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.7.0...v2.8.0
[2.7.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.5.1...v2.6.0
[2.5.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.5.0...v2.5.1
[2.5.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.9.0...v2.0.0
[1.9.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.8.1...v1.9.0
[1.8.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.8.0...v1.8.1
[1.8.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.7.0...v1.8.0
[1.7.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.6.0...v1.7.0
[1.6.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.5.0...v1.6.0
[1.5.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.4...v1.1.0
[1.0.4]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.1...v1.0.0
[0.1.1]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/9dk9jptv8h-hue/japan-otaku-map/releases/tag/v0.1.0























