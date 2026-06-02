import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[var(--color-sumi)]/10 rounded-md',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'circular' && 'h-10 w-10 rounded-full',
        variant === 'rectangular' && 'h-24 w-full rounded-xl',
        className
      )}
    />
  )
}

export function CardSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <Skeleton variant="rectangular" className="h-20 w-20 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}
