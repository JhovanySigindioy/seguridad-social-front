import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar, Building2, RefreshCw, ChevronUp, ChevronDown,
  AlertCircle, Eye, Pencil, FileText, Search, Copy, CheckCircle2,
} from 'lucide-react';
import { useDailyAffiliations, useUpdateAffiliationStatus } from '../hooks/useAffiliations';
import { useAuthStore } from '../../../store/useAuthStore';
import { useOffices } from '../../offices/hooks/useOffices';
import { PAYMENT_STATUSES, type AffiliationItem, type PaymentStatus } from '../types/affiliation.types';
import { StatusBadge } from '../components/StatusBadge';
import { AffiliationDetailsModal } from '../components/AffiliationDetailsModal';
import { EditAffiliationModal } from '../components/EditAffiliationModal';
import { useClients } from '../../clients/hooks/useClients';

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin registrar';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registrar';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date);
};

const formatPhones = (phone1?: string | null, phone2?: string | null) => {
  return [phone1, phone2].filter(Boolean).join(' / ') || 'Sin telefono';
};

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const normalizeWhatsAppPhone = (phone?: string | null) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('57') && digits.length >= 12) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
};

const getAffiliationWhatsAppUrl = (item: AffiliationItem, phone?: string | null) => {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return '';

  const signature = item.office_name || 'Seguridad Social';
  const message = `Hola, ${item.client_name}. Queremos recordarle que su afiliacion a seguridad social esta proxima a vencer.\n\nQueremos que siga protegido, asi que estamos listos para acompanarlo y ayudarle a renovarla de forma rapida y sin complicaciones. Escribanos por aqui y lo gestionamos juntos.\n\n${signature}`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
};

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <img src="/img/whatsapp.png" alt="" aria-hidden="true" width={size} height={size} className="block object-contain" />
);

const today = () => new Date().toISOString().split('T')[0];

export const DailyReportPage = () => {
  const { user } = useAuthStore();
  const { offices } = useOffices();
  const isAdmin = user?.role === 'admin';

  const [selectedDate, setSelectedDate] = useState(today());
  const [officeFilter, setOfficeFilter] = useState<number | 'all'>('all');

  const officeId = useMemo(() => {
    if (!isAdmin) return undefined;
    return officeFilter === 'all' ? undefined : officeFilter;
  }, [isAdmin, officeFilter]);

  const { data: affiliations, isLoading, isError, refetch, isFetching } = useDailyAffiliations(selectedDate, officeId);
  const { data: clients } = useClients();

  const updateStatus = useUpdateAffiliationStatus();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('office_name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedPhoneId, setCopiedPhoneId] = useState<number | null>(null);
  const itemsPerPage = 10;

  const clientsById = useMemo(() => {
    return new Map((clients || []).map(client => [client.id, client]));
  }, [clients]);

  const getItemPhones = (item: AffiliationItem) => {
    const client = clientsById.get(item.client_id);
    return {
      phone1: item.client_phone_1 || client?.phone_1 || null,
      phone2: item.client_phone_2 || client?.phone_2 || null,
    };
  };

  // Group by office for summary
  const officeGroups = useMemo(() => {
    if (!affiliations) return [];
    const groups: Record<string, { office_name: string; items: any[]; count: number; total_value: number }> = {};
    for (const a of affiliations) {
      const key = a.office_name || 'Sin oficina';
      if (!groups[key]) groups[key] = { office_name: key, items: [], count: 0, total_value: 0 };
      groups[key].items.push(a);
      groups[key].count++;
      groups[key].total_value += Number(a.value || 0);
    }
    return Object.values(groups).sort((a, b) => a.office_name.localeCompare(b.office_name));
  }, [affiliations]);

  // Flat list for table
  const filtered = useMemo(() => {
    if (!affiliations) return [];
    return affiliations
      .filter((a: any) => {
        const matchSearch =
          a.client_name.toLowerCase().includes(search.toLowerCase()) ||
          a.client_identification.includes(search) ||
          a.company_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.payment_status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a: any, b: any) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if ((a[sortField] || '') < (b[sortField] || '')) return -1 * dir;
        if ((a[sortField] || '') > (b[sortField] || '')) return 1 * dir;
        return 0;
      });
  }, [affiliations, search, statusFilter, sortField, sortDir]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setCurrentPage(1);
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 opacity-50 inline-flex">
      {sortField === field ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} className="opacity-30" />}
    </span>
  );

  const getAllowedStatuses = (role?: string): PaymentStatus[] => {
    if (role === 'admin' || role === 'office_manager') return [...PAYMENT_STATUSES];
    return [];
  };

  const allowedStatusOptions = useMemo(() => getAllowedStatuses(user?.role), [user?.role]);

  const getStatusOptions = (currentStatus: PaymentStatus) => {
    return allowedStatusOptions.includes(currentStatus)
      ? allowedStatusOptions
      : [currentStatus, ...allowedStatusOptions];
  };

  const handleStatusChange = (item: AffiliationItem, paymentStatus: PaymentStatus) => {
    if (item.payment_status === paymentStatus) return;
    updateStatus.mutate({
      id: item.id,
      payment_status: paymentStatus,
      month: item.month || 1,
      year: item.year || new Date().getFullYear(),
    });
  };

  const handleCopyPhone = async (item: AffiliationItem) => {
    const { phone1, phone2 } = getItemPhones(item);
    const phone = phone1 || phone2;
    if (!phone) return;
    await copyText(phone);
    setCopiedPhoneId(item.id);
    window.setTimeout(() => setCopiedPhoneId(null), 1800);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ─── Header Controls & Summary ─── */}
      <div className="flex flex-col xl:flex-row gap-4 items-start justify-between">
        {/* Left Side: Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => { setSelectedDate(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
            />
          </div>

          {isAdmin && (
            <div className="relative">
              <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={officeFilter}
                onChange={e => { setOfficeFilter(e.target.value === 'all' ? 'all' : Number(e.target.value)); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
              >
                <option value="all">Todas las oficinas</option>
                {offices.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => { setSelectedDate(today()); setOfficeFilter('all'); }}
            className="px-3 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Hoy
          </button>

          {/* Moved: Total Items & Refresh Button */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-zinc-700 h-8">
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
              {isLoading ? '...' : `${filtered.length} afiliación(es)`}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              title="Actualizar"
            >
              <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Right Side: Office Summary Cards */}
        <div className="flex flex-wrap gap-3 xl:justify-end w-full xl:w-auto">
          {!isLoading && officeGroups.length > 0 && officeGroups.map((g, i) => (
            <motion.div
              key={g.office_name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 p-4 shadow-sm flex flex-col justify-between min-w-[240px] xl:max-w-[280px]"
            >
              <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider truncate mb-2">
                {g.office_name}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100 leading-none">{g.count}</p>
                  <p className="text-[10px] text-slate-400 mt-1">afiliaciones</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                    ${g.total_value.toLocaleString('es-CO')}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">recaudo total</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ─── Search + Status Filters ─── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula o empresa..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'Pendiente', 'En Proceso', 'Pagado'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all ${statusFilter === s
                  ? s === 'all'
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : s === 'Pendiente'
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : s === 'En Proceso'
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                }`}
            >
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm min-h-[300px]">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <AlertCircle size={40} className="text-red-400 mb-3" />
            <p className="font-semibold">Error al cargar</p>
            <button onClick={() => refetch()} className="mt-2 text-sm text-indigo-500 hover:underline">Reintentar</button>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50">
                  {[
                    { label: 'Oficina', field: 'office_name' },
                    { label: 'Cliente', field: 'client_name' },
                    { label: 'Empresa', field: 'company_name' },
                    { label: 'Servicios', field: 'eps_name' },
                    { label: 'Valor', field: 'value' },
                    { label: 'Estado', field: 'status' },
                    { label: 'Pago', field: 'payment_status' },
                    { label: 'Creado', field: 'created_at' },
                    { label: 'Acciones', field: 'actions' },
                  ].map(col => (
                    col.field === 'actions' ? (
                      <th key={col.field} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 whitespace-nowrap">
                        {col.label}
                      </th>
                    ) : (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 cursor-pointer hover:text-indigo-600 select-none whitespace-nowrap"
                      >
                        <span className="flex items-center">{col.label}<SortIcon field={col.field} /></span>
                      </th>
                    )
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-zinc-800/60">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3.5">
                          <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full animate-pulse" style={{ width: `${50 + Math.random() * 40}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-20 text-slate-400 dark:text-zinc-500">
                      <FileText size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="font-semibold">Sin afiliaciones en esta fecha</p>
                      <p className="text-xs mt-1">Selecciona otra fecha o crea una nueva afiliación</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((item: any, index: number) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.2), duration: 0.15 }}
                      className="border-b border-slate-50 dark:border-zinc-800/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                    >
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold">
                          {item.office_name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {item.client_name}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">{item.client_identification}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{formatPhones(getItemPhones(item).phone1, getItemPhones(item).phone2)}</span>
                          <button
                            onClick={() => handleCopyPhone(item)}
                            disabled={!(getItemPhones(item).phone1 || getItemPhones(item).phone2)}
                            className="rounded p-1 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300 dark:hover:text-zinc-200 dark:disabled:text-zinc-700"
                            title="Copiar telefono"
                          >
                            {copiedPhoneId === item.id ? <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
                          </button>
                          {getAffiliationWhatsAppUrl(item, getItemPhones(item).phone1 || getItemPhones(item).phone2) ? (
                            <a href={getAffiliationWhatsAppUrl(item, getItemPhones(item).phone1 || getItemPhones(item).phone2)} target="_blank" rel="noreferrer" className="rounded p-1" title="Enviar WhatsApp" aria-label="Enviar WhatsApp">
                              <WhatsAppIcon size={16} />
                            </a>
                          ) : (
                            <button disabled className="rounded p-1 opacity-30" title="Sin telefono" aria-label="WhatsApp no disponible">
                              <WhatsAppIcon size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-zinc-400 max-w-[160px] truncate">
                        {item.company_name}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {item.eps_name !== '—' && <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30">EPS</span>}
                          {item.pension_name !== '—' && <span className="px-1.5 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded text-[10px] font-bold border border-violet-100 dark:border-violet-900/30">PEN</span>}
                          {item.arl_name !== '—' && <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold border border-amber-100 dark:border-amber-900/30">ARL</span>}
                          {item.ccf_name !== '—' && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-100 dark:border-blue-900/30">CCF</span>}
                          {item.eps_name === '—' && item.pension_name === '—' && item.arl_name === '—' && item.ccf_name === '—' && (
                            <span className="text-[10px] text-slate-400 font-bold border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded">N/A</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 dark:text-zinc-200">
                          ${Number(item.value).toLocaleString('es-CO')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const isInactivo = item.status === 'Inactivo';
                          const isExpired = item.status === 'Activo' && item.end_date && new Date(item.end_date) < new Date();
                          const cls = isInactivo
                            ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            : isExpired
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
                          const lbl = isInactivo ? 'Inactiva' : isExpired ? 'Vencida' : 'Activa';
                          return (
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${cls}`}>
                              {lbl}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        {item.status === 'Inactivo' ? (
                          <StatusBadge status={item.payment_status} />
                        ) : allowedStatusOptions.length > 0 ? (
                          <div className="inline-flex min-w-[120px] items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-sm"
                            style={{
                              backgroundColor: item.payment_status === 'Pagado' ? '#ecfdf5' : item.payment_status === 'En Proceso' ? '#eff6ff' : '#fffbeb',
                              borderColor: item.payment_status === 'Pagado' ? '#a7f3d0' : item.payment_status === 'En Proceso' ? '#bfdbfe' : '#fde68a',
                              color: item.payment_status === 'Pagado' ? '#047857' : item.payment_status === 'En Proceso' ? '#1d4ed8' : '#b45309',
                            }}
                            title="Cambiar estado"
                          >
                            <span className={`w-2 h-2 rounded-full ${item.payment_status === 'Pagado' ? 'bg-emerald-500' : item.payment_status === 'En Proceso' ? 'bg-blue-500' : 'bg-amber-500'
                              }`} />
                            <select
                              value={item.payment_status}
                              onChange={e => handleStatusChange(item, e.target.value as PaymentStatus)}
                              className="min-w-[85px] cursor-pointer bg-transparent text-xs font-semibold outline-none"
                            >
                              {getStatusOptions(item.payment_status).map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <StatusBadge status={item.payment_status} />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-400 dark:text-zinc-500">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedItem(item)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => item.status !== 'Inactivo' && setEditingItem(item)}
                            disabled={item.status === 'Inactivo'}
                            className={`p-1.5 rounded-lg transition-colors ${item.status === 'Inactivo'
                                ? 'text-slate-300 dark:text-zinc-700 cursor-not-allowed'
                                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                              }`}
                            title={item.status === 'Inactivo' ? 'Afiliación inactiva' : 'Editar'}
                          >
                            <Pencil size={15} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <AffiliationDetailsModal
        isOpen={!!selectedItem}
        data={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <EditAffiliationModal
        isOpen={!!editingItem}
        affiliation={editingItem}
        onClose={() => setEditingItem(null)}
      />
    </div>
  );
};
