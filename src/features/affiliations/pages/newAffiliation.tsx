import { useState, useEffect, useMemo } from 'react';
import { Save, Heart, Shield, Landmark, Building, CheckCircle2, User } from 'lucide-react';
import { useAffiliationFormData, useCreateAffiliation, useLatestAffiliationByClient } from '../hooks/useAffiliations';
import { useToast } from '../../../components/Toast';
import type { AffiliationCreateDTO } from '../types/affiliation.types';
import { useAuthStore } from '../../../store/useAuthStore';
import { useOffices } from '../../offices/hooks/useOffices';

const SERVICE_CONFIG = {
  eps: { label: 'Salud EPS', shortLabel: 'EPS', color: 'emerald', icon: Heart },
  pension: { label: 'Pensión', shortLabel: 'PEN', color: 'indigo', icon: Landmark },
  arl: { label: 'Riesgos ARL', shortLabel: 'ARL', color: 'amber', icon: Shield },
  ccf: { label: 'Caja CCF', shortLabel: 'CCF', color: 'blue', icon: Building },
};


interface ServiceState {
  active: boolean;
  entityId: string;
  riskLevel: string;
}

interface NewAffiliationPageProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const NewAffiliationPage = ({ onCancel, onSuccess }: NewAffiliationPageProps) => {
  const { data: cat, isLoading } = useAffiliationFormData();
  const { mutateAsync: create, isPending } = useCreateAffiliation();
  const { showToast } = useToast();

  const [clientSearch, setClientSearch] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientId, setClientId] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [selectedOfficeId, setSelectedOfficeId] = useState('');

  const { activeOfficeId, user } = useAuthStore();
  const { offices } = useOffices();
  const isAdmin = user?.role === 'admin';

  const [services, setServices] = useState<Record<keyof typeof SERVICE_CONFIG, ServiceState>>({
    eps: { active: false, entityId: '', riskLevel: '1' },
    pension: { active: false, entityId: '', riskLevel: '1' },
    arl: { active: false, entityId: '', riskLevel: '1' },
    ccf: { active: false, entityId: '', riskLevel: '1' },
  });

  const { data: latestAffiliation, isFetching: isFetchingLatest } = useLatestAffiliationByClient(clientId);

  useEffect(() => {
    if (latestAffiliation) {
      setCompanyId(String(latestAffiliation.company_id));
      setValue(String(latestAffiliation.value));

      setServices(prev => ({
        eps: { ...prev.eps, active: !!latestAffiliation.eps_id, entityId: latestAffiliation.eps_id ? String(latestAffiliation.eps_id) : '' },
        pension: { ...prev.pension, active: !!latestAffiliation.pension_id, entityId: latestAffiliation.pension_id ? String(latestAffiliation.pension_id) : '' },
        arl: { ...prev.arl, active: !!latestAffiliation.arl_id, entityId: latestAffiliation.arl_id ? String(latestAffiliation.arl_id) : '', riskLevel: latestAffiliation.risk_level ? String(latestAffiliation.risk_level) : '1' },
        ccf: { ...prev.ccf, active: !!latestAffiliation.ccf_id, entityId: latestAffiliation.ccf_id ? String(latestAffiliation.ccf_id) : '' },
      }));

      showToast('Formulario autocompletado con la última afiliación', 'success');
    }
  }, [latestAffiliation, showToast]);

  const [value, setValue] = useState('');
  const [method, setMethod] = useState<string>('');
  const [observation, setObservation] = useState('');

  const filteredClients = useMemo(() => {
    if (!cat?.clients) return [];
    const search = clientSearch.toLowerCase();
    return cat.clients.filter((c: any) => {
      const fullName = `${c.first_name} ${c.second_name || ''} ${c.first_lastname} ${c.second_lastname || ''}`.toLowerCase();
      return fullName.includes(search) || c.identification.toLowerCase().includes(search);
    }).slice(0, 10);
  }, [cat?.clients, clientSearch]);

  useEffect(() => {
    setClientId('');
    setClientSearch('');
    setCompanyId('');
    setValue('');
    setServices({
      eps: { active: false, entityId: '', riskLevel: '1' },
      pension: { active: false, entityId: '', riskLevel: '1' },
      arl: { active: false, entityId: '', riskLevel: '1' },
      ccf: { active: false, entityId: '', riskLevel: '1' },
    });
    setMethod('');
    setObservation('');
    setSelectedOfficeId('');
  }, []);

  const handleServiceChange = (service: keyof typeof SERVICE_CONFIG, field: keyof ServiceState, val: any) => {
    setServices(prev => ({ ...prev, [service]: { ...prev[service], [field]: val } }));
  };

  const handleSubmit = async () => {
    if (!clientId) return showToast('Selecciona un cliente.');
    if (!companyId) return showToast('Selecciona la empresa.');
    
    const hasActiveService = Object.values(services).some(s => s.active);
    if (!hasActiveService) return showToast('Debes seleccionar al menos un servicio para afiliar.');

    if (services.eps.active && !services.eps.entityId) return showToast('Selecciona la Entidad EPS.');
    if (services.arl.active && !services.arl.entityId) return showToast('Selecciona la Aseguradora ARL.');
    if (services.ccf.active && !services.ccf.entityId) return showToast('Selecciona la Caja de Compensación.');
    if (services.pension.active && !services.pension.entityId) return showToast('Selecciona el Fondo de Pensión.');
    
    if (!value || isNaN(Number(value))) return showToast('Ingresa un valor de cobro válido.');

    let currentOfficeId = activeOfficeId;
    if (isAdmin && !activeOfficeId) {
      if (!selectedOfficeId) return showToast('Selecciona la sede a la que se asignará la afiliación.');
      currentOfficeId = Number(selectedOfficeId);
    } else if (!currentOfficeId) {
      currentOfficeId = offices?.length > 0 ? offices[0].id : null;
    }

    const formData: AffiliationCreateDTO = {
      client_id: Number(clientId),
      company_id: Number(companyId),
      value: Number(value),
      payment_method: (method || undefined) as AffiliationCreateDTO['payment_method'],
      eps_id: services.eps.active ? Number(services.eps.entityId) : null,
      arl_id: services.arl.active ? Number(services.arl.entityId) : null,
      ccf_id: services.ccf.active ? Number(services.ccf.entityId) : null,
      pension_id: services.pension.active ? Number(services.pension.entityId) : null,
      risk_level: services.arl.active ? services.arl.riskLevel : null,
      is_auto_renewed: false,
      office_id: currentOfficeId || undefined,
      observation: observation || undefined,
    };

    try {
      await create(formData);
      showToast('Afiliación creada exitosamente', 'success');
      onSuccess?.();
    } catch (err: any) {
      showToast(err.response?.data?.error || err.data?.error || 'Error al crear la afiliación');
    }
  };

  const activeServices = Object.entries(services).filter(([, s]) => s.active);

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto ">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {isAdmin && !activeOfficeId && (
                <>
                  <label className="block text-xs font-bold text-amber-800 dark:text-amber-400 mb-2">
                    En que oficina desea registrar la afiliación?
                  </label>
                  <select
                    value={selectedOfficeId}
                    onChange={e => setSelectedOfficeId(e.target.value)}
                    className="w-full p-3 bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700/50 rounded-xl outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-200"
                  >
                    <option value="">Selecciona la sede a la que se asignará la afiliación...</option>
                    {offices?.map((office: any) => (
                      <option key={office.id} value={office.id}>{office.name}</option>
                    ))}
                  </select>
                </>
              )}

              {/* Row 1: Worker + Company */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">
                    <User size={12} className="inline mr-1" />
                    Trabajador
                    {isFetchingLatest && (
                      <div className="ml-2 animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-600"></div>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={clientSearch}
                      onChange={e => {
                        setClientSearch(e.target.value);
                        setClientId('');
                        setShowClientDropdown(true);
                      }}
                      onFocus={() => setShowClientDropdown(true)}
                      className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                    />
                    {showClientDropdown && clientSearch && (
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg shadow-lg max-h-44 overflow-y-auto">
                        {filteredClients.length === 0 ? (
                          <div className="p-3 text-sm text-slate-400">No se encontraron clientes</div>
                        ) : (
                          filteredClients.map((c: any) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setClientId(String(c.id));
                                setClientSearch(`${c.first_name}${c.second_name ? ' ' + c.second_name : ''} ${c.first_lastname}${c.second_lastname ? ' ' + c.second_lastname : ''} - ${c.identification}`);
                                setShowClientDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 border-b border-slate-100 dark:border-zinc-800 last:border-b-0"
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
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">Empresa</label>
                  <select
                    value={companyId}
                    onChange={e => setCompanyId(e.target.value)}
                    className="w-full p-2.5 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200"
                  >
                    <option value="">Seleccionar...</option>
                    {cat?.companies?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Services Toggle (full width) */}
              <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {(Object.keys(SERVICE_CONFIG) as Array<keyof typeof SERVICE_CONFIG>).map(key => {
                    const config = SERVICE_CONFIG[key];
                    const isActive = services[key].active;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleServiceChange(key, 'active', !isActive)}
                        className={`flex items-center gap-3 p-3 bg-white dark:bg-zinc-950 rounded-xl transition-all w-full text-left ${isActive
                            ? `border border-${config.color}-200 dark:border-${config.color}-900/30 shadow-sm shadow-${config.color}-500/10`
                            : 'border border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                          }`}
                      >
                        <div className={`w-2 h-10 rounded-full shrink-0 transition-colors ${isActive ? `bg-${config.color}-400` : 'bg-slate-300 dark:bg-zinc-700'}`}></div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-bold uppercase mb-0.5 ${isActive ? `text-${config.color}-600 dark:text-${config.color}-400` : 'text-slate-500'}`}>
                            Módulo
                          </p>
                          <p className={`text-sm font-semibold truncate ${isActive ? 'text-slate-800 dark:text-zinc-200' : 'text-slate-500'}`}>
                            {config.shortLabel}
                          </p>
                        </div>
                        {isActive ? (
                          <CheckCircle2 size={18} className={`text-${config.color}-500 shrink-0`} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-zinc-700 shrink-0"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Rows - Single Card Container */}
              <div className="bg-white dark:bg-zinc-900 rounded-lg border border-slate-200 dark:border-zinc-800 p-4">
                {activeServices.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-slate-500 dark:text-zinc-400 mt-1">
                      Completa la información para registrar una nueva afiliación. La cobertura iniciará a partir de hoy.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeServices.map(([key, service]) => {
                      const config = SERVICE_CONFIG[key as keyof typeof SERVICE_CONFIG];
                      return (
                        <div key={key} className="border-b border-slate-100 dark:border-zinc-800 last:border-b-0 pb-4 last:pb-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-1.5 rounded bg-${config.color}-100 dark:bg-${config.color}-900/30`}>
                              <config.icon size={14} className={`text-${config.color}-600 dark:text-${config.color}-400`} strokeWidth={1.5} />
                            </div>
                            <span className={`text-xs font-bold text-${config.color}-700 dark:text-${config.color}-300`}>{config.label}</span>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div>
                              <select
                                value={service.entityId}
                                onChange={e => handleServiceChange(key as keyof typeof SERVICE_CONFIG, 'entityId', e.target.value)}
                                className={`w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-${config.color}-200 dark:border-${config.color}-800/30 rounded-lg outline-none focus:border-${config.color}-500 text-slate-800 dark:text-zinc-200`}
                              >
                                <option value="">Entidad</option>
                                {key === 'eps' && cat?.eps?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                {key === 'pension' && cat?.pensions?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                {key === 'arl' && cat?.arl?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                {key === 'ccf' && cat?.ccf?.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                              </select>
                            </div>
                            {key === 'arl' && (
                              <div>
                                <select
                                  value={service.riskLevel}
                                  onChange={e => handleServiceChange('arl', 'riskLevel', e.target.value)}
                                  className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-800/30 rounded-lg outline-none focus:border-amber-500 text-slate-800 dark:text-zinc-200"
                                >
                                  {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>Nivel {r}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Payment Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">Cobro</label>
                  <div className="grid grid-cols-2 gap-3">
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
                        className="w-full pl-7 pr-4 py-2 text-base font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:border-indigo-500 outline-none text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                    <select
                      value={method}
                      onChange={e => setMethod(e.target.value)}
                      className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                    >
                      <option value="">Medio de pago</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Nequi">Nequi</option>
                      <option value="Daviplata">Daviplata</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-zinc-400 mb-2">Observaciones</label>
                  <textarea
                    value={observation}
                    onChange={e => setObservation(e.target.value)}
                    placeholder="Opcional..."
                    rows={2}
                    className="w-full p-2 text-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-lg focus:border-indigo-500 outline-none text-slate-800 dark:text-zinc-200 resize-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-zinc-400 rounded-lg hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isPending || isLoading}
          className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          {isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Guardar</>}
        </button>
      </div>
    </div>
  );
};