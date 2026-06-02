import { useEffect } from 'react'
import { mockLocations } from '@/constants/mockData'
import { useUIStore } from '@/store/useUIStore'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AppShell } from '@/components/layout/AppShell'

export default function App() {
  const theme = useUIStore((s) => s.theme)

  // 初始化主题
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <ErrorBoundary>
      <AppShell locations={mockLocations} />
      <ThemeToggle />
    </ErrorBoundary>
  )
}
