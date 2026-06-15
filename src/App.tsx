import { useEffect, useState, useMemo } from 'react'
import { mockLocations } from '@/constants/mockData'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'

/* ================================================================
   Welcome Screen — 欢迎界面 — 日本旅游地图
   Sakura • Sumi-e • Hanko Stamps
   ================================================================ */

const TITLE_CHARS = '日本旅游地图'.split('')
const SUBTITLE = '日本旅游 — 全国店铺地图'

interface StampData {
  label: string
  sub: string
  color: string
  bg: string
  border: string
  shadow: string
}

const STAMPS: StampData[] = [
  {
    label: 'アニメイト',
    sub: 'Animate',
    color: '#e91e63',
    bg: '#fce4ec',
    border: '#f48fb1',
    shadow: '0 0 24px rgba(233,30,99,0.3)',
  },
  {
    label: 'メロンブックス',
    sub: 'Melonbooks',
    color: '#009688',
    bg: '#e0f2f1',
    border: '#80cbc4',
    shadow: '0 0 24px rgba(0,150,136,0.3)',
  },
  {
    label: 'まんだらけ',
    sub: 'Mandarake',
    color: '#ff9800',
    bg: '#fff3e0',
    border: '#ffcc80',
    shadow: '0 0 24px rgba(255,152,0,0.3)',
  },
]

interface PetalData {
  id: number
  left: string
  delay: string
  duration: string
  size: number
  sway: string
  rotate: string
  opacity: number
}

function generatePetals(count: number): PetalData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${((i / count) * 94 + Math.random() * 6) % 96}%`,
    delay: `${Math.random() * 2.2}s`,
    duration: `${2.8 + Math.random() * 3.4}s`,
    size: 0.55 + Math.random() * 0.7,
    sway: `${(Math.random() - 0.5) * 140}px`,
    rotate: `${360 + Math.random() * 540}deg`,
    opacity: 0.45 + Math.random() * 0.45,
  }))
}

function WelcomeScreen({ exiting }: { exiting: boolean }) {
  const [isMobile] = useState(() => window.innerWidth < 768)
  const petalCount = isMobile ? 14 : 20
  const petals = useMemo(() => generatePetals(petalCount), [petalCount])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        animation: exiting ? 'loaderExit 0.45s ease-in forwards' : 'inkBloom 0.8s ease-out forwards',
      }}
    >
      {/* —— 水墨背景层 —— */}
      <div className="absolute inset-0" style={{ background: 'var(--welcome-bg, #f7f3ee)' }} />
      {/* 墨韵光晕 */}
      <div
        className="absolute top-1/2 left-1/2 w-[140vmax] h-[140vmax] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(233,30,99,0.06) 0%, rgba(156,39,176,0.05) 25%, rgba(33,150,243,0.04) 50%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          animation: `mapBreathe ${isMobile ? 8 : 4}s ease-in-out infinite`,
        }}
      />

      {/* —— 和纸纹理 —— */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 50%, #000 1px, transparent 1px), radial-gradient(circle at 80% 30%, #000 1px, transparent 1px), radial-gradient(circle at 50% 80%, #000 0.5px, transparent 0.5px)',
          backgroundSize: '80px 80px, 100px 100px, 60px 60px',
          backgroundPosition: '0 0, 20px 30px, 10px 15px',
        }}
      />

      {/* —— 日本地图轮廓 —— */}
      <div
        className="absolute top-1/2 left-1/2 text-[min(48vw,56vh)] leading-none select-none pointer-events-none"
        style={{
          transform: 'translate(-50%, -50%)',
          opacity: 0.06,
          filter: 'blur(1px)',
          animation: `mapBreathe ${isMobile ? 10 : 5}s ease-in-out infinite`,
        }}
      >
        🗾
      </div>

      {/* —— 樱花花瓣 —— */}
      {petals.map((p) => (
        <span
          key={p.id}
          aria-hidden
          className="absolute top-0 pointer-events-none select-none gpu-layer"
          style={{
            left: p.left,
            fontSize: `${p.size}rem`,
            opacity: 0,
            animationName: 'sakuraFall',
            animationDuration: p.duration,
            animationDelay: p.delay,
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            '--petal-sway': p.sway,
            '--petal-rotate': p.rotate,
          } as React.CSSProperties}
        >
          🌸
        </span>
      ))}

      {/* —— 主内容区 —— */}
      <div
        className="relative z-10 flex flex-col items-center px-6 w-full max-w-[440px]"
        style={{
          animation: exiting ? 'loaderExit 0.4s ease-in forwards' : 'inkBloom 0.9s 0.2s ease-out both',
        }}
      >
        {/* 标题 — 毛笔字逐个浮现 */}
        <h1 className="flex flex-wrap justify-center gap-[0.03em] mb-3 text-[clamp(22px,5.5vw,42px)] font-bold leading-tight">
          {TITLE_CHARS.map((char, i) => (
            <span
              key={i}
              className="inline-block gpu-layer"
              style={{
                animation: `charReveal 0.55s ${0.15 + i * 0.06}s var(--ease-spring) both`,
                background: 'linear-gradient(135deg, #e91e63 0%, #9c27b0 40%, #2196f3 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: 'none',
                filter: 'drop-shadow(0 2px 4px rgba(233,30,99,0.15))',
              }}
            >
              {char}
            </span>
          ))}
        </h1>

        {/* 副标题 */}
        <p
          className="text-[13px] tracking-[0.15em] text-[#888] mb-7 font-medium gpu-layer"
          style={{
            animation: `charReveal 0.5s ${0.7}s var(--ease-spring) both`,
          }}
        >
          {SUBTITLE}
        </p>

        {/* —— 判子印章三连 —— */}
        <div
          className="flex mb-8 flex-wrap justify-center"
          style={{ gap: isMobile ? '0.5rem' : '1rem', animation: `charReveal 0.5s ${0.8}s var(--ease-spring) both` }}
        >
          {STAMPS.map((stamp, i) => (
            <div
              key={stamp.label}
              className="flex flex-col items-center gap-1"
              style={{
                animation: `stampIn 0.55s ${0.85 + i * 0.12}s var(--ease-spring) both`,
              }}
            >
              <div
                className="rounded-lg text-center select-none gpu-layer"
                style={{
                  backgroundColor: stamp.bg,
                  border: `2px solid ${stamp.border}`,
                  boxShadow: stamp.shadow,
                  minWidth: isMobile ? '72px' : '88px',
                  padding: isMobile ? '0.375rem 0.625rem' : '0.5rem 0.875rem',
                }}
              >
                <div
                  className="font-bold tracking-wider leading-tight"
                  style={{ color: stamp.color, fontSize: isMobile ? '10px' : '11px' }}
                >
                  {stamp.label}
                </div>
                <div
                  className="font-semibold tracking-[0.08em] opacity-60 leading-tight"
                  style={{ color: stamp.color, fontSize: isMobile ? '8px' : '9px' }}
                >
                  {stamp.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* —— 加载指示点 —— */}
        <div className="flex gap-2.5" style={{ animation: `charReveal 0.4s 1.1s var(--ease-spring) both` }}>
          {STAMPS.map((stamp, i) => (
            <div
              key={stamp.label}
              className="w-2.5 h-2.5 rounded-full gpu-layer"
              style={{
                backgroundColor: stamp.color,
                animation: `dotBounce 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: stamp.shadow,
              }}
            />
          ))}
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
  const [isMobile] = useState(() => window.innerWidth < 768)

  const loadingTime = isMobile ? 2200 : 2500
  const exitTime = isMobile ? 2800 : 3200

  useEffect(() => {
    document.documentElement.style.setProperty('--welcome-bg', '#f7f3ee')

    // 开始退出动画 → 完全过渡
    const show = setTimeout(() => setExiting(true), loadingTime)
    const hide = setTimeout(() => setLoading(false), exitTime)
    return () => {
      clearTimeout(show)
      clearTimeout(hide)
      document.documentElement.style.removeProperty('--welcome-bg')
    }
  }, [loadingTime, exitTime])

  return (
    <ErrorBoundary>
      {/* 地图在底层 — 欢迎页期间就开始加载 */}
      <AppShell locations={mockLocations} />

      {/* 欢迎页覆盖在上方 — 动画结束后移除 */}
      {loading && <WelcomeScreen exiting={exiting} />}
    </ErrorBoundary>
  )
}
