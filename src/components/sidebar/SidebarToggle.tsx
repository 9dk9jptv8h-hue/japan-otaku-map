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
        'flex h-9 w-9 items-center justify-center',
        'rounded-full border border-white/20',
        'transition-all duration-300 ease-out',
        'hover:scale-110 active:scale-95',
        'shadow-lg backdrop-blur-md',
        collapsed
          // z-50: sits above the sidebar panel and map content when collapsed
          ? 'fixed top-4 left-3 z-50 header-gradient text-white'
          : 'glass text-[var(--color-text-dim)] hover:text-[var(--color-text)]',
        className
      )}
      aria-label={collapsed ? '展开侧栏' : '收起侧栏'}
    >
      {collapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <ChevronLeft className="h-4 w-4" />
      )}
    </button>
  )
}
