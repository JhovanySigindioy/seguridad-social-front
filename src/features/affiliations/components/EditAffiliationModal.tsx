import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building, Heart, Shield, Landmark, CheckCircle2, Calendar } from 'lucide-react';
import { useAffiliationFormData, useUpdateAffiliation } from '../hooks/useAffiliations';
import { useToast } from '../../../components/Toast';
import { WITHDRAWAL_REASONS, type AffiliationItem, type WithdrawalReason } from '../types/affiliation.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  affiliation: AffiliationItem | null;
}

export const EditAffiliationModal = ({ isOpen, onClose, affiliation }: Props) => {
  const { data: cat, isLoading } = useAffiliationFormData();
  const { mutateAsync: update, isPending } = useUpdateAffiliation();
  const { showToast } = useToast();

  const [clientId, setClientId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [govRecordAt, setGovRecordAt] = useState('');
  const [createdAt, setCreatedAt] = useState('');


  const [hasEps, setHasEps] = useState(false);
  const [hasArl, setHasArl] = useState(false);
  const [hasCcf, setHasCcf] = useState(false);
  const [hasPension, setHasPension] = useState(false);

  const [epsId, setEpsId] = useState('');
  const [arlId, setArlId] = useState('');
  const [ccfId, setCcfId] = useState('');
  const [pensionId, setPensionId] = useState('');
  const [riskLevel, setRiskLevel] = useState('1');

  const [value, setValue] = useState('');
  const [method, setMethod] = useState('');
  const [isAutoRenewed, setIsAutoRenewed] = useState(true);
  const [observation, setObservation] = useState('');
  const [withdrawalReason, setWithdrawalReason] = useState<WithdrawalReason | ''>('');
  const [withdrawalObservations, setWithdrawalObservations] = useState('');

  useEffect(() => {
    if (affiliation && isOpen) {
      setClientId(String((affiliation as any).client_id || ''));
      setCompanyId(String((affiliation as any).company_id || ''));
      setValue(String(affiliation.value));
      setMethod((affiliation as any).payment_method || '');
      setIsAutoRenewed(Boolean(affiliation.is_auto_renewed));
      setObservation(affiliation.observation || '');
      setWithdrawalReason(affiliation.withdrawal_reason || '');
      setWithdrawalObservations(affiliation.withdrawal_observations || '');

      if (affiliation.gov_record_at) {
        setGovRecordAt(affiliation.gov_record_at.split('T')[0]);
      } else {
        setGovRecordAt('');
      }

      if (affiliation.created_at) {
        setCreatedAt(affiliation.created_at.split('T')[0]);
      } else {
        setCreatedAt('');
      }



      const hasEpsVal = affiliation.eps_name && affiliation.eps_name !== '—';
      const hasArlVal = affiliation.arl_name && affiliation.arl_name !== '—';
      const hasCcfVal = affiliation.ccf_name && affiliation.ccf_name !== '—';
      const hasPensionVal = affiliation.pension_name && affiliation.pension_name !== '—';

      setHasEps(Boolean(hasEpsVal));
      setHasArl(Boolean(hasArlVal));
      setHasCcf(Boolean(hasCcfVal));
      setHasPension(Boolean(hasPensionVal));

      setRiskLevel(affiliation.risk_level || '1');

      // Map entity IDs by name from catalogs
      if (cat?.eps) {
        const found = cat.eps.find((e: any) => e.name === affiliation.eps_name);
        if (found) setEpsId(String(found.id));
      }
      if (cat?.arl) {
        const found = cat.arl.find((a: any) => a.name === affiliation.arl_name);
        if (found) setArlId(String(found.id));
      }
      if (cat?.ccf) {
        const found = cat.ccf.find((c: any) => c.name === affiliation.ccf_name);
        if (found) setCcfId(String(found.id));
      }
      if (cat?.pensions) {
        const found = cat.pensions.find((p: any) => p.name === affiliation.pension_name);
        if (found) setPensionId(String(found.id));
      }
    }
  }, [affiliation, isOpen, cat]);

  const handleSubmit = async () => {
    if (!clientId) return showToast('Selecciona un cliente.');
    if (!companyId) return showToast('Selecciona la empresa.');
    if (hasEps && !epsId) return showToast('Selecciona la Entidad EPS.');
    if (hasArl && !arlId) return showToast('Selecciona la Aseguradora ARL.');
    if (hasCcf && !ccfId) return showToast('Selecciona la Caja de Compensación.');
    if (hasPension && !pensionId) return showToast('Selecciona el Fondo de Pensión.');
    if (!value || isNaN(Number(value))) return showToast('Ingresa un valor de cobro válido.');

    try {
      await update({
        id: affiliation!.id,
        client_id: Number(clientId),
        company_id: Number(companyId),
        value: Number(value),
        payment_method: method || null,
        start_date: affiliation?.start_date ? affiliation.start_date.split('T')[0] : null,
        end_date: affiliation?.end_date ? affiliation.end_date.split('T')[0] : null,
        gov_record_at: govRecordAt || null,
        created_at: createdAt || null,
        eps_id: hasEps ? Number(epsId) : null,
        arl_id: hasArl ? Number(arlId) : null,
        ccf_id: hasCcf ? Number(ccfId) : null,
        pension_id: hasPension ? Number(pensionId) : null,
        risk_level: hasArl ? riskLevel : null,
        is_auto_renewed: isAutoRenewed,
        observation: observation.trim() || null,
        withdrawal_reason: withdrawalReason || null,
        withdrawal_observations: withdrawalObservations.trim() || null,
        month: affiliation?.month,
        year: affiliation?.year,
      });

      showToast('Afiliación actualizada exitosamente', 'success');
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Error al actualizar la afiliación');
    }
  };

  const ServiceCard = ({ active, onChange, label, color }: any) => (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 rounded-xl transition-all w-full text-left ${active
          ? `border border-${color}-200 dark:border-${color}-900/30 shadow-sm shadow-${color}-500/10`
          : 'border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
        }`}
    >
      <div className={`w-2 h-10 rounded-full shrink-0 transition-colors ${active ? `bg-${color}-400` : 'bg-slate-300 dark:bg-zinc-700'}`}></div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-bold uppercase mb-0.5 ${active ? `text-${color}-600 dark:text-${color}-400` : 'text-slate-500'}`}>
          Módulo
        </p>
        <p className={`text-sm font-semibold truncate ${active ? 'text-slate-800 dark:text-zinc-200' : 'text-slate-500'}`}>
          {label}
        </p>
      </div>
      {active ? (
        <CheckCircle2 size={18} className={`text-${color}-500 shrink-0`} />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-zinc-700 shrink-0"></div>
      )}
    </button>
  );

  const isInactiveAffiliation = affiliation?.status === 'Inactivo';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-slate-50 dark:bg-zinc-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 flex-shrink-0">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Editar Afiliación</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Modifica los datos del afiliado</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* LEFT COLUMN */}
              <div className="w-5/12 border-r border-slate-200 dark:border-zinc-800 p-5 overflow-y-auto space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">Cliente</label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                  >
                    <option value="">Seleccionar...</option>
                    {cat?.clients?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.first_name}{c.second_name ? ' ' + c.second_name : ''} {c.first_lastname}{c.second_lastname ? ' ' + c.second_lastname : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">Empresa</label>
                  <select
                    value={companyId}
                    onChange={e => setCompanyId(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                  >
                    <option value="">Seleccionar...</option>
                    {cat?.companies?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">Módulos a Cotizar</label>
                  <div className="grid grid-cols-2 gap-2">
                    <ServiceCard active={hasEps} onChange={setHasEps} icon={Heart} label="Salud EPS" color="emerald" />
                    <ServiceCard active={hasPension} onChange={setHasPension} icon={Landmark} label="Pensión" color="violet" />
                    <ServiceCard active={hasArl} onChange={setHasArl} icon={Shield} label="Riesgos ARL" color="amber" />
                    <ServiceCard active={hasCcf} onChange={setHasCcf} icon={Building} label="Caja CCF" color="blue" />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Fecha Pago Recibido</span>
                        </div>
                        <input
                          type="date"
                          value={createdAt}
                          onChange={e => setCreatedAt(e.target.value)}
                          className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                            <Calendar size={16} className="text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Fecha de Pago</span>
                        </div>
                        <input
                          type="date"
                          value={govRecordAt}
                          onChange={e => setGovRecordAt(e.target.value)}
                          className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">Detalles de Entidades</label>

                      {!hasEps && !hasPension && !hasArl && !hasCcf && (
                        <div className="p-6 border-2 border-dashed border-slate-200 dark:border-zinc-700 rounded-xl text-center text-slate-400 text-sm">
                          Activa un módulo a la izquierda
                        </div>
                      )}

                      <AnimatePresence>
                        {hasEps && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2">
                            <label className="block text-xs text-emerald-600 dark:text-emerald-400 mb-1">EPS</label>
                            <select value={epsId} onChange={e => setEpsId(e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-emerald-500 text-slate-800 dark:text-zinc-200">
                              <option value="">Seleccionar EPS...</option>
                              {cat?.eps?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {hasPension && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2">
                            <label className="block text-xs text-violet-600 dark:text-violet-400 mb-1">Pensión</label>
                            <select value={pensionId} onChange={e => setPensionId(e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-violet-500 text-slate-800 dark:text-zinc-200">
                              <option value="">Seleccionar...</option>
                              {cat?.pensions?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {hasArl && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2 grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs text-amber-600 dark:text-amber-400 mb-1">ARL</label>
                              <select value={arlId} onChange={e => setArlId(e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-200">
                                <option value="">Seleccionar...</option>
                                {cat?.arl?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-amber-600 dark:text-amber-400 mb-1">Nivel</label>
                              <select value={riskLevel} onChange={e => setRiskLevel(e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-200">
                                {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>Nivel {r}</option>)}
                              </select>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {hasCcf && (
                          <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-2">
                            <label className="block text-xs text-blue-600 dark:text-blue-400 mb-1">CCF</label>
                            <select value={ccfId} onChange={e => setCcfId(e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-blue-500 text-slate-800 dark:text-zinc-200">
                              <option value="">Seleccionar CCF...</option>
                              {cat?.ccf?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                            </select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-2">Detalles del Cobro</label>
                      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl p-4 space-y-3">
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-zinc-500 mb-1">Valor a Cobrar</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-600 dark:text-indigo-400 font-bold">$</span>
                            <input
                              type="text"
                              placeholder="0"
                              value={value ? Number(value).toLocaleString('es-CO') : ''}
                              onChange={e => {
                                const raw = e.target.value.replace(/[^\d]/g, '');
                                setValue(raw);
                              }}
                              className="w-full pl-7 pr-4 py-2.5 text-xl font-bold bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg focus:border-indigo-500 outline-none text-indigo-600 dark:text-indigo-400"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-zinc-500 mb-1">Medio de Pago</label>
                          <select value={method} onChange={e => setMethod(e.target.value)} className="w-full p-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200">
                            <option value="">Ninguno</option>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Nequi">Nequi</option>
                            <option value="Daviplata">Daviplata</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 dark:text-zinc-500 mb-1">Observaciones</label>
                          <textarea
                            value={observation}
                            onChange={e => setObservation(e.target.value)}
                            placeholder="Opcional..."
                            rows={2}
                            className="w-full p-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200 resize-none"
                          />
                        </div>
                        {isInactiveAffiliation && (
                          <>
                            <div className="h-px bg-slate-200 dark:bg-zinc-800" />
                            <div>
                              <label className="block text-xs text-red-500 dark:text-red-400 mb-1">Motivo de retiro</label>
                              <select
                                value={withdrawalReason}
                                onChange={e => setWithdrawalReason(e.target.value as WithdrawalReason | '')}
                                className="w-full p-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-red-200 dark:border-red-900/40 rounded-lg outline-none focus:border-red-500 text-slate-800 dark:text-zinc-200"
                              >
                                <option value="">Sin motivo</option>
                                {WITHDRAWAL_REASONS.map(reason => (
                                  <option key={reason} value={reason}>{reason}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-red-500 dark:text-red-400 mb-1">Observaciones de retiro</label>
                              <textarea
                                value={withdrawalObservations}
                                onChange={e => setWithdrawalObservations(e.target.value)}
                                placeholder="Describe el contexto del retiro..."
                                rows={3}
                                className="w-full p-2 text-sm bg-slate-50 dark:bg-zinc-950 border border-red-200 dark:border-red-900/40 rounded-lg outline-none focus:border-red-500 text-slate-800 dark:text-zinc-200 resize-none"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 bg-slate-100 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 flex-shrink-0">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 rounded-xl hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || isLoading}
                className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
              >
                {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Guardar</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
