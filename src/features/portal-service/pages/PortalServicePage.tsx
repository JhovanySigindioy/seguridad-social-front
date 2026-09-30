import { useState } from 'react';
import { Check, CreditCard, FileText, LockKeyhole, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useActivatePortalService, usePortalServiceStatus } from '../hooks/usePortalService';

interface Props {
  onOpenAccounts: () => void;
}

export const PortalServicePage = ({ onOpenAccounts }: Props) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { data: service, isLoading } = usePortalServiceStatus();
  const activate = useActivatePortalService();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const features: Array<{ icon: LucideIcon; title: string; text: string }> = [
    { icon: Users, title: 'Cuentas de afiliados', text: 'Crea accesos individuales para que cada afiliado consulte su información.' },
    { icon: FileText, title: 'Documentos disponibles', text: 'Publica soportes autorizados y mantén la información organizada.' },
    { icon: LockKeyhole, title: 'Acceso seguro', text: 'Cada usuario solo consulta sus propios periodos y documentos visibles.' },
  ];

  const activateService = async () => {
    await activate.mutateAsync();
    setConfirmOpen(false);
    setAccepted(false);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,_#013575_0%,_#0b468f_58%,_#244a91_100%)] p-6 text-white shadow-lg shadow-blue-950/10 sm:p-8">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-50"><Sparkles size={13} /> Nuevo servicio</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">Portal de afiliados</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-50/85 sm:text-base">Ofrece a tus afiliados una forma sencilla, segura y disponible en todo momento para consultar sus periodos y documentos.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {isAdmin && !service?.enabled ? <button type="button" onClick={() => setConfirmOpen(true)} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#013575] transition hover:bg-blue-50">Activar portal</button> : null}
            <button type="button" onClick={onOpenAccounts} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/25 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">Gestionar cuentas</button>
          </div>
        </div>
      </section>

      <section className={`rounded-2xl border p-5 ${service?.enabled ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-400">Estado del servicio</p>
            <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{isLoading ? 'Consultando estado...' : service?.enabled ? 'Portal autorizado y activo' : 'Pendiente de autorización administrativa'}</p>
            {service?.enabled ? <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">Autorizado por {service.accepted_by_name || 'el administrador'} el {service.accepted_at ? new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(service.accepted_at)) : '—'}.</p> : <p className="mt-1 text-sm text-slate-600 dark:text-zinc-300">La autorización debe realizarla Angelica Ravelo, administradora de la agencia.</p>}
          </div>
          <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${service?.enabled ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}>{service?.enabled ? 'Activo' : 'Pendiente'}</span>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, text }) => (
          <div key={String(title)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200"><Icon size={19} /></div>
            <h2 className="mt-4 text-base font-black text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Tarifa del servicio</p><p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">$6.000 <span className="text-sm font-semibold text-slate-500">COP / cuenta / mes</span></p><p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">Las cuentas existentes también hacen parte del cobro al activar el servicio.</p></div>
          <CreditCard className="hidden text-indigo-500 sm:block" size={34} />
        </div>
      </section>

      {confirmOpen && isAdmin ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Autorización administrativa</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Activar Portal de afiliados</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-300">Al aceptar se generará un cobro mensual de <strong>$6.000 COP por cada cuenta de afiliado creada</strong>. Este valor incluye las cuentas existentes de la agencia.</p>
            <label className="mt-5 flex items-start gap-3 text-sm text-slate-700 dark:text-zinc-200"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600" /><span>Confirmo que autorizo el costo mensual y el uso del servicio para la agencia.</span></label>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => { setConfirmOpen(false); setAccepted(false); }} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500">Cancelar</button><button type="button" disabled={!accepted || activate.isPending} onClick={activateService} className="inline-flex items-center gap-2 rounded-xl bg-[#013575] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{activate.isPending ? 'Activando...' : <><Check size={16} />Aceptar y activar</>}</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
