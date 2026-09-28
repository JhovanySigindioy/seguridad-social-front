import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, FileText, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  mimeType: string;
  objectUrl: string | null;
  onClose: () => void;
}

export const DocumentPreviewModal = ({ isOpen, title, mimeType, objectUrl, onClose }: Props) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const isPdf = mimeType === 'application/pdf';
  const isImage = mimeType.startsWith('image/');

  return (
    <AnimatePresence>
      {isOpen && objectUrl ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="relative flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">Vista previa</p>
                <h3 className="mt-1 truncate text-sm font-black text-slate-900 dark:text-white sm:text-base">{title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={objectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"
                >
                  <ExternalLink size={16} /> Abrir
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-red-300 hover:text-red-600 dark:border-zinc-700 dark:text-zinc-300"
                  aria-label="Cerrar vista previa"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 bg-slate-100 dark:bg-zinc-900">
              {isPdf ? (
                <iframe title={title} src={objectUrl} className="h-full w-full" />
              ) : null}

              {isImage ? (
                <div className="flex h-full items-center justify-center overflow-auto p-4">
                  <img src={objectUrl} alt={title} className="max-h-full max-w-full rounded-2xl object-contain shadow-lg" />
                </div>
              ) : null}

              {!isPdf && !isImage ? (
                <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                  <FileText size={32} className="text-slate-300 dark:text-zinc-700" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Este tipo de archivo no tiene vista previa embebida.</p>
                </div>
              ) : null}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
};
