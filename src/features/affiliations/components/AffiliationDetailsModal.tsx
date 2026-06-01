import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, UserCircle, Briefcase, FileText, DollarSign, Ban } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { useToast } from '../../../components/Toast';

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin registrar';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registrar';

  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const AffiliationDetailsModal = ({ isOpen, onClose, data }: Props) => {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Overlay oscuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Detalle de Afiliación</h2>
                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold rounded-full">
                      #{data.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                      Inicio: {formatDate(data.start_date)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700">
                      Fin: {data.end_date ? formatDate(data.end_date) : 'Activa'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar space-y-8 min-h-0">

              {/* Info Cliente y Empresa */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <UserCircle size={14} /> Cliente Afiliado
                  </h3>
                  <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <p className="font-bold text-slate-800 dark:text-zinc-200">{data.client_name}</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">CC: {data.client_identification}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Building2 size={14} /> Empresa (Contratante)
                  </h3>
                  <div className="bg-slate-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800">
                    <p className="font-bold text-slate-800 dark:text-zinc-200">{data.company_name}</p>
                  </div>
                </div>
              </div>

              {/* Módulos de Entidades */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase size={14} /> Entidades de Seguridad Social
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.eps_name !== '—' && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-emerald-100 dark:border-emerald-900/30 rounded-xl shadow-sm">
                      <div className="w-2 h-8 bg-emerald-400 rounded-full"></div>
                      <div>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Salud (EPS)</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{data.eps_name}</p>
                      </div>
                    </div>
                  )}
                  {data.pension_name !== '—' && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-violet-100 dark:border-violet-900/30 rounded-xl shadow-sm">
                      <div className="w-2 h-8 bg-violet-400 rounded-full"></div>
                      <div>
                        <p className="text-[10px] font-bold text-violet-600 uppercase">Pensión</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{data.pension_name}</p>
                      </div>
                    </div>
                  )}
                  {data.arl_name !== '—' && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-amber-100 dark:border-amber-900/30 rounded-xl shadow-sm">
                      <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
                      <div>
                        <p className="text-[10px] font-bold text-amber-600 uppercase">Riesgos (ARL) - Nivel {data.risk_level}</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{data.arl_name}</p>
                      </div>
                    </div>
                  )}
                  {data.ccf_name !== '—' && (
                    <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 border border-blue-100 dark:border-blue-900/30 rounded-xl shadow-sm">
                      <div className="w-2 h-8 bg-blue-400 rounded-full"></div>
                      <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase">Caja Comp. (CCF)</p>
                        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{data.ccf_name}</p>
                      </div>
                    </div>
                  )}
                  {data.eps_name === '—' && data.pension_name === '—' && data.arl_name === '—' && data.ccf_name === '—' && (
                    <div className="col-span-1 sm:col-span-2 p-6 text-center text-slate-400 dark:text-zinc-600 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                      No hay módulos registrados
                    </div>
                  )}
                </div>
              </div>

              {/* Cobro y Estado */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <DollarSign size={14} /> Información de Pago
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/30 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase mb-1">Valor Total Cobrado</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">
                        ${Number(data.value).toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 bg-slate-50 dark:bg-zinc-900/50 p-5 rounded-2xl border border-slate-100 dark:border-zinc-800 flex flex-col justify-center gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Trámite (Gobierno)</span>
                      <StatusBadge status={data.payment_status} />
                    </div>
                    
<div className="flex justify-between items-center gap-4">
                      <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Pago ante gobierno</span>
                      <span className="text-right text-sm font-bold text-emerald-700 dark:text-emerald-300">{formatDate(data.gov_record_at)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Recibido en plataforma</span>
                      <span className="text-right text-sm font-bold text-slate-700 dark:text-zinc-200">{formatDate(data.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
