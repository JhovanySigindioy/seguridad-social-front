type Status = 'Pendiente' | 'En Proceso' | 'Pagado' | 'Por Confirmar' | 'No Continúa';

const config: Record<Status, { label: string; className: string }> = {
  Pendiente:   { label: 'Pendiente',  className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  'En Proceso':{ label: 'En Proceso', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  Pagado:      { label: 'Pagado',     className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  'Por Confirmar': { label: 'Por Confirmar', className: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400' },
  'No Continúa': { label: 'No Continúa', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export const StatusBadge = ({ status }: { status: Status }) => {
  const { label, className } = config[status] ?? config['Pendiente'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
