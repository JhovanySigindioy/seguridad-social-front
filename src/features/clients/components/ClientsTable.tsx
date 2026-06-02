import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, Pencil, Trash2, AlertCircle, UserCircle } from 'lucide-react';
import { useClients, useDeleteClient } from '../hooks/useClients';
import type { Client } from '../types/client.types';
import { CreateClientModal } from './CreateClientModal';
import { EditClientModal } from './EditClientModal';
import { useAuthStore } from '../../../store/useAuthStore';

export const ClientsTable = () => {
  const { data: clients, isLoading, isError, refetch, isFetching } = useClients();
  const deleteClient = useDeleteClient();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
      const fullName = `${c.first_name} ${c.second_name || ''} ${c.first_lastname} ${c.second_lastname || ''}`.replace(/\s+/g, ' ').toLowerCase();
      const matchSearch =
        fullName.includes(search.toLowerCase()) ||
        c.identification.includes(search) ||
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

      <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Identificación</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Email</th>
              {isAdmin && <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Oficina</th>}
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-zinc-800/60">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3.5">
                      <div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded-full animate-pulse" style={{ width: `${60 + Math.random() * 40}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-20 text-slate-400">
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
                      {client.email || <span className="text-slate-400">Sin email</span>}
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
