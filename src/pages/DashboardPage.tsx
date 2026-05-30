import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Building2, Menu, X, Sun, Moon, Bell,
  TrendingUp, CheckCircle2, Clock, AlertCircle, ChevronRight, UserPlus,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { OfficeSelectorModal } from '../features/offices/components/OfficeSelectorModal';
import { AffiliationsPage } from '../features/affiliations/pages/affiliations';
import { NewAffiliationPage } from '../features/affiliations/pages/newAffiliation';
import { ClientsPage } from '../features/clients/pages/ClientsPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { useAffiliations } from '../features/affiliations/hooks/useAffiliations';
import { useOffices } from '../features/offices/hooks/useOffices';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'affiliations', label: 'Afiliaciones', icon: Users },
  { id: 'clients',      label: 'Clientes',     icon: UserPlus },
  { id: 'companies',    label: 'Empresas',     icon: Building2 },
  { id: 'reports',      label: 'Reportes',     icon: BarChart3, adminOnly: true },
  { id: 'billing',      label: 'Facturación',  icon: FileText },
  { id: 'settings',     label: 'Configuración', icon: Settings },
];

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
        <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        <Icon size={20} className={iconColor} />
      </div>
    </div>
  </motion.div>
);

// ─── Mini Trend Chart ─────────────────────────────────────────────────────────
const MiniTrendChart = ({ data }: { data: { month: string; value: number }[] }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div 
            className="w-full bg-indigo-200 dark:bg-indigo-800 rounded-t transition-all hover:bg-indigo-300 dark:hover:bg-indigo-700"
            style={{ height: `${(d.value / max) * 56}px` }}
          />
          <span className="text-[8px] text-slate-400 dark:text-zinc-500 truncate">{d.month}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Affiliation Row ───────────────────────────────────────────────────────────
const AffiliationRow = ({ item, showOffice }: { item: any; showOffice?: boolean }) => {
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

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{item.client_name}</p>
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
  const { offices } = useOffices();
  const [selectedOfficeId, setSelectedOfficeId] = useState<number | 'all'>('all');
  const [affiliationsView, setAffiliationsView] = useState<'recent' | 'expiring'>('recent');
  const isAdmin = user?.role === 'admin';

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
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

  // Stats for current month
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const monthAffiliations = filteredAffiliations.filter((a: any) => 
      a.month === currentMonth && a.year === currentYear
    );
    
    // Vencidas: payment not made and end_date has passed
    const overdueAffiliations = filteredAffiliations.filter((a: any) => {
      if (a.payment_status === 'Pagado') return false;
      if (!a.end_date) return false;
      return new Date(a.end_date) < today;
    });
    
    // Próximas a vencer: expire in next 5 days
    const in5Days = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
    const expiringSoonAffiliations = filteredAffiliations.filter((a: any) => {
      if (a.status !== 'Activo' || !a.end_date) return false;
      const endDate = new Date(a.end_date);
      return endDate >= today && endDate <= in5Days;
    });
    
    return {
      total:         monthAffiliations.length,
      paid:          monthAffiliations.filter((a: any) => a.payment_status === 'Pagado').length,
      pending:       monthAffiliations.filter((a: any) => a.payment_status === 'Pendiente').length,
      inProcess:     monthAffiliations.filter((a: any) => a.payment_status === 'En Proceso').length,
      overdue:       overdueAffiliations.length,
      overdueValue:  overdueAffiliations.reduce((sum: number, a: any) => sum + Number(a.value), 0),
      expiringSoon:  expiringSoonAffiliations.length,
      expiringValue: expiringSoonAffiliations.reduce((sum: number, a: any) => sum + Number(a.value), 0),
    };
  }, [filteredAffiliations, currentMonth, currentYear]);

  // Trend data (last 3 months: current month going back)
  const trendData = useMemo(() => {
    if (!filteredAffiliations.length) return [];
    
    // Generate last 3 months including current
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const result: { month: string; value: number }[] = [];
    
    for (let i = 2; i >= 0; i--) {
      let month = currentMonth - i;
      let year = currentYear;
      if (month <= 0) {
        month += 12;
        year -= 1;
      }
      
      const monthAffiliations = filteredAffiliations.filter((a: any) => 
        a.month === month && a.year === year
      );
      const totalValue = monthAffiliations.reduce((sum: number, a: any) => sum + Number(a.value), 0);
      
      result.push({
        month: monthNames[month - 1],
        value: totalValue
      });
    }
    
    return result;
  }, [filteredAffiliations]);

  // Recent: Only Activo, sorted by created_at
  const recentAffiliations = useMemo(() => {
    return filteredAffiliations
      .filter((a: any) => a.status === 'Activo')
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 8);
  }, [filteredAffiliations]);

  // Expiring: Only Activo, expiring in next 7 days, sorted by end_date
  const expiringAffiliations = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return filteredAffiliations
      .filter((a: any) => {
        if (a.status !== 'Activo' || !a.end_date) return false;
        const endDate = new Date(a.end_date);
        return endDate >= today && endDate <= in7Days;
      })
      .sort((a: any, b: any) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
  }, [filteredAffiliations]);

  const displayedAffiliations = affiliationsView === 'recent' ? recentAffiliations : expiringAffiliations;

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
            {monthNames[currentMonth - 1]} {currentYear}
          </p>
        </div>
        {isAdmin && (
          <select
            value={selectedOfficeId}
            onChange={e => setSelectedOfficeId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-zinc-200"
          >
            <option value="all">Todas las oficinas</option>
            {offices.map(o => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Total" value={isLoading ? '…' : stats.total}
          icon={TrendingUp} bg="bg-indigo-100 dark:bg-indigo-900/30"
          iconColor="text-indigo-600 dark:text-indigo-400" delay={0.05} />
        <StatCard label="Pagadas" value={isLoading ? '…' : stats.paid}
          icon={CheckCircle2} bg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400" delay={0.1} />
        <StatCard label="En Proceso" value={isLoading ? '…' : stats.inProcess}
          icon={Clock} bg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400" delay={0.15} />
        <StatCard label="Pendientes" value={isLoading ? '…' : stats.pending}
          icon={AlertCircle} bg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400" delay={0.2} />
        <StatCard label="Vencidas" value={isLoading ? '…' : stats.overdue}
          icon={AlertCircle} bg="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400" delay={0.25} />
      </div>

      {/* Trend + Próximas a Vencer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trend Chart */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Tendencia de Ingresos</h3>
            <span className="text-xs text-slate-400 dark:text-zinc-500">Últimos 3 meses</span>
          </div>
          {trendData.length > 0 ? (
            <MiniTrendChart data={trendData} />
          ) : (
            <div className="h-16 flex items-center justify-center text-xs text-slate-400">
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Próximas a Vencer */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-amber-200 dark:border-amber-800/50 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Próximas a Vencer</h3>
            <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">
              {isLoading ? '…' : stats.expiringSoon}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mb-3">
            Vencen en los próximos 5 días
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${isLoading ? '…' : (stats.expiringValue / 1000000).toFixed(1)}M
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500">en juego</span>
          </div>
        </div>
      </div>

      {/* Afiliaciones (Híbrido: Urgentes + Recientes) */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">Afiliaciones</h3>
          </div>
          <div className="flex items-center gap-3">
            {/* Switch */}
            <div className="flex items-center bg-slate-100 dark:bg-zinc-800 rounded-lg p-1">
              <button
                onClick={() => setAffiliationsView('recent')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  affiliationsView === 'recent'
                    ? 'bg-white dark:bg-zinc-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                Recientes
              </button>
              <button
                onClick={() => setAffiliationsView('expiring')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  affiliationsView === 'expiring'
                    ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
                }`}
              >
                Por Vencer
                {expiringAffiliations.length > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-bold">
                    {expiringAffiliations.length}
                  </span>
                )}
              </button>
            </div>
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
                  <AffiliationRow key={item.id} item={item} showOffice={isAdmin} />
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 5 : 4} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-zinc-500">
                    {affiliationsView === 'recent' ? 'Sin afiliaciones recientes' : 'Sin afiliaciones por vencer'}
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

  return (
    <aside className="w-64 h-full bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow">
            <Users size={15} className="text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 dark:text-white text-sm leading-none block">
              VibeSocial
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
              Seguridad Social v2
            </span>
          </div>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400"
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
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { onTabChange(item.id); onClose(); }}
              className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              <span className="flex items-center gap-3">
                <item.icon size={17} />
                {item.label}
              </span>
              {active && <ChevronRight size={14} />}
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

  const isAdmin   = user?.role === 'admin';
  const isBlocked = !isAdmin && !activeOfficeId;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome user={user} activeOfficeId={activeOfficeId} />;
      case 'affiliations': return <AffiliationsPage onNewAffiliation={() => setActiveTab('new-affiliation')} />;
      case 'new-affiliation': return <NewAffiliationPage onCancel={() => setActiveTab('affiliations')} onSuccess={() => setActiveTab('affiliations')} />;
      case 'clients': return <ClientsPage />;
      case 'companies': return <ComingSoon label="Módulo de Empresas" />;
      case 'reports': return isAdmin ? <ReportsPage /> : <DashboardHome user={user} activeOfficeId={activeOfficeId} />;
      case 'billing':   return <ComingSoon label="Módulo de Facturación" />;
      case 'settings':  return <ComingSoon label="Configuración del Sistema" />;
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
          onClose={() => {}}
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
