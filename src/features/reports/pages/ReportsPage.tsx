import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, DollarSign, Users, 
  Building2, PieChart, ArrowUpRight, ArrowDownRight,
  AlertTriangle, CheckCircle2, Clock, Target
} from 'lucide-react';
import { useAffiliations } from '../../affiliations/hooks/useAffiliations';
import { useOffices } from '../../offices/hooks/useOffices';
import { useDashboardStats } from '../../../hooks/useDashboardStats';
import { MonthYearSelector } from '../../../components/MonthYearSelector';

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

interface KpiCardProps {
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: number;
  icon: any;
  bg: string;
  iconColor: string;
  delay: number;
}

const KpiCard = ({ label, value, subvalue, trend, icon: Icon, bg, iconColor, delay }: KpiCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 220, damping: 20 }}
    className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
        <motion.p 
          key={value}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="text-2xl font-extrabold text-slate-900 dark:text-white"
        >
          {value}
        </motion.p>
        {subvalue && <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">{subvalue}</p>}
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-2 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
        {trend >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        <span className="text-xs font-semibold">{Math.abs(trend)}% vs mes anterior</span>
      </div>
    )}
  </motion.div>
);

interface BarChartProps {
  data: { label: string; value: number; value2?: number }[];
  labels?: [string, string];
}

const SimpleBarChart = ({ data, labels }: BarChartProps) => {
  const max = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)), 1);
  
  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-zinc-400 w-12 text-right">{d.label}</span>
          <div className="flex-1 relative h-8 bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-indigo-500 rounded-lg transition-all"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
            {d.value2 !== undefined && (
              <div 
                className="absolute top-0 h-full bg-indigo-300 dark:bg-indigo-700 rounded-lg transition-all opacity-50"
                style={{ width: `${(d.value2 / max) * 100}%` }}
              />
            )}
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-700 dark:text-zinc-300">
              ${(d.value / 1000000).toFixed(1)}M
            </span>
          </div>
        </div>
      ))}
      {labels && (
        <div className="flex items-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-indigo-500 rounded" />
            <span className="text-xs text-slate-500">{labels[0]}</span>
          </div>
          {labels[1] && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-indigo-300 dark:bg-indigo-700 rounded" />
              <span className="text-xs text-slate-500">{labels[1]}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

const SimplePieChart = ({ data }: PieChartProps) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.reduce((acc, d, i) => {
            const percentage = (d.value / total) * 100;
            const offset = acc.offset;
            acc.elements.push(
              <circle
                key={i}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={d.color}
                strokeWidth="20"
                strokeDasharray={`${percentage} ${100 - percentage}`}
                strokeDashoffset={-offset}
                className="transition-all"
              />
            );
            acc.offset += percentage;
            return acc;
          }, { elements: [] as any[], offset: 0 }).elements}
        </svg>
      </div>
      <div className="flex-1 space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-slate-600 dark:text-zinc-400">{d.label}</span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              ${(d.value / 1000000).toFixed(1)}M ({(d.value / total * 100).toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Resumen Ejecutivo ────────────────────────────────────────────────────────
const ResumenEjecutivo = ({ 
  targetMonth, targetYear, setTargetMonth, setTargetYear 
}: { 
  targetMonth: number; targetYear: number; 
  setTargetMonth: (m: number) => void; setTargetYear: (y: number) => void;
}) => {
  const { data: dashboardStats, isLoading } = useDashboardStats(undefined, targetMonth, targetYear);
  const { offices } = useOffices();
  
  const stats = useMemo(() => {
    if (!dashboardStats) return null;
    
    const currentMonth = targetMonth;
    const currentYear = targetYear;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

    // Find current month and prev month revenue from dashboardStats
    const currentTrend = dashboardStats.trendData.find((t: any) => t.month === currentMonth && t.year === currentYear);
    const prevTrend = dashboardStats.trendData.find((t: any) => t.month === prevMonth && t.year === prevYear);

    const currentRevenue = currentTrend ? Number(currentTrend.value) : 0;
    const prevRevenue = prevTrend ? Number(prevTrend.value) : 0;
    const revenueGrowth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    
    return {
      totalAffiliations: dashboardStats.totalAffiliations,
      currentMonthAffiliations: dashboardStats.currentMonth.total,
      currentRevenue,
      revenueGrowth,
      paidCount: dashboardStats.currentMonth.paid,
      pendingCount: dashboardStats.currentMonth.pending,
      inProcessCount: dashboardStats.currentMonth.inProcess,
      overdueCount: dashboardStats.overdue.count,
      overdueValue: dashboardStats.overdue.value,
      officesCount: offices.length,
    };
  }, [dashboardStats, targetMonth, targetYear, offices]);
  
  if (isLoading || !stats) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-slate-100 dark:bg-zinc-800 rounded-2xl" /></div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-10 items-start sm:items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Resumen Ejecutivo</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Indicadores clave del negocio</p>
        </div>
        <MonthYearSelector 
          month={targetMonth} 
          year={targetYear} 
          onChange={(m, y) => { setTargetMonth(m); setTargetYear(y); }} 
        />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ingresos del Mes" value={`$${(stats.currentRevenue / 1000000).toFixed(1)}M`} 
          subvalue={monthNames[targetMonth - 1]} trend={Math.round(stats.revenueGrowth)}
          icon={DollarSign} bg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600" delay={0.05} />
        <KpiCard label="Total Afiliados" value={stats.totalAffiliations} 
          subvalue={`${stats.currentMonthAffiliations} este mes`}
          icon={Users} bg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600" delay={0.1} />
        <KpiCard label="Cartera Vencida" value={stats.overdueCount} 
          subvalue={`$${(stats.overdueValue / 1000000).toFixed(1)}M`}
          icon={AlertTriangle} bg="bg-red-100 dark:bg-red-900/30" iconColor="text-red-600" delay={0.15} />
        <KpiCard label="Tasa de Pago" 
          value={`${Math.round((stats.paidCount / (stats.currentMonthAffiliations || 1)) * 100)}%`} 
          subvalue={`${stats.paidCount} pagadas`}
          icon={CheckCircle2} bg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600" delay={0.2} />
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4">Estado de Cartera - {monthNames[targetMonth - 1]} {targetYear}</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl">
            <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-2" />
            <motion.p key={stats.paidCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{stats.paidCount}</motion.p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500">Pagadas</p>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl">
            <Clock size={24} className="text-blue-600 mx-auto mb-2" />
            <motion.p key={stats.inProcessCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">{stats.inProcessCount}</motion.p>
            <p className="text-xs text-blue-600 dark:text-blue-500">En Proceso</p>
          </div>
          <div className="text-center p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
            <AlertTriangle size={24} className="text-amber-600 mx-auto mb-2" />
            <motion.p key={stats.pendingCount} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }} className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{stats.pendingCount}</motion.p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Pendientes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Ingresos por Oficina ──────────────────────────────────────────────────────
const IngresosPorOficina = () => {
  const { data: affiliations, isLoading } = useAffiliations();
  const { offices } = useOffices();
  
  const officeStats = useMemo(() => {
    if (!affiliations || !offices.length) return [];
    
    return offices.map(office => {
      const officeAffiliations = affiliations.filter((a: any) => a.office_name === office.name);
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const monthData = officeAffiliations.filter((a: any) => a.month === currentMonth && a.year === currentYear);
      
      const revenue = monthData.reduce((sum: number, a: any) => sum + Number(a.value), 0);
      const paid = monthData.filter((a: any) => a.payment_status === 'Pagado').length;
      const pending = monthData.filter((a: any) => a.payment_status === 'Pendiente').length;
      
      return {
        name: office.name,
        city: office.city,
        revenue,
        total: monthData.length,
        paid,
        pending,
        collectionRate: monthData.length > 0 ? (paid / monthData.length) * 100 : 0,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [affiliations, offices]);
  
  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-slate-100 dark:bg-zinc-800 rounded-2xl" /></div>;
  }
  
  const totalRevenue = officeStats.reduce((sum, o) => sum + o.revenue, 0);
  const topOffice = officeStats[0];
  const worstOffice = officeStats[officeStats.length - 1];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Ingresos por Oficina</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Comparativa de desempeño entre oficinas</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Mejor Oficina</p>
          <p className="text-lg font-extrabold mt-1">{topOffice?.name || 'N/A'}</p>
          <p className="text-sm text-emerald-100">${((topOffice?.revenue || 0) / 1000000).toFixed(1)}M</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos Totales</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ${(totalRevenue / 1000000).toFixed(1)}M
          </p>
          <p className="text-xs text-slate-400 mt-1">{monthNames[new Date().getMonth()]} {new Date().getFullYear()}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white">
          <p className="text-xs font-semibold text-red-100 uppercase tracking-wider">Oficina con Menor Ingreso</p>
          <p className="text-lg font-extrabold mt-1">{worstOffice?.name || 'N/A'}</p>
          <p className="text-sm text-red-100">${((worstOffice?.revenue || 0) / 1000000).toFixed(1)}M</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Detalle por Oficina</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Oficina</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Ingresos</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Afiliados</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Pagados</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Pendientes</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Tasa Cobro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {officeStats.map((office, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-zinc-200">{office.name}</p>
                      <p className="text-xs text-slate-400">{office.city}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-slate-700 dark:text-zinc-300">
                    ${(office.revenue / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-5 py-4 text-right text-slate-600 dark:text-zinc-400">{office.total}</td>
                  <td className="px-5 py-4 text-right text-emerald-600 font-semibold">{office.paid}</td>
                  <td className="px-5 py-4 text-right text-amber-600 font-semibold">{office.pending}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      office.collectionRate >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                      office.collectionRate >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {Math.round(office.collectionRate)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Comparativa Mensual ──────────────────────────────────────────────────────
const ComparativaMensual = ({ 
  targetMonth, targetYear, setTargetMonth, setTargetYear 
}: { 
  targetMonth: number; targetYear: number; 
  setTargetMonth: (m: number) => void; setTargetYear: (y: number) => void;
}) => {
  const { data: dashboardStats, isLoading } = useDashboardStats(undefined, targetMonth, targetYear);
  
  const monthlyData = useMemo(() => {
    if (!dashboardStats) return [];
    
    // Server returns DESC (May, Apr, Mar). We reverse for chronological order
    return [...dashboardStats.trendData].reverse().map(t => ({
      month: monthNames[t.month - 1],
      monthNum: t.month,
      year: t.year,
      revenue: Number(t.value),
      count: Number(t.count),
      paid: Number(t.paid),
      pending: Number(t.pending),
    }));
  }, [dashboardStats]);
  
  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-slate-100 dark:bg-zinc-800 rounded-2xl" /></div>;
  }

  if (monthlyData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comparativa Mensual</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">No hay datos disponibles para comparar.</p>
          </div>
          <MonthYearSelector
            month={targetMonth}
            year={targetYear}
            onChange={(m, y) => { setTargetMonth(m); setTargetYear(y); }}
          />
        </div>
      </div>
    );
  }
   
  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const revenueChange = prevMonth && prevMonth.revenue > 0 ? ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100 : 0;
  const countChange = prevMonth && prevMonth.count > 0 ? ((currentMonth.count - prevMonth.count) / prevMonth.count) * 100 : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Comparativa Mensual</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Evolución de ingresos y cobros (últimos 6 meses)</p>
        </div>
        <MonthYearSelector 
          month={targetMonth} 
          year={targetYear} 
          onChange={(m, y) => { setTargetMonth(m); setTargetYear(y); }} 
        />
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Ingresos del Mes" value={`$${(currentMonth.revenue / 1000000).toFixed(1)}M`} 
          trend={Math.round(revenueChange)}
          icon={DollarSign} bg="bg-emerald-100 dark:bg-emerald-900/30" iconColor="text-emerald-600" delay={0.05} />
        <KpiCard label="Afiliados del Mes" value={currentMonth.count} 
          trend={Math.round(countChange)}
          icon={Users} bg="bg-indigo-100 dark:bg-indigo-900/30" iconColor="text-indigo-600" delay={0.1} />
        <KpiCard label="Pagados" value={currentMonth.paid} 
          icon={CheckCircle2} bg="bg-blue-100 dark:bg-blue-900/30" iconColor="text-blue-600" delay={0.15} />
        <KpiCard label="Pendientes" value={currentMonth.pending} 
          icon={Clock} bg="bg-amber-100 dark:bg-amber-900/30" iconColor="text-amber-600" delay={0.2} />
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm">
        <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4">Ingresos por Mes</h3>
        <SimpleBarChart 
          data={monthlyData.map(d => ({ label: d.month, value: d.revenue }))} 
        />
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Detalle Mensual</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Mes</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Ingresos</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Afiliados</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Pagados</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Pendientes</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Ticket Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {monthlyData.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50">
                  <td className="px-5 py-4 font-semibold text-slate-800 dark:text-zinc-200">{d.month} {d.year}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-700 dark:text-zinc-300">
                    ${(d.revenue / 1000000).toFixed(1)}M
                  </td>
                  <td className="px-5 py-4 text-right text-slate-600 dark:text-zinc-400">{d.count}</td>
                  <td className="px-5 py-4 text-right text-emerald-600 font-semibold">{d.paid}</td>
                  <td className="px-5 py-4 text-right text-amber-600 font-semibold">{d.pending}</td>
                  <td className="px-5 py-4 text-right text-slate-600 dark:text-zinc-400">
                    ${d.count > 0 ? Math.round(d.revenue / d.count / 1000) : 0}K
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Distribución por Servicio ────────────────────────────────────────────────
const DistribucionServicio = () => {
  const { data: affiliations, isLoading } = useAffiliations();
  
  const serviceStats = useMemo(() => {
    if (!affiliations) return { eps: 0, pension: 0, arl: 0, ccf: 0 };
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthData = affiliations.filter((a: any) => a.month === currentMonth && a.year === currentYear);
    
    let eps = 0, pension = 0, arl = 0, ccf = 0;
    
    monthData.forEach((a: any) => {
      if (a.eps_name !== '—') eps += Number(a.value);
      if (a.pension_name !== '—') pension += Number(a.value);
      if (a.arl_name !== '—') arl += Number(a.value);
      if (a.ccf_name !== '—') ccf += Number(a.value);
    });
    
    return { eps, pension, arl, ccf };
  }, [affiliations]);
  
  const pieData = [
    { label: 'EPS (Salud)', value: serviceStats.eps, color: '#10b981' },
    { label: 'Pensión', value: serviceStats.pension, color: '#8b5cf6' },
    { label: 'ARL (Riesgos)', value: serviceStats.arl, color: '#f59e0b' },
    { label: 'CCF (Caja)', value: serviceStats.ccf, color: '#3b82f6' },
  ].filter(d => d.value > 0);
  
  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-64 bg-slate-100 dark:bg-zinc-800 rounded-2xl" /></div>;
  }
  
  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  const topService = pieData.sort((a, b) => b.value - a.value)[0];
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Distribución por Servicio</h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">Revenue por tipo de servicio - {monthNames[new Date().getMonth()]} {new Date().getFullYear()}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-4">Distribución de Revenue</h3>
          {pieData.length > 0 ? (
            <SimplePieChart data={pieData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400">
              Sin datos disponibles
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white">
            <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Servicio con Mayor Revenue</p>
            <p className="text-xl font-extrabold mt-1">{topService?.label || 'N/A'}</p>
            <p className="text-sm text-emerald-100">
              ${((topService?.value || 0) / 1000000).toFixed(1)}M ({topService ? Math.round((topService.value / total) * 100) : 0}%)
            </p>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300 mb-3">Resumen</h3>
            <div className="space-y-3">
              {pieData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-sm text-slate-600 dark:text-zinc-400">{d.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                      ${(d.value / 1000000).toFixed(1)}M
                    </span>
                    <span className="text-xs text-slate-400 ml-2">
                      ({Math.round((d.value / total) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Reports Page ─────────────────────────────────────────────────────────────
export const ReportsPage = () => {
  const [activeReport, setActiveReport] = useState('resumen');
  const [targetMonth, setTargetMonth] = useState<number>(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  
  const reports = [
    { id: 'resumen', label: 'Resumen Ejecutivo', icon: Target },
    { id: 'oficinas', label: 'Por Oficina', icon: Building2 },
    { id: 'comparativa', label: 'Comparativa', icon: BarChart3 },
    { id: 'servicios', label: 'Por Servicio', icon: PieChart },
  ];
  
  const renderReport = () => {
    switch (activeReport) {
      case 'resumen': return <ResumenEjecutivo targetMonth={targetMonth} targetYear={targetYear} setTargetMonth={setTargetMonth} setTargetYear={setTargetYear} />;
      case 'oficinas': return <IngresosPorOficina />;
      case 'comparativa': return <ComparativaMensual targetMonth={targetMonth} targetYear={targetYear} setTargetMonth={setTargetMonth} setTargetYear={setTargetYear} />;
      case 'servicios': return <DistribucionServicio />;
      default: return <ResumenEjecutivo targetMonth={targetMonth} targetYear={targetYear} setTargetMonth={setTargetMonth} setTargetYear={setTargetYear} />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reportes</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">Análisis y métricas del negocio</p>
        </div>
      </div>
      
      {/* Report Tabs */}
      <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-xl p-1 border border-slate-100 dark:border-zinc-800 overflow-x-auto">
        {reports.map(report => (
          <button
            key={report.id}
            onClick={() => setActiveReport(report.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeReport === report.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <report.icon size={16} />
            {report.label}
          </button>
        ))}
      </div>
      
      {/* Report Content */}
      <motion.div
        key={activeReport}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {renderReport()}
      </motion.div>
    </div>
  );
};
