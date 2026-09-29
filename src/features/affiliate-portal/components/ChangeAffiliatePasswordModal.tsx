import { useState } from 'react';
import axios from 'axios';
import { KeyRound, Loader2, X } from 'lucide-react';
import { useAffiliateAuthStore } from '../../../store/useAffiliateAuthStore';
import { useChangeAffiliatePassword } from '../hooks/useAffiliatePortal';

interface Props {
  isOpen: boolean;
  required: boolean;
  onClose: () => void;
}

export const ChangeAffiliatePasswordModal = ({ isOpen, required, onClose }: Props) => {
  const { token, user, setAuth } = useAffiliateAuthStore();
  const changePassword = useChangeAffiliatePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword.length < 12) {
      setError('La nueva contraseña debe tener al menos 12 caracteres.');
      return;
    }
    if (newPassword !== confirmation) {
      setError('La confirmación no coincide con la nueva contraseña.');
      return;
    }

    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      if (token && user) setAuth(token, { ...user, must_change_password: false });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmation('');
      onClose();
    } catch (requestError: unknown) {
      const message = axios.isAxiosError(requestError) ? requestError.response?.data?.error : undefined;
      setError(message || 'No fue posible cambiar la contraseña.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200"><KeyRound size={19} /></div>
            <h2 className="mt-4 text-xl font-black text-slate-900 dark:text-white">{required ? 'Actualiza tu contraseña' : 'Cambiar contraseña'}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-zinc-400">{required ? 'Por seguridad debes cambiar la contraseña temporal antes de continuar.' : 'Usa una contraseña personal que no compartas con otras personas.'}</p>
          </div>
          {!required && <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800" aria-label="Cerrar"><X size={18} /></button>}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400">Contraseña actual<input required type="password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" /></label>
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400">Nueva contraseña<input required type="password" minLength={12} value={newPassword} onChange={event => setNewPassword(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" /></label>
          <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400">Confirmar nueva contraseña<input required type="password" minLength={12} value={confirmation} onChange={event => setConfirmation(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white" /></label>
          {error && <p className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
          <button type="submit" disabled={changePassword.isPending} className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#013575] px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{changePassword.isPending && <Loader2 size={16} className="animate-spin" />}Guardar nueva contraseña</button>
        </form>
      </div>
    </div>
  );
};
