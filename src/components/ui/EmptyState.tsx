import { Search } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 text-[var(--color-sumi)]/20">
        {icon ?? <Search className="h-12 w-12" />}
      </div>
      <h3 className="text-sm font-medium text-[var(--color-sumi)]/60 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--color-sumi)]/40 max-w-[240px]">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
