import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, UserPlus } from 'lucide-react';
import { useClientFormData, useCreateClient } from '../hooks/useClients';
import { useAuthStore } from '../../../store/useAuthStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClientModal = ({ isOpen, onClose }: Props) => {
  const { data: formData, isLoading } = useClientFormData();
  const { mutateAsync: create, isPending } = useCreateClient();
  const { activeOfficeId, offices } = useAuthStore();

  const [error, setError] = useState('');

  const [documentTypeId, setDocumentTypeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [firstLastname, setFirstLastname] = useState('');
  const [secondLastname, setSecondLastname] = useState('');
  const [identification, setIdentification] = useState('');
  const [email, setEmail] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDocumentTypeId('');
      setFirstName('');
      setSecondName('');
      setFirstLastname('');
      setSecondLastname('');
      setIdentification('');
      setEmail('');
      setPhone1('');
      setPhone2('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    setError('');

    if (!documentTypeId) return setError('Selecciona el tipo de documento.');
    if (!firstName.trim()) return setError('Ingresa el primer nombre.');
    if (!firstLastname.trim()) return setError('Ingresa el primer apellido.');
    if (!identification) return setError('Ingresa el número de identificación.');
    
    const currentOfficeId = activeOfficeId || (offices?.length > 0 ? offices[0] : null);
    if (!currentOfficeId) return setError('No hay una oficina activa para crear el cliente.');

    try {
      await create({
        document_type_id: Number(documentTypeId),
        first_name: firstName.trim(),
        second_name: secondName.trim() || undefined,
        first_lastname: firstLastname.trim(),
        second_lastname: secondLastname.trim() || undefined,
        identification,
        email: email.trim() || undefined,
        phone_1: phone1.trim() || undefined,
        phone_2: phone2.trim() || undefined,
        office_id: currentOfficeId,
      });

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear el cliente');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 dark:bg-zinc-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-slate-50 dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800"
          >
            <div className="flex items-center justify-between p-6 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                  <UserPlus size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nuevo Cliente</h2>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">Ingresa los datos del cliente</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Tipo de Documento</label>
                      <select
                        value={documentTypeId}
                        onChange={e => setDocumentTypeId(e.target.value)}
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      >
                        <option value="">Seleccionar...</option>
                        {formData?.documentTypes?.map((dt: any) => (
                          <option key={dt.id} value={dt.id}>{dt.code} - {dt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Número de Identificación</label>
                      <input
                        type="text"
                        value={identification}
                        onChange={e => setIdentification(e.target.value)}
                        placeholder="Ej: 12345678"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">1er Nombre *</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Ej: Juan"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">2do Nombre</label>
                      <input
                        type="text"
                        value={secondName}
                        onChange={e => setSecondName(e.target.value)}
                        placeholder="Ej: Carlos"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">1er Apellido *</label>
                      <input
                        type="text"
                        value={firstLastname}
                        onChange={e => setFirstLastname(e.target.value)}
                        placeholder="Ej: Pérez"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">2do Apellido</label>
                      <input
                        type="text"
                        value={secondLastname}
                        onChange={e => setSecondLastname(e.target.value)}
                        placeholder="Ej: García"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Email (Opcional)</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Ej: juan@email.com"
                      className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Número de Contacto 1</label>
                      <input
                        type="text"
                        value={phone1}
                        onChange={e => setPhone1(e.target.value)}
                        placeholder="Ej: 3001234567"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1.5">Número de Contacto 2</label>
                      <input
                        type="text"
                        value={phone2}
                        onChange={e => setPhone2(e.target.value)}
                        placeholder="Ej: 3109876543"
                        className="w-full p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl outline-none focus:border-indigo-500 text-slate-800 dark:text-zinc-200"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 bg-slate-50 dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><Save size={18} /> Crear Cliente</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
