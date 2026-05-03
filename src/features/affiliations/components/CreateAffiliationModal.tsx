import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Save, AlertCircle, Building, Heart, Shield, Landmark, CheckCircle2 } from 'lucide-react';
import { useAffiliationFormData, useCreateAffiliation } from '../hooks/useAffiliations';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAffiliationModal = ({ isOpen, onClose }: Props) => {
  const { data: cat, isLoading } = useAffiliationFormData();
  const { mutateAsync: create, isPending } = useCreateAffiliation();

  const [error, setError] = useState('');

  // ─── Lado Izquierdo (Selección) ─────────────────────────
  const [clientEmployerId, setClientEmployerId] = useState('');
  const [hasEps, setHasEps] = useState(false);
  const [hasArl, setHasArl] = useState(false);
  const [hasCcf, setHasCcf] = useState(false);
  const [hasPension, setHasPension] = useState(false);

  // ─── Lado Derecho (Detalles) ────────────────────────────
  const [epsId, setEpsId] = useState('');
  const [arlId, setArlId] = useState('');
  const [ccfId, setCcfId] = useState('');
  const [pensionId, setPensionId] = useState('');
  const [riskLevel, setRiskLevel] = useState('1');

  const [value, setValue] = useState('');
  const [status, setStatus] = useState('Pendiente');
  const [method, setMethod] = useState('');

  // ─── Lógica ─────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');

    if (!clientEmployerId) return setError('Selecciona un cliente y empresa.');
    if (hasEps && !epsId) return setError('Selecciona la Entidad EPS.');
    if (hasArl && !arlId) return setError('Selecciona la Aseguradora ARL.');
    if (hasCcf && !ccfId) return setError('Selecciona la Caja de Compensación.');
    if (hasPension && !pensionId) return setError('Selecciona el Fondo de Pensión.');
    if (!value || isNaN(Number(value))) return setError('Ingresa un valor de cobro válido.');

    try {
      await create({
        client_employer_id: Number(clientEmployerId),
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        value: Number(value),
        payment_status: status,
        payment_method: method || undefined,
        eps_id: hasEps ? Number(epsId) : null,
        arl_id: hasArl ? Number(arlId) : null,
        ccf_id: hasCcf ? Number(ccfId) : null,
        pension_id: hasPension ? Number(pensionId) : null,
        risk_level: hasArl ? riskLevel : null,
        is_auto_renewed: true,
      });

      // Reset
      setClientEmployerId('');
      setValue('');
      setHasEps(false); setHasArl(false); setHasCcf(false); setHasPension(false);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la afiliación');
    }
  };

  // ─── Componente Toggle ──────────────────────────────────────────────
  const ServiceCard = ({ active, onChange, icon: Icon, label, color }: any) => (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all ${active
          ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20 shadow-md shadow-${color}-500/10 scale-[1.02]`
          : 'border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-slate-200 dark:hover:border-zinc-700 hover:scale-[1.02]'
        }`}
    >
      <div className={`p-3 rounded-full mb-3 ${active ? `bg-${color}-500 text-white` : 'bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500'}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <span className={`font-bold text-sm ${active ? `text-${color}-700 dark:text-${color}-400` : 'text-slate-600 dark:text-zinc-400'}`}>{label}</span>
      {active && (
        <div className={`absolute top-2 right-2 text-${color}-500`}>
          <CheckCircle2 size={18} />
        </div>
      )}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"
          />

          {/* Modal Content - Pantalla Dividida */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-5xl h-full max-h-[90vh] bg-slate-50 dark:bg-zinc-950 rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden border border-slate-200 dark:border-zinc-800 my-auto"
          >
            {/* Header Flotante Mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
              <h2 className="font-extrabold text-slate-900 dark:text-white">Nueva Afiliación</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400"><X size={20} /></button>
            </div>

            {/* ─── LADO IZQUIERDO: CONFIGURACIÓN PRINCIPAL ─── */}
            <div className="w-full lg:w-5/12 h-full min-h-0 overflow-y-auto bg-white dark:bg-zinc-900 p-6 sm:p-8 flex flex-col border-r border-slate-200 dark:border-zinc-800 custom-scrollbar">
              <div className="hidden lg:flex flex-shrink-0 items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Nueva Afiliación</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Configura el perfil del afiliado.</p>
                </div>
              </div>

              {isLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-8 flex-1">
                  {/* Selector de Cliente */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full" /> 1. Cliente y Empresa
                    </h3>
                    <select
                      value={clientEmployerId}
                      onChange={e => { setClientEmployerId(e.target.value); setError(''); }}
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-800/50 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 outline-none transition-colors text-slate-800 dark:text-zinc-200 font-medium"
                    >
                      <option value="" disabled>Selecciona un cliente...</option>
                      {cat?.clientEmployers?.map((ce: any) => (
                        <option key={ce.client_employer_id} value={ce.client_employer_id}>
                          {ce.client_name} • {ce.company_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selector de Módulos */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 mb-3 uppercase tracking-wider flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-indigo-500 rounded-full" /> 2. Módulos a Cotizar
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <ServiceCard active={hasEps} onChange={setHasEps} icon={Heart} label="Salud (EPS)" color="emerald" />
                      <ServiceCard active={hasPension} onChange={setHasPension} icon={Landmark} label="Pensión" color="violet" />
                      <ServiceCard active={hasArl} onChange={setHasArl} icon={Shield} label="Riesgos (ARL)" color="amber" />
                      <ServiceCard active={hasCcf} onChange={setHasCcf} icon={Building} label="Caja (CCF)" color="blue" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── LADO DERECHO: DETALLES Y COBRO ─── */}
            {/* Se añade h-full max-h-[90vh] para contener la altura y activar el scroll */}
            <div className="w-full lg:w-7/12 h-full max-h-[90vh] flex flex-col bg-slate-50/50 dark:bg-zinc-950/50 min-h-0">

              {/* Encabezado fijo (Cerrar) */}
              <div className="hidden lg:flex flex-shrink-0 items-center justify-end px-6 pt-6 sm:px-8 sm:pt-8 pb-4">
                <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Área de Formulario con Scroll Interno */}
              <div className="flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 pb-6 custom-scrollbar space-y-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-2xl text-sm flex items-center gap-2 font-medium">
                    <AlertCircle size={18} /> {error}
                  </div>
                )}

                {/* Entidades Desplegables */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-4 bg-indigo-500 rounded-full" /> 3. Detalles de Entidades
                  </h3>

                  {!hasEps && !hasPension && !hasArl && !hasCcf && (
                    <div className="p-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl text-center text-slate-400 dark:text-zinc-500 font-medium">
                      Activa al menos un módulo a la izquierda
                    </div>
                  )}

                  <AnimatePresence>
                    {hasEps && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Entidad de Salud (EPS)</label>
                        <select value={epsId} onChange={e => setEpsId(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-emerald-500 dark:text-white">
                          <option value="">Seleccionar EPS...</option>
                          {cat?.eps?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </motion.div>
                    )}

                    {hasPension && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Fondo de Pensión</label>
                        <select value={pensionId} onChange={e => setPensionId(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-violet-500 dark:text-white">
                          <option value="">Seleccionar Fondo...</option>
                          {cat?.pensions?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </motion.div>
                    )}

                    {hasArl && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Aseguradora (ARL)</label>
                          <select value={arlId} onChange={e => setArlId(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-amber-500 dark:text-white">
                            <option value="">Seleccionar ARL...</option>
                            {cat?.arl?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                          </select>
                        </div>
                        <div className="w-28">
                          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Nivel Riesgo</label>
                          <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-amber-500 dark:text-white">
                            {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>Nivel {r}</option>)}
                          </select>
                        </div>
                      </motion.div>
                    )}

                    {hasCcf && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Caja de Compensación (CCF)</label>
                        <select value={ccfId} onChange={e => setCcfId(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-blue-500 dark:text-white">
                          <option value="">Seleccionar CCF...</option>
                          {cat?.ccf?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Detalles de Cobro */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-4 bg-indigo-500 rounded-full" /> 4. Detalles del Cobro
                  </h3>
                  <div className="p-5 sm:p-6 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-sm space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Valor Total a Cobrar ($)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="w-full p-3 sm:p-4 text-2xl font-black bg-slate-50 dark:bg-zinc-950 border-2 border-slate-100 dark:border-zinc-800 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all text-indigo-600 dark:text-indigo-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Estado del Trámite</label>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                          className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-semibold">
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Pagado">Pagado</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Medio de Pago (Cliente)</label>
                        <select value={method} onChange={e => setMethod(e.target.value)}
                          className="w-full p-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 dark:text-white font-semibold">
                          <option value="">Ninguno</option>
                          <option value="Efectivo">Efectivo</option>
                          <option value="Transferencia">Transferencia</option>
                          <option value="Nequi">Nequi</option>
                          <option value="Daviplata">Daviplata</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Guardado Fijo al fondo */}
              <div className="flex-shrink-0 px-6 py-5 sm:px-8 sm:py-6 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isPending || isLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Guardar Afiliación</>}
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};