import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Building, Heart, Shield, Landmark, User, CheckCircle2 } from 'lucide-react';
import { useAffiliationFormData, useCreateAffiliation } from '../hooks/useAffiliations';
import { useToast } from '../../../components/Toast';
import type { AffiliationCreateDTO } from '../types/affiliation.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAffiliationModal = ({ isOpen, onClose }: Props) => {
  const { data: cat, isLoading } = useAffiliationFormData();
  const { mutateAsync: create, isPending } = useCreateAffiliation();
  const { showToast } = useToast();

  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [companyId, setCompanyId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
  const [method, setMethod] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];

  const filteredClients = useMemo(() => {
    if (!cat?.clients) return [];
    const search = clientSearch.toLowerCase();
    return cat.clients.filter((c: any) => {
      const fullName = `${c.first_name} ${c.second_name || ''} ${c.first_lastname} ${c.second_lastname || ''}`.toLowerCase();
      return fullName.includes(search) || c.identification.toLowerCase().includes(search);
    }).slice(0, 10);
  }, [cat?.clients, clientSearch]);

  useEffect(() => {
    if (isOpen) {
      setClientId('');
      setClientSearch('');
      setCompanyId('');
      setStartDate(today);
      setEndDate('');
      setValue('');
      setHasEps(false);
      setHasArl(false);
      setHasCcf(false);
      setHasPension(false);
      setEpsId('');
      setArlId('');
      setCcfId('');
      setPensionId('');
      setRiskLevel('1');
      setMethod('');
      setShowClientDropdown(false);
    }
  }, [isOpen, today]);

  const handleSubmit = async () => {
    if (!clientId) return showToast('Selecciona un cliente.');
    if (!companyId) return showToast('Selecciona la empresa.');
    if (!startDate) return showToast('Ingresa la fecha de inicio.');
    if (endDate && endDate < startDate) return showToast('La fecha de fin debe ser posterior a la fecha de inicio.');
    if (hasEps && !epsId) return showToast('Selecciona la Entidad EPS.');
    if (hasArl && !arlId) return showToast('Selecciona la Aseguradora ARL.');
    if (hasCcf && !ccfId) return showToast('Selecciona la Caja de Compensación.');
    if (hasPension && !pensionId) return showToast('Selecciona el Fondo de Pensión.');
    if (!value || isNaN(Number(value))) return showToast('Ingresa un valor de cobro válido.');

    const formData: AffiliationCreateDTO = {
      client_id: Number(clientId),
      company_id: Number(companyId),
      start_date: startDate,
      end_date: endDate || undefined,
      value: Number(value),
      payment_method: (method || undefined) as AffiliationCreateDTO['payment_method'],
      eps_id: hasEps ? Number(epsId) : null,
      arl_id: hasArl ? Number(arlId) : null,
      ccf_id: hasCcf ? Number(ccfId) : null,
      pension_id: hasPension ? Number(pensionId) : null,
      risk_level: hasArl ? riskLevel : null,
      is_auto_renewed: !endDate,
    };

    try {
      await create(formData);
      onClose();
    } catch (err: any) {
      showToast(err.response?.data?.error || err.data?.error || 'Error al crear la afiliación');
    }
  };

  const ServiceCard = ({ active, onChange, icon: Icon, label, color }: any) => (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={`relative overflow-hidden flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${active
          ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20 shadow-md`
          : 'border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-slate-300 dark:hover:border-zinc-600'
        }`}
    >
      <div className={`p-2 rounded-lg mb-2 ${active ? `bg-${color}-500 text-white` : 'bg-slate-100 dark:bg-zinc-800 text-slate-400'}`}>
        <Icon size={20} strokeWidth={1.5} />
      </div>
      <span className={`text-xs font-semibold ${active ? `text-${color}-700 dark:text-${color}-300` : 'text-slate-600 dark:text-zinc-400'}`}>{label}</span>
      {active && <CheckCircle2 size={14} className={`absolute top-2 right-2 text-${color}-500`} />}
    </button>
  );

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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Nueva Afiliación</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400">Registrar afiliación con fechas específicas</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {/* LEFT COLUMN */}
              <div className="w-5/12 border-r border-slate-200 dark:border-zinc-800 p-5 overflow-y-auto space-y-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Trabajador y Empresa</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">Cliente</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nombre o cédula..."
                      value={clientSearch}
                      onChange={e => {
                        setClientSearch(e.target.value);
                        setClientId('');
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                    />
                    {showClientDropdown && clientSearch && (
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {filteredClients.length === 0 ? (
                          <div className="p-3 text-sm text-slate-400">No se encontraron clientes</div>
                        ) : (
                          filteredClients.map((c: any) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setClientId(String(c.id));
                                setClientSearch('');
                                setShowClientDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors border-b border-slate-100 dark:border-zinc-800 last:border-b-0"
                            >
                              <span className="font-medium text-slate-800 dark:text-zinc-200">
                                {c.first_name}{c.second_name ? ' ' + c.second_name : ''} {c.first_lastname}{c.second_lastname ? ' ' + c.second_lastname : ''}
                              </span>
                              <span className="ml-2 text-xs text-slate-400">{c.identification}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
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

                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Fechas</span>
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
                    <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Fechas</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">Inicio Afiliación</label>
                        <input
                          type="date"
                          value={startDate}
                          max={today}
                          onChange={e => setStartDate(e.target.value)}
                          className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-zinc-400 mb-1.5">Fin Afiliación <span className="text-slate-400">(opcional)</span></label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          onChange={e => setEndDate(e.target.value)}
                          className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                        />
                      </div>
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
