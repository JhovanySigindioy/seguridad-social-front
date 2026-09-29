import { useMemo, useState } from 'react';
import { Check, Copy, KeyRound, Loader2, Search, ShieldCheck, X } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useOffices } from '../../offices/hooks/useOffices';
import { useAffiliateAccounts, useCreateAffiliateAccount, useResetAffiliateAccountPassword } from '../hooks/useAffiliateAccounts';
import type { AffiliateAccountRow } from '../types/affiliate-account.types';

const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatDate = (value?: string | null) => value
  ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(value))
  : 'Sin registro';

const statusLabel = (status?: string | null) => ({
  active: 'Activa',
  blocked: 'Bloqueada',
  disabled: 'Deshabilitada',
  invited: 'Invitada',
}[status || ''] || 'Sin cuenta');

export const AffiliateAccountsPage = () => {
  const { user } = useAuthStore();
  const { offices } = useOffices();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [officeId, setOfficeId] = useState<number | undefined>();
  const [status, setStatus] = useState('all');
  const [selectedClient, setSelectedClient] = useState<AffiliateAccountRow | null>(null);
  const [email, setEmail] = useState('');
  const [credentials, setCredentials] = useState<{ email: string; password: string; clientName: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filters = useMemo(() => ({ officeId, search, status, paidOnly: true }), [officeId, search, status]);
  const { data: accounts = [], isLoading, isError, refetch } = useAffiliateAccounts(filters);
  const createAccount = useCreateAffiliateAccount();
  const resetPassword = useResetAffiliateAccountPassword();

  const summary = useMemo(() => ({
    total: accounts.length,
    active: accounts.filter(item => item.account_status === 'active').length,
    pending: accounts.filter(item => !item.account_id).length,
    blocked: accounts.filter(item => item.account_status === 'blocked').length,
  }), [accounts]);

  const openCreate = (item: AffiliateAccountRow) => {
    setSelectedClient(item);
    setEmail(item.client_email || '');
  };

  const handleCreate = async () => {
    if (!selectedClient) return;
    try {
      const result = await createAccount.mutateAsync({
        clientId: selectedClient.client_id,
        email: email.trim() || undefined,
      });
      setSelectedClient(null);
      setEmail('');
      setCredentials({ email: result.email, password: result.temporary_password, clientName: selectedClient.client_name });
    } catch {
      // The global API interceptor displays the server error.
    }
  };

  const handleResetPassword = async (item: AffiliateAccountRow) => {
    if (!item.account_id || !window.confirm(`¿Regenerar la contraseña de ${item.client_name}? La contraseña anterior dejará de funcionar.`)) return;
    try {
      const result = await resetPassword.mutateAsync(item.account_id);
      setCredentials({ email: result.email, password: result.temporary_password, clientName: item.client_name });
    } catch {
      // The global API interceptor displays the server error.
    }
  };

  const copy = async (value: string, label: string) => {
    await navigator.clipboard?.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">Clientes</p>
        <h1 className="mt-1 text-2xl font-black text-slate-900 dark:text-white">Accesos al portal</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Crea y consulta las cuentas que permiten a cada afiliado revisar sus periodos y documentos.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Clientes elegibles', summary.total, 'text-indigo-600'],
          ['Cuentas activas', summary.active, 'text-emerald-600'],
          ['Sin cuenta', summary.pending, 'text-amber-600'],
          ['Bloqueadas', summary.blocked, 'text-red-600'],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">{label}</p>
            <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nombre, identificación o correo..." className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" />
        </div>
        {isAdmin && (
          <select value={officeId || ''} onChange={event => setOfficeId(event.target.value ? Number(event.target.value) : undefined)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
            <option value="">Todas las oficinas</option>
            {offices.map(office => <option key={office.id} value={office.id}>{office.name}</option>)}
          </select>
        )}
        <select value={status} onChange={event => setStatus(event.target.value)} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
          <option value="all">Todos los estados</option>
          <option value="none">Sin cuenta</option>
          <option value="active">Activa</option>
          <option value="blocked">Bloqueada</option>
        </select>
      </div>

      {isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">No se pudieron cargar los accesos. <button onClick={() => refetch()} className="font-bold underline">Reintentar</button></div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-zinc-800 dark:bg-zinc-800/50 dark:text-zinc-400">
              <th className="px-4 py-3">Cliente</th><th className="px-4 py-3">Oficina</th><th className="px-4 py-3">Ultimo pago</th><th className="px-4 py-3">Cuenta</th><th className="px-4 py-3">Creada por</th><th className="px-4 py-3">Accion</th>
            </tr></thead>
            <tbody>
              {isLoading ? <tr><td colSpan={6} className="p-10 text-center text-slate-400">Cargando accesos...</td></tr> : accounts.map(item => (
                <tr key={item.client_id} className="border-b border-slate-100 last:border-0 dark:border-zinc-800">
                  <td className="px-4 py-4"><p className="font-bold text-slate-800 dark:text-white">{item.client_name}</p><p className="text-xs text-slate-500">{item.identification}</p></td>
                  <td className="px-4 py-4 text-slate-600 dark:text-zinc-300">{item.office_name}</td>
                  <td className="px-4 py-4">{item.last_paid_month && item.last_paid_year ? <><p className="font-semibold text-emerald-600">{months[item.last_paid_month - 1]} {item.last_paid_year}</p><p className="text-xs text-slate-400">{item.confirmed_affiliation_count} periodo(s) confirmado(s)</p></> : <span className="text-slate-400">Sin pago</span>}</td>
                  <td className="px-4 py-4">{item.account_id ? <><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.account_status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{statusLabel(item.account_status)}</span><p className="mt-1 text-xs text-slate-500">{item.account_email}</p></> : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">Sin cuenta</span>}</td>
                  <td className="px-4 py-4 text-slate-500">{item.created_by_name || 'Pendiente'}</td>
                  <td className="px-4 py-4">{!item.account_id && item.eligible && user?.role !== 'viewer' ? <button onClick={() => openCreate(item)} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700"><KeyRound size={14} />Crear acceso</button> : item.account_id && user?.role !== 'viewer' ? <button onClick={() => handleResetPassword(item)} disabled={resetPassword.isPending} className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 disabled:opacity-60 dark:border-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-950/30"><KeyRound size={14} />Regenerar contraseña</button> : item.account_id ? <span className="text-xs text-slate-400">Creada {formatDate(item.account_created_at)}</span> : <span className="text-xs text-slate-400">No elegible</span>}</td>
                </tr>
              ))}
              {!isLoading && accounts.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-slate-400">No hay clientes que coincidan con los filtros.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-indigo-500">Nuevo acceso</p><h2 className="mt-1 text-xl font-black dark:text-white">{selectedClient.client_name}</h2><p className="text-sm text-slate-500">{selectedClient.identification} · {selectedClient.office_name}</p></div><button onClick={() => setSelectedClient(null)}><X className="text-slate-400" /></button></div>
            <label className="mt-5 block text-xs font-bold text-slate-500">Correo de acceso<input value={email} onChange={event => setEmail(event.target.value)} type="email" placeholder="Si lo dejas vacío se generará uno" className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" /></label>
            <div className="mt-4 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-800"><ShieldCheck size={16} className="mb-1" />La contraseña será generada de forma segura y se mostrará una sola vez.</div>
            <div className="mt-5 flex justify-end gap-2"><button onClick={() => setSelectedClient(null)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500">Cancelar</button><button onClick={handleCreate} disabled={createAccount.isPending} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">{createAccount.isPending && <Loader2 size={16} className="animate-spin" />}Crear cuenta</button></div>
          </div>
        </div>
      )}

      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900"><div className="flex items-center gap-3 text-emerald-600"><Check /><h2 className="text-xl font-black">Cuenta creada</h2></div><p className="mt-2 text-sm text-slate-500">Entrega estas credenciales a {credentials.clientName}. La contraseña no volverá a mostrarse.</p><div className="mt-5 space-y-3"><div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-zinc-800"><div><p className="text-xs text-slate-400">Correo</p><p className="font-bold dark:text-white">{credentials.email}</p></div><button onClick={() => copy(credentials.email, 'email')}><Copy size={17} className={copied === 'email' ? 'text-emerald-600' : 'text-slate-400'} /></button></div><div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-zinc-800"><div><p className="text-xs text-slate-400">Contraseña temporal</p><p className="font-bold dark:text-white">{credentials.password}</p></div><button onClick={() => copy(credentials.password, 'password')}><Copy size={17} className={copied === 'password' ? 'text-emerald-600' : 'text-slate-400'} /></button></div></div><button onClick={() => setCredentials(null)} className="mt-5 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white">Cerrar</button></div></div>
      )}
    </div>
  );
};
