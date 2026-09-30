import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, FileText, LockKeyhole, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';
import { useActivatePortalService, usePortalServiceStatus } from '../hooks/usePortalService';

interface Props {
  onOpenAccounts: () => void;
}

const features: Array<{ icon: LucideIcon; title: string; text: string }> = [
  {
    icon: Users,
    title: 'Acceso individual',
    text: 'Cada afiliado tendrá su propia cuenta para consultar únicamente su información.',
  },
  {
    icon: FileText,
    title: 'Documentos siempre disponibles',
    text: 'Publica los documentos autorizados para que tus afiliados puedan consultarlos cuando los necesiten.',
  },
  {
    icon: LockKeyhole,
    title: 'Información segura y organizada',
    text: 'Cada usuario accede únicamente a sus períodos y documentos habilitados por tu agencia.',
  },
];

export const PortalServicePage = ({ onOpenAccounts }: Props) => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { data: service, isLoading } = usePortalServiceStatus();
  const activate = useActivatePortalService();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const isActive = service?.status === 'active';
  const isSuspended = service?.status === 'suspended';
  const servicePrice = Number(service?.monthly_price || 6000).toLocaleString('es-CO');

  const activateService = async () => {
    await activate.mutateAsync();
    setConfirmOpen(false);
    setAccepted(false);
  };

  const openActivation = () => {
    if (isAdmin) {
      setConfirmOpen(true);
      return;
    }

    setInfoOpen(true);
  };

  return (
    <div className="w-full space-y-0">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="relative -mx-4 overflow-hidden bg-[#013575] text-white shadow-lg shadow-blue-950/10 lg:-mx-8 lg:-my-8">
        <img src="/img/ventas2.png" alt="Construvida AYJ, cada día más cerca de sus usuarios" className="h-56 w-full object-cover object-[42%_center] sm:h-72 lg:h-auto lg:object-contain lg:object-center" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 bg-gradient-to-t from-[#013575]/95 via-[#013575]/80 to-transparent px-4 pb-4 pt-14 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:pb-6">
          <div><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur"><Sparkles size={12} /> Nuevo servicio</span><p className="mt-2 max-w-xl text-sm font-semibold text-blue-50/90">Dale a tus afiliados acceso a su información 24/7.</p></div>
          {isActive ? (
            <button type="button" onClick={onOpenAccounts} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#013575] transition hover:bg-blue-50">Gestionar cuentas <ArrowRight size={15} /></button>
          ) : (
            <button type="button" onClick={openActivation} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#013575] transition hover:bg-blue-50">Solicitar activación <ArrowRight size={15} /></button>
          )}
        </div>
      </motion.section>

      <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="grid gap-8 border-y border-slate-200 py-8 dark:border-zinc-800 md:grid-cols-3 md:gap-0">
        {features.map(({ icon: Icon, title, text }, index) => (
          <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.3, delay: index * 0.07, ease: 'easeOut' }} className={`px-1 sm:px-5 ${index > 0 ? 'md:border-l md:border-slate-200 dark:md:border-zinc-800' : ''}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200"><Icon size={20} /></div>
            <h2 className="mt-4 text-base font-black text-slate-900 dark:text-white lg:text-sm">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">{text}</p>
          </motion.article>
        ))}
      </section>

      <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm dark:border-indigo-950/60 dark:bg-zinc-900 sm:p-5 lg:p-5">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Tarifa del servicio</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white lg:text-lg">Un servicio adicional para tu agencia</h2>
            <p className="mt-3 text-3xl font-black text-[#013575] dark:text-indigo-200 lg:text-2xl">${servicePrice} <span className="text-sm font-semibold text-slate-500 dark:text-zinc-400">COP / cuenta / mes</span></p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">Al activar el servicio, la tarifa aplica a las cuentas de afiliados habilitadas en el portal.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            {isActive ? <button type="button" onClick={onOpenAccounts} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#013575] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0a4089]">Gestionar cuentas <ArrowRight size={16} /></button> : <button type="button" onClick={openActivation} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#013575] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0a4089]">Solicitar activación <ArrowRight size={16} /></button>}
          </div>
        </div>
      </motion.section>

      {!isLoading && (
        <motion.section initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.3, ease: 'easeOut' }} className={`rounded-2xl border p-3 sm:p-4 ${isActive ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/20' : isSuspended ? 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20' : 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-zinc-400">Estado del servicio</p>
              <h2 className="mt-1 text-base font-black text-slate-900 dark:text-white">{isActive ? 'Servicio activo' : isSuspended ? 'Servicio suspendido' : 'Servicio disponible para activación'}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-zinc-300">{isActive ? `Autorizado por ${service?.accepted_by_name || 'el administrador'}${service?.accepted_at ? ` el ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(service.accepted_at))}` : ''}.` : isSuspended ? 'El servicio no está disponible en este momento. Contacta al administrador de la agencia.' : 'La activación se completará cuando el administrador autorice el servicio para la agencia.'}</p>
            </div>
            <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${isActive ? 'bg-emerald-400 text-emerald-950' : isSuspended ? 'bg-red-400 text-red-950' : 'bg-amber-300 text-amber-950'}`}>{isActive ? 'Activo' : isSuspended ? 'Suspendido' : 'Pendiente'}</span>
          </div>
        </motion.section>
      )}
      </div>

      <footer className="-mx-4 w-auto bg-[#013575] px-4 py-9 text-white sm:-mx-4 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/75">Portal de afiliados</p><h2 className="mt-1 text-xl font-black">Más autonomía para tus afiliados.</h2><p className="mt-1 text-sm text-blue-100/80">Una experiencia digital simple, segura y disponible cuando la necesiten.</p></div>
          {isActive ? <button type="button" onClick={onOpenAccounts} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#013575] transition hover:bg-blue-50">Gestionar cuentas <ArrowRight size={16} /></button> : <button type="button" onClick={openActivation} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#013575] transition hover:bg-blue-50">Solicitar activación <ArrowRight size={16} /></button>}
        </div>
      </footer>

      {confirmOpen && isAdmin ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Autorización administrativa</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Activar Portal de afiliados</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-300">Al aceptar se generará un cobro mensual de <strong>$6.000 COP por cada cuenta de afiliado creada</strong>. Este valor aplica a las cuentas habilitadas en el portal.</p>
            <label className="mt-5 flex items-start gap-3 text-sm text-slate-700 dark:text-zinc-200"><input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600" /><span>Confirmo que autorizo el costo mensual y el uso del servicio para la agencia.</span></label>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => { setConfirmOpen(false); setAccepted(false); }} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500">Cancelar</button><button type="button" disabled={!accepted || activate.isPending} onClick={activateService} className="inline-flex items-center gap-2 rounded-xl bg-[#013575] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{activate.isPending ? 'Activando...' : <><Check size={16} />Aceptar y activar</>}</button></div>
          </div>
        </div>
      ) : null}

      {infoOpen && !isAdmin ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-500">Solicitud de activación</p>
            <h2 className="mt-2 text-xl font-black text-slate-900 dark:text-white">Un administrador debe autorizar el servicio</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-300">El Portal de afiliados está listo para tu agencia. La autorización debe realizarla el administrador responsable antes de crear cuentas o publicar documentos.</p>
            <div className="mt-5 flex justify-end"><button type="button" onClick={() => setInfoOpen(false)} className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">Cerrar</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
