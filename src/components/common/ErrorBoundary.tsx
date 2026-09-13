import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Minimall ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans selection:bg-red-500 selection:text-white">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-2xl text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center text-3xl text-red-600 shadow-inner">
              ⚡
            </div>

            <div className="space-y-2">
              <h1
                className="text-2xl font-black text-gray-900 tracking-wide"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                ЧТО-ТО ПОШЛО НЕ ТАК
              </h1>
              <p className="text-sm text-gray-500">
                Произошла непредвиденная ошибка при загрузке страницы. Приложение защищено от падения.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-red-600/20 cursor-pointer"
              >
                Обновить страницу
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                На главную
              </button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 text-[11px] font-mono text-left rounded-xl overflow-auto max-h-32 border border-red-200">
                {this.state.error.toString()}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
