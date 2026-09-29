import { ArrowRight, CheckCircle2, Clock3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAffiliateAuthStore } from '../store/useAffiliateAuthStore';
import { useAffiliateAffiliations, useAffiliateDocuments, useAffiliateMe } from '../features/affiliate-portal/hooks/useAffiliatePortal';
import { AffiliatePortalShell } from '../features/affiliate-portal/components/AffiliatePortalShell';
import { AffiliationPeriodRow } from '../features/affiliate-portal/components/AffiliationPeriodRow';
import {
  formatDate,
  formatMoney,
  getAffiliationPeriodLabel,
  getAffiliationRoute,
  getDocumentsForAffiliation,
  getFeaturedAffiliation,
  getSortedAffiliations,
} from '../features/affiliate-portal/utils/affiliate-portal.helpers';

const paymentTone = (status?: string | null) => {
  if (status === 'Pagado') return 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/50';
  if (status === 'En Proceso') return 'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/50';
  return 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/50';
};

export const AffiliatePortalPage = () => {
  const location = useLocation();
  const showHistory = location.pathname === '/portal/historial';
  const fallbackUser = useAffiliateAuthStore((state) => state.user);
  const { data: me } = useAffiliateMe(true);
  const { data: affiliations, isLoading: loadingAffiliations } = useAffiliateAffiliations(true);
  const { data: documents, isLoading: loadingDocuments } = useAffiliateDocuments(true);

  const user = me || fallbackUser;
  const visibleAffiliations = getSortedAffiliations(
    (affiliations || []).filter((item) => item.decision_status === 'Confirmada')
  );
  const safeDocuments = documents || [];
  const featuredAffiliation = getFeaturedAffiliation(visibleAffiliations);
  const historyAffiliations = featuredAffiliation
    ? visibleAffiliations.filter((item) => item.id !== featuredAffiliation.id)
    : visibleAffiliations;
  const featuredDocuments = featuredAffiliation ? getDocumentsForAffiliation(safeDocuments, featuredAffiliation) : [];
  const isLoading = loadingAffiliations || loadingDocuments;
  const featuredIsActive = featuredAffiliation?.status === 'Activo';

  return (
    <AffiliatePortalShell
      user={user}
      title={showHistory ? 'Historial de afiliaciones' : 'Tus afiliaciones'}
      description={showHistory ? 'Consulta tus periodos confirmados y los documentos asociados.' : 'Consulta tu cobertura, pagos y documentos desde un solo lugar.'}
      eyebrow="Resumen de cuenta"
      hideHero
    >
      <div className="mx-auto w-full max-w-6xl px-0 pb-5 sm:px-6 sm:py-8 lg:px-8 lg:py-6">
        {!showHistory && <>
        <div className="flex flex-col overflow-hidden bg-white dark:bg-zinc-900 lg:mx-auto lg:min-h-0 lg:max-w-6xl lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:lg:border-zinc-800 dark:lg:shadow-none">
        <div className="border-b border-white/10 bg-[linear-gradient(135deg,_#013575_0%,_#0b468f_100%)] px-4 py-3.5 text-white sm:px-7 sm:py-5 lg:flex lg:items-center lg:justify-between lg:px-8 lg:py-5">
          <div>
            <p className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-3xl">Hola, {user?.name || 'afiliado'}</p>
            <h1 className="mt-1 text-sm font-semibold text-blue-100/85 sm:text-base lg:text-sm">Resumen de su protección</h1>
          </div>
          <p className="mt-2 text-xs font-medium text-blue-100/75 lg:mt-0 lg:text-xs">{visibleAffiliations.length} periodo{visibleAffiliations.length !== 1 ? 's' : ''} confirmado{visibleAffiliations.length !== 1 ? 's' : ''}</p>
        </div>

        {isLoading ? (
          <div className="space-y-4" aria-label="Cargando información">
            <div className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-zinc-900" />
            <div className="h-32 animate-pulse rounded-3xl bg-slate-100 dark:bg-zinc-900" />
          </div>
        ) : featuredAffiliation ? (
          <>
            <section className="flex flex-1 flex-col overflow-hidden bg-white dark:bg-zinc-900 lg:flex-none">
              <div className="border-b border-slate-200 bg-white px-4 py-4 text-slate-900 sm:px-7 sm:py-6 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white lg:px-8 lg:py-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between lg:items-center">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Estado actual</p>
                    <h2 className="mt-1.5 text-xl font-black sm:text-3xl lg:text-2xl">{getAffiliationPeriodLabel(featuredAffiliation)}</h2>
                    <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 sm:text-sm">{featuredIsActive ? 'Tu afiliación se encuentra vigente.' : 'Este es tu periodo confirmado más reciente.'}</p>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-2 text-xs font-black uppercase tracking-wider ${featuredIsActive ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}>
                    <CheckCircle2 size={15} /> {featuredIsActive ? 'Vigente' : 'Vencida'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-slate-100 lg:grid-cols-4 dark:bg-zinc-800 lg:border-x lg:border-slate-100 dark:lg:border-zinc-800">
                <div className="bg-white px-3 py-3 dark:bg-zinc-900 sm:px-5 sm:py-4 lg:px-4 lg:py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-[11px]">Cobertura</p><p className="mt-1 text-xs font-bold text-slate-900 dark:text-white sm:mt-2 sm:text-sm lg:text-xs">{formatDate(featuredAffiliation.start_date)}</p><p className="text-[11px] text-slate-500 sm:text-xs lg:text-[11px]">hasta {formatDate(featuredAffiliation.end_date)}</p></div>
                <div className="bg-white px-3 py-3 dark:bg-zinc-900 sm:px-5 sm:py-4 lg:px-4 lg:py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-[11px]">Estado del pago</p><span className={`mt-1 inline-flex rounded-full px-2 py-1 text-[11px] font-bold ring-1 sm:mt-2 sm:px-2.5 sm:text-xs lg:text-[11px] ${paymentTone(featuredAffiliation.payment_status)}`}>{featuredAffiliation.payment_status}</span></div>
                <div className="bg-white px-3 py-3 dark:bg-zinc-900 sm:px-5 sm:py-4 lg:px-4 lg:py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-[11px]">Valor del periodo</p><p className="mt-1 text-base font-black text-slate-900 dark:text-white sm:mt-2 sm:text-lg lg:text-base">{formatMoney(Number(featuredAffiliation.value || 0))}</p></div>
                <div className="bg-white px-3 py-3 dark:bg-zinc-900 sm:px-5 sm:py-4 lg:px-4 lg:py-3"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs lg:text-[11px]">Documentos</p><p className="mt-1 text-base font-black text-slate-900 dark:text-white sm:mt-2 sm:text-lg lg:text-base">{featuredDocuments.length}</p><p className="text-[11px] text-slate-500 sm:text-xs lg:text-[11px]">archivo{featuredDocuments.length !== 1 ? 's' : ''} visible{featuredDocuments.length !== 1 ? 's' : ''}</p></div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 px-4 py-3 dark:border-zinc-800 sm:gap-3 sm:px-7 sm:py-4 lg:px-8 lg:py-4">
                <Link to={getAffiliationRoute(featuredAffiliation)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#013575] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#0a4089] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 sm:text-sm lg:w-fit lg:min-w-[230px]"><span>Ver detalles y documentos</span><ArrowRight size={15} /></Link>
              </div>
            </section>

          </>
        ) : (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center dark:border-amber-900/40 dark:bg-amber-950/20"><Clock3 className="mx-auto text-amber-600" size={28} /><h2 className="mt-3 font-black text-slate-900 dark:text-white">Aún no hay periodos confirmados</h2><p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">Cuando tu afiliación sea confirmada, podrás consultar aquí tus pagos y documentos.</p></div>
        )}
        </div>
        </>}

        {showHistory && <section id="historial-afiliaciones" className="overflow-hidden bg-white dark:bg-zinc-900 lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:lg:border-zinc-800 dark:lg:shadow-none">
           <div className="border-b border-white/10 bg-[linear-gradient(135deg,_#013575_0%,_#0b468f_100%)] px-4 py-4 text-white sm:px-6 sm:py-5"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/75">Historial</p><div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"><h2 className="text-xl font-black">Tus periodos confirmados</h2><p className="text-sm text-blue-100/85">{historyAffiliations.length} periodo{historyAffiliations.length !== 1 ? 's' : ''} anterior{historyAffiliations.length !== 1 ? 'es' : ''}</p></div></div>
          {historyAffiliations.length > 0 ? <div>{historyAffiliations.map((affiliation) => <AffiliationPeriodRow key={`${affiliation.id}-${affiliation.month}-${affiliation.year}`} affiliation={affiliation} documentCount={getDocumentsForAffiliation(safeDocuments, affiliation).length} />)}</div> : <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-zinc-400">No hay otros periodos confirmados para esta cuenta.</div>}
        </section>}
      </div>
    </AffiliatePortalShell>
  );
};
