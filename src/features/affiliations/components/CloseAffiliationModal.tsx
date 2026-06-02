import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { useCloseAffiliation } from '../hooks/useAffiliations';
import { useToast } from '../../../components/Toast';
import type { AffiliationItem } from '../types/affiliation.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  affiliation: AffiliationItem | null;
}

export const CloseAffiliationModal = ({ isOpen, onClose, affiliation }: Props) => {
  const { mutateAsync: closeAffiliation, isPending } = useCloseAffiliation();
  const { showToast } = useToast();
  
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState<'Voluntario' | 'FinContrato' | 'Licencia' | 'Otro'>('Voluntario');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (isOpen && affiliation?.start_date) {
      try {
        const d = new Date(affiliation.start_date);
        const y = d.getFullYear();
        const m = d.getMonth() + 1; // 1-based
        // Get last day of that month
        const endD = new Date(y, m, 0);
        const endStr = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;
        setEndDate(endStr);
      } catch {
        setEndDate(new Date().toISOString().split('T')[0]);
      }
      setReason('Voluntario');
      setObservations('');
    }
  }, [isOpen, affiliation]);

  const handleSubmit = async () => {
    if (!affiliation) return;
    if (!endDate) return showToast('Selecciona la fecha de finalización');
    
    try {
      await closeAffiliation({
        id: affiliation.id,
        end_date: endDate,
        withdrawal_reason: reason,
        withdrawal_observations: observations.trim() || undefined,
      });
      showToast('Afiliación retirada correctamente', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Error al retirar la afiliación');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && affiliation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-orange-50 dark:bg-orange-900/20 px-6 py-5 border-b border-orange-100 dark:border-orange-900/30 flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl">
                <Trash2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Retirar Afiliación</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">Al retirar esta afiliación, pasará a estado Retirada.</p>
              </div>
              <button onClick={onClose} className="p-1 text-slate-400 hover:bg-white/50 dark:hover:bg-zinc-800/50 rounded-lg">
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 overflow-y-auto max-h-[60vh]">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{affiliation.client_name}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400">CC: {affiliation.client_identification}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Empresa: <span className="font-medium text-slate-700 dark:text-zinc-300">{affiliation.company_name}</span></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Fecha de Retiro
                </label>
                <div className="w-full p-2.5 text-sm bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-500 dark:text-zinc-400 cursor-not-allowed">
                  {endDate} (Fin de mes)
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Motivo de Retiro *
                </label>
                <select
                  value={reason}
                  onChange={(e: any) => setReason(e.target.value)}
                  className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-zinc-200"
                >
                  <option value="Voluntario">Retiro Voluntario</option>
                  <option value="FinContrato">Fin de Contrato</option>
                  <option value="Licencia">Licencia No Remunerada</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Observaciones <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  value={observations}
                  onChange={e => setObservations(e.target.value)}
                  placeholder="Detalles adicionales sobre el retiro..."
                  className="w-full p-3 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:border-orange-500 text-slate-800 dark:text-zinc-200 resize-none h-24"
                />
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200/50 dark:border-blue-900/30 rounded-lg">
                <AlertTriangle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-400/90 leading-relaxed">
                  Al retirarla, se registrará la fecha de retiro a fin de mes y el estado cambiará a Retirada.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-3">
              <button
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 min-w-[140px]"
              >
                {isPending ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  'Retirar'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
