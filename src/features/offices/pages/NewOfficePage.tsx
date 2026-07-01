import { useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Building2, Image, Loader2, MapPin, ShieldCheck } from 'lucide-react';
import { useToast } from '../../../components/Toast';
import { useAdminOffices, useCreateOffice } from '../hooks/useAdminOffices';

export const NewOfficePage = () => {
  const { data: offices, isLoading } = useAdminOffices();
  const { mutateAsync: createOffice, isPending } = useCreateOffice();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const recentOffices = useMemo(() => (offices || []).slice(0, 6), [offices]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await createOffice({
        name: name.trim(),
        address: address.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
      });

      setName('');
      setAddress('');
      setLogoUrl('');
      showToast('Sede creada correctamente', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.error || 'No se pudo crear la sede');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 inline-flex rounded-2xl bg-sky-50 p-3 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
              <MapPin size={24} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Nueva Sede</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-zinc-400">
              Registra sedes nuevas para tu agencia y dejalas disponibles para clientes, usuarios y afiliaciones.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-sky-700 dark:border-sky-900/30 dark:bg-sky-950/10 dark:text-sky-300">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldCheck size={16} /> Solo admin
            </div>
            <p className="mt-1 text-xs">La sede queda asociada automaticamente a la agencia del administrador autenticado.</p>
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Datos de la sede</h2>
          <div className="mt-6 grid gap-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300">Nombre *</label>
              <div className="relative">
                <Building2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={name}
                  onChange={event => setName(event.target.value)}
                  placeholder="Ej: Sede Chia"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                  required
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300">Direccion</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                <textarea
                  value={address}
                  onChange={event => setAddress(event.target.value)}
                  placeholder="Cra 12 # 34-56"
                  className="min-h-[110px] w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 pt-3 text-sm text-slate-900 outline-none transition focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-300">Logo URL</label>
              <div className="relative">
                <Image size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={logoUrl}
                  onChange={event => setLogoUrl(event.target.value)}
                  placeholder="https://..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:bg-sky-700 disabled:cursor-wait disabled:opacity-60"
            >
              {isPending ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
              {isPending ? 'Creando...' : 'Crear Sede'}
            </button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sedes registradas</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400">
            Vista rapida de las sedes disponibles para la agencia actual.
          </p>

          <div className="mt-5 space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                  <div className="mt-3 h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-zinc-800" />
                </div>
              ))
            ) : recentOffices.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400 dark:border-zinc-800 dark:text-zinc-500">
                Aun no hay sedes registradas.
              </div>
            ) : (
              recentOffices.map(office => (
                <div key={office.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="font-semibold text-slate-900 dark:text-white">{office.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{office.address || 'Sin direccion registrada'}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">{office.logo_url || 'Sin logo configurado'}</p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
