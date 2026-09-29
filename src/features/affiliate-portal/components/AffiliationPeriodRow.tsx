import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { AffiliationItem } from '../../affiliations/types/affiliation.types';
import { formatDate, formatMoney, getAffiliationPeriodTitle, getAffiliationRoute, getVisibleServices } from '../utils/affiliate-portal.helpers';

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

  const isPaid = affiliation.payment_status === 'Pagado';

  return (
    <article className="border-b border-slate-200 last:border-b-0 dark:border-zinc-800">
      <Link
        to={getAffiliationRoute(affiliation)}
        className="group block bg-white transition hover:bg-slate-50/70 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
      >
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Periodo confirmado</p>
            <h3 className="mt-1 text-xl font-black text-slate-900 dark:text-white">{getAffiliationPeriodTitle(affiliation)}</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Oficina {affiliation.office_name} · {formatMoney(Number(affiliation.value))}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${affiliation.status === 'Activo' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}>{statusLabel}</span>
            <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${isPaid ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>Pago: {affiliation.payment_status}</span>
          </div>
        </div>

        <div className="border-y border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400 sm:px-6">
          <span className="font-semibold text-slate-900 dark:text-white">Entidades:</span> {getVisibleServices(affiliation)}
        </div>

        <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-zinc-800 sm:grid-cols-4">
          {[
            ['Cobertura', `${formatDate(affiliation.start_date)} - ${affiliation.end_date ? formatDate(affiliation.end_date) : 'Activa'}`],
            ['Archivos', `${documentCount}`],
            ['Valor del periodo', formatMoney(Number(affiliation.value))],
            ['Oficina', affiliation.office_name],
          ].map(([label, value]) => (
            <div key={label} className="bg-white px-4 py-3 dark:bg-zinc-900 sm:px-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 dark:text-zinc-500">{label}</p>
              <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">{value}</p>
            </div>
          ))}
        </div>

        <div className="px-4 py-3 sm:px-6">
          <div className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#013575] px-4 py-2.5 text-xs font-bold text-white transition group-hover:bg-[#0a4089] sm:w-fit sm:min-w-[230px] sm:text-sm">
            <span>Ver detalles y documentos</span>
            <ChevronRight size={16} />
          </div>
        </div>
      </Link>
    </article>
  );
};
