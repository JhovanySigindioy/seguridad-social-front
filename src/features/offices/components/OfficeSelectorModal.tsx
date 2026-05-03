import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useOffices } from '../hooks/useOffices';

export const OfficeSelectorModal = () => {
  const { user, offices: userOfficeIds, activeOfficeId, setActiveOffice } = useAuthStore();
  const { offices, loading } = useOffices();

  // Lógica: Solo mostrar si NO es admin, tiene más de una oficina y no ha seleccionado ninguna.
  const isAdmin = user?.role === 'admin';
  const showModal = !isAdmin && userOfficeIds.length > 1 && !activeOfficeId;

  if (!showModal) return null;

  // Filtrar solo las oficinas que el usuario tiene permitidas
  const allowedOffices = offices.filter(o => userOfficeIds.includes(o.id));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800"
        >
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                <Building2 className="text-indigo-600 dark:text-indigo-400 h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Selecciona tu Sede</h2>
                <p className="text-slate-500 dark:text-zinc-400">¿En qué oficina trabajarás hoy?</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
                  <p className="text-slate-500">Cargando sedes autorizadas...</p>
                </div>
              ) : (
                allowedOffices.map((office) => (
                  <motion.button
                    key={office.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveOffice(office.id)}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-slate-100 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500/50 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                        <MapPin size={20} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <div className="text-left">
                        <span className="block font-bold text-slate-800 dark:text-zinc-200">{office.name}</span>
                        <span className="text-xs text-slate-500 dark:text-zinc-500">{office.address}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </motion.button>
                ))
              )}
            </div>
          </div>
          
          <div className="p-6 bg-slate-50/50 dark:bg-zinc-800/20 border-t border-slate-100 dark:border-zinc-800 text-center">
            <p className="text-xs text-slate-400">
              Si no ves tu sede, contacta al administrador de tu agencia.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
