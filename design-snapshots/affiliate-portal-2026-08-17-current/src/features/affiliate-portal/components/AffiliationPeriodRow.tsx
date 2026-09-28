// @ts-nocheck
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AffiliationItem } from '../../affiliations/types/affiliation.types';
import { formatDate, formatMoney, getAffiliationPeriodLabel, getAffiliationRoute, getVisibleServices } from '../utils/affiliate-portal.helpers';

interface Props {
  affiliation: AffiliationItem;
  documentCount: number;
}

export const AffiliationPeriodRow = ({ affiliation, documentCount }: Props) => {
  return (
    <Link
      to={getAffiliationRoute(affiliation.id)}
      className="group block border-b border-slate-200 px-4 py-4 transition hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-900/50 sm:px-5"
    >
      <div className="grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)_220px_44px] lg:items-center lg:gap-5">
        <div className="flex items-start gap-3">
          <div className={`mt-1 h-3 w-3 rounded-full ${affiliation.status === 'Activo' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-zinc-700'}`} />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400 dark:text-zinc-500">Periodo</p>
            <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{getAffiliationPeriodLabel(affiliation)}</p>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${affiliation.status === 'Inactivo' ? 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200'}`}>
              {affiliation.status}
            </span>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200">
              Pago {affiliation.payment_status}
            </span>
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{formatDate(affiliation.start_date)} - {affiliation.end_date ? formatDate(affiliation.end_date) : 'Activa'}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-300">{getVisibleServices(affiliation)}</p>
        </div>

        <div className="flex items-center justify-between gap-4 lg:justify-end">
          <div className="grid grid-cols-2 gap-3 text-left sm:min-w-[240px]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Valor</p>
              <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{formatMoney(Number(affiliation.value))}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Archivos</p>
              <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">{documentCount}</p>
            </div>
          </div>

        </div>

        <div className="flex items-center justify-end">
          <div className="rounded-full bg-slate-100 p-2 text-slate-500 transition group-hover:bg-indigo-50 group-hover:text-[#013575] dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:bg-indigo-950/40 dark:group-hover:text-indigo-200">
            <ChevronRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
};
