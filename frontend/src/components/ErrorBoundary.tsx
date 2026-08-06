import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Nimma Seva:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-red-800/50 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-950/80 border border-red-800 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Something went wrong</h2>
              <p className="text-xs text-slate-400">
                The application encountered an unexpected runtime error.
              </p>
              {this.state.error && (
                <div className="bg-slate-900 rounded-xl p-3 text-left font-mono text-[11px] text-red-300 border border-slate-800 overflow-x-auto max-h-32">
                  {this.state.error.toString()}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Reload App
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <Home className="w-4 h-4" />
                Reset & Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
