import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/**
 * Toast Bridge: permite que Axios (fuera del árbol React) dispare notificaciones.
 * App.tsx registra la función showToast al montar el ToastProvider.
 */
type ToastFn = (message: string, type?: 'error' | 'success' | 'info') => void;
type LogoutFn = () => void;

let _showToast: ToastFn | null = null;
let _logout: LogoutFn | null = null;

export const registerToastBridge = (showToast: ToastFn, logout: LogoutFn) => {
  _showToast = showToast;
  _logout = logout;
};

// ── Interceptor de Request: inyectar token ─────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Interceptor de Response: manejo global de errores HTTP ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.error;

    if (status === 401) {
      _showToast?.('Tu sesión ha expirado. Por favor inicia sesión de nuevo.', 'error');
      _logout?.();
    } else if (status === 403) {
      _showToast?.(serverMessage || 'No tienes permisos para realizar esta acción.', 'error');
    } else if (status === 404) {
      _showToast?.(serverMessage || 'El recurso solicitado no fue encontrado.', 'error');
    } else if (status >= 500) {
      _showToast?.(serverMessage || 'Error interno del servidor. Intenta de nuevo más tarde.', 'error');
    } else if (!error.response) {
      // Error de red (sin conexión, servidor caído)
      _showToast?.('Sin conexión con el servidor. Verifica tu red.', 'error');
    }

    return Promise.reject(error);
  }
);

export default api;
