import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuthStore } from './store/useAuthStore';
import { ToastProvider, useToast } from './components/Toast';
import { registerToastBridge } from './services/api/axios-instance';

/**
 * AppBridge: componente interno que tiene acceso al contexto de Toast
 * y registra el bridge para que el interceptor de Axios pueda usarlo.
 */
const AppBridge = () => {
  const { showToast } = useToast();
  const logout = useAuthStore(state => state.logout);

  useEffect(() => {
    registerToastBridge(showToast, logout);
  }, [showToast, logout]);

  return null;
};

function App() {
  const token = useAuthStore(state => state.token);

  return (
    <ToastProvider>
      <AppBridge />
      <BrowserRouter>
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <LoginPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/" 
            element={token ? <DashboardPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/affiliations" 
            element={token ? <DashboardPage tab="affiliations" /> : <Navigate to="/login" />} 
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

