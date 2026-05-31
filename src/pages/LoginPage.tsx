import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import api from '../services/api/axios-instance';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import type { LoginResponse } from '../types/auth.types';

const loginRequest = (credentials: { email: string; password: string }) =>
  api.post<{ success: boolean; data: LoginResponse }>('/auth/login', credentials)
    .then((res) => res.data.data);

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Solo para errores de credenciales (400) — UI local de este formulario
  const [formError, setFormError] = useState<string | null>(null);

  const setAuth = useAuthStore(state => state.setAuth);
  const { theme, toggleTheme } = useThemeStore();

  // Aplicar clase dark al inicio si es necesario
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const { mutate: login, isPending } = useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ token, user, offices }) => {
      setAuth(token, user, offices);
    },
    onError: (error: any) => {
      // Los errores globales (401, 403, 500, red) ya los maneja el interceptor de Axios.
      // Aquí solo capturamos el 400: credenciales incorrectas (error de UX local).
      const status = error?.response?.status;
      if (status === 400 || status === 401) {
        setFormError(error?.response?.data?.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    login({ email, password });
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* Imagen de Presentación (Arriba en móvil, Izquierda en escritorio) */}
      <div 
        className="flex w-full h-[35vh] md:h-auto md:w-1/2 lg:w-3/5 bg-[#013575] relative overflow-hidden items-center justify-center shrink-0"
        style={{
          backgroundImage: "url('/img/LoginPresntacion.webp')",
          backgroundSize: "cover",
          backgroundPosition: "left center",
          backgroundRepeat: "no-repeat"
        }}
      >
        {/* Decoración extra opcional sobre la imagen */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 md:from-transparent to-[#012555]/10 pointer-events-none" />
      </div>

      {/* Formulario (Superpuesto abajo en móvil, Derecha en escritorio) */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative bg-white dark:bg-zinc-950 rounded-t-[40px] md:rounded-none -mt-10 md:mt-0 z-10 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] md:shadow-none">
        
        {/* Toggle Tema */}
        <button 
          onClick={toggleTheme}
          className="absolute top-6 right-6 p-3 rounded-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:shadow-md transition-all"
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
              {formError && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-3 rounded-lg"
                >
                  <p className="text-red-600 dark:text-red-400 text-sm font-medium text-center">{formError}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : (
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
