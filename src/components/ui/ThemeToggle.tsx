import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/utils/cn'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { toggleTheme, isDark } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full',
        'glass shadow-soft hover:scale-110 active:scale-95',
        'transition-all duration-300 ease-out',
        className
      )}
      aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-[var(--color-gold)]" />
      ) : (
        <Moon className="h-5 w-5 text-[var(--color-indigo)]" />
      )}
    </button>
  )
}
