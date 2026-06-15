import { useEffect, useState, useMemo } from 'react'
import { mockLocations } from '@/constants/mockData'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'

/* ================================================================
   Welcome Screen — 欢迎界面 — 东京霓虹 × 日式美学
   Neon • Particles • City Lights • CountUp
   ================================================================ */

const TITLE_CHARS = '日本旅游地图'.split('')

const BRANDS = [
  { name: 'Animate', color: '#e91e63' },
  { name: 'Melonbooks', color: '#4caf50' },
  { name: 'Mandarake', color: '#ff9800' },
  { name: 'Suruga-ya', color: '#1565c0' },
  { name: 'GAMERS', color: '#fbc02d' },
  { name: 'Lashinbang', color: '#7b1fa2' },
  { name: 'K-Books', color: '#b71c1c' },
]

/* 城市光点 — 日本地图上7大城市群的位置 */
const CITY_DOTS = [
  { name: '东京', top: '48%', left: '72%', delay: 0, size: 12 },
  { name: '大阪', top: '62%', left: '52%', delay: 0.3, size: 10 },
  { name: '名古屋', top: '58%', left: '58%', delay: 0.5, size: 8 },
  { name: '福冈', top: '72%', left: '32%', delay: 0.7, size: 8 },
  { name: '札幌', top: '18%', left: '65%', delay: 0.9, size: 8 },
  { name: '仙台', top: '35%', left: '70%', delay: 1.1, size: 6 },
  { name: '广岛', top: '65%', left: '40%', delay: 1.3, size: 6 },
]

function WelcomeScreen({ exiting }: { exiting: boolean }) {
  const [count, setCount] = useState(175)

  /* 数字递增动画 — 0 → 175 */
  useEffect(() => {
    setCount(0)
    const target = 175
    let current = 0
    let intervalId: ReturnType<typeof setInterval>
    const timer = setTimeout(() => {
      intervalId = setInterval(() => {
        current += 6
        if (current >= target) {
          current = target
          clearInterval(intervalId)
        }
        setCount(current)
      }, 40)
    }, 400)
    return () => {
      clearTimeout(timer)
      if (intervalId) clearInterval(intervalId)
    }
  }, [])
      if (intervalId) clearInterval(intervalId)
    }
  }, [])

  /* 背景粒子 — 40个彩色光点 */
  const particles = useMemo(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.4,
      duration: `${3 + Math.random() * 4}s`,
      delay: `${Math.random() * 3}s`,
      color: BRANDS[i % BRANDS.length].color,
    }))
  , [])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #1a0a2e 50%, #2e0a1a 100%)',
        animation: exiting ? 'welcomeExit 0.6s ease-in forwards' : undefined,
      }}
    >
      {/* —— 粒子层 —— */}
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute rounded-full"
          aria-hidden
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            opacity: 0,
            '--particle-opacity': p.opacity,
            animation: `particleFloat ${p.duration} ${p.delay} ease-in-out infinite`,
          } as React.CSSProperties}
        />
      ))}

      {/* —— 日本地图 + 城市发光圆点 —— */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <div
          className="relative"
          style={{
            fontSize: 'min(60vw, 50vh)',
            lineHeight: 1,
            opacity: 0.08,
            filter: 'blur(1px)',
          }}
        >
          🗾
          {CITY_DOTS.map(dot => (
            <div
              key={dot.name}
              className="absolute rounded-full"
              style={{
                top: dot.top,
                left: dot.left,
                width: `${dot.size}px`,
                height: `${dot.size}px`,
                background: '#e91e63',
                boxShadow: '0 0 20px #e91e63, 0 0 40px #e91e6380',
                animation: `cityPulse 2s ${dot.delay}s ease-out both, pulse 2.5s ${dot.delay + 1}s ease-in-out infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* —— 主内容 —— */}
      <div className="relative z-10 flex flex-col items-center px-6 w-full max-w-[480px]">

        {/* 标题 — 逐字滑入 */}
        <h1 className="flex flex-wrap justify-center gap-[0.05em] mb-6 text-[clamp(28px,7vw,52px)] font-black leading-tight">
          {TITLE_CHARS.map((char, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                color: 'white',
                animation: `slideUp 0.5s ${0.3 + i * 0.08}s ease-out both`,
                textShadow: '0 0 30px rgba(233,30,99,0.3), 0 0 60px rgba(33,150,243,0.2)',
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* 数据统计 — 动态计数器 */}
        <div className="flex gap-8 mb-8" style={{ animation: 'fadeInUp 0.6s 1s ease-out both' }}>
          <div className="text-center">
            <div className="text-3xl font-black text-white">{count}+</div>
            <div className="text-xs text-white/50 mt-1">动漫店铺</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white">7</div>
            <div className="text-xs text-white/50 mt-1">大连锁</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-white">全国</div>
            <div className="text-xs text-white/50 mt-1">覆盖</div>
          </div>
        </div>

        {/* 品牌展示 — 彩色圆点 + 名称 */}
        <div
          className="flex flex-wrap justify-center gap-x-4 gap-y-2 mb-10 max-w-[400px]"
          style={{ animation: 'fadeInUp 0.5s 1.3s ease-out both' }}
        >
          {BRANDS.map((brand, i) => (
            <span
              key={brand.name}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium text-white/60"
              style={{ animation: `fadeInUp 0.4s ${1.4 + i * 0.06}s ease-out both` }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: brand.color, boxShadow: `0 0 8px ${brand.color}60` }}
              />
              {brand.name}
            </span>
          ))}
        </div>

        {/* 进度条 */}
        <div className="w-full max-w-[200px]" style={{ animation: 'fadeInUp 0.4s 1.6s ease-out both' }}>
          <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #e91e63, #1565c0, #7b1fa2)',
                animation: 'progressFill 2s 0.5s ease-out both',
              }}
            />
          </div>
          <p className="text-center text-[10px] text-white/30 mt-2">正在加载地图...</p>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   App Root
   ================================================================ */

export default function App() {
  const [loading, setLoading] = useState(true)
  const [exiting, setExiting] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [isMobile] = useState(() => window.innerWidth < 768)

  const loadingTime = isMobile ? 2200 : 2500
  const exitTime = isMobile ? 2800 : 3200

  useEffect(() => {
    // 延迟500ms再加载地图，让欢迎动画先跑顺
    const mapTimer = setTimeout(() => setMapReady(true), 500)
    const show = setTimeout(() => setExiting(true), loadingTime)
    const hide = setTimeout(() => {
      setLoading(false)
      document.body.style.background = ''  // 清除inline暗色背景，恢复CSS控制
    }, exitTime)
    return () => {
      clearTimeout(mapTimer)
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [loadingTime, exitTime])

  return (
    <ErrorBoundary>
      {/* 地图在底层 — 延迟500ms加载，避免和欢迎动画抢CPU */}
      {mapReady && <AppShell locations={mockLocations} />}

      {/* 欢迎页覆盖在上方 — 动画结束后移除 */}
      {loading && <WelcomeScreen exiting={exiting} />}
    </ErrorBoundary>
  )
}
