import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Building2, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useCreateCompany, useCompanies } from '../hooks/useCompanies';

export const NewCompanyPage = () => {
  const { data: companies, isLoading } = useCompanies();
  const { mutateAsync: createCompany, isPending } = useCreateCompany();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [nit, setNit] = useState('');
  const [email, setEmail] = useState('');

  const recentCompanies = useMemo(() => (companies || []).slice(0, 6), [companies]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await createCompany({
        name: name.trim(),
        nit: nit.trim(),
        email: email.trim() || undefined,
      });

      setName('');
      setNit('');
      setEmail('');
      showToast('Empresa creada correctamente', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'No se pudo crear la empresa');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Nueva Empresa</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
              Crea empresas para tu agencia y dejalas disponibles en el formulario de afiliaciones.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/10 dark:text-emerald-300">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} /> Solo admin
            </div>
            <p className="mt-1 text-xs">La empresa se vincula automaticamente a la agencia del administrador autenticado.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de la empresa</h2>
          <div className="mt-6 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300">Nombre *</label>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Ej: Servicios Integrales del Caribe SAS"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300">NIT *</label>
              <input
                value={nit}
                onChange={event => setNit(event.target.value)}
                placeholder="900123456-7"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300">Correo</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="contacto@empresa.com"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <Building2 size={16} />}
              {isPending ? 'Creando...' : 'Crear Empresa'}
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Empresas activas</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Referencia rapida de las empresas ya registradas en tu agencia.
          </p>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                </div>
              ))
            ) : recentCompanies.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                Aun no hay empresas registradas.
              </div>
            ) : (
              recentCompanies.map(company => (
                <div key={company.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="font-semibold text-slate-900 dark:text-white">{company.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">NIT: {company.nit}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{company.email || 'Sin correo registrado'}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
