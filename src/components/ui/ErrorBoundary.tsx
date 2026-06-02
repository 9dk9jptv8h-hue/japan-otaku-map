import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-washi)]">
            <div className="text-center p-8">
              <h2 className="text-lg font-medium text-[var(--color-sumi)] mb-2">
                出了点问题
              </h2>
              <p className="text-sm text-[var(--color-sumi)]/50 mb-4">
                {this.state.error?.message ?? '未知错误'}
              </p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="rounded-xl bg-[var(--color-indigo)] px-4 py-2 text-sm text-white hover:bg-[var(--color-indigo)]/85 transition-all"
              >
                重试
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
