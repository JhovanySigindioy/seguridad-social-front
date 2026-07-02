import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import api from '../services/api/axios-instance';

const DEFAULT_AGENCY_ID = '1';

const updatePaymentLock = async ({ agencyId, blocked }: { agencyId: string; blocked: boolean }) => {
  const { data } = await api.post(`/public/agencies/${agencyId}/payment-lock`, { blocked });
  return data.data;
};

export const AgencyPaymentLockPage = () => {
  const [agencyId, setAgencyId] = useState(DEFAULT_AGENCY_ID);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [resultState, setResultState] = useState<'success' | 'error' | null>(null);

  const mutation = useMutation({
    mutationFn: updatePaymentLock,
    onSuccess: (data) => {
      setResultState('success');
      setResultMessage(data?.message || 'Estado actualizado correctamente');
    },
    onError: (error: any) => {
      setResultState('error');
      setResultMessage(error?.response?.data?.error || 'No se pudo actualizar el estado de la agencia');
    },
  });

  const handleAction = (blocked: boolean) => {
    if (!agencyId.trim()) {
      setResultState('error');
      setResultMessage('Ingresa un ID de agencia valido');
      return;
    }

    setResultMessage(null);
    mutation.mutate({ agencyId: agencyId.trim(), blocked });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_45%,#020617_100%)] px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl overflow-hidden rounded-[28px] border border-white/10 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl"
        >
          <div className="border-b border-white/10 px-8 py-7">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-300">Control privado</p>
            <h1 className="mt-3 text-3xl font-black text-white">Bloqueo por pago</h1>
            <p className="mt-2 text-sm text-slate-300">Activa o libera el acceso de una agencia al iniciar sesion.</p>
          </div>

          <div className="space-y-6 px-8 py-8">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-200">ID de agencia</label>
              <input
                type="text"
                value={agencyId}
                onChange={(event) => setAgencyId(event.target.value.replace(/[^0-9]/g, ''))}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-lg font-bold text-white outline-none transition focus:border-cyan-400"
                placeholder="1"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleAction(true)}
                disabled={mutation.isPending}
                className="flex items-center justify-center gap-3 rounded-2xl bg-red-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
                Bloquear agencia
              </button>

              <button
                type="button"
                onClick={() => handleAction(false)}
                disabled={mutation.isPending}
                className="flex items-center justify-center gap-3 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                Desbloquear agencia
              </button>
            </div>

            {resultMessage && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${resultState === 'success'
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                    : 'border-red-400/30 bg-red-500/15 text-red-200'
                  }`}
              >
                {resultMessage}
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-sm text-slate-300">
              Usa esta vista solo para cambiar el estado de acceso. Si bloqueas una agencia, sus usuarios veran el modal de de acceso restringido al intentar iniciar sesion.
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
