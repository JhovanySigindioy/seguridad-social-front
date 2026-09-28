// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BriefcaseBusiness, CalendarRange, Download, Eye, FileText, Loader2 } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import affiliateApi from '../services/api/affiliate-axios';
import { useAffiliateAuthStore } from '../store/useAffiliateAuthStore';
import { useAffiliateAffiliations, useAffiliateDocuments, useAffiliateMe } from '../features/affiliate-portal/hooks/useAffiliatePortal';
import { AffiliatePortalShell } from '../features/affiliate-portal/components/AffiliatePortalShell';
import { useToast } from '../components/Toast';
import { DocumentPreviewModal } from '../features/affiliate-portal/components/DocumentPreviewModal';
import {
  formatDate,
  formatDocumentType,
  formatFileSize,
  formatMoney,
  getAffiliationPeriodLabel,
  getAffiliationRoute,
  getDocumentsForAffiliation,
  getVisibleServices,
  isDocumentPreviewable,
} from '../features/affiliate-portal/utils/affiliate-portal.helpers';

interface PreviewState {
  title: string;
  mimeType: string;
  objectUrl: string | null;
}

export const AffiliateAffiliationDetailPage = () => {
  const { affiliationId } = useParams();
  const { showToast } = useToast();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [previewingId, setPreviewingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const fallbackUser = useAffiliateAuthStore((state) => state.user);
  const { data: me } = useAffiliateMe(true);
  const { data: affiliations, isLoading: loadingAffiliations } = useAffiliateAffiliations(true);
  const { data: documents, isLoading: loadingDocuments } = useAffiliateDocuments(true);

  const user = me || fallbackUser;
  const parsedAffiliationId = Number(affiliationId);
  const safeAffiliations = affiliations || [];
  const safeDocuments = documents || [];

  const selectedAffiliation = safeAffiliations.find((item) => item.id === parsedAffiliationId) || null;
  const selectedDocuments = selectedAffiliation ? getDocumentsForAffiliation(safeDocuments, selectedAffiliation) : [];

  const navigation = useMemo(() => {
    if (!selectedAffiliation) {
      return { previous: null as typeof selectedAffiliation, next: null as typeof selectedAffiliation };
    }

    const index = safeAffiliations.findIndex((item) => item.id === selectedAffiliation.id);

    return {
      previous: index >= 0 && index < safeAffiliations.length - 1 ? safeAffiliations[index + 1] : null,
      next: index > 0 ? safeAffiliations[index - 1] : null,
    };
  }, [safeAffiliations, selectedAffiliation]);

  useEffect(() => {
    return () => {
      if (preview?.objectUrl) {
        window.URL.revokeObjectURL(preview.objectUrl);
      }
    };
  }, [preview]);

  if (affiliationId && (!Number.isInteger(parsedAffiliationId) || parsedAffiliationId <= 0)) {
    return <Navigate to="/portal" replace />;
  }

  if (!loadingAffiliations && !selectedAffiliation) {
    return <Navigate to="/portal" replace />;
  }

  const closePreview = () => {
    if (preview?.objectUrl) {
      window.URL.revokeObjectURL(preview.objectUrl);
    }

    setPreview(null);
  };

  const handleDownload = async (documentId: number, originalName: string) => {
    try {
      setDownloadingId(documentId);
      const response = await affiliateApi.get(`/affiliate/documents/${documentId}/download`, {
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
    } catch (error: any) {
      showToast(error.response?.data?.error || 'No se pudo descargar el archivo.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handlePreview = async (documentId: number, title: string, mimeType: string) => {
    try {
      setPreviewingId(documentId);
      const response = await affiliateApi.get(`/affiliate/documents/${documentId}/download`, {
        responseType: 'blob',
      });

      if (preview?.objectUrl) {
        window.URL.revokeObjectURL(preview.objectUrl);
      }

      const objectUrl = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
      setPreview({ title, mimeType, objectUrl });
    } catch (error: any) {
      showToast(error.response?.data?.error || 'No se pudo abrir la vista previa.');
    } finally {
      setPreviewingId(null);
    }
  };

  return (
    <>
      <AffiliatePortalShell
        user={user}
        title={selectedAffiliation ? getAffiliationPeriodLabel(selectedAffiliation) : 'Cargando afiliacion'}
        description={selectedAffiliation
          ? 'Esta vista muestra solo la informacion y los documentos vinculados a esta afiliacion.'
          : 'Estamos cargando la informacion del periodo seleccionado.'}
        eyebrow={selectedAffiliation?.company_name || 'Detalle de afiliacion'}
        aside={(
          <Link
            to="/portal"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"
          >
            <ArrowLeft size={16} /> Volver al listado
          </Link>
        )}
      >
        {loadingAffiliations || loadingDocuments || !selectedAffiliation ? (
          <div className="space-y-4">
            <div className="h-28 animate-pulse rounded-[28px] bg-slate-100 dark:bg-zinc-900" />
            <div className="h-24 animate-pulse rounded-[28px] bg-slate-100 dark:bg-zinc-900" />
            <div className="h-56 animate-pulse rounded-[28px] bg-slate-100 dark:bg-zinc-900" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Link to="/portal" className="font-semibold text-slate-500 transition hover:text-[#013575] dark:text-zinc-400 dark:hover:text-indigo-200">
                  Mis afiliaciones
                </Link>
                <span className="text-slate-300 dark:text-zinc-700">/</span>
                <span className="font-semibold text-slate-900 dark:text-white">{getAffiliationPeriodLabel(selectedAffiliation)}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {navigation.previous ? (
                  <Link
                    to={getAffiliationRoute(navigation.previous.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"
                  >
                    <ArrowLeft size={16} /> Periodo anterior
                  </Link>
                ) : null}

                {navigation.next ? (
                  <Link
                    to={getAffiliationRoute(navigation.next.id)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Periodo siguiente <ArrowRight size={16} />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="border-b border-slate-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-indigo-50 p-3 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200">
                      <CalendarRange size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Resumen del periodo</h2>
                      <p className="text-sm text-slate-500 dark:text-zinc-400">Datos operativos de esta afiliacion.</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                  {[
                    ['Empresa', selectedAffiliation.company_name],
                    ['Cobertura', `${formatDate(selectedAffiliation.start_date)} - ${selectedAffiliation.end_date ? formatDate(selectedAffiliation.end_date) : 'Activa'}`],
                    ['Estado de afiliacion', selectedAffiliation.status],
                    ['Estado de pago', selectedAffiliation.payment_status],
                    ['Valor del periodo', formatMoney(Number(selectedAffiliation.value))],
                    ['Servicios', getVisibleServices(selectedAffiliation)],
                  ].map(([label, value]) => (
                    <div key={label} className="px-4 py-4 sm:px-5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-zinc-500">{label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="border-b border-slate-200 px-4 py-4 dark:border-zinc-800 sm:px-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-indigo-50 p-3 text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200">
                        <BriefcaseBusiness size={18} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-slate-900 dark:text-white">Documentos de esta afiliacion</h2>
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Solo archivos ligados a este periodo.</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-zinc-900 dark:text-zinc-200">
                      {selectedDocuments.length} archivo{selectedDocuments.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {selectedDocuments.length > 0 ? (
                  <div>
                    <div className="hidden grid-cols-[minmax(0,1.5fr)_130px_140px_220px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-500 lg:grid">
                      <span>Documento</span>
                      <span>Tipo</span>
                      <span>Tamano</span>
                      <span>Acciones</span>
                    </div>

                    <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                      {selectedDocuments.map((portalDocument) => {
                        const canPreview = isDocumentPreviewable(portalDocument.mime_type);

                        return (
                          <div key={portalDocument.id} className="px-4 py-4 sm:px-5">
                            <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.5fr)_130px_140px_220px] lg:items-center lg:gap-4">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-900 dark:text-white">{portalDocument.display_name}</p>
                                <p className="mt-1 truncate text-xs text-slate-500 dark:text-zinc-400">{portalDocument.original_name}</p>
                                <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400">Disponible desde {formatDate(portalDocument.created_at)}</p>
                              </div>

                              <div className="lg:text-sm">
                                <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-[#013575] dark:bg-indigo-950/40 dark:text-indigo-200 lg:text-xs">
                                  <FileText size={12} /> {formatDocumentType(portalDocument.document_type)}
                                </span>
                              </div>

                              <div className="text-sm font-semibold text-slate-700 dark:text-zinc-200">{formatFileSize(portalDocument.size_bytes)}</div>

                              <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                                {canPreview ? (
                                  <button
                                    type="button"
                                    onClick={() => handlePreview(portalDocument.id, portalDocument.display_name, portalDocument.mime_type)}
                                    disabled={previewingId === portalDocument.id}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] disabled:cursor-wait disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-200"
                                  >
                                    {previewingId === portalDocument.id ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                                    Ver
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() => handleDownload(portalDocument.id, portalDocument.original_name)}
                                  disabled={downloadingId === portalDocument.id}
                                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#013575] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0a4089] disabled:cursor-wait disabled:opacity-70"
                                >
                                  {downloadingId === portalDocument.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                                  Descargar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="px-6 py-14 text-center">
                    <CalendarRange size={30} className="mx-auto mb-3 text-slate-300 dark:text-zinc-700" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Este periodo no tiene archivos visibles todavia.</p>
                    <p className="mt-1 text-xs leading-6 text-slate-500 dark:text-zinc-400">
                      Cuando la oficina cargue certificados, facturas o soportes para esta afiliacion, apareceran aqui en esta vista.
                    </p>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </AffiliatePortalShell>

      <DocumentPreviewModal
        isOpen={Boolean(preview?.objectUrl)}
        title={preview?.title || 'Vista previa'}
        mimeType={preview?.mimeType || ''}
        objectUrl={preview?.objectUrl || null}
        onClose={closePreview}
      />
    </>
  );
};
