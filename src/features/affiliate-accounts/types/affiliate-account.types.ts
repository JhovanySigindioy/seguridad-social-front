export type AffiliateAccountStatus = 'active' | 'blocked' | 'disabled' | 'invited';

export interface AffiliateAccountRow {
  client_id: number;
  client_name: string;
  identification: string;
  client_email?: string | null;
  phone_1?: string | null;
  office_id: number;
  office_name: string;
  account_id: number | null;
  account_email?: string | null;
  account_status?: AffiliateAccountStatus | null;
  account_created_at?: string | null;
  last_login_at?: string | null;
  created_by_name?: string | null;
  confirmed_affiliation_count: number;
  active_affiliation_count: number;
  document_count: number;
  last_paid_month?: number | null;
  last_paid_year?: number | null;
  eligible: boolean;
}

export interface AffiliateAccountsPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface AffiliateAccountsSummary {
  total: number;
  activeAccounts: number;
  clientsWithoutAccount: number;
  clientsWithActiveAffiliation: number;
}

export interface AffiliateAccountsResponse {
  items: AffiliateAccountRow[];
  pagination: AffiliateAccountsPagination;
  summary: AffiliateAccountsSummary;
}

export interface CreateAffiliateAccountResponse {
  account_id: number;
  client_id: number;
  client_name: string;
  office_id: number;
  office_name: string;
  email: string;
  temporary_password: string;
}
