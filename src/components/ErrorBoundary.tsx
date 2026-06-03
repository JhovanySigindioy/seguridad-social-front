import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application render error', error, errorInfo);
  }

  private clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('offices');
    localStorage.removeItem('activeOfficeId');
    window.location.href = '/login';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-zinc-950 dark:text-white">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-xl font-bold">No se pudo cargar la aplicación</h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400">
            Puede haber datos de sesión antiguos o corruptos guardados en el navegador.
          </p>
          <button
            onClick={this.clearSession}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700"
          >
            Limpiar sesión e iniciar de nuevo
          </button>
        </div>
      </div>
    );
  }
}
