import { Component, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorKey: number
  retryCount: number
}

const MAX_RETRIES = 3

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorKey: 0, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Integrate production error reporting here (e.g., Sentry, Cloudflare Analytics)
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    const nextCount = this.state.retryCount + 1
    if (nextCount > MAX_RETRIES) return
    this.setState({
      hasError: false,
      errorKey: this.state.errorKey + 1,
      retryCount: nextCount,
    })
  }

  render() {
    if (this.state.hasError) {
      const exhausted = this.state.retryCount >= MAX_RETRIES

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
              {exhausted ? (
                <p className="text-xs text-[var(--color-sumi)]/30">
                  已重试 {MAX_RETRIES} 次，请刷新页面
                </p>
              ) : (
                <button
                  onClick={this.handleRetry}
                  className="rounded-xl bg-[var(--color-indigo)] px-4 py-2 text-sm text-white hover:bg-[var(--color-indigo)]/85 transition-all"
                >
                  重试
                </button>
              )}
            </div>
          </div>
        )
      )
    }

    return <span key={this.state.errorKey}>{this.props.children}</span>
  }
}
