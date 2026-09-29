import { useState } from 'react';
import axios from 'axios';
import { BriefcaseBusiness, CalendarRange, Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import affiliateApi from '../services/api/affiliate-axios';
import { useAffiliateAuthStore } from '../store/useAffiliateAuthStore';
import { useAffiliateAffiliations, useAffiliateDocuments, useAffiliateMe } from '../features/affiliate-portal/hooks/useAffiliatePortal';
import { AffiliatePortalShell } from '../features/affiliate-portal/components/AffiliatePortalShell';
import { useToast } from '../components/Toast';
import {
  formatDate,
  formatFileSize,
  formatMoney,
  getAffiliationPeriodLabel,
  getDocumentsForAffiliation,
} from '../features/affiliate-portal/utils/affiliate-portal.helpers';

export const AffiliateAffiliationDetailPage = () => {
  const { affiliationId, year, month } = useParams();
  const { showToast } = useToast();
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [openingId, setOpeningId] = useState<number | null>(null);
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

  if (affiliationId && (!Number.isInteger(parsedAffiliationId) || parsedAffiliationId <= 0)) {
    return <Navigate to="/portal" replace />;
  }

  if (!loadingAffiliations && !selectedAffiliation) {
    return <Navigate to="/portal" replace />;
  }

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

  const handleOpen = async (documentId: number) => {
    const newWindow = window.open('', '_blank');

    if (!newWindow) {
      showToast('Permite las ventanas emergentes para abrir el archivo.');
      return;
    }

    try {
      setOpeningId(documentId);
      const response = await affiliateApi.get(`/affiliate/documents/${documentId}/download`, {
        responseType: 'blob',
      });

      const objectUrl = window.URL.createObjectURL(new Blob([response.data], {
        type: String(response.headers['content-type'] || 'application/octet-stream'),
      }));
      newWindow.location.href = objectUrl;
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error: unknown) {
      newWindow.close();
      const message = axios.isAxiosError(error) ? error.response?.data?.error : undefined;
      showToast(message || 'No fue posible abrir el archivo.');
    } finally {
      setOpeningId(null);
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
      >
        {loadingAffiliations || loadingDocuments || !selectedAffiliation ? (
          <div className="space-y-4 px-4 sm:px-5 lg:px-6">
            <div className="h-24 animate-pulse bg-slate-100 dark:bg-zinc-900" />
            <div className="h-44 animate-pulse bg-slate-100 dark:bg-zinc-900" />
            <div className="h-56 animate-pulse bg-slate-100 dark:bg-zinc-900" />
          </div>
        ) : (
          <div className="w-full md:mt-6 space-y-5 px-0 pb-5 sm:space-y-6 sm:px-5 sm:pb-8 lg:mx-auto lg:max-w-6xl lg:px-0">
            <section className="bg-white dark:bg-zinc-950 lg:overflow-hidden lg:rounded-3xl lg:border lg:border-slate-200 lg:shadow-sm dark:lg:border-zinc-800">
              <div className="bg-[linear-gradient(135deg,_#013575_0%,_#0b468f_100%)] px-4 py-5 text-white sm:px-5 sm:py-6 lg:px-8">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
 
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100/75">Detalle del periodo</p>
                      <h2 className="mt-1 text-xl font-black text-white">{getAffiliationPeriodLabel(selectedAffiliation)}</h2>
                      <p className="text-sm text-blue-100/85">Oficina {selectedAffiliation.office_name} · {formatMoney(Number(selectedAffiliation.value))}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 py-2">
                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${selectedAffiliation.status === 'Activo' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-300 text-amber-950'}`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                      {selectedAffiliation.status === 'Activo' ? 'Vigente' : selectedAffiliation.status === 'Inactivo' ? 'Retirada' : 'Vencida'}
                    </span>
                    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${selectedAffiliation.payment_status === 'Pagado' ? 'bg-emerald-400 text-emerald-950' : selectedAffiliation.payment_status === 'En Proceso' ? 'bg-blue-200 text-blue-950' : 'bg-amber-300 text-amber-950'}`}>
                      Pago: {selectedAffiliation.payment_status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-y border-slate-200 px-4 py-4 text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400 sm:px-5 lg:px-8">
                  <span className="font-semibold text-slate-900 dark:text-white">Servicios:</span>{' '}
                  {contractedServices.map((service) => `${service.label}: ${service.value}`).join(' | ')}
              </div>

              <div className="grid gap-0 px-4 sm:grid-cols-2 sm:px-5 xl:grid-cols-4 lg:px-8">
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
                    {selectedDocuments.map((portalDocument) => (
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
                            <button
                              type="button"
                              onClick={() => handleOpen(portalDocument.id)}
                              disabled={openingId === portalDocument.id}
                              className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-[#013575] hover:text-[#013575] disabled:cursor-wait disabled:opacity-70 dark:border-zinc-700 dark:text-zinc-300 dark:hover:text-indigo-200"
                              aria-label="Abrir archivo"
                            >
                              {openingId === portalDocument.id ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
                            </button>

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
                    ))}
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

    </>
  );
};
