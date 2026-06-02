import { cn } from '@/utils/cn'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarToggleProps {
  collapsed: boolean
  onClick: () => void
  className?: string
}

export function SidebarToggle({ collapsed, onClick, className }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        collapsed
          ? 'fixed top-4 left-3 z-[9999] header-gradient text-white shadow-lg'
          : 'absolute top-4 z-20 glass',
        'flex h-8 w-8 items-center justify-center',
        'rounded-full shadow-soft border border-white/20',
        'hover:scale-110 active:scale-95 transition-all duration-300 ease-out',
        !collapsed && '-right-3',
        className
      )}
      aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4 text-[var(--color-sumi)]/60" />
      ) : (
        <ChevronLeft className="h-4 w-4 text-[var(--color-sumi)]/60" />
      )}
    </button>
  )
}
