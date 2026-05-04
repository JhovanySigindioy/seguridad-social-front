import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { useAuthStore } from './store/useAuthStore';
import { ToastProvider } from './components/Toast';

function App() {
  const token = useAuthStore(state => state.token);

  return (
    <ToastProvider>
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
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
