// @ts-nocheck
import type { AffiliateDocument } from '../../affiliate-documents/types/affiliate-document.types';
import type { AffiliationItem } from '../../affiliations/types/affiliation.types';

export const formatDate = (value?: string | null) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatMoney = (value: number) => `$${Number(value).toLocaleString('es-CO')}`;

export const formatFileSize = (value: number) => {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDocumentType = (value: string) => value.replace(/[_-]/g, ' ');

export const getAffiliationPeriodLabel = (affiliation: AffiliationItem) => `Periodo ${String(affiliation.month).padStart(2, '0')}/${affiliation.year}`;

export const getAffiliationSortValue = (affiliation: AffiliationItem) => (affiliation.year * 100) + affiliation.month;

export const getAffiliationRoute = (affiliationId: number) => `/portal/afiliacion/${affiliationId}`;

export const getSortedAffiliations = (affiliations: AffiliationItem[]) => {
  return [...affiliations].sort((a, b) => {
    const sortDiff = getAffiliationSortValue(b) - getAffiliationSortValue(a);

    if (sortDiff !== 0) {
      return sortDiff;
    }

    return b.id - a.id;
  });
};

export const getFeaturedAffiliation = (affiliations: AffiliationItem[]) => {
  const sorted = getSortedAffiliations(affiliations);
  return sorted.find((item) => item.status === 'Activo') || sorted[0] || null;
};

export const getDocumentsForAffiliation = (documents: AffiliateDocument[], affiliation: AffiliationItem) => {
  return documents.filter((document) => {
    if (document.affiliation_id) {
      return document.affiliation_id === affiliation.id;
    }

    return document.payment_month === affiliation.month && document.payment_year === affiliation.year;
  });
};

export const getVisibleServices = (affiliation: AffiliationItem) => {
  return [affiliation.eps_name, affiliation.pension_name, affiliation.arl_name, affiliation.ccf_name]
    .filter((value) => value && value !== '—')
    .join(' · ') || 'Sin servicios visibles';
};

export const isDocumentPreviewable = (mimeType?: string | null) => {
  if (!mimeType) return false;
  return mimeType === 'application/pdf' || mimeType.startsWith('image/');
};
