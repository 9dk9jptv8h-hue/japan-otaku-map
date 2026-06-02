import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-300 ease-out cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-sakura)] focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' && 'bg-[var(--color-indigo)] text-white hover:bg-[var(--color-indigo)]/85 active:scale-95',
        variant === 'secondary' && 'bg-[var(--color-indigo-light)] text-[var(--color-indigo)] hover:bg-[var(--color-indigo-light)]/70 active:scale-95',
        variant === 'ghost' && 'text-[var(--color-sumi)] hover:bg-black/5 active:scale-95',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
