import { useEffect, useRef } from 'react'
import { useUIStore } from '@/store/useUIStore'

export function useTheme() {
  const { theme, toggleTheme, setTheme } = useUIStore()
  const initialized = useRef(false)

  // 初始化时从 store 同步到 DOM
  useEffect(() => {
    if (!initialized.current) {
      document.documentElement.dataset.theme = theme
      initialized.current = true
    }
  }, [theme])

  return { theme, toggleTheme, setTheme, isDark: theme === 'dark' }
}
