import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-rose-50 border-2 border-rose-300 rounded-3xl p-6 text-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <AlertTriangle className="w-8 h-8 shrink-0 animate-bounce" />
              <div>
                <h2 className="text-lg font-black">UI Rendering Diagnostic Caught</h2>
                <p className="text-xs text-rose-600">A component encountered a rendering exception.</p>
              </div>
            </div>
            
            <div className="bg-slate-900 text-rose-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-48">
              <strong>{this.state.error?.toString()}</strong>
              {this.state.errorInfo?.componentStack && (
                <pre className="mt-2 text-[10px] text-slate-400 whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null, errorInfo: null });
                window.location.reload();
              }}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
