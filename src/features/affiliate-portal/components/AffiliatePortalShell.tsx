import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { KeyRound, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { useAffiliateAuthStore } from '../../../store/useAffiliateAuthStore';
import type { AffiliateAuthUser } from '../../../types/affiliate-auth.types';
import '../styles/affiliate-portal.css';
import { ChangeAffiliatePasswordModal } from './ChangeAffiliatePasswordModal';

interface Props {
  user: AffiliateAuthUser | null;
  title: string;
  description: string;
  children: ReactNode;
  eyebrow?: string;
  aside?: ReactNode;
  hideHero?: boolean;
}

export const AffiliatePortalShell = ({
  user,
  title,
  description,
  children,
  eyebrow = 'Portal Afiliados',
  aside,
  hideHero = false,
}: Props) => {
  const logout = useAffiliateAuthStore((state) => state.logout);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(Boolean(user?.must_change_password));
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.must_change_password) setPasswordOpen(true);
  }, [user?.must_change_password]);

  useEffect(() => {
    setMenuOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAccountMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!accountMenuOpen) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!accountMenuRef.current?.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    return () => document.removeEventListener('pointerdown', closeOnOutsidePointer);
  }, [accountMenuOpen]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const isPortalIndex = location.pathname === '/portal';
  const isHistory = location.pathname === '/portal/historial';
  const initials = (user?.name || 'A').split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="affiliate-portal-theme min-h-screen bg-[var(--affiliate-background)] dark:bg-zinc-950">
      <header className="fixed inset-x-0 top-0 z-[70] border-b border-slate-200 bg-white/92 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/92">
        <div className={`flex w-full items-center justify-between gap-3 px-3 transition-all duration-200 sm:px-4 lg:px-6 xl:px-8 ${isScrolled ? 'min-h-14' : 'min-h-16'}`}>
          <div className="flex min-w-0 items-center gap-3">
            <Link to="/portal" className="inline-flex items-center gap-2 rounded-2xl text-slate-900 transition hover:text-[#013575] dark:text-white dark:hover:text-indigo-200">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#013575] text-white shadow-sm shadow-indigo-900/20">
                <ShieldCheck size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black sm:text-base">Portal Afiliados</span>
                <span className="block truncate text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Seguridad Social</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              <Link
                to="/portal"
                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${isPortalIndex
                  ? 'bg-indigo-50 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                Mis afiliaciones
              </Link>
              <Link
                to="/portal/historial"
                className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${isHistory
                  ? 'bg-indigo-50 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-white'
                }`}
              >
                Historial
              </Link>
            </nav>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {aside}
            <div ref={accountMenuRef} className="relative">
              <button type="button" onClick={() => setAccountMenuOpen((current) => !current)} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#013575] text-sm font-black text-white shadow-sm ring-2 ring-white transition hover:bg-[#0a4089] focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:ring-zinc-950" aria-label="Abrir menú de cuenta" aria-haspopup="menu" aria-expanded={accountMenuOpen}>{initials}</button>
              {accountMenuOpen && (
                <div role="menu" aria-label="Opciones de cuenta" className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-base font-black text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200">{initials}</span>
                    <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">Cuenta del portal</p><p className="truncate text-sm font-bold text-slate-900 dark:text-white">{user?.email || 'Sin correo'}</p><p className="truncate text-xs text-slate-500 dark:text-zinc-400">{user?.identification || 'Sin identificacion'} · {user?.office_name || 'Sin sede'}</p></div>
                  </div>
                  <div className="mt-3 space-y-1">
                     <button type="button" role="menuitem" onClick={() => { setPasswordOpen(true); setAccountMenuOpen(false); }} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-[#013575] dark:text-zinc-200 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-200"><KeyRound size={17} /> Cambiar contraseña</button>
                     <button type="button" role="menuitem" onClick={logout} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-600 dark:text-zinc-200 dark:hover:bg-red-950/30 dark:hover:text-red-300"><LogOut size={17} /> Cerrar sesión</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200 lg:hidden"
            aria-label={menuOpen ? 'Cerrar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <div className="lg:hidden">
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[75] bg-slate-950/50 backdrop-blur-sm"
              aria-label="Cerrar menu"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-[80] flex w-[86vw] max-w-sm flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-zinc-800">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Menu</p>
                  <p className="mt-1 text-base font-black text-slate-900 dark:text-white">Portal Afiliados</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"
                  aria-label="Cerrar menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="rounded-[24px] bg-[linear-gradient(135deg,_#013575_0%,_#0b468f_60%,_#133e7c_100%)] px-4 py-4 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/80">Cuenta activa</p>
                  <p className="mt-3 text-sm font-bold">{user?.email || 'Sin correo'}</p>
                  <p className="mt-1 text-xs text-blue-100/80">{user?.identification || 'Sin identificacion'} · {user?.office_name || 'Sin sede'}</p>
                </div>

                <div className="mt-5 space-y-5">
                  <div>
                    <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Navegacion</p>
                    <div className="space-y-2">
                      <Link
                        to="/portal"
                        className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${isPortalIndex
                          ? 'bg-indigo-50 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'bg-slate-50 text-slate-700 dark:bg-zinc-900 dark:text-zinc-200'
                        }`}
                      >
                        Mis afiliaciones
                      </Link>

                      <Link
                        to="/portal/historial"
                        className={`block rounded-2xl px-4 py-3 text-sm font-semibold transition ${isHistory
                          ? 'bg-indigo-50 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200'
                          : 'bg-slate-50 text-slate-700 dark:bg-zinc-900 dark:text-zinc-200'
                        }`}
                      >
                        Historial
                      </Link>

                    </div>
                  </div>

                  {aside ? (
                    <div>
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Acciones</p>
                      <div className="space-y-2">{aside}</div>
                    </div>
                  ) : null}
                  <button type="button" onClick={() => { setPasswordOpen(true); setMenuOpen(false); }} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"><KeyRound size={16} /> Cambiar contraseña</button>
                </div>
              </div>

              <div className="border-t border-slate-200 px-4 py-4 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-200"
                >
                  <LogOut size={16} /> Salir
                </button>
              </div>
            </motion.aside>
          </div>
        ) : null}
      </AnimatePresence>

      {!hideHero ? (
        <section className={`relative mt-16 overflow-hidden border-b border-slate-200 bg-[linear-gradient(130deg,_#013575_0%,_#0b468f_55%,_#133e7c_100%)] px-3 text-white transition-all duration-200 dark:border-zinc-800 sm:px-4 lg:px-6 xl:px-8 lg:py-6 ${isScrolled ? 'py-3 sm:py-4' : 'py-5 sm:py-5'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(129,140,248,0.18),_transparent_34%)]" />
          <div className="relative w-full">
            <span className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-50 backdrop-blur transition-all duration-200 ${isScrolled ? 'py-0.5' : 'py-1'}`}>
              <ShieldCheck size={12} /> {eyebrow}
            </span>
            <h1 className={`max-w-4xl font-black leading-tight text-white transition-all duration-200 sm:text-3xl lg:text-4xl ${isScrolled ? 'mt-2 text-xl' : 'mt-4 text-2xl'}`}>{title}</h1>
            <p className={`max-w-4xl text-sm text-blue-50/85 transition-all duration-200 sm:text-base ${isScrolled ? 'mt-1 line-clamp-1 leading-6 sm:line-clamp-none' : 'mt-3 leading-7'}`}>{description}</p>
          </div>
        </section>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, x: 0, y: 8 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 0, y: -6 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ transformOrigin: 'top center', willChange: 'opacity, transform' }}
          className={`w-full px-0 ${hideHero ? 'pt-16 pb-0' : 'pb-4 sm:pb-5 lg:pb-6'}`}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      <ChangeAffiliatePasswordModal isOpen={passwordOpen} required={Boolean(user?.must_change_password)} onClose={() => setPasswordOpen(false)} />
    </div>
  );
};
