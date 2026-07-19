import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Frontend render error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F3F0] px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h1 className="text-lg font-bold text-gray-900 mt-4">Something went wrong</h1>
          <p className="text-sm text-gray-500 mt-2">
            The page hit an unexpected UI error. Refreshing usually gets you back on track.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#014BAA] text-white text-sm font-semibold hover:bg-[#013b86] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh page
          </button>
        </div>
      </div>
    );
  }
}
