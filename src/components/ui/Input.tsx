import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  onClear?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, onClear, className, value, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-sumi)]/40">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          value={value}
          className={cn(
            'w-full rounded-xl border border-[var(--color-sumi)]/10 bg-white/60 px-4 py-2.5 text-sm',
            'placeholder:text-[var(--color-sumi)]/30',
            'focus:outline-none focus:ring-2 focus:ring-[var(--color-sakura)]/50 focus:border-transparent',
            'transition-all duration-300 ease-out',
            icon ? 'pl-10' : undefined,
            className
          )}
          {...props}
        />
        {value != null && value !== '' && onClear && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-sumi)]/30 hover:text-[var(--color-sumi)]/60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
