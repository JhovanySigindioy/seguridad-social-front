import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, RefreshCw, ChevronUp, ChevronDown, AlertCircle, FileText, Pencil, Eye, UserPlus } from 'lucide-react';
import { useAffiliations, useUpdateAffiliationStatus } from '../hooks/useAffiliations';
import { useAuthStore } from '../../../store/useAuthStore';
import { PAYMENT_STATUSES, type AffiliationItem, type PaymentStatus } from '../types/affiliation.types';
import { StatusBadge } from './StatusBadge';
import { AffiliationDetailsModal } from './AffiliationDetailsModal';
import { EditAffiliationModal } from './EditAffiliationModal';

const OFFICE_MANAGER_PAYMENT_STATUSES: PaymentStatus[] = ['Pendiente', 'En Proceso'];
const STATUS_STYLES: Record<PaymentStatus, {
  dot: string;
  select: string;
  filterActive: string;
  filterIdle: string;
}> = {
  Pendiente: {
    dot: 'bg-amber-500',
    select: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300',
    filterActive: 'border-amber-500 bg-amber-500 text-white shadow-sm shadow-amber-500/20',
    filterIdle: 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300',
  },
  'En Proceso': {
    dot: 'bg-blue-500',
    select: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300',
    filterActive: 'border-blue-500 bg-blue-500 text-white shadow-sm shadow-blue-500/20',
    filterIdle: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-300',
  },
  Pagado: {
    dot: 'bg-emerald-500',
    select: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300',
    filterActive: 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/20',
    filterIdle: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300',
  },
};

const getAllowedStatuses = (role?: string): PaymentStatus[] => {
  if (role === 'admin') return [...PAYMENT_STATUSES];
  if (role === 'office_manager') return OFFICE_MANAGER_PAYMENT_STATUSES;
  return [];
};

const formatDate = (value?: string | null) => {
  if (!value) return 'Sin registrar';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin registrar';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

interface AffiliationsTableProps {
  onNewAffiliation?: () => void;
}

export const AffiliationsTable = ({ onNewAffiliation }: AffiliationsTableProps) => {
  const { data: affiliations, isLoading, isError, refetch, isFetching } = useAffiliations();
  const { user } = useAuthStore();
  const updateStatus = useUpdateAffiliationStatus();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const itemsPerPage = 8;
  const allowedStatusOptions = useMemo(() => getAllowedStatuses(user?.role), [user?.role]);
  const canChangeStatus = allowedStatusOptions.length > 0;
  const isOfficeManager = user?.role === 'office_manager';

  const filtered = useMemo(() => {
    if (!affiliations) return [];
    return affiliations
      .filter(a => {
        const matchSearch =
          a.client_name.toLowerCase().includes(search.toLowerCase()) ||
          a.client_identification.includes(search) ||
          a.company_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || a.payment_status === statusFilter;
        return matchSearch && matchStatus;
      })
      .sort((a: any, b: any) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (a[sortField] < b[sortField]) return -1 * dir;
        if (a[sortField] > b[sortField]) return 1 * dir;
        return 0;
      });
  }, [affiliations, search, statusFilter, sortField, sortDir]);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
    setCurrentPage(1);
  };

  const getStatusOptions = (currentStatus: PaymentStatus) => {
    return allowedStatusOptions.includes(currentStatus)
      ? allowedStatusOptions
      : [currentStatus, ...allowedStatusOptions];
  };

  const isStatusLocked = (item: AffiliationItem) => {
    return isOfficeManager && item.payment_status === 'Pagado';
  };

  const handleStatusChange = (item: AffiliationItem, paymentStatus: PaymentStatus) => {
    if (item.payment_status === paymentStatus) return;
    if (isOfficeManager && item.payment_status === 'Pagado') return;

    setStatusError(null);
    setUpdatingStatusId(item.id);

    updateStatus.mutate(
      { id: item.id, payment_status: paymentStatus },
      {
        onError: (error: any) => {
          setStatusError(error.response?.data?.error || 'No se pudo actualizar el estado');
        },
        onSettled: () => {
          setUpdatingStatusId(null);
        },
      }
    );
  };

  const getFilterClassName = (status: 'all' | PaymentStatus) => {
    const base = 'px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all';
    const isActive = statusFilter === status;

    if (status === 'all') {
      return `${base} ${isActive
          ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
          : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
        }`;
    }

    return `${base} ${isActive ? STATUS_STYLES[status].filterActive : STATUS_STYLES[status].filterIdle}`;
  };

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const SortIcon = ({ field }: { field: string }) => (
    <span className="ml-1 opacity-50">
      {sortField === field ? (sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronDown size={14} />}
    </span>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-zinc-500">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <p className="font-semibold">Error al cargar las afiliaciones</p>
      <button onClick={() => refetch()} className="mt-4 text-sm text-indigo-500 hover:underline">Reintentar</button>
    </div>
  );

  const getAffiliationStatus = (item: AffiliationItem) => {
    if (item.status === 'Inactivo') {
      return { label: 'Inactiva', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
    }
    if (item.status === 'Activo' && item.end_date) {
      const endDate = new Date(item.end_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (endDate < today) {
        return { label: 'Vencida', className: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' };
      }
    }
    if (item.status === 'Activo') {
      return { label: 'Activa', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
    }
    return { label: 'Desconocido', className: 'bg-slate-100 text-slate-500' };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar: Search + Nueva Afiliación button */}
      <div className="flex flex-col sm:flex-row gap-3 items-center sm:items-center">
        <div className="flex flex-1 items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o empresa..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 placeholder-slate-400"
            />
          </div>
          <button
            onClick={onNewAffiliation}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-500/20 whitespace-nowrap"
          >
            <UserPlus size={16} />
            Nueva Afiliación
          </button>
        </div>
      </div>

      {/* Count + Filters: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-center">
        <div className="flex items-center gap-2">
          {(['all', 'Pendiente', 'En Proceso', 'Pagado'] as const).map(s => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
              className={getFilterClassName(s)}
            >
              {s === 'all' ? 'Todos' : s}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-end gap-2">
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            {isLoading ? 'Cargando...' : `${filtered.length} registro${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
          </p>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-indigo-500 transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>
      {statusError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {statusError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm min-h-[400px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50">
              {[
                { label: 'Cliente', field: 'client_name' },
                { label: 'Empresa', field: 'company_name' },
                { label: 'Oficina', field: 'office_name' },
                { label: 'Fechas', field: 'gov_record_at' },
                { label: 'Servicios', field: 'eps_name' },
                { label: 'Valor', field: 'value' },
                { label: 'Estado', field: 'status' },
                { label: 'Pago', field: 'payment_status' },
                { label: 'Acciones', field: 'actions' },
              ].map(col => (
                <th
                  key={col.field}
                  onClick={() => handleSort(col.field)}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 cursor-pointer hover:text-indigo-600 select-none whitespace-nowrap"
                >
                  <span className="flex items-center">{col.label}<SortIcon field={col.field} /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-zinc-800/60">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-20 text-slate-400">
                  <FileText size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No se encontraron afiliaciones</p>
                </td>
              </tr>
            ) : (
              <>
                {paginated.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.15), duration: 0.15 }}
                    className="border-b border-slate-50 dark:border-zinc-800/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors group"
                  >
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.client_name}</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-500">{item.client_identification}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-zinc-400 max-w-[180px] truncate">{item.company_name}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-semibold">
                        {item.office_name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-[11px] leading-tight text-slate-500 dark:text-zinc-400">
                        <p><span className="font-bold text-slate-600 dark:text-zinc-300">Recibido:</span> {formatDate(item.created_at)}</p>
                        <p><span className="font-bold text-emerald-600 dark:text-emerald-400">Pagado:</span> {formatDate(item.gov_record_at)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {item.eps_name !== '—' && <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold border border-emerald-100 dark:border-emerald-900/30">EPS</span>}
                        {item.pension_name !== '—' && <span className="px-1.5 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 rounded text-[10px] font-bold border border-violet-100 dark:border-violet-900/30">PEN</span>}
                        {item.arl_name !== '—' && <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold border border-amber-100 dark:border-amber-900/30">ARL</span>}
                        {item.ccf_name !== '—' && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-100 dark:border-blue-900/30">CCF</span>}
                        {item.eps_name === '—' && item.pension_name === '—' && item.arl_name === '—' && item.ccf_name === '—' && (
                          <span className="text-[10px] text-slate-400 font-bold border border-slate-200 dark:border-zinc-800 px-1.5 py-0.5 rounded">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-bold text-slate-800 dark:text-zinc-200">
                        ${Number(item.value).toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {(() => {
                        const affStatus = getAffiliationStatus(item);
                        return (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${affStatus.className}`}>
                            {affStatus.label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3.5" onClick={event => event.stopPropagation()}>
                      {item.status === 'Inactivo' ? (
                        <StatusBadge status={item.payment_status} />
                      ) : canChangeStatus ? (
                        <div
                          title={isStatusLocked(item) ? 'Estado pagado bloqueado para office_manager' : 'Cambiar estado'}
                          className={`inline-flex min-w-[120px] items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-semibold shadow-sm ${STATUS_STYLES[item.payment_status].select} ${isStatusLocked(item) ? 'cursor-not-allowed opacity-80' : ''}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[item.payment_status].dot}`} />
                          {isStatusLocked(item) ? (
                            <span className="min-w-[80px]">{item.payment_status}</span>
                          ) : (
                            <select
                              aria-label="Cambiar estado"
                              value={item.payment_status}
                              disabled={updatingStatusId === item.id}
                              onChange={event => handleStatusChange(item, event.target.value as PaymentStatus)}
                              className="min-w-[90px] cursor-pointer bg-transparent text-xs font-semibold outline-none disabled:cursor-wait disabled:opacity-60"
                            >
                              {getStatusOptions(item.payment_status).map(status => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      ) : (
                        <StatusBadge status={item.payment_status} />
                      )}
                    </td>
                    <td className="px-4 py-3.5" onClick={event => event.stopPropagation()}>
                      <div className="flex items-center gap-2">
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
                          className={`p-1.5 rounded-lg transition-colors ${item.status === 'Inactivo' ? 'text-slate-300 dark:text-zinc-700 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
                          title={item.status === 'Inactivo' ? 'Afiliación inactiva, no editable' : 'Editar afiliación'}
                        >
                          <Pencil size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-800/30 flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filtered.length)} de {filtered.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                Anterior
              </button>
              <span className="px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-zinc-200">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
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
