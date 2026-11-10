import { Component } from 'react';

/**
 * ErrorBoundary — catches unhandled render errors and shows a readable
 * fallback instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
          <div className="w-full max-w-md rounded-xl border border-expense-light bg-white p-8 shadow-card text-center">
            <div className="mb-4 text-4xl">⚠️</div>
            <h1 className="text-lg font-semibold text-neutral-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => window.location.replace('/')}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
