import { useEffect, useState, useMemo } from 'react'
import { mockLocations } from '@/constants/mockData'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'
import { useMapStore } from '@/store/useMapStore'

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
  const [count, setCount] = useState(176)

  /* 数字递增动画 — 0 → 175 */
  useEffect(() => {
    setCount(0)
    const target = 176
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
        animation: exiting ? 'welcomeExit 0.8s ease-out forwards' : undefined,
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
   Loading Transition — 地图加载过渡页
   ================================================================ */

function LoadingTransition({ isMapReady }: { isMapReady: boolean }) {
  const [progress, setProgress] = useState(0)
  const [exiting, setExiting] = useState(false)

  // 进度动画：慢速走到90%，2.5秒
  useEffect(() => {
    const duration = 2500
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      setProgress(Math.floor(p * 90))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [])

  // 地图就绪 → 冲刺100% → 退出
  useEffect(() => {
    if (isMapReady && progress >= 50) {
      setProgress(100)
      const t = setTimeout(() => setExiting(true), 600)
      return () => clearTimeout(t)
    }
  }, [isMapReady, progress])

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center"
      style={{
        background: '#f7f3ee',
        animation: exiting ? 'welcomeExit 0.5s ease-in forwards' : undefined,
      }}
    >
      {/* 中央玻璃卡片 */}
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 24,
        padding: '48px 56px',
        boxShadow: '0 4px 40px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        maxWidth: 420,
        width: '90%',
        textAlign: 'center' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: 20,
      }}>
        <div style={{ fontSize: 60 }}>🗾</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>
          日本旅游地图
        </h2>
        <p style={{ fontSize: 13, color: '#9090b0', margin: 0 }}>
          176 动漫店铺 · 7 大连锁 · 全日本覆盖
        </p>

        {/* 进度条 */}
        <div style={{ width: '100%', marginTop: 8 }}>
          <div style={{
            height: 4,
            background: '#e8e8f0',
            borderRadius: 2,
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #e91e63, #1565c0, #7b1fa2)',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }} />
          </div>
          <p style={{ fontSize: 11, color: '#a0a0b8', marginTop: 8 }}>
            {progress >= 100 ? '加载完成' : '正在加载地图数据...'}
          </p>
        </div>

        {/* 7品牌呼吸灯 */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {BRANDS.map((b, i) => (
            <span key={b.name} style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: b.color,
              opacity: 0.4 + 0.6 * (progress / 100),
              animation: `pulse 1.8s ${i * 0.2}s ease-in-out infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   App Root — 三阶段过渡：welcome → loading → map
   ================================================================ */

export default function App() {
  const [phase, setPhase] = useState<'welcome' | 'loading' | 'map'>('welcome')
  const [welcomeExiting, setWelcomeExiting] = useState(false)
  const [mapRender, setMapRender] = useState(false)
  const [isMobile] = useState(() => window.innerWidth < 768)
  const isMapReady = useMapStore(s => s.isMapReady)

  const welcomeTime = isMobile ? 2200 : 2500

  // 地图延迟渲染——300ms后开始（确保overlay已经paint）
  useEffect(() => {
    const t = setTimeout(() => setMapRender(true), 300)
    return () => clearTimeout(t)
  }, [])

  // 欢迎页定时退出 → 进入loading
  useEffect(() => {
    const show = setTimeout(() => setWelcomeExiting(true), welcomeTime)
    const hide = setTimeout(() => setPhase('loading'), welcomeTime + 800)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
    }
  }, [welcomeTime])

  // loading阶段：至少2秒 + 地图必须ready
  useEffect(() => {
    if (phase !== 'loading') return
    let cancelled = false

    const checkIfReady = () => {
      if (cancelled) return
      if (isMapReady) {
        // 地图真正加载完毕 → 额外等0.8秒让进度条走完 → 进入地图
        setTimeout(() => {
          if (!cancelled) setPhase('map')
        }, 800)
      } else {
        // 还没ready → 每隔200ms检查一次
        setTimeout(checkIfReady, 200)
      }
    }
    // 最低2秒后才开始检查
    const minimumTimer = setTimeout(checkIfReady, 2000)
    return () => {
      cancelled = true
      clearTimeout(minimumTimer)
    }
  }, [phase, isMapReady])

  return (
    <ErrorBoundary>
      {mapRender && <AppShell locations={mockLocations} />}
      {phase === 'welcome' && <WelcomeScreen exiting={welcomeExiting} />}
      {phase === 'loading' && <LoadingTransition isMapReady={isMapReady} />}
    </ErrorBoundary>
  )
}
