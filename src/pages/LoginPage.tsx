import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon, ShieldCheck } from 'lucide-react';
import api from '../services/api/axios-instance';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const setAuth = useAuthStore(state => state.setAuth);
  const { theme, toggleTheme } = useThemeStore();

  // Aplicar clase dark al inicio si es necesario
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user, offices } = response.data.data;
      setAuth(token, user, offices);
    } catch (err: any) {
      console.error('Login Error Details:', err);
      const serverMessage = err.response?.data?.error;
      const status = err.response?.status;
      setError(serverMessage || `Error de conexión (${status || 'Network Error'})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Columna Izquierda: Branding (Solo escritorio) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-indigo-600 dark:bg-indigo-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400 blur-3xl" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-white max-w-lg"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">VibeSocial</h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6">
            La plataforma inteligente de <span className="text-indigo-200">Seguridad Social</span>
          </h2>
          <p className="text-indigo-100 text-xl leading-relaxed opacity-90">
            Gestiona aportes, afiliaciones y reportes con una arquitectura indestructible y una experiencia fluida.
          </p>
        </motion.div>

        {/* Decoración Abstracta Extra */}
        <div className="absolute bottom-12 left-12 flex gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-1.5 w-12 rounded-full bg-white/20" />
          ))}
        </div>
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        
        {/* Toggle Tema */}
        <button 
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:shadow-md transition-all"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-[400px]"
        >
          <div className="mb-10">
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Bienvenido de nuevo</h3>
            <p className="text-slate-500 dark:text-zinc-400 mt-2">Ingresa tus credenciales para acceder</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  className="w-full h-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-12 pr-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Contraseña</label>
                <a href="#" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-12 pr-12 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-lg"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium text-center">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <>
                  <span>Iniciar Sesión</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <p className="text-sm text-slate-500 dark:text-zinc-500">
              ¿No tienes cuenta? <a href="#" className="font-bold text-indigo-600 hover:underline">Contactar a soporte</a>
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};
