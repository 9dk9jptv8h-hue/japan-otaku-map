import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorKey: number
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorKey: 0 }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorKey: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
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
                onClick={() => this.setState({ hasError: false, errorKey: this.state.errorKey + 1 })}
                className="rounded-xl bg-[var(--color-indigo)] px-4 py-2 text-sm text-white hover:bg-[var(--color-indigo)]/85 transition-all"
              >
                重试
              </button>
            </div>
          </div>
        )
      )
    }

    return <span key={this.state.errorKey}>{this.props.children}</span>
  }
}
