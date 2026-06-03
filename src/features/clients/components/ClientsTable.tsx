import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, Pencil, Trash2, AlertCircle, UserCircle, Phone, Copy, CheckCircle2 } from 'lucide-react';
import { useClients, useDeleteClient } from '../hooks/useClients';
import type { Client } from '../types/client.types';
import { CreateClientModal } from './CreateClientModal';
import { EditClientModal } from './EditClientModal';
import { useAuthStore } from '../../../store/useAuthStore';

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <img
    src="/img/whatsapp.png"
    alt=""
    aria-hidden="true"
    width={size}
    height={size}
    className="block object-contain"
  />
);

const getClientName = (client: Client) => {
  return `${client.first_name} ${client.second_name || ''} ${client.first_lastname} ${client.second_lastname || ''}`.replace(/\s+/g, ' ').trim();
};

const formatPhones = (client: Client) => {
  return [client.phone_1, client.phone_2].filter(Boolean).join(' / ') || 'Sin telefono';
};

const getPrimaryPhone = (client: Client) => {
  return client.phone_1 || client.phone_2 || '';
};

const normalizeWhatsAppPhone = (phone?: string | null) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('57') && digits.length >= 12) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
};

const getWhatsAppUrl = (client: Client) => {
  const phone = normalizeWhatsAppPhone(getPrimaryPhone(client));
  if (!phone) return '';

  const clientName = getClientName(client);
  const signature = client.office_name || 'Seguridad Social';
  const message = `Hola, ${clientName}. Queremos recordarle que su afiliacion a seguridad social esta proxima a vencer.\n\nQueremos que siga protegido, asi que estamos listos para acompanarlo y ayudarle a renovarla de forma rapida y sin complicaciones. Escribanos por aqui y lo gestionamos juntos.\n\n${signature}`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const getCallUrl = (client: Client) => {
  const phone = normalizeWhatsAppPhone(getPrimaryPhone(client));
  return phone ? `tel:+${phone}` : '';
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

export const ClientsTable = () => {
  const { data: clients, isLoading, isError, refetch, isFetching } = useClients();
  const deleteClient = useDeleteClient();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState<number | null>(null);
  const { user, activeOfficeId } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const itemsPerPage = 10;

  const filtered = useMemo(() => {
    if (!clients) return [];
    
    const officeFiltered = clients.filter(c => {
      if (isAdmin) return true;
      return c.office_id === activeOfficeId;
    });

    return officeFiltered.filter(c => {
      const fullName = getClientName(c).toLowerCase();
      const matchSearch =
        fullName.includes(search.toLowerCase()) ||
        c.identification.includes(search) ||
        (c.phone_1?.includes(search) ?? false) ||
        (c.phone_2?.includes(search) ?? false) ||
        (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.office_name?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchSearch;
    });
  }, [clients, search, isAdmin, activeOfficeId]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const handleDelete = async () => {
    if (!clientToDelete) return;
    
    setDeleteError(null);
    try {
      await deleteClient.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
    } catch (err: any) {
      setDeleteError(err.response?.data?.error || 'Error al eliminar cliente');
    }
  };

  const handleCopyPhone = async (client: Client) => {
    const phone = getPrimaryPhone(client);
    if (!phone) return;

    await copyText(phone);
    setCopiedClientId(client.id);
    window.setTimeout(() => setCopiedClientId(null), 1800);
  };

  if (isError) return (
    <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-zinc-500">
      <AlertCircle size={48} className="text-red-400 mb-4" />
      <p className="font-semibold">Error al cargar los clientes</p>
      <button onClick={() => refetch()} className="mt-4 text-sm text-indigo-500 hover:underline">Reintentar</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, cédula, email u oficina..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-500 hover:text-indigo-500 transition-colors"
            title="Actualizar"
          >
            <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-500/20"
          >
            + Nuevo Cliente
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-zinc-500">
        {isLoading ? 'Cargando...' : `${filtered.length} cliente${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`}
      </p>

      {deleteError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
          {deleteError}
        </div>
      )}

      <div className="grid gap-3 md:hidden">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="h-4 w-40 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
              <div className="mt-3 h-3 w-28 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
              <div className="mt-2 h-3 w-36 rounded bg-slate-100 dark:bg-zinc-800 animate-pulse" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400 dark:border-zinc-800 dark:bg-zinc-900">
            <UserCircle size={40} className="mx-auto mb-3 opacity-30" />
            <p>No se encontraron clientes</p>
          </div>
        ) : (
          paginated.map(client => {
            const whatsappUrl = getWhatsAppUrl(client);
            const callUrl = getCallUrl(client);
            const hasPhone = Boolean(getPrimaryPhone(client));
            const primaryPhone = getPrimaryPhone(client);

            return (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm shadow-indigo-500/5 dark:border-indigo-900/30 dark:bg-zinc-900"
              >
                <div className="mb-3 h-1 w-14 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400" />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-base font-semibold leading-snug text-slate-900 dark:text-zinc-100">{getClientName(client)}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                      {client.document_type_name} {client.identification}
                    </p>
                    {isAdmin && (
                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
                        {client.office_name}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => setEditingClient(client)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setClientToDelete(client)}
                      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600 dark:hover:bg-zinc-800"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 dark:border-indigo-900/30 dark:bg-indigo-950/10">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                        <Phone size={13} /> Contacto
                      </p>
                      <div className="min-w-0">
                        <p className="break-all text-base font-semibold text-slate-900 dark:text-zinc-100">
                          {primaryPhone || 'Sin telefono'}
                        </p>
                        {client.phone_1 && client.phone_2 && (
                          <p className="mt-0.5 break-all text-xs text-slate-500 dark:text-zinc-400">Alterno: {client.phone_2}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        onClick={() => handleCopyPhone(client)}
                        disabled={!hasPhone}
                        className="flex h-9 w-9 items-center justify-center text-slate-500 transition-colors hover:text-slate-900 disabled:text-slate-300 dark:text-zinc-400 dark:hover:text-zinc-100 dark:disabled:text-zinc-700"
                        title="Copiar telefono"
                      >
                        {copiedClientId === client.id ? <CheckCircle2 size={22} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={21} />}
                      </button>
                      {whatsappUrl ? (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-9 w-9 items-center justify-center text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                          title="Enviar WhatsApp"
                          aria-label="Enviar WhatsApp"
                        >
                          <WhatsAppIcon size={24} />
                        </a>
                      ) : (
                        <button disabled className="flex h-9 w-9 items-center justify-center text-slate-300 dark:text-zinc-700" title="Sin telefono" aria-label="WhatsApp no disponible">
                          <WhatsAppIcon size={24} />
                        </button>
                      )}
                      {callUrl ? (
                        <a
                          href={callUrl}
                          className="flex h-9 w-9 items-center justify-center text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Llamar"
                          aria-label="Llamar"
                        >
                          <Phone size={22} />
                        </a>
                      ) : (
                        <button disabled className="flex h-9 w-9 items-center justify-center text-slate-300 dark:text-zinc-700" title="Sin telefono" aria-label="Llamada no disponible">
                          <Phone size={22} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-3 truncate text-xs text-slate-400 dark:text-zinc-500">
                  {client.email || 'Sin email'}
                </p>

              </motion.div>
            );
          })
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">#</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Identificación</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Telefono</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Email</th>
              {isAdmin && <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Oficina</th>}
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-zinc-800/60">
                  {Array.from({ length: isAdmin ? 7 : 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="text-center py-20 text-slate-400">
                  <UserCircle size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No se encontraron clientes</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence mode="popLayout">
                {paginated.map((client, index) => (
                  <motion.tr
                    key={client.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.2 }}
                    className="border-b border-slate-50 dark:border-zinc-800/60 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors"
                  >
                    <td className="px-4 py-3.5 text-xs text-slate-400 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">
                        {client.first_name} {client.second_name} {client.first_lastname} {client.second_lastname}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-zinc-400">
                      <span className="font-mono text-xs bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded">
                        {client.document_type_name} {client.identification}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{formatPhones(client)}</span>
                        <button
                          onClick={() => handleCopyPhone(client)}
                          disabled={!getPrimaryPhone(client)}
                          className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 dark:disabled:text-zinc-700"
                          title="Copiar telefono"
                        >
                          {copiedClientId === client.id ? <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 dark:text-zinc-400">
                      {client.email || <span className="text-slate-400">Sin email aaa</span>}
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-xs font-medium">
                          {client.office_name}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        {getWhatsAppUrl(client) ? (
                          <a
                            href={getWhatsAppUrl(client)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-8 w-8 items-center justify-center text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                            title="Enviar WhatsApp"
                          >
                            <WhatsAppIcon size={17} />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="p-1.5 rounded-lg text-slate-300 dark:text-zinc-700 cursor-not-allowed"
                            title="Sin telefono"
                          >
                            <WhatsAppIcon size={17} />
                          </button>
                        )}
                        <button
                          onClick={() => setEditingClient(client)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setClientToDelete(client)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>

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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {clientToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setClientToDelete(null)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 p-6"
            >
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-center text-slate-900 dark:text-white mb-2">
                ¿Eliminar cliente?
              </h3>
              <p className="text-sm text-center text-slate-500 dark:text-zinc-400 mb-6">
                ¿Estás seguro de eliminar a "{clientToDelete.first_name} {clientToDelete.first_lastname}"? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setClientToDelete(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteClient.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
                >
                  {deleteClient.isPending ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <CreateClientModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <EditClientModal client={editingClient} onClose={() => setEditingClient(null)} />
    </div>
  );
};
