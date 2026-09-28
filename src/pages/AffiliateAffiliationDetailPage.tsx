import { useEffect, useState } from 'react';
import axios from 'axios';
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
  formatFileSize,
  formatMoney,
  getAffiliationPeriodLabel,
  getAffiliationRoute,
  getDocumentsForAffiliation,
  isDocumentPreviewable,
} from '../features/affiliate-portal/utils/affiliate-portal.helpers';

interface PreviewState {
  title: string;
  mimeType: string;
  objectUrl: string | null;
}

export const AffiliateAffiliationDetailPage = () => {
  const { affiliationId, year, month } = useParams();
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
  const parsedYear = Number(year);
  const parsedMonth = Number(month);
  const safeAffiliations = affiliations || [];
  const safeDocuments = documents || [];

  const selectedAffiliation = safeAffiliations.find((item) =>
    item.id === parsedAffiliationId && item.year === parsedYear && item.month === parsedMonth
  ) || null;
  const selectedDocuments = selectedAffiliation ? getDocumentsForAffiliation(safeDocuments, selectedAffiliation) : [];

  const navigation = (() => {
    if (!selectedAffiliation) {
      return { previous: null as typeof selectedAffiliation, next: null as typeof selectedAffiliation };
    }

    const index = safeAffiliations.findIndex((item) => item.id === selectedAffiliation.id);

    return {
      previous: index >= 0 && index < safeAffiliations.length - 1 ? safeAffiliations[index + 1] : null,
      next: index > 0 ? safeAffiliations[index - 1] : null,
    };
  })();

  const contractedServices = (() => {
    if (!selectedAffiliation) {
      return [] as Array<{ label: string; value: string }>;
    }

    return [
      { label: 'EPS', value: selectedAffiliation.eps_name },
      { label: 'ARL', value: selectedAffiliation.arl_name },
      { label: 'CCF', value: selectedAffiliation.ccf_name },
      { label: 'Pension', value: selectedAffiliation.pension_name },
    ].filter((service) => service.value && service.value !== '—');
  })();

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
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : undefined;
      showToast(message || 'No fue posible descargar el archivo.');
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
    } catch (error: unknown) {
      const message = axios.isAxiosError(error) ? error.response?.data?.error : undefined;
      showToast(message || 'No fue posible abrir la vista previa.');
    } finally {
      setPreviewingId(null);
    }
  };

  return (
    <>
      <AffiliatePortalShell
        user={user}
        title={selectedAffiliation ? getAffiliationPeriodLabel(selectedAffiliation) : 'Cargando afiliacion'}
        description={selectedAffiliation ? 'Detalle del periodo seleccionado.' : 'Cargando detalle del periodo.'}
        eyebrow="Detalle de afiliacion"
        hideHero
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
          <div className="space-y-4 px-4 sm:px-5 lg:px-6">
            <div className="h-24 animate-pulse bg-slate-100 dark:bg-zinc-900" />
            <div className="h-44 animate-pulse bg-slate-100 dark:bg-zinc-900" />
            <div className="h-56 animate-pulse bg-slate-100 dark:bg-zinc-900" />
          </div>
        ) : (
          <div className="space-y-6 px-4 sm:px-5 lg:px-6">
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
                    to={getAffiliationRoute(navigation.previous)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"
                  >
                    <ArrowLeft size={16} /> Periodo anterior
                  </Link>
                ) : null}

                {navigation.next ? (
                  <Link
                    to={getAffiliationRoute(navigation.next)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-[#013575] dark:border-zinc-700 dark:text-zinc-200"
                  >
                    Periodo siguiente <ArrowRight size={16} />
                  </Link>
                ) : null}
              </div>
            </div>

            <section className="overflow-hidden border-y border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
              <div className="px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[#013575] dark:text-indigo-200">
                      <CalendarRange size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900 dark:text-white">{getAffiliationPeriodLabel(selectedAffiliation)}</h2>
                      <p className="text-sm text-slate-500 dark:text-zinc-400">Oficina {selectedAffiliation.office_name} - Aporte {formatMoney(Number(selectedAffiliation.value))}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-2">
                    <span className={`inline-flex h-2.5 w-2.5 rounded-full ${selectedAffiliation.status === 'Activo' && selectedAffiliation.decision_status === 'Confirmada' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {selectedAffiliation.decision_status === 'Por Confirmar'
                        ? 'Por confirmar'
                        : selectedAffiliation.decision_status === 'No Continúa'
                          ? 'No continua'
                          : selectedAffiliation.status === 'Activo'
                            ? 'Vigente'
                            : selectedAffiliation.status === 'Inactivo' ? 'Retirada' : 'Vencida'} - {selectedAffiliation.payment_status}
                    </span>
                  </div>
                </div>

                <div className="border-y border-slate-200 py-4 text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                  <span className="font-semibold text-slate-900 dark:text-white">Servicios:</span>{' '}
                  {contractedServices.map((service) => `${service.label}: ${service.value}`).join(' | ')}
                </div>

                <div className="grid gap-0 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ['Cobertura', `${formatDate(selectedAffiliation.start_date)} - ${selectedAffiliation.end_date ? formatDate(selectedAffiliation.end_date) : 'Activa'}`],
                    ['Archivos', `${selectedDocuments.length}`],
                    ['Valor del periodo', formatMoney(Number(selectedAffiliation.value))],
                    ['Oficina', selectedAffiliation.office_name],
                  ].map(([label, value], index) => (
                    <div key={label} className={`py-4 ${index < 3 ? 'border-b border-slate-200 sm:border-b-0' : ''} ${index % 2 === 0 ? 'sm:border-r sm:border-slate-200 dark:sm:border-zinc-800' : ''} ${index < 3 && index > 1 ? 'xl:border-r xl:border-slate-200 dark:xl:border-zinc-800' : ''} ${index < 3 ? 'xl:border-b-0' : ''} ${index % 2 === 0 ? 'sm:pr-4' : 'sm:pl-4'} ${index < 2 ? 'xl:pr-4' : 'xl:pl-4'}`}>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-zinc-500">{label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-zinc-800">
                <div className="px-4 py-4 dark:border-zinc-800 sm:px-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-1 text-[#013575] dark:text-indigo-200">
                      <BriefcaseBusiness size={18} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Archivos del periodo</h2>
                    </div>
                  </div>

                  <div className="px-1 py-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
                    {selectedDocuments.length} archivo{selectedDocuments.length !== 1 ? 's' : ''}
                  </div>
                </div>
                </div>

                {selectedDocuments.length > 0 ? (
                  <div className="divide-y divide-slate-200 dark:divide-zinc-800">
                    {selectedDocuments.map((portalDocument) => {
                      const canPreview = isDocumentPreviewable(portalDocument.mime_type);

                      return (
                        <div key={portalDocument.id} className="group flex items-center justify-between gap-3 px-4 py-4 transition hover:bg-slate-50 dark:hover:bg-zinc-900/50 sm:px-5">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center text-red-600 dark:text-red-300">
                              <FileText size={20} />
                            </div>

                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-semibold text-slate-900 transition group-hover:text-[#013575] dark:text-white dark:group-hover:text-indigo-200">
                                {portalDocument.display_name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                                <span>{formatDate(portalDocument.created_at)}</span>
                                <span>{formatFileSize(portalDocument.size_bytes)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {canPreview ? (
                              <button
                                type="button"
                                onClick={() => handlePreview(portalDocument.id, portalDocument.display_name, portalDocument.mime_type)}
                                disabled={previewingId === portalDocument.id}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#013575] hover:text-[#013575] disabled:cursor-wait disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-indigo-200"
                                aria-label="Ver archivo"
                              >
                                {previewingId === portalDocument.id ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => handleDownload(portalDocument.id, portalDocument.original_name)}
                              disabled={downloadingId === portalDocument.id}
                              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#013575] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0a4089] disabled:cursor-wait disabled:opacity-70"
                            >
                              {downloadingId === portalDocument.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                              <span className="hidden sm:inline">Descargar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-14 text-center">
                    <CalendarRange size={30} className="mx-auto mb-3 text-slate-300 dark:text-zinc-700" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200">Este periodo no tiene archivos visibles todavia.</p>
                  </div>
                )}
              </div>
            </section>
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
