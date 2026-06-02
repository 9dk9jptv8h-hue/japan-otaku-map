import { cn } from '@/utils/cn'

interface BadgeProps {
  label: string
  color?: string
  active?: boolean
  onClick?: () => void
  className?: string
}

export function Badge({ label, color, active = false, onClick, className }: BadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 ease-out',
        'hover:scale-105 active:scale-95',
        active
          ? 'text-white shadow-md'
          : 'bg-[var(--color-sumi)]/5 text-[var(--color-sumi)]/60 hover:bg-[var(--color-sumi)]/10',
        className
      )}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {active && (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
      {label}
    </button>
  )
}
