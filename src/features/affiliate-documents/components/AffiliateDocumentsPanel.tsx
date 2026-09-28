import { useMemo, useState } from 'react';
import axios from 'axios';
import { Download, FilePlus2, FileText, Loader2, Lock, Upload, Eye } from 'lucide-react';
import api from '../../../services/api/axios-instance';
import { useToast } from '../../../components/Toast';
import { useAuthStore } from '../../../store/useAuthStore';
import type { AffiliationItem } from '../../affiliations/types/affiliation.types';
import { AFFILIATE_DOCUMENT_TYPES } from '../types/affiliate-document.types';
import { useAffiliateDocuments, useUploadAffiliateDocument } from '../hooks/useAffiliateDocuments';

const formatDateTime = (value?: string | null) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDocumentType = (value: string) => {
  const fromCatalog = AFFILIATE_DOCUMENT_TYPES.find((item) => item.value === value)?.label;
  if (fromCatalog) return fromCatalog;
  return value.replace(/[_-]/g, ' ');
};

interface Props {
  affiliation: AffiliationItem;
  isOpen: boolean;
}

export const AffiliateDocumentsPanel = ({ affiliation, isOpen }: Props) => {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const canUpload = user?.role === 'admin' || user?.role === 'office_manager';
  const [documentType, setDocumentType] = useState('certificado');
  const [displayName, setDisplayName] = useState('');
  const [isVisibleToAffiliate, setIsVisibleToAffiliate] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const filters = useMemo(() => ({
    client_id: affiliation.client_id,
    affiliation_id: affiliation.id,
    monthly_payment_id: affiliation.monthly_payment_id ?? undefined,
  }), [affiliation.client_id, affiliation.id, affiliation.monthly_payment_id]);

  const { data: documents, isLoading, isError } = useAffiliateDocuments(filters, isOpen);
  const uploadMutation = useUploadAffiliateDocument();

  const resetForm = () => {
    setDocumentType('certificado');
    setDisplayName('');
    setIsVisibleToAffiliate(true);
    setSelectedFile(null);
  };

  const handleUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      showToast('Selecciona un archivo antes de subirlo.');
      return;
    }

    try {
      await uploadMutation.mutateAsync({
        client_id: affiliation.client_id,
        affiliation_id: affiliation.id,
        monthly_payment_id: affiliation.monthly_payment_id ?? undefined,
        document_type: documentType,
        display_name: displayName,
        is_visible_to_affiliate: isVisibleToAffiliate,
        file: selectedFile,
      });

      showToast('Documento cargado correctamente.', 'success');
      resetForm();
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : undefined;
      showToast(message || 'No fue posible subir el documento.');
    }
  };

  const handleDownload = async (documentId: number, originalName: string) => {
    try {
      setDownloadingId(documentId);
      const response = await api.get(`/affiliate-documents/${documentId}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : undefined;
      showToast(message || 'No se pudo descargar el documento.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-5">


      {canUpload && (
        <form onSubmit={handleUpload} className="rounded-[26px] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-zinc-100">
            <FilePlus2 size={16} className="text-[#013575]" />
            Subir nuevo documento
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Tipo de documento
              <select
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
                className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              >
                {AFFILIATE_DOCUMENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Nombre visible
              <input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Ej: Incapacidad agosto 2026"
                className="min-h-11 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-semibold text-slate-500 dark:text-zinc-400 md:col-span-2">
              Archivo
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                className="min-h-11 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-100 file:px-3 file:py-2 file:text-xs file:font-bold file:text-[#013575] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-200"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={isVisibleToAffiliate}
                onChange={(event) => setIsVisibleToAffiliate(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Visible para el afiliado en su portal
            </label>

            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#013575] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a4089] disabled:cursor-wait disabled:opacity-70"
            >
              {uploadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
              Subir documento
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-zinc-800" />
            ))}
          </div>
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          No se pudieron cargar los documentos de esta afiliacion.
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <div key={document.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-[#013575] dark:bg-indigo-900/30 dark:text-indigo-200">
                      <FileText size={12} /> {formatDocumentType(document.document_type)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {document.source}
                    </span>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${document.is_visible_to_affiliate ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200'}`}>
                      {document.is_visible_to_affiliate ? <Eye size={12} /> : <Lock size={12} />}
                      {document.is_visible_to_affiliate ? 'Visible al afiliado' : 'Solo interno'}
                    </span>
                  </div>

                  <p className="mt-3 truncate text-sm font-bold text-slate-800 dark:text-zinc-100">{document.display_name}</p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-zinc-400">{document.original_name}</p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                    <span>Tamano: {formatFileSize(document.size_bytes)}</span>
                    <span>Subido: {formatDateTime(document.created_at)}</span>
                    {document.payment_month && document.payment_year ? (
                      <span>Periodo: {String(document.payment_month).padStart(2, '0')}/{document.payment_year}</span>
                    ) : null}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(document.id, document.original_name)}
                  disabled={downloadingId === document.id}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] disabled:cursor-wait disabled:opacity-60 dark:border-zinc-700 dark:text-zinc-200"
                >
                  {downloadingId === document.id ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                  Descargar
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center dark:border-zinc-800 dark:bg-zinc-900/30">
          <FileText size={32} className="mx-auto mb-3 text-slate-300 dark:text-zinc-700" />
          <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Aun no hay documentos para esta afiliacion.</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">Cuando cargues soportes desde esta vista apareceran aqui para su consulta y descarga.</p>
        </div>
      )}
    </div>
  );
};
