import { type InputHTMLAttributes, forwardRef, useRef, useImperativeHandle } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  onClear?: () => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, onClear, className, value, ...props }, ref) => {
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement)

    return (
      <div className="relative w-full">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-sumi)]/40">
            {icon}
          </span>
        )}
        <input
          ref={innerRef}
          value={value}
          className={cn(
            'w-full rounded-xl border border-[var(--color-border)] bg-white/80 px-4 py-2.5 text-sm shadow-soft',
            'placeholder:text-[var(--color-sumi)]/35',
            'focus:border-[var(--color-accent)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20',
            'transition-[border-color,box-shadow,background-color] duration-300 ease-out',
            icon ? 'pl-10' : undefined,
            className
          )}
          {...props}
        />
        {value != null && value !== '' && onClear && (
          <button
            type="button"
            onClick={() => {
              onClear()
              setTimeout(() => innerRef.current?.focus(), 0)
            }}
            aria-label="清除输入"
            className="absolute right-2.5 top-1/2 flex h-6 min-h-6 w-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-sumi)]/35 transition-[color,background-color] hover:bg-[var(--color-sumi)]/8 hover:text-[var(--color-sumi)]/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
