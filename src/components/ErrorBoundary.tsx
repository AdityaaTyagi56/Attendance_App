import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-on-surface dark:text-on-surface-dark p-8">
          <div className="max-w-md w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-on-surface-variant dark:text-on-surface-dark-variant mb-6">
              The application encountered an error. Please refresh the page or try again later.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-brand text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
              >
                Refresh Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-white/10 text-on-surface dark:text-on-surface-dark font-semibold py-3 px-6 rounded-xl hover:bg-surface/90 dark:hover:bg-surface-dark/90 transition-all"
              >
                Try Again
              </button>
            </div>
            {this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-on-surface-variant dark:text-on-surface-dark-variant text-sm">
                  Error Details
                </summary>
                <pre className="mt-2 p-4 bg-surface dark:bg-surface-dark rounded-lg text-xs overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;