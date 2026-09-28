import { CalendarRange, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AffiliationItem } from '../../affiliations/types/affiliation.types';
import { formatMoney, getAffiliationPeriodTitle, getAffiliationRoute, getVisibleServices } from '../utils/affiliate-portal.helpers';

interface Props {
  affiliation: AffiliationItem;
  documentCount: number;
}

export const AffiliationPeriodRow = ({ affiliation, documentCount }: Props) => {
  const statusLabel = affiliation.decision_status === 'Por Confirmar'
    ? 'Por confirmar'
    : affiliation.decision_status === 'No Continúa'
      ? 'No continua'
      : affiliation.status === 'Activo' ? 'Vigente' : affiliation.status === 'Inactivo' ? 'Retirada' : 'Vencida';

  return (
    <article className="border-b border-slate-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
      <Link
        to={getAffiliationRoute(affiliation)}
        className="group block rounded-xl border border-slate-200 bg-white p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition hover:border-[#013575] dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[#013575] dark:bg-zinc-900 dark:text-indigo-200">
              <CalendarRange size={18} />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{getAffiliationPeriodTitle(affiliation)}</h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400">Oficina {affiliation.office_name} - Aporte {formatMoney(Number(affiliation.value))}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900">
            <CheckCircle2 size={16} className={affiliation.payment_status === 'Pagado' ? 'text-emerald-600' : 'text-amber-500'} />
            <span className="text-sm font-medium text-slate-900 dark:text-white">{statusLabel} - {affiliation.payment_status}</span>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400">
          <span className="font-semibold text-slate-900 dark:text-white">Entidades:</span> {getVisibleServices(affiliation)}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-500">
            {documentCount} archivo{documentCount !== 1 ? 's' : ''}
          </div>

          <div className="inline-flex min-h-12 w-full items-center justify-between gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-[#013575] transition group-hover:border-[#013575] sm:w-auto dark:border-zinc-700 dark:text-indigo-200">
            <span>Ver detalle y descargar archivos</span>
            <ChevronRight size={18} />
          </div>
        </div>
      </Link>
    </article>
  );
};
