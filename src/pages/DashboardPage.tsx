import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Building2, Menu, X, Sun, Moon, Bell,
  TrendingUp, CheckCircle2, Clock, AlertCircle, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { OfficeSelectorModal } from '../features/offices/components/OfficeSelectorModal';
import { AffiliationsTable } from '../features/affiliations/components/AffiliationsTable';
import { CreateAffiliationModal } from '../features/affiliations/components/CreateAffiliationModal';
import { useAffiliations } from '../features/affiliations/hooks/useAffiliations';

// ─── Nav Items ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'affiliations', label: 'Afiliaciones',  icon: Users },
  { id: 'companies',    label: 'Empresas',      icon: Building2 },
  { id: 'billing',      label: 'Facturación',   icon: FileText },
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

// ─── Dashboard Home ───────────────────────────────────────────────────────────
const DashboardHome = ({ user }: { user: any }) => {
  const { data: affiliations, isLoading } = useAffiliations();

  const stats = React.useMemo(() => {
    if (!affiliations) return { total: 0, paid: 0, pending: 0, inProcess: 0 };
    return {
      total:     affiliations.length,
      paid:      affiliations.filter(a => a.payment_status === 'Pagado').length,
      pending:   affiliations.filter(a => a.payment_status === 'Pendiente').length,
      inProcess: affiliations.filter(a => a.payment_status === 'En Proceso').length,
    };
  }, [affiliations]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <p className="text-sm text-slate-500 dark:text-zinc-500">{greeting},</p>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {user?.name?.split(' ')[0]} 👋
        </h1>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Afiliaciones" value={isLoading ? '…' : stats.total}
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
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800">
          <h2 className="font-bold text-slate-800 dark:text-white">Últimas Afiliaciones</h2>
        </div>
        <div className="p-5">
          <AffiliationsTable />
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
        {NAV_ITEMS.map(item => {
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
export const DashboardPage = () => {
  const { user, activeOfficeId } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab]     = useState('dashboard');
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const isAdmin   = user?.role === 'admin';
  const isBlocked = !isAdmin && !activeOfficeId;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome user={user} />;
      case 'affiliations': return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Afiliaciones</h1>
              <p className="text-slate-500 dark:text-zinc-400 text-sm mt-1">Gestión mensual de pagos de seguridad social</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
            >
              <Users size={18} /> Nueva Afiliación
            </button>
          </div>
          <AffiliationsTable />
        </div>
      );
      case 'companies': return <ComingSoon label="Módulo de Empresas" />;
      case 'billing':   return <ComingSoon label="Módulo de Facturación" />;
      case 'settings':  return <ComingSoon label="Configuración del Sistema" />;
      default: return null;
    }
  };

  return (
    // NO añadir clase 'dark' aquí — la gestiona useThemeStore en document.documentElement
    <div className="h-screen overflow-hidden flex bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-white">
      <OfficeSelectorModal />
      <CreateAffiliationModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />

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
              {NAV_ITEMS.find(n => n.id === activeTab)?.label}
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
