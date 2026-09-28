import { ArrowRight, CalendarClock, ChevronDown, FileText, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAffiliateAuthStore } from '../store/useAffiliateAuthStore';
import { useAffiliateAffiliations, useAffiliateDocuments, useAffiliateMe } from '../features/affiliate-portal/hooks/useAffiliatePortal';
import { AffiliatePortalShell } from '../features/affiliate-portal/components/AffiliatePortalShell';
import { AffiliationPeriodRow } from '../features/affiliate-portal/components/AffiliationPeriodRow';
import { formatDate, getAffiliationPeriodLabel, getAffiliationRoute, getDocumentsForAffiliation, getFeaturedAffiliation, getSortedAffiliations } from '../features/affiliate-portal/utils/affiliate-portal.helpers';

export const AffiliatePortalPage = () => {
  const fallbackUser = useAffiliateAuthStore((state) => state.user);
  const { data: me } = useAffiliateMe(true);
  const { data: affiliations, isLoading: loadingAffiliations } = useAffiliateAffiliations(true);
  const { data: documents, isLoading: loadingDocuments } = useAffiliateDocuments(true);

  const user = me || fallbackUser;
  const safeAffiliations = getSortedAffiliations(affiliations || []);
  const safeDocuments = documents || [];
  const featuredAffiliation = getFeaturedAffiliation(safeAffiliations);
  const historyAffiliations = featuredAffiliation
    ? safeAffiliations.filter((item) => item.id !== featuredAffiliation.id)
    : safeAffiliations;
  const featuredDocuments = featuredAffiliation ? getDocumentsForAffiliation(safeDocuments, featuredAffiliation) : [];
  const featuredStatusLabel = featuredAffiliation
    ? featuredAffiliation.decision_status === 'Por Confirmar'
      ? 'Por confirmar'
      : featuredAffiliation.decision_status === 'No Continúa'
        ? 'No continua'
        : featuredAffiliation.status === 'Activo'
          ? 'Vigente'
          : featuredAffiliation.status === 'Inactivo' ? 'Retirada' : 'Vencida'
    : '';

  return (
    <AffiliatePortalShell
      user={user}
      title="Consulte sus periodos de afiliacion"
      description="Revise cada afiliacion de forma independiente, junto con los documentos, pagos y soportes visibles asociados."
      eyebrow="Portal Afiliados"
      hideHero
    >
      {featuredAffiliation ? (
        <section className="overflow-hidden border-b border-slate-200 bg-[linear-gradient(145deg,_#013575_0%,_#0b468f_55%,_#123f85_100%)] text-white dark:border-zinc-800">
          <div className="flex min-h-[calc(100vh-4rem)] flex-col">
            <div className="relative flex flex-1 flex-col px-4 py-5 sm:px-5 sm:py-6 xl:px-8 xl:py-8">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.16),_transparent_24%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.24),_transparent_32%)]" />

              <div className="relative flex flex-1 flex-col">
                <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-3 border-b border-white/12 pb-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white ring-1 ring-white/10">
                      <UserCircle2 size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-black text-white sm:text-base">{user?.name || 'Afiliado'}</p>
                      <p className="text-xs text-blue-100/80">{user?.identification || 'Sin identificacion'}{user?.office_name ? ` · ${user.office_name}` : ''}</p>
                    </div>
                  </div>

                  <div className="">
                    <div className="overflow-hidden border-y border-white/12 bg-white/6 backdrop-blur">
                      <div className="flex flex-col gap-4 px-4 py-3 sm:flex-row sm:items-end sm:justify-between sm:px-5">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100/72">Periodo principal</p>
                          <p className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">{getAffiliationPeriodLabel(featuredAffiliation)}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="h-10 w-px bg-white/12 sm:h-12" />
                          <span className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] ${featuredAffiliation.status === 'Activo' && featuredAffiliation.decision_status === 'Confirmada' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}>
                            {featuredStatusLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden border-y border-white/12 lg:mt-10">
                  <div className="grid sm:grid-cols-3">
                    {[
                      { label: 'Cobertura', value: `${formatDate(featuredAffiliation.start_date)} - ${featuredAffiliation.end_date ? formatDate(featuredAffiliation.end_date) : 'Activa'}`, icon: CalendarClock },
                      { label: 'Estado de pago', value: featuredAffiliation.payment_status, icon: ShieldCheck },
                      { label: 'Archivos visibles', value: `${featuredDocuments.length}`, icon: FileText },
                    ].map(({ label, value, icon: Icon }, index) => (
                      <div key={label} className={`flex items-start justify-between gap-4 px-0 py-4 ${index < 2 ? 'border-b border-white/10 sm:border-b-0 sm:border-r sm:pr-5' : ''} ${index > 0 ? 'sm:pl-5' : ''}`}>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/70">{label}</p>
                          <p className="mt-2 text-base font-black text-white">{value}</p>
                        </div>
                        <Icon size={18} className="mt-1 text-blue-100/70" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <Link
                      to={getAffiliationRoute(featuredAffiliation)}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-[#013575] transition hover:bg-blue-50"
                    >
                      Ver detalles <ArrowRight size={16} />
                    </Link>
                    <a
                      href="#historial-afiliaciones"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/18 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                      Ver historial <ChevronDown size={16} />
                    </a>
                  </div>

                <div className="mt-6 flex items-center gap-3 text-sm text-blue-100/78">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/18">
                    <ChevronDown size={16} />
                  </span>
                  <p>Deslice para ver el historial.</p>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>
      ) : null}

        <section id="historial-afiliaciones" className="overflow-hidden border-y border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Historial de afiliaciones</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Ultimos {historyAffiliations.length} periodos registrados</p>
            </div>
          </div>
        </div>

        {loadingAffiliations || loadingDocuments ? (
          <div className="divide-y divide-slate-200 dark:divide-zinc-800">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="px-4 py-5 sm:px-5">
                <div className="h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-zinc-900" />
              </div>
            ))}
          </div>
        ) : historyAffiliations.length > 0 ? (
          <div>
            {historyAffiliations.map((affiliation) => (
              <AffiliationPeriodRow
                key={`${affiliation.id}-${affiliation.month}-${affiliation.year}`}
                affiliation={affiliation}
                documentCount={getDocumentsForAffiliation(safeDocuments, affiliation).length}
              />
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-slate-500 dark:text-zinc-400">
            {featuredAffiliation ? 'No hay mas periodos historicos para esta cuenta.' : 'Aun no encontramos afiliaciones visibles para esta cuenta.'}
          </div>
        )}
      </section>
    </AffiliatePortalShell>
  );
};
