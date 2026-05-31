import { Calendar } from 'lucide-react';

const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface MonthYearSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export const MonthYearSelector = ({ month, year, onChange }: MonthYearSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-800 rounded-xl px-4 py-2 shadow-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
      <Calendar size={18} className="text-indigo-600 dark:text-indigo-400" />
      <select
        value={month}
        onChange={(e) => onChange(Number(e.target.value), year)}
        className="bg-transparent text-sm font-bold text-indigo-900 dark:text-indigo-300 focus:outline-none appearance-none pr-3 cursor-pointer"
        style={{ backgroundImage: 'none' }}
      >
        {monthNames.map((m, i) => (
          <option key={i} value={i + 1} className="text-slate-800 dark:text-slate-200 bg-white dark:bg-zinc-800">{m}</option>
        ))}
      </select>
      <span className="text-indigo-300 dark:text-indigo-700/50">|</span>
      <select
        value={year}
        onChange={(e) => onChange(month, Number(e.target.value))}
        className="bg-transparent text-sm font-bold text-indigo-900 dark:text-indigo-300 focus:outline-none appearance-none cursor-pointer"
        style={{ backgroundImage: 'none' }}
      >
        {years.map(y => (
          <option key={y} value={y} className="text-slate-800 dark:text-slate-200 bg-white dark:bg-zinc-800">{y}</option>
        ))}
      </select>
    </div>
  );
};
