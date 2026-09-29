import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AgencyPaymentLockPage } from './pages/AgencyPaymentLockPage';
import { AffiliateLoginPage } from './pages/AffiliateLoginPage';
import { AffiliatePortalPage } from './pages/AffiliatePortalPage';
import { AffiliateAffiliationDetailPage } from './pages/AffiliateAffiliationDetailPage';
import { useAuthStore } from './store/useAuthStore';
import { useAffiliateAuthStore } from './store/useAffiliateAuthStore';
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
  const user = useAuthStore(state => state.user);
  const affiliateToken = useAffiliateAuthStore(state => state.token);
  const isAdmin = user?.role === 'admin';

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
            path="/portal/login"
            element={!affiliateToken ? <AffiliateLoginPage /> : <Navigate to="/portal" />}
          />
          <Route
            path="/portal"
            element={affiliateToken ? <AffiliatePortalPage /> : <Navigate to="/portal/login" />}
          />
          <Route
            path="/portal/afiliacion/:affiliationId/:year/:month"
            element={affiliateToken ? <AffiliateAffiliationDetailPage /> : <Navigate to="/portal/login" />}
          />
          <Route
            path="/control-acceso/gestor-cobro-9xv3k2"
            element={<AgencyPaymentLockPage />}
          />
          <Route 
            path="/" 
            element={token ? <DashboardPage /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/affiliations" 
            element={token ? <DashboardPage tab="affiliations" /> : <Navigate to="/login" />} 
          />
          <Route
            path="/affiliate-accounts"
            element={token ? <DashboardPage tab="affiliate-accounts" /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin/companies/new"
            element={token && isAdmin ? <DashboardPage tab="admin-companies" /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/offices/new"
            element={token && isAdmin ? <DashboardPage tab="admin-offices" /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;

