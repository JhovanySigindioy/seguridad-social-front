import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, LogOut,
  Building2, Menu, X, Sun, Moon, Bell,
  TrendingUp, CheckCircle2, Clock, AlertCircle, ChevronRight, UserPlus, Copy,
  BarChart3, Target, BriefcaseBusiness
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { OfficeSelectorModal } from '../features/offices/components/OfficeSelectorModal';
import { AffiliationsPage } from '../features/affiliations/pages/affiliations';
import { AffiliationsTable } from '../features/affiliations/components/AffiliationsTable';
import { NewAffiliationPage } from '../features/affiliations/pages/newAffiliation';
import { DailyReportPage } from '../features/affiliations/pages/DailyReportPage';
import { ClientsPage } from '../features/clients/pages/ClientsPage';
import { useClients } from '../features/clients/hooks/useClients';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { NewCompanyPage } from '../features/companies/pages/NewCompanyPage';
import { NewOfficePage } from '../features/offices/pages/NewOfficePage';
import { useAffiliations } from '../features/affiliations/hooks/useAffiliations';
import { useOffices } from '../features/offices/hooks/useOffices';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { MonthYearSelector } from '../components/MonthYearSelector';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    id: 'affiliations-menu',
    label: 'Afiliaciones',
    icon: Users,
    subItems: [
      { id: 'affiliations', label: 'Listado General' },
      { id: 'daily-report', label: 'Reporte Diario' },
      { id: 'retired', label: 'Retirados' }
    ]
  },
  { id: 'clients', label: 'Clientes', icon: UserPlus },
  {
    id: 'admin-menu',
    label: 'Administracion',
    icon: BriefcaseBusiness,
    adminOnly: true,
    subItems: [
      { id: 'admin-companies', label: 'Nueva Empresa' },
      // { id: 'admin-offices', label: 'Nueva Sede' },
    ]
  },
  { id: 'reports', label: 'Reportes', icon: BarChart3, adminOnly: true },
];

const copyText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const normalizeWhatsAppPhone = (phone?: string | null) => {
  const digits = (phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('57') && digits.length >= 12) return digits;
  if (digits.length === 10) return `57${digits}`;
  return digits;
};

const getAffiliationWhatsAppUrl = (item: any, phone?: string | null) => {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  if (!normalizedPhone) return '';

  const signature = item.office_name || 'Seguridad Social';
  const message = `Hola, ${item.client_name}. Queremos recordarle que su afiliacion a seguridad social esta proxima a vencer.\n\nQueremos que siga protegido, asi que estamos listos para acompanarlo y ayudarle a renovarla de forma rapida y sin complicaciones. Escribanos por aqui y lo gestionamos juntos.\n\n${signature}`;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
};

const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <img src="/img/whatsapp.png" alt="" aria-hidden="true" width={size} height={size} className="block object-contain" />
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, bg, iconColor, delay
}: {
  label: string; value: string | number; icon: any;
  bg: string; iconColor: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, type: 'spring', stiffness: 220, damping: 20 }}
    className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          {label}
        </p>
        <motion.p
          key={value}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="text-3xl font-extrabold text-slate-900 dark:text-white"
        >
          {value}
        </motion.p>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </motion.div>
);

// ─── Mini Trend Chart ─────────────────────────────────────────────────────────
const MiniTrendChart = ({ data }: { data: { month: string; value: number }[] }) => {
  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values);

  // Start the y-axis at slightly below the minimum value to exaggerate the differences and show the trend clearly
  const base = max === min ? 0 : min * 0.85;
  const range = max - base;

  const formatValue = (val: number) => {
    if (val === 0) return '';
    if (val >= 1000000) return (val / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
    return val.toString();
  };

  return (
    <div className="flex items-end gap-1 h-20 pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative h-full">
          {/* Tooltip on hover for full value */}
          <div className="absolute -top-7 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            ${d.value.toLocaleString('es-CO')}
          </div>

          <div
            className="w-full flex flex-col justify-center items-center bg-indigo-200 dark:bg-indigo-800 rounded-t transition-all group-hover:bg-indigo-300 dark:group-hover:bg-indigo-700 overflow-hidden"
            style={{ height: `${d.value === 0 ? 0 : Math.max(((d.value - base) / range) * 56, 16)}px` }}
          >
            <span className="text-[9px] font-bold text-indigo-700 dark:text-indigo-200">
              {formatValue(d.value)}
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 truncate mt-1">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Affiliation Row ───────────────────────────────────────────────────────────
const AffiliationRow = ({ item, showOffice, clientFallback }: { item: any; showOffice?: boolean; clientFallback?: any }) => {
  const statusPaymentConfig: Record<string, { bg: string; text: string; dot: string }> = {
    'Pagado': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
    'Pendiente': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
    'En Proceso': { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  };

  const serviceColors: Record<string, string> = {
    'EPS': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    'PEN': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    'ARL': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    'CCF': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  };

  const services: string[] = [];
  if (item.eps_name !== '—') services.push('EPS');
  if (item.pension_name !== '—') services.push('PEN');
  if (item.arl_name !== '—') services.push('ARL');
  if (item.ccf_name !== '—') services.push('CCF');

  const paymentConfig = statusPaymentConfig[item.payment_status] || statusPaymentConfig['Pendiente'];
  const phone1 = item.client_phone_1 || clientFallback?.phone_1 || null;
  const phone2 = item.client_phone_2 || clientFallback?.phone_2 || null;
  const phones = [phone1, phone2].filter(Boolean).join(' / ');
  const primaryPhone = phone1 || phone2 || '';
  const whatsappUrl = getAffiliationWhatsAppUrl(item, primaryPhone);
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = async () => {
    if (!primaryPhone) return;
    await copyText(primaryPhone);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{item.client_name}</p>
        <p className="text-xs text-slate-400 dark:text-zinc-500">{item.client_identification}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">{phones || 'Sin telefono'}</span>
          <button
            onClick={handleCopyPhone}
            disabled={!primaryPhone}
            className="rounded p-1 text-slate-400 transition-colors hover:text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300 dark:hover:text-zinc-200 dark:disabled:text-zinc-700"
            title="Copiar telefono"
          >
            {copied ? <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
          </button>
          {whatsappUrl ? (
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded p-1" title="Enviar WhatsApp" aria-label="Enviar WhatsApp">
              <WhatsAppIcon size={16} />
            </a>
          ) : (
            <button disabled className="rounded p-1 opacity-30" title="Sin telefono" aria-label="WhatsApp no disponible">
              <WhatsAppIcon size={16} />
            </button>
          )}
        </div>
      </td>
      {showOffice && (
        <td className="px-4 py-3">
          <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-xs font-semibold">
            {item.office_name || 'N/A'}
          </span>
        </td>
      )}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          {services.map(s => (
            <span key={s} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${serviceColors[s]}`}>
              {s}
            </span>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${paymentConfig.bg}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${paymentConfig.dot}`} />
          <span className={`text-xs font-semibold ${paymentConfig.text}`}>{item.payment_status}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-sm font-bold text-slate-700 dark:text-zinc-300">
          ${Number(item.value).toLocaleString('es-CO')}
        </span>
      </td>
    </tr>
  );
};

// ─── Dashboard Home ───────────────────────────────────────────────────────────
const DashboardHome = ({ user, activeOfficeId }: { user: any; activeOfficeId: number | null }) => {
  const { data: affiliations, isLoading } = useAffiliations();
  const { data: clients } = useClients();
  const { offices } = useOffices();
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | 'all'>('all');
  const [targetMonth, setTargetMonth] = useState<number>(new Date().getMonth() + 1);
  const [targetYear, setTargetYear] = useState<number>(new Date().getFullYear());
  const isAdmin = user?.role === 'admin';

  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  // Filter affiliations based on selected office
  const filteredAffiliations = useMemo(() => {
    if (!affiliations) return [];

    // For office_manager: always filter by their active office
    if (!isAdmin && activeOfficeId) {
      const office = offices.find(o => o.id === activeOfficeId);
      const officeName = office?.name;
      if (officeName) {
        return affiliations.filter((a: any) => a.office_name === officeName);
      }
    }

    // For admin: use the dropdown selection
    if (selectedOfficeId === 'all') return affiliations;
    const selectedOffice = offices.find(o => o.id === selectedOfficeId);
    const selectedOfficeName = selectedOffice?.name;
    if (selectedOfficeName) {
      return affiliations.filter((a: any) => a.office_name === selectedOfficeName);
    }

    return affiliations;
  }, [affiliations, selectedOfficeId, activeOfficeId, isAdmin, offices]);

  const { data: dashboardStats } = useDashboardStats(activeOfficeId || undefined, targetMonth, targetYear);

  // Stats for current month
  const stats = useMemo(() => {
    if (!dashboardStats) return {
      total: 0, paid: 0, pending: 0, inProcess: 0,
      overdue: 0, overdueValue: 0, currentRevenueTotal: 0, currentRevenuePaid: 0
    };
    return {
      total: dashboardStats.currentMonth.total,
      paid: dashboardStats.currentMonth.paid,
      pending: dashboardStats.currentMonth.pending,
      inProcess: dashboardStats.currentMonth.inProcess,
      overdue: dashboardStats.overdue.count,
      overdueValue: dashboardStats.overdue.value,
      currentRevenueTotal: dashboardStats.currentMonthRevenue?.total || 0,
      currentRevenuePaid: dashboardStats.currentMonthRevenue?.paid || 0,
    };
  }, [dashboardStats]);

  const targetGoal = useMemo(() => {
    if (isAdmin && selectedOfficeId === 'all') return (offices?.length || 1) * 10;
    return 10;
  }, [isAdmin, selectedOfficeId, offices]);

  const completionPercentage = useMemo(() => {
    if (isLoading) return 0;
    return Math.min(100, Math.round((stats.total / (targetGoal || 1)) * 100));
  }, [stats.total, targetGoal, isLoading]);

  // Trend data (last 6 months)
  const trendData = useMemo(() => {
    if (!dashboardStats) return [];

    // Server returns DESC (May, Apr, Mar...). We reverse to make it chronological.
    return [...dashboardStats.trendData].reverse().map(t => ({
      month: monthNames[t.month - 1],
      value: Number(t.value)
    }));
  }, [dashboardStats]);

  // Recent: Only Activo and created in the selected month
  const displayedAffiliations = useMemo(() => {
    return filteredAffiliations
      .filter((a: any) => {
        if (a.status !== 'Activo') return false;
        const createdAt = new Date(a.created_at);
        return (createdAt.getMonth() + 1) === targetMonth && createdAt.getFullYear() === targetYear;
      })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [filteredAffiliations, targetMonth, targetYear]);

  const clientsById = useMemo(() => {
    return new Map((clients || []).map(client => [client.id, client]));
  }, [clients]);

  const displayOfficeName = useMemo(() => {
    if (!isAdmin && activeOfficeId) {
      return offices.find(o => o.id === activeOfficeId)?.name || 'Mi Oficina';
    }
    if (selectedOfficeId === 'all') return 'General';
    return offices.find(o => o.id === selectedOfficeId)?.name || 'General';
  }, [selectedOfficeId, activeOfficeId, isAdmin, offices]);

  const headerTitle = isAdmin && selectedOfficeId === 'all' ? 'Resumen General' : (isAdmin ? displayOfficeName : displayOfficeName);

  return (
    <div className="space-y-6">
      {/* Header with office filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {headerTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Resumen estadístico del mes seleccionado
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthYearSelector
            month={targetMonth}
            year={targetYear}
            onChange={(m, y) => { setTargetMonth(m); setTargetYear(y); }}
          />
          {isAdmin && (
            <select
              value={selectedOfficeId}
              onChange={e => setSelectedOfficeId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200 h-[38px]"
            >
              <option value="all">Todas las oficinas</option>
              {offices.map(o => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Goal Progress Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border-2 border-blue-500/20 dark:border-blue-500/30 shadow-lg shadow-blue-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/40 rounded-2xl text-blue-600 dark:text-blue-400">
            <Target size={32} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-zinc-100 uppercase tracking-tight">
              Meta del Mes: {targetGoal} Afiliaciones
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
              Se han registrado <span className="text-blue-600 dark:text-blue-400 font-bold">{stats.total}</span> afiliaciones
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto flex flex-col md:items-end gap-1">
          <div className="flex items-center gap-5 w-full">
            <div className="flex-1 md:w-48 lg:w-64 h-3.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-blue-500 dark:bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${isLoading ? 0 : Math.min(100, completionPercentage)}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>
            <div className="flex flex-col items-end min-w-[4rem]">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400 leading-none">
                {isLoading ? '…' : completionPercentage}%
              </span>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-right w-full">
            Porcentaje de Cumplimiento
          </span>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Nuevas Afiliaciones" value={isLoading ? '…' : stats.total}
          icon={TrendingUp} bg="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400" delay={0.05} />
        <StatCard label="Pagas (Nuevas)" value={isLoading ? '…' : stats.paid}
          icon={CheckCircle2} bg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400" delay={0.1} />
        <StatCard label="En Proceso (Nuevas)" value={isLoading ? '…' : stats.inProcess}
          icon={Clock} bg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400" delay={0.15} />
        <StatCard label="Pendientes (Nuevas)" value={isLoading ? '…' : stats.pending}
          icon={AlertCircle} bg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400" delay={0.2} />
      </div>

      {/* Trend + Próximas a Vencer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Tendencia de Ingresos</h3>
            <span className="text-xs text-slate-400 dark:text-zinc-500">Últimos 6 meses</span>
          </div>
          {trendData.length > 0 ? (
            <MiniTrendChart data={trendData} />
          ) : (
            <div className="h-16 flex items-center justify-center text-xs text-slate-400">
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Ingresos del Mes */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-emerald-200 dark:border-emerald-800/50 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Ingresos del Mes</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
            Dinero generado en el mes actual
          </p>
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                ${isLoading ? '…' : stats.currentRevenuePaid.toLocaleString('es-CO')}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">recaudado</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-zinc-500">
              de ${(isLoading ? 0 : stats.currentRevenueTotal).toLocaleString('es-CO')} proyectados
            </div>
          </div>
        </div>
      </div>

      {/* Afiliaciones Recientes */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Nuevas Afiliaciones del Mes</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Cliente</th>
                {isAdmin && <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Oficina</th>}
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Servicios</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Pago</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-zinc-400">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-24 animate-pulse" /></td>
                    {isAdmin && <td className="px-4 py-3"><div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-20 animate-pulse" /></td>}
                    <td className="px-4 py-3"><div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-16 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-20 animate-pulse" /></td>
                    <td className="px-4 py-3"><div className="h-3 bg-slate-100 dark:bg-zinc-800 rounded w-16 animate-pulse ml-auto" /></td>
                  </tr>
                ))
              ) : displayedAffiliations.length > 0 ? (
                displayedAffiliations.map(item => (
                  <AffiliationRow key={item.id} item={item} showOffice={isAdmin} clientFallback={clientsById.get(item.client_id)} />
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
                    Sin afiliaciones recientes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ─── Coming Soon ──────────────────────────────────────────────────────────────
const ComingSoon = ({ label }: { label: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-32 text-slate-400 dark:text-zinc-600"
  >
    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
      <Building2 size={28} className="opacity-40" />
    </div>
    <p className="text-lg font-bold">{label}</p>
    <p className="text-sm mt-1">Próximamente disponible</p>
  </motion.div>
);

// ─── Sidebar Component ────────────────────────────────────────────────────────
const Sidebar = ({
  activeTab, onTabChange, onClose, isMobile, user, activeOfficeId
}: {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
  isMobile: boolean;
  user: any;
  activeOfficeId: number | null;
}) => {
  const { logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const { offices } = useOffices();

  const currentOffice = offices?.find(o => o.id === activeOfficeId);
  const logoUrl = currentOffice?.logo_url || user?.agency_logo_url;

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'affiliations-menu': ['affiliations', 'daily-report', 'retired'].includes(activeTab),
    'admin-menu': ['admin-companies', 'admin-offices'].includes(activeTab)
  });

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="flex relative items-center justify-center py-6 px-4 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex flex-col items-center justify-center text-center">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-full max-h-24 object-contain mb-3" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow flex-shrink-0 mb-3">
              <Users size={18} className="text-white" />
            </div>
          )}
          <span className="text-[15px] leading-tight font-bold text-slate-900 dark:text-white">
            {currentOffice ? currentOffice.name : 'Construvida AYJ'}
          </span>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Sede activa */}
      <div className="mx-4 mt-4 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
        <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Sede Activa</p>
        <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 truncate">
          {isAdmin ? 'Acceso Total (Admin)' : activeOfficeId ? `Sede #${activeOfficeId}` : 'No seleccionada'}
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.filter(item => !item.adminOnly || isAdmin).map(item => {
          if (item.subItems) {
            const isOpen = openMenus[item.id];
            const hasActiveChild = item.subItems.some(sub => sub.id === activeTab);
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${hasActiveChild && !isOpen
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
                    }`}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={17} />
                    {item.label}
                  </span>
                  <ChevronRight size={14} className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-9 pr-2 py-1 space-y-1">
                        {item.subItems.map(sub => {
                          const active = activeTab === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => { onTabChange(sub.id); onClose(); }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${active
                                ? sub.id === 'retired'
                                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                                  : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                : sub.id === 'retired'
                                  ? 'text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
                                }`}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }

          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); onClose(); }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
            >
              <span className="flex items-center gap-3">
                <item.icon size={17} />
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

// ─── Dashboard Page ───────────────────────────────────────────────────────────
interface DashboardPageProps {
  tab?: string;
}

export const DashboardPage = ({ tab }: DashboardPageProps = {}) => {
  const { user, activeOfficeId } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState(tab || 'dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const isAdmin = user?.role === 'admin';
  const isBlocked = !isAdmin && !activeOfficeId;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome user={user} activeOfficeId={activeOfficeId} />;
      case 'affiliations': return <AffiliationsPage onNewAffiliation={() => setActiveTab('new-affiliation')} />;
      case 'daily-report': return <DailyReportPage />;
      case 'new-affiliation': return <NewAffiliationPage onCancel={() => setActiveTab('affiliations')} onSuccess={() => setActiveTab('affiliations')} />;
      case 'clients': return <ClientsPage />;
      case 'retired': return <AffiliationsTable defaultTab="inactivas" />;
      case 'admin-companies': return isAdmin ? <NewCompanyPage /> : <DashboardHome user={user} activeOfficeId={activeOfficeId} />;
      case 'admin-offices': return isAdmin ? <NewOfficePage /> : <DashboardHome user={user} activeOfficeId={activeOfficeId} />;
      case 'companies': return <ComingSoon label="Módulo de Empresas" />;
      case 'reports': return isAdmin ? <ReportsPage /> : <DashboardHome user={user} activeOfficeId={activeOfficeId} />;
      case 'billing': return <ComingSoon label="Módulo de Facturación" />;
      case 'settings': return <ComingSoon label="Configuración del Sistema" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white">
      <OfficeSelectorModal />

      {/* ── Desktop Sidebar (siempre visible) ─────────────────── */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={() => { }}
          isMobile={false}
          user={user}
          activeOfficeId={activeOfficeId}
        />
      </div>

      {/* ── Mobile Sidebar (drawer) ────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden"
            >
              <Sidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={() => setMobileOpen(false)}
                isMobile={true}
                user={user}
                activeOfficeId={activeOfficeId}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Content ───────────────────────────────────────── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isBlocked ? 'blur-sm pointer-events-none select-none' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 h-14 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-4 lg:px-6 flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Page title (desktop) */}
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-slate-600 dark:text-zinc-300">
              {NAV_ITEMS.find(n => n.id === activeTab)?.label ?? (activeTab === 'new-affiliation' ? 'Nueva Afiliación' : activeTab)}
            </p>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page body */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
