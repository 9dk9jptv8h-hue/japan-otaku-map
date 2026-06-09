import { useEffect, useState } from 'react'
import { mockLocations } from '@/constants/mockData'
import { useUIStore } from '@/store/useUIStore'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { AppShell } from '@/components/layout/AppShell'

function SkeletonLoader({ exiting }: { exiting: boolean }) {
  return (
    <div
      className="flex h-screen w-screen items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #fce4ec, #e3f2fd, #e0f7fa, #f3e5f5)',
        backgroundSize: '400% 400%',
        animation: exiting ? 'loaderExit 0.5s ease-in forwards' : 'bgShift 8s ease infinite',
      }}
    >
      <div className="flex flex-col items-center w-full max-w-[380px] px-6">
        {/* Logo */}
        <div
          className="text-[56px] mb-5"
          style={{ animation: exiting ? 'none' : 'pulse 1.5s ease-in-out infinite' }}
        >
          🗾
        </div>

        {/* 标题 */}
        <h1
          className="text-2xl font-bold mb-2 text-center"
          style={{
            background: 'linear-gradient(135deg, #e91e63, #9c27b0, #2196f3)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          日本オタクショップマップ
        </h1>
        <p className="text-[13px] text-[#999] mb-8 tracking-wide">
          Animate · Melonbooks · Mandarake — 全国店舗一覧
        </p>

        {/* 骨架卡片预览 — 模拟侧边栏卡片 */}
        <div className="w-full space-y-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl skeleton-shimmer"
              style={{
                animationDelay: `${i * 0.1}s`,
                opacity: exiting ? 0 : undefined,
                transition: 'opacity 0.3s',
              }}
            >
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                <div className="h-3 w-full rounded-md skeleton-shimmer" />
                <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
                <div className="flex gap-1.5 mt-1">
                  <div className="h-4 w-12 rounded-full skeleton-shimmer" />
                  <div className="h-4 w-10 rounded-full skeleton-shimmer" />
                  <div className="h-4 w-14 rounded-full skeleton-shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 底部加载点 */}
        <div className="flex gap-2">
          {['#e91e63', '#4caf50', '#ff9800'].map((c, i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: c,
                animation: `pulse 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.25}s`,
                opacity: exiting ? 0 : undefined,
                transition: 'opacity 0.3s',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const theme = useUIStore((s) => s.theme)
  const [loading, setLoading] = useState(true)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    // 模拟加载 — 1.2s 开始退出，1.8s 完全加载
    const show = setTimeout(() => setExiting(true), 1000)
    const hide = setTimeout(() => setLoading(false), 1600)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [theme])

  if (loading) {
    return <SkeletonLoader exiting={exiting} />
  }

  return (
    <ErrorBoundary>
      <AppShell locations={mockLocations} />
    </ErrorBoundary>
  )
}
