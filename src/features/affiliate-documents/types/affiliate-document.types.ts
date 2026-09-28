export interface AffiliateDocument {
  id: number;
  client_id: number;
  affiliation_id: number | null;
  monthly_payment_id: number | null;
  document_type: string;
  display_name: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  source: string;
  is_visible_to_affiliate: boolean;
  created_at: string;
  client_name: string;
  client_identification: string;
  office_name: string;
  payment_month: number | null;
  payment_year: number | null;
  download_url: string;
}

export interface AffiliateDocumentFilters {
  client_id?: number;
  affiliation_id?: number;
  monthly_payment_id?: number;
}

export interface UploadAffiliateDocumentPayload {
  client_id: number;
  affiliation_id?: number;
  monthly_payment_id?: number;
  document_type: string;
  display_name?: string;
  is_visible_to_affiliate?: boolean;
  file: File;
}

export const AFFILIATE_DOCUMENT_TYPES = [
  { value: 'certificado', label: 'Certificado' },
  { value: 'incapacidad', label: 'Incapacidad' },
  { value: 'factura', label: 'Factura' },
  { value: 'soporte_pago', label: 'Soporte de pago' },
  { value: 'afiliacion', label: 'Soporte de afiliacion' },
  { value: 'otro', label: 'Otro' },
] as const;
